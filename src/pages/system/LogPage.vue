<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">日志管理</div>

    <!-- 搜索和操作栏 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="queryForm.username"
              label="操作用户"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="queryForm.operationDesc"
              label="操作描述"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="queryForm.method"
              :options="methodOptions"
              label="请求方法"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <q-btn color="primary" icon="search" label="搜索" @click="loadLogs" />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <q-btn color="secondary" icon="refresh" label="重置" @click="resetQuery" />
          </div>
        </div>
        
        <div class="row q-gutter-md items-end q-mt-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="queryForm.startTime"
              label="开始时间"
              type="datetime-local"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="queryForm.endTime"
              label="结束时间"
              type="datetime-local"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              color="warning"
              icon="clear_all"
              label="清空日志"
              @click="clearLogs"
              v-permission="'system:log:clear'"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 日志表格 -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">操作日志</div>

        <q-table
          :rows="logs"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="rowsPerPageOptions"
          :no-data-label="'暂无数据'"
          :no-results-label="'未找到匹配的记录'"
          :loading-label="'加载中...'"
          :rows-per-page-label="'每页显示:'"
        >
          <template v-slot:body-cell-method="props">
            <q-td :props="props">
              <q-badge
                :color="getMethodColor(props.row.method)"
                :label="props.row.method"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status >= 200 && props.row.status < 300 ? 'positive' : 'negative'"
                :label="props.row.status"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-time="props">
            <q-td :props="props">
              <q-badge
                :color="getTimeColor(props.row.time)"
                :label="props.row.time + 'ms'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="visibility"
                @click="showLogDetail(props.row)"
              >
                <q-tooltip>查看详情</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:bottom>
            <div class="row items-center justify-end full-width" v-if="pagination.rowsNumber > 0">
              <div class="q-mr-md">
                共 {{ pagination.rowsNumber }} 条记录
              </div>
              <q-pagination
                v-model="pagination.page"
                :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                @update:model-value="onRequest({ pagination })"
                direction-links
                boundary-links
                icon-first="first_page"
                icon-last="last_page"
              />
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 日志详情对话框 -->
    <q-dialog v-model="logDetailDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">日志详情</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list v-if="currentLog" dense>
            <q-item>
              <q-item-section>
                <q-item-label>操作用户</q-item-label>
                <q-item-label caption>{{ currentLog.username }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>操作类型</q-item-label>
                <q-item-label caption>{{ currentLog.operation }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>请求方法</q-item-label>
                <q-item-label caption>{{ currentLog.method }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>请求URI</q-item-label>
                <q-item-label caption>{{ currentLog.uri }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>IP地址</q-item-label>
                <q-item-label caption>{{ currentLog.ip }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>用户代理</q-item-label>
                <q-item-label caption>{{ currentLog.userAgent }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>响应状态</q-item-label>
                <q-item-label caption>{{ currentLog.status }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>执行时间</q-item-label>
                <q-item-label caption>{{ currentLog.time }}ms</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label>操作时间</q-item-label>
                <q-item-label caption>{{ new Date(currentLog.createTime).toLocaleString() }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="currentLog.params">
              <q-item-section>
                <q-item-label>请求参数</q-item-label>
                <q-item-label caption>
                  <pre class="text-caption">{{ formatJson(currentLog.params) }}</pre>
                </q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="currentLog.result">
              <q-item-section>
                <q-item-label>响应结果</q-item-label>
                <q-item-label caption>
                  <pre class="text-caption">{{ formatJson(currentLog.result) }}</pre>
                </q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="currentLog.errorMsg">
              <q-item-section>
                <q-item-label>错误信息</q-item-label>
                <q-item-label caption class="text-negative">{{ currentLog.errorMsg }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section>
          <div class="row justify-end">
            <q-btn flat label="关闭" @click="logDetailDialog = false" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { logApi } from 'src/api'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'LogPage',

  setup() {
    const $q = useQuasar()

    const loading = ref(false)
    const logDetailDialog = ref(false)
    const logs = ref([])
    const currentLog = ref(null)

    const queryForm = ref({
      username: '',
      operationDesc: '',
      method: '',
      startTime: '',
      endTime: ''
    })

    const pagination = ref({
      sortBy: 'createTime',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })

    const columns = [
      {
        name: 'id',
        label: 'ID',
        field: 'id',
        align: 'left',
        sortable: true
      },
      {
        name: 'username',
        label: '操作用户',
        field: 'username',
        align: 'left',
        sortable: true
      },
      {
        name: 'operationDesc',
        label: '操作描述',
        field: 'operationDesc',
        align: 'left',
        sortable: true
      },
      {
        name: 'operationType',
        label: '操作类型',
        field: 'operationType',
        align: 'left',
        format: (val) => getOperationTypeDescription(val)
      },
      {
        name: 'requestMethod',
        label: '请求方法',
        field: 'requestMethod',
        align: 'center'
      },
      {
        name: 'requestUrl',
        label: '请求URI',
        field: 'requestUrl',
        align: 'left'
      },
      {
        name: 'ipAddress',
        label: 'IP地址',
        field: 'ipAddress',
        align: 'left'
      },
      {
        name: 'status',
        label: '状态码',
        field: 'status',
        align: 'center'
      },
      {
        name: 'time',
        label: '执行时间',
        field: 'time',
        align: 'center'
      },
      {
        name: 'createTime',
        label: '操作时间',
        field: 'createTime',
        align: 'center',
        format: (val) => new Date(val).toLocaleString(),
        sortable: true
      },
      {
        name: 'actions',
        label: '操作',
        field: 'actions',
        align: 'center'
      }
    ]

    const methodOptions = [
      { label: 'GET', value: 'GET' },
      { label: 'POST', value: 'POST' },
      { label: 'PUT', value: 'PUT' },
      { label: 'DELETE', value: 'DELETE' }
    ]

    const rowsPerPageOptions = [5, 10, 20, 50, 100]

    const getMethodColor = (method) => {
      const colors = {
        'GET': 'blue',
        'POST': 'green',
        'PUT': 'orange',
        'DELETE': 'red'
      }
      return colors[method] || 'grey'
    }

    const getTimeColor = (time) => {
      if (time < 100) return 'positive'
      if (time < 500) return 'warning'
      return 'negative'
    }

    const getOperationTypeFromMethod = (method) => {
      const typeMap = {
        'GET': 1,
        'POST': 2,
        'PUT': 3,
        'DELETE': 4
      }
      return typeMap[method]
    }

    const getOperationTypeDescription = (code) => {
      const typeMap = {
        1: '新增',
        2: '修改',
        3: '删除',
        4: '查询',
        5: '登录',
        6: '登出'
      }
      return typeMap[code] || '未知'
    }

    const formatJson = (jsonStr) => {
      try {
        const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
        return JSON.stringify(obj, null, 2)
      } catch (error) {
        return jsonStr
      }
    }

    const loadLogs = async (props) => {
      loading.value = true
      
      try {
        const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value
        
        const params = {
          current: page,
          size: rowsPerPage,
          module: queryForm.value.username || undefined,
          operationDesc: queryForm.value.operationDesc || undefined,
          status: undefined
        }
        
        // Remove undefined values to avoid sending empty parameters
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })

        const response = await logApi.getList(params)
        
        // MyBatis-Plus IPage structure: { records: [], total: number, size: number, current: number, pages: number }
        const pageData = response.data.data
        const records = pageData.records || []
        const total = pageData.total || 0

        logs.value = records
        pagination.value.rowsNumber = total
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        pagination.value.sortBy = sortBy
        pagination.value.descending = descending
      } catch (error) {
        console.error('加载日志列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      loadLogs(props)
    }

    const resetQuery = () => {
      queryForm.value = {
        username: '',
        operationDesc: '',
        method: '',
        startTime: '',
        endTime: ''
      }
      loadLogs()
    }

    const showLogDetail = (log) => {
      currentLog.value = log
      logDetailDialog.value = true
    }

    const clearLogs = () => {
      $q.dialog({
        title: '确认清空',
        message: '确定要清空所有操作日志吗？此操作不可恢复！',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await logApi.clear()
          $q.notify({
            type: 'positive',
            message: '日志清空成功'
          })
          loadLogs()
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error.response?.data?.message || '清空失败'
          })
        }
      })
    }

    onMounted(() => {
      loadLogs()
    })

    return {
      loading,
      logDetailDialog,
      logs,
      currentLog,
      queryForm,
      pagination,
      columns,
      methodOptions,
      rowsPerPageOptions,
      getMethodColor,
      getTimeColor,
      getOperationTypeDescription,
      formatJson,
      loadLogs,
      onRequest,
      resetQuery,
      showLogDetail,
      clearLogs
    }
  }
})
</script>

<style lang="sass" scoped>
pre
  white-space: pre-wrap
  word-break: break-all
  max-height: 200px
  overflow-y: auto
</style>
