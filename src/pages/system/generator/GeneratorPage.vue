<template>
  <q-page>
    <!-- 搜索和操作栏 -->
    <q-card class="q-mb-xs">
      <q-card-section>
        <div class="row q-gutter-sm items-center">
          <q-input v-model="queryForm.tableName" label="表名" outlined dense clearable style="width: 200px;" />
          <q-input v-model="queryForm.tableComment" label="表注释" outlined dense clearable style="width: 200px;" />
          <q-btn color="primary" icon="search" label="搜索" @click="loadTables" />
          <q-btn color="secondary" icon="refresh" label="重置" @click="resetQuery" />
        </div>
      </q-card-section>
    </q-card>

    <!-- 数据库表格 -->
    <q-card>
      <q-card-section>
        <q-table :rows="tables" :columns="columns" row-key="tableName" :loading="loading" :pagination="pagination"
          @request="onRequest" binary-state-sort :rows-per-page-options="rowsPerPageOptions" :no-data-label="'暂无数据'"
          :no-results-label="'未找到匹配的记录'" :loading-label="'加载中...'" :rows-per-page-label="'每页显示:'" selection="multiple"
          v-model:selected="selectedRows">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense color="primary" icon="visibility" @click="showTableDetail(props.row)">
                <q-tooltip>查看表结构</q-tooltip>
              </q-btn>
              <q-btn flat dense color="positive" icon="code" @click="showGenerateConfig(props.row)"
                v-permission="'generator:code:generate'">
                <q-tooltip>生成代码</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:bottom>
            <DataTablePagination :pagination="pagination" :rows-per-page-options="rowsPerPageOptions"
              @rows-per-page-change="onRowsPerPageChange" @page-change="onPageChange" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 表结构详情对话框 -->
    <TableDetailDialog v-model="tableDetailDialog" :table-data="currentTable" />

    <!-- 代码生成配置对话框 -->
    <GenerateConfigDialog v-model="generateConfigDialog" :table-data="currentTable" @generate="handleGenerate"
      @preview="handlePreview" />

    <!-- 代码预览对话框 -->
    <CodePreviewDialog v-model="codePreviewDialog" :generated-code="generatedCode" @download="handleDownload" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { generatorApi } from 'src/api'
import { useQuasar } from 'quasar'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import TableDetailDialog from './TableDetailDialog.vue'
import GenerateConfigDialog from './GenerateConfigDialog.vue'
import CodePreviewDialog from './CodePreviewDialog.vue'

defineOptions({
  name: 'GeneratorPage'
})

const $q = useQuasar()

const loading = ref(false)
const tableDetailDialog = ref(false)
const generateConfigDialog = ref(false)
const codePreviewDialog = ref(false)
const tables = ref([])
const currentTable = ref(null)
const selectedRows = ref([])
const generatedCode = ref(null)
const currentConfig = ref(null)

const queryForm = ref({
  tableName: '',
  tableComment: ''
})

const pagination = ref({
  sortBy: 'tableName',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const columns = [
  {
    name: 'tableName',
    label: '表名',
    field: 'tableName',
    align: 'left',
    sortable: true
  },
  {
    name: 'tableComment',
    label: '表注释',
    field: 'tableComment',
    align: 'left',
    sortable: true
  },
  {
    name: 'engine',
    label: '存储引擎',
    field: 'engine',
    align: 'center'
  },
  {
    name: 'createTime',
    label: '创建时间',
    field: 'createTime',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
]

const rowsPerPageOptions = [5, 10, 20, 50, 100]

const loadTables = async (props) => {
  loading.value = true

  try {
    const response = await generatorApi.getTableList()
    let tableList = response.data.data || []

    // 前端过滤
    if (queryForm.value.tableName) {
      tableList = tableList.filter(table =>
        table.tableName.toLowerCase().includes(queryForm.value.tableName.toLowerCase())
      )
    }
    if (queryForm.value.tableComment) {
      tableList = tableList.filter(table =>
        table.tableComment && table.tableComment.toLowerCase().includes(queryForm.value.tableComment.toLowerCase())
      )
    }

    tables.value = tableList
    pagination.value.rowsNumber = tableList.length
  } catch (error) {
    console.error('加载数据库表列表失败:', error)
    $q.notify({
      type: 'negative',
      message: '加载数据库表列表失败'
    })
  } finally {
    loading.value = false
  }
}

const onRequest = (props) => {
  loadTables(props)
}

const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1
  loadTables()
}

const onPageChange = (newPage) => {
  pagination.value.page = newPage
  onRequest({ pagination: pagination.value })
}

const resetQuery = () => {
  queryForm.value = {
    tableName: '',
    tableComment: ''
  }
  loadTables()
}

const showTableDetail = async (table) => {
  try {
    const response = await generatorApi.getTableInfo(table.tableName)
    currentTable.value = response.data.data
    tableDetailDialog.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '获取表详情失败'
    })
  }
}

const showGenerateConfig = (table) => {
  currentTable.value = table
  generateConfigDialog.value = true
}

const handlePreview = async (config) => {
  try {
    $q.loading.show({ message: '正在生成代码预览...' })
    const response = await generatorApi.previewCode(config)
    generatedCode.value = response.data.data
    currentConfig.value = config // 保存当前配置
    codePreviewDialog.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '代码预览失败'
    })
  } finally {
    $q.loading.hide()
  }
}

const handleGenerate = async (config) => {
  try {
    $q.loading.show({ message: '正在生成代码...' })
    const response = await generatorApi.downloadCode(config)
    // 从响应头中提取文件名
    let fileName = `${config.businessName}_code.zip` // 默认文件名
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '') // 移除引号
      }
    }

    // 下载文件
    const blob = new Blob([response.data], { type: 'application/zip' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: '代码生成成功'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '代码生成失败'
    })
  } finally {
    $q.loading.hide()
  }
}

const handleDownload = () => {
  if (currentConfig.value) {
    handleGenerate(currentConfig.value)
  }
}

onMounted(() => {
  loadTables()
})
</script>

<style lang="scss" scoped></style>