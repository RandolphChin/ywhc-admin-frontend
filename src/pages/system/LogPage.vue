<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">日志管理</div>

    <!-- 搜索和操作栏 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-sm items-center">
            <!-- 操作用户查询 -->
            <div class="column q-gutter-xs">
              <q-input
                v-model="usernameQuery"
                :label="`操作用户 (${queryForm.queryType.username === 'exact' ? '精确' : '模糊'})`"
                outlined
                dense
                clearable
                style="width: 160px;"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    size="sm"
                    :icon="queryForm.queryType.username === 'exact' ? 'search' : 'manage_search'"
                    @click="toggleQueryType('username')"
                  >
                    <q-tooltip>切换查询模式</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>
            
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
            <div class="column q-gutter-xs">
              <q-select
                v-if="queryForm.queryType.requestMethod === 'exact'"
                v-model="queryForm.requestMethod"
                :options="methodOptions"
                label="请求方法 (精确)"
                outlined
                dense
                clearable
                emit-value
                map-options
                style="width: 160px;"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="list"
                    @click="toggleQueryType('requestMethod')"
                  >
                    <q-tooltip>切换为多选模式</q-tooltip>
                  </q-btn>
                </template>
              </q-select>
              
              <q-select
                v-else
                v-model="queryForm.requestMethods"
                :options="methodOptions"
                label="请求方法 (多选)"
                outlined
                dense
                clearable
                emit-value
                map-options
                multiple
                use-chips
                style="width: 160px;"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="radio_button_checked"
                    @click="toggleQueryType('requestMethod')"
                  >
                    <q-tooltip>切换为单选模式</q-tooltip>
                  </q-btn>
                </template>
              </q-select>
            </div>
            
            <!-- 状态查询 -->
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
            <q-input
              v-model="dateRangeDisplay"
              label="时间范围"
              outlined
              dense
              clearable
              style="width: 250px;"
              placeholder="请选择时间范围"
              class="cursor-pointer"
              @clear="clearDateRange"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
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
                </q-icon>
              </template>
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
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
            </q-td>
          </template>

          <template v-slot:bottom>
            <div class="row items-center justify-start full-width" v-if="pagination.rowsNumber > 0">
              <div class="q-mr-md">
                共 {{ pagination.rowsNumber }} 条记录
              </div>
              <div class="row items-center">
                <div class="row items-center q-gutter-sm" >
                  <span>每页显示</span>
                  <q-select
                    v-model="pagination.rowsPerPage"
                    :options="rowsPerPageOptions"
                    dense
                    outlined
                    class="ultra-compact-select"
                    @update:model-value="onRowsPerPageChange"
                  />
                  <span>条</span>
                </div>
                <q-pagination
                  v-model="pagination.page"
                  :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                  @update:model-value="onRequest({ pagination })"
                  direction-links
                  boundary-links
                  :max-pages="5"
          
                />
              </div>
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

<script setup>
import { ref, onMounted, computed } from 'vue'
import { logApi } from 'src/api'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'LogPage'
})

const $q = useQuasar()

const loading = ref(false)
const logDetailDialog = ref(false)
const logs = ref([])
const currentLog = ref(null)

