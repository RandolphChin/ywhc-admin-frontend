<template>
  <q-page>
    <!-- 搜索和操作栏 -->
    <q-card>
      <q-card-section>
        <div class="row q-gutter-sm items-center">
          <q-input v-model="queryForm.enterpriseName" label="企业名称" outlined dense clearable style="width: 160px;" />
          <q-input v-model="queryForm.enterpriseAddress" label="企业地址" outlined dense clearable style="width: 160px;" />
          <!-- 状态查询 方式2-->
          <DictSelect v-model="queryForm.status" dict-type="enterprise_status" label="企业状态" :include-all="false"
            style="width: 160px;" />
          <q-input v-model="dateRangeDisplay" label="时间范围" outlined dense clearable readonly style="width: 250px;"
            class="cursor-pointer" @clear="clearDateRange">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer" />
            </template>
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="queryForm.dateRange" mask="YYYY-MM-DD" range>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="关闭" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-input>
          <q-btn color="primary" outline icon="search" label="搜索" @click="loadEnterprises" />
          <q-btn color="grey-6" outline icon="refresh" label="重置" @click="resetQuery" />
        </div>
        <div class="row q-mt-xs q-gutter-sm">
          <q-btn color="primary" outline icon="add" label="新增" @click="showEnterpriseCreate"
            v-permission="'test:enterprise:add'" />
          <q-btn color="primary" outline icon="delete" label="批量删除" @click="batchDelete"
            :disable="selectedRows.length === 0" v-permission="'test:enterprise:remove'" />
          <q-btn color="primary" outline icon="download" label="导出" @click="exportEnterprises"
            v-permission="'test:enterprise:export'" />
        </div>
      </q-card-section>
    </q-card>

    <!-- 测试企业表格 -->
    <q-card>
      <q-card-section>
        <q-table class="compact-checkbox-table" :rows="enterprises" :columns="columns" row-key="id" :loading="loading"
        v-model:pagination="pagination" @request="onRequest" binary-state-sort :rows-per-page-options="[5, 10, 20, 50, 100]"
           selection="multiple" v-model:selected="selectedRows">

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense size="sm" color="primary" icon="visibility" @click="showEnterpriseDetail(props.row)">
                <q-tooltip>查看详情</q-tooltip>
              </q-btn>
              <q-btn flat dense size="sm" color="primary" icon="edit" @click="showEnterpriseEdit(props.row)"
                v-permission="'test:enterprise:edit'">
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn flat dense size="sm" color="primary" icon="delete" @click="deleteEnterprise(props.row)"
                v-permission="'test:enterprise:remove'">
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- 自定义分页显示 -->
          <template v-slot:bottom>
            <DataTablePagination
              :pagination="pagination"
              @rows-per-page-change="onRowsPerPageChange"
              @page-change="onPageChange"
            />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 测试企业对话框 -->
    <EnterpriseEditDialog v-model="enterpriseDialog" :enterprise-data="currentEnterprise"
      :is-edit="dialogMode === 'edit'" :is-readonly="dialogMode === 'view'" :dict-data-map="dictDataMap" @submit="handleSubmit" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { enterpriseApi } from 'src/api'
import { useQuasar } from 'quasar'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import EnterpriseEditDialog from './EnterpriseEditDialog.vue'
import { formatTime } from 'src/utils/index'
import { createDictData } from 'src/utils/dict'
import DictSelect from 'src/components/DictSelect.vue'

// 方法2：使用 createDictData（响应式）
const dictDataMap = createDictData(['enterprise_status'])

defineOptions({
  name: 'TestEnterprisePage'
})

const $q = useQuasar()

const loading = ref(false)
const enterpriseDialog = ref(false)
const dialogMode = ref('view') // 'view', 'edit', 'create'
const enterprises = ref([])
const currentEnterprise = ref(null)
const selectedRows = ref([])

const queryForm = ref({
  enterpriseName: '',
  enterpriseAddress: '',
  status: null,
  // 时间范围 - 初始化为空对象以避免undefined警告
  dateRange: { from: '', to: '' }
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
    name: 'enterpriseName',
    label: '企业名称',
    field: 'enterpriseName',
    align: 'left',
    sortable: true
  },
  {
    name: 'enterpriseAddress',
    label: '企业地址',
    field: 'enterpriseAddress',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: '企业状态',
    field: 'status',
    align: 'left',
    format: (val) => getStatusDescription(val)
  },
  {
    name: 'createTime',
    label: '创建时间',
    field: 'createTime',
    align: 'left',
    format: (val) => formatTime(val, 'YYYY-MM-DD HH:mm:ss'),
    sortable: true
  },
  {
    name: 'updateTime',
    label: '更新时间',
    field: 'updateTime',
    align: 'left',
    format: (val) => formatTime(val, 'YYYY-MM-DD HH:mm:ss'),
  },
  {
    name: 'createByName',
    label: '创建者',
    field: 'createByName',
    align: 'left',
  },
  {
    name: 'updateByName',
    label: '更新者',
    field: 'updateByName',
    align: 'left',
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
]

const loadEnterprises = async (props) => {
  loading.value = true

  try {
    // 确保正确获取分页和排序参数
    const currentPagination = props?.pagination || pagination.value
    const { page, rowsPerPage, sortBy, descending } = currentPagination

    console.log('当前排序状态:', { sortBy, descending }) // 添加日志

    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy || 'createTime',
      orderDirection: descending ? 'desc' : 'asc',
      ...queryForm.value
    }

    console.log('排序参数:', { sortBy, descending, orderDirection: descending ? 'desc' : 'asc' })

    // 日期范围查询处理
    const dateRange = queryForm.value.dateRange
    if (dateRange) {
      const isObject = typeof dateRange === 'object'
      const startDate = isObject ? dateRange.from : dateRange
      const endDate = isObject ? dateRange.to : dateRange
      
      if (startDate && endDate) {
        params.createTimeBetween = [
          `${startDate} 00:00:01`,
          `${endDate} 23:59:59`
        ]
      }
    }

    const response = await enterpriseApi.getList(params)
    const pageData = response.data.data
    const records = pageData.records || []
    const total = pageData.total || 0

    enterprises.value = records
   
    pagination.value.rowsNumber = total
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending


  } catch (error) {
    console.error('加载测试企业列表失败:', error)
  } finally {
    loading.value = false
  }
}

const onRequest = (props) => {
  loadEnterprises(props)
}


const resetQuery = () => {
  queryForm.value = {
    enterpriseName: '',
    enterpriseAddress: '',
    status: null,
    dateRange: { from: '', to: '' }
  }
  loadEnterprises()
}

/**
 *  引用传递 vs 值传递
 * 深拷贝方式，创建新对象 JSON.parse(JSON.stringify(enterprise)) 
 *  在父组件传递数据时进行深拷贝，这样子组件的修改就不会影响到原始数据
 */
const showEnterpriseDetail = (enterprise) => {

  // JSON.parse(JSON.stringify(enterprise)) 
  // currentEnterprise.value = enterprise // 引用传递
  currentEnterprise.value = JSON.parse(JSON.stringify(enterprise)) // currentEnterprise全新的独立对象
  dialogMode.value = 'view'
  enterpriseDialog.value = true
}

const showEnterpriseEdit = (enterprise) => {
  currentEnterprise.value = JSON.parse(JSON.stringify(enterprise))
  dialogMode.value = 'edit'
  enterpriseDialog.value = true
}

const showEnterpriseCreate = () => {
  currentEnterprise.value = null
  dialogMode.value = 'create'
  enterpriseDialog.value = true
}

const deleteEnterprise = (enterprise) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除这条测试企业记录吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await enterpriseApi.delete(enterprise.id)
      $q.notify({
        type: 'positive',
        message: '测试企业删除成功'
      })
      loadEnterprises()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '删除失败'
      })
    }
  })
}

const batchDelete = () => {
  $q.dialog({
    title: '确认批量删除',
    message: `确定要删除选中的 ${selectedRows.value.length} 条测试企业记录吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const ids = selectedRows.value.map(row => row.id)
      await enterpriseApi.batchDelete(ids)
      $q.notify({
        type: 'positive',
        message: '测试企业批量删除成功'
      })
      selectedRows.value = []
      loadEnterprises()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '批量删除失败'
      })
    }
  })
}

const exportEnterprises = async () => {
  try {
    const response = await enterpriseApi.export(queryForm.value)

    // 从响应头中提取文件名
    let fileName = `测试企业_${new Date().getTime()}.xlsx` // 默认文件名
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '') // 移除引号
      }
    }

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: '测试企业导出成功'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '导出失败'
    })
  }
}

const handleRefresh = () => {
  loadEnterprises()
}

const handleSubmit = async (enterpriseData) => {
  try {
    if (enterpriseData.id) {
      await enterpriseApi.update(enterpriseData)
      $q.notify({
        type: 'positive',
        message: '测试企业更新成功'
      })
    } else {
      await enterpriseApi.create(enterpriseData)
      $q.notify({
        type: 'positive',
        message: '测试企业创建成功'
      })
    }
    enterpriseDialog.value = false
    loadEnterprises()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '操作失败'
    })
  }
}

const datePopup = ref(null)

const clearDateRange = () => {
  queryForm.value.dateRange = { from: '', to: '' }
}

const showDatePicker = () => {
  if (datePopup.value) {
    datePopup.value.show()
  }
}

const dateRangeDisplay = computed(() => {
  const dateRange = queryForm.value.dateRange
  if (!dateRange) return ''
  
  const isObject = typeof dateRange === 'object'
  const startDate = isObject ? dateRange.from : dateRange
  const endDate = isObject ? dateRange.to : dateRange
  
  return (startDate && endDate) ? `${startDate} ~ ${endDate}` : ''
})
// 根据字典的key 获取字典值
const getStatusDescription = (status) => {
  if (!dictDataMap.enterprise_status?.value) {
    return status
  }
  const item = dictDataMap.enterprise_status.value.find(item => item.dictValue == status)
  return item ? item.dictLabel : status
}


const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1 // Reset to first page when changing rows per page
  loadEnterprises()
}

const onPageChange = (newPage) => {
  pagination.value.page = newPage
  onRequest({ pagination: pagination.value })
}

onMounted(() => {
  loadEnterprises()
})
</script>

<style lang="scss" scoped>

</style>