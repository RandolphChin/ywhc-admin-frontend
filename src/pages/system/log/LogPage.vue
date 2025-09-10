<template>
  <q-page>
    <!-- <div class="text-h4 q-mb-md">日志管理</div> -->

    <!-- 搜索和操作栏 -->
    <q-card class="q-mb-xs">
      <q-card-section>
        <div class="row q-gutter-sm items-center">
            <!-- 操作用户查询 -->
              <q-input
                v-model="queryForm.username"
                label="操作用户"
                outlined
                dense
                clearable
                style="width: 160px;"
              />
  
            <!-- 操作描述 - 固定模糊查询 -->
            <q-input
              v-model="queryForm.operationDesc"
              label="操作描述 (模糊)"
              outlined
              dense
              clearable
              style="width: 160px;"
            />
            
            <!-- 请求方法查询 -->
              <q-select
                v-model="queryForm.requestMethod"
                :options="methodOptions"
                label="请求方法"
                outlined
                dense
                clearable
                emit-value
                map-options
                style="width: 160px;"
              />
                
            <!-- 状态查询 方式1-->
<!-- 
            <q-select
              v-model="queryForm.status"
              :options="statusOptions"
              label="操作状态"
              outlined
              dense
              clearable
              emit-value
              map-options
              style="width: 140px;"
            />
             -->
            <!-- 状态查询 方式2-->
            <DictSelect
              v-model="queryForm.status"
              dict-type="response_status"
              label="操作状态"
              :include-all="false"
               style="width: 140px;"
            />
            <q-input
              v-model="dateRangeDisplay"
              label="时间范围"
              outlined
              dense
              clearable
              style="width: 250px;"
              class="cursor-pointer"
              @clear="clearDateRange"
              @click="$refs.datePopup.show()"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" />
              </template>
              <q-popup-proxy ref="datePopup" cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="queryForm.dateRange"
                  mask="YYYY-MM-DD"
                  range
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="关闭" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-input>
                <q-btn color="primary" icon="search" label="搜索" @click="loadLogs" />
                <q-btn color="secondary" icon="refresh" label="重置" @click="resetQuery" />
                <q-btn
                  color="warning"
                  icon="clear_all"
                  label="清空日志"
                  @click="clearLogs"
                  v-permission="'system:log:clear'"
                />
          </div>
      </q-card-section>
    </q-card>

    <!-- 日志表格 -->
    <q-card>
      <q-card-section>
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
                :color="props.row.status == 1 ? 'positive' : 'negative'"
                :label="getStatusLabel(props.row.status)"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-executionTime="props">
            <q-td :props="props">
              <q-badge
                :color="getTimeColor(props.row.executionTime)"
                :label="props.row.executionTime + 'ms'"
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
              <q-btn
                flat
                dense
                color="primary"
                icon="edit"
                @click="showLogEdit(props.row)"
              >
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:bottom>
            <DataTablePagination
              :pagination="pagination"
              :rows-per-page-options="rowsPerPageOptions"
              @rows-per-page-change="onRowsPerPageChange"
              @page-change="onPageChange"
            />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 日志详情对话框 -->
    <LogEditDialog 
      v-model="logDetailDialog" 
      :log-data="currentLog" 
      :is-readonly="true"
      @refresh="handleRefresh"
    />

    <!-- 日志编辑对话框 -->
    <LogEditDialog 
      v-model="logEditDialog" 
      :log-data="currentLog" 
      :is-edit="true"
      :is-readonly="false"
      @submit="handleSubmit"
    />

    <!-- 日志新增对话框 -->
    <LogEditDialog 
      v-model="logCreateDialog" 
      :is-edit="false"
      :is-readonly="false"
      @submit="handleSubmit"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { logApi } from 'src/api'
import { useQuasar } from 'quasar'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import LogEditDialog from './LogEditDialog.vue'
import { formatTime } from 'src/utils/index'
// 字典表引入
import { createDictData } from 'src/utils/dict'
// 方法1：使用 useDictionary
// const { getBatchDictData } = useDictionary()
// const dictData = await getBatchDictData(['request_methods', 'sys_common_status'])

// 方法2：使用 createDictData（响应式）
const dictDataMap = createDictData(['request_methods', 'response_status'])
import DictSelect from 'src/components/DictSelect.vue'

defineOptions({
  name: 'LogPage'
})

const $q = useQuasar()

const loading = ref(false)
const logDetailDialog = ref(false)
const logEditDialog = ref(false)
const logCreateDialog = ref(false)
const logs = ref([])
const currentLog = ref(null)

const queryForm = ref({
  username: '',
  requestMethod: '',
  status: null,
  // 时间范围
  dateRange: null,
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
    name: 'executionTime',
    label: '执行时间',
    field: 'executionTime',
    align: 'center'
  },
  {
    name: 'createTime',
    label: '操作时间',
    field: 'createTime',
    align: 'center',
    format: (val) => formatTime(val, 'YYYY-MM-DD HH:mm:ss'),
    sortable: true
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
]

// 调用方法 下拉框
const methodOptions = computed(() => {
  if (!dictDataMap.request_methods?.value) {
    return []
  }
  return dictDataMap.request_methods.value.map(item => ({
    label: item.dictLabel,
    value: item.dictLabel // 使用 dictLabel 作为 value，因为实际请求方法是 GET、POST 等
  }))
})


const statusOptions = computed(() => {
  if(!dictDataMap.response_status?.value) {
      return []
  }
  return dictDataMap.response_status.value.map(item => ({
    label: item.dictLabel,
    value: item.dictValue
  }))
})


const rowsPerPageOptions = [5, 10, 20, 50, 100]

const dateRangeDisplay = computed(() => {
  if (!queryForm.value.dateRange) return ''
  if (queryForm.value.dateRange.from && queryForm.value.dateRange.to) {
    return `${queryForm.value.dateRange.from} ~ ${queryForm.value.dateRange.to}`
  }
  if (queryForm.value.dateRange &&!queryForm.value.dateRange.from) {
    return `${queryForm.value.dateRange} ~ ${queryForm.value.dateRange}`
  }
  return ''
})

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
  if (time < 500) return 'positive'
  if (time < 1000) return 'warning'
  return 'negative'
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

const loadLogs = async (props) => {
  loading.value = true
  
  try {
    const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value
    
    // 构建查询参数，根据查询类型选择对应字段
    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy || 'createTime',
      orderDirection: descending ? 'desc' : 'asc',
      usernameLike: queryForm.value.username, // 用户名查询（模糊查询）
      operationDescLike: queryForm.value.operationDesc,
      requestMethod: queryForm.value.requestMethod,
      status: queryForm.value.status,
    }

    // 日期范围查询方式2************可选链操作符 和 空值合并操作符****
    const dateRange = queryForm.value.dateRange
    if (dateRange) {
      const startDate = dateRange?.from ?? dateRange
      const endDate = dateRange?.to ?? dateRange
      
      params.createTimeBetween = [
        `${startDate} 00:00:01`,
        `${endDate} 23:59:59`
      ]
    }
    
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

const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1 // Reset to first page when changing rows per page
  loadLogs()
}

const onPageChange = (newPage) => {
  pagination.value.page = newPage
  onRequest({ pagination: pagination.value })
}

const resetQuery = () => {
  queryForm.value = {
    username: '',
    requestMethod: '',
    status: null,
    // 时间范围
    dateRange: null,
  }
  loadLogs()
}

const showLogDetail = (log) => {
  currentLog.value = log
  logDetailDialog.value = true
}

const showLogEdit = (log) => {
  currentLog.value = log
  logEditDialog.value = true
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

// 根据字典的key 获取字典值
const getStatusLabel = (status) => {
  if (!dictDataMap.response_status?.value) {
    return status
  }
  const item = dictDataMap.response_status.value.find(item => item.dictValue == status)
  return item ? item.dictLabel : status
}

const clearDateRange = () => {
  queryForm.value.dateRange = null
}

const handleRefresh = () => {
  loadLogs()
}

const handleSubmit = async (logData) => {
  try {
    if (logData.id) {
      // 编辑日志
      await logApi.update(logData.id, logData)
      $q.notify({
        type: 'positive',
        message: '日志更新成功'
      })
    } else {
      // 新增日志
      await logApi.create(logData)
      $q.notify({
        type: 'positive',
        message: '日志创建成功'
      })
    }
    loadLogs()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '操作失败'
    })
  }
}

onMounted(() => {
  loadLogs()
})
</script>

<style lang="scss" scoped>
</style>