const queryForm = ref({
  // 精确查询字段
  username: '',
  requestMethod: '',
  status: null,
  
  // 模糊查询字段
  usernameLike: '',
  operationDesc: '',
  moduleLike: '',
  ipAddressLike: '',
  
  // 范围查询字段
  executionTimeRange: [],
  createTimeRange: null,
  
  // IN查询字段
  requestMethods: [],
  statusList: [],
  
  // 时间范围
  dateRange: null,
  
  // 查询类型控制
  queryType: {
    username: 'exact', // exact | fuzzy
    operationDesc: 'fuzzy',
    requestMethod: 'exact' // exact | in
  }
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

const statusOptions = [
  { label: '成功', value: 1 },
  { label: '失败', value: 0 }
]

const rowsPerPageOptions = [5, 10, 20, 50, 100]

// 计算属性用于动态v-model绑定
const usernameQuery = computed({
  get: () => queryForm.value.queryType.username === 'exact' 
    ? queryForm.value.username 
    : queryForm.value.usernameLike,
  set: (value) => {
    if (queryForm.value.queryType.username === 'exact') {
      queryForm.value.username = value
      queryForm.value.usernameLike = '' // 清空另一个字段
    } else {
      queryForm.value.usernameLike = value
      queryForm.value.username = '' // 清空另一个字段
    }
  }
})

// 切换查询类型的方法
const toggleQueryType = (field) => {
  switch (field) {
    case 'username':
      queryForm.value.queryType.username = 
        queryForm.value.queryType.username === 'exact' ? 'fuzzy' : 'exact'
      // 清空相关字段
      queryForm.value.username = ''
      queryForm.value.usernameLike = ''
      break
    case 'requestMethod':
      queryForm.value.queryType.requestMethod = 
        queryForm.value.queryType.requestMethod === 'exact' ? 'in' : 'exact'
      // 清空相关字段
      queryForm.value.requestMethod = ''
      queryForm.value.requestMethods = []
      break
  }
}

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
    
    // 构建查询参数，根据查询类型选择对应字段
    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy || 'createTime',
      orderDirection: descending ? 'desc' : 'asc'
    }
    
    // 用户名查询
    if (queryForm.value.queryType.username === 'exact' && queryForm.value.username) {
      params.username = queryForm.value.username
    } else if (queryForm.value.queryType.username === 'fuzzy' && queryForm.value.usernameLike) {
      params.usernameLike = queryForm.value.usernameLike
    }
    
    // 操作描述（模糊查询）
    if (queryForm.value.operationDesc) {
      params.operationDesc = queryForm.value.operationDesc
    }
    
    // 请求方法查询
    if (queryForm.value.queryType.requestMethod === 'exact' && queryForm.value.requestMethod) {
      params.requestMethod = queryForm.value.requestMethod
    } else if (queryForm.value.queryType.requestMethod === 'in' && queryForm.value.requestMethods?.length > 0) {
      params.requestMethods = queryForm.value.requestMethods
    }
    
    // 状态查询
    if (queryForm.value.status !== null && queryForm.value.status !== undefined) {
      params.status = queryForm.value.status
    }
    
    // 日期范围查询
    if (queryForm.value.dateRange?.from && queryForm.value.dateRange?.to) {
      params.createTimeRange = {
        startTime: queryForm.value.dateRange.from + ' 00:00:00',
        endTime: queryForm.value.dateRange.to + ' 23:59:59'
      }
    }
    
    // 执行时间范围查询
    if (queryForm.value.executionTimeRange?.length === 2) {
      params.executionTimeRange = queryForm.value.executionTimeRange
    }
    
    // Remove undefined values to avoid sending empty parameters
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '' || 
          (Array.isArray(params[key]) && params[key].length === 0)) {
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

const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1 // Reset to first page when changing rows per page
  loadLogs()
}

const resetQuery = () => {
  queryForm.value = {
    // 精确查询字段
    username: '',
    requestMethod: '',
    status: null,
    
    // 模糊查询字段
    usernameLike: '',
    operationDesc: '',
    moduleLike: '',
    ipAddressLike: '',
    
    // 范围查询字段
    executionTimeRange: [],
    createTimeRange: null,
    
    // IN查询字段
    requestMethods: [],
    statusList: [],
    
    // 时间范围
    dateRange: null,
    
    // 查询类型控制
    queryType: {
      username: 'exact',
      operationDesc: 'fuzzy',
      requestMethod: 'exact'
    }
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

const getStatusLabel = (status) => {
  // 操作状态：0-失败，1-成功
  const labels = { 0: '失败', 1: '成功' }
  return labels[status] || '未知'
}

const clearDateRange = () => {
  queryForm.value.dateRange = null
}

onMounted(() => {
  loadLogs()
})
</script>

<style lang="scss" scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}



</style>
