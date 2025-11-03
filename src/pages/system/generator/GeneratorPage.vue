<template>
  <q-page>
    <!-- 🔍 搜索和操作栏 / Barre de recherche et d’actions / Search & Action bar -->
    <q-card class="q-mb-xs">
      <q-card-section>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="queryForm.tableName"
            :label="t('system.generator.table_name')"
            outlined dense clearable style="width: 200px;"
          />
          <q-input
            v-model="queryForm.tableComment"
            :label="t('system.generator.table_comment')"
            outlined dense clearable style="width: 200px;"
          />
          <q-btn color="primary" icon="search" :label="t('action.search')" @click="loadTables" />
          <q-btn color="secondary" icon="refresh" :label="t('action.reset')" @click="resetQuery" />
        </div>
      </q-card-section>
    </q-card>

    <!-- 🗄️ 数据库表格 / Tableau des tables / Database tables -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="tables"
          :columns="columns"
          row-key="tableName"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="rowsPerPageOptions"
          :no-data-label="t('common.noData')"
          :no-results-label="t('common.noResults')"
          :loading-label="t('common.loading')"
          :rows-per-page-label="t('common.perPage')"
          selection="multiple"
          v-model:selected="selectedRows"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense color="primary" icon="visibility" @click="showTableDetail(props.row)">
                <q-tooltip>{{ t('action.view') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat dense color="positive" icon="code"
                @click="showGenerateConfig(props.row)"
                v-permission="'generator:code:generate'"
              >
                <q-tooltip>{{ t('action.generate') }}</q-tooltip>
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

    <!-- 📋 表结构详情 / Détails de table / Table details -->
    <TableDetailDialog v-model="tableDetailDialog" :table-data="currentTable" />

    <!-- ⚙️ 代码生成配置 / Configuration de génération / Generation config -->
    <GenerateConfigDialog
      v-model="generateConfigDialog"
      :table-data="currentTable"
      @generate="handleGenerate"
      @preview="handlePreview"
    />

    <!-- 🧾 代码预览 / Aperçu du code / Code preview -->
    <CodePreviewDialog
      v-model="codePreviewDialog"
      :generated-code="generatedCode"
      @download="handleDownload"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { generatorApi } from 'src/api'
import { useQuasar } from 'quasar'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import TableDetailDialog from './TableDetailDialog.vue'
import GenerateConfigDialog from './GenerateConfigDialog.vue'
import CodePreviewDialog from './CodePreviewDialog.vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'GeneratorPage' })

const $q = useQuasar()
const { t } = useI18n()

// 状态管理 / States
const loading = ref(false)
const tableDetailDialog = ref(false)
const generateConfigDialog = ref(false)
const codePreviewDialog = ref(false)
const tables = ref([])
const currentTable = ref(null)
const selectedRows = ref([])
const generatedCode = ref(null)
const currentConfig = ref(null)

const queryForm = ref({ tableName: '', tableComment: '' })

// 分页 / Pagination
const pagination = ref({
  sortBy: 'createTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const rowsPerPageOptions = [5, 10, 20, 50, 100]

// 列定义（响应 i18n）/ Columns (reactive to i18n)
const columns = computed(() => [
  { name: 'tableName',   label: t('system.generator.table_name'),   field: 'tableName',   align: 'left',   sortable: true },
  { name: 'tableComment',label: t('system.generator.table_comment'),field: 'tableComment',align: 'left',   sortable: true },
  { name: 'engine',      label: t('system.generator.engine'),       field: 'engine',      align: 'center' },
  { name: 'createTime',  label: t('system.generator.create_time'),  field: 'createTime',  align: 'center', sortable: true },
  { name: 'actions',     label: t('system.generator.actions'),      field: 'actions',     align: 'center' }
])

// 加载表列表 / Load table list
const loadTables = async () => {
  loading.value = true
  try {
    // 确保正确获取分页和排序参数
    const currentPagination = props?.pagination || pagination.value
    const { page, rowsPerPage, sortBy, descending } = currentPagination

    // 构建查询参数
    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy || 'createTime',
      orderDirection: descending ? 'desc' : 'asc'
    }

    // 添加筛选条件
    if (queryForm.value.tableName) {
      params.tableName = queryForm.value.tableName
    }
    if (queryForm.value.tableComment) {
      params.tableComment = queryForm.value.tableComment
    }

    // 后端筛选和分页
    const response = await generatorApi.getTableList(params)
    const pageData = response.data.data
    const records = pageData.records || []
    const total = pageData.total || 0

    tables.value = records
    pagination.value.rowsNumber = total
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: t('system.generator.load_failed') })
  } finally {
    loading.value = false
  }
}

const onRequest = () => { loadTables() }

const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1
  loadTables()
}

const onPageChange = (newPage) => {
  pagination.value.page = newPage
  onRequest()
}

const resetQuery = () => {
  queryForm.value = { tableName: '', tableComment: '' }
  loadTables()
}

const showTableDetail = async (table) => {
  try {
    const response = await generatorApi.getTableInfo(table.tableName)
    currentTable.value = response.data.data
    tableDetailDialog.value = true
  } catch {
    $q.notify({ type: 'negative', message: t('system.generator.detail_failed') })
  }
}

const showGenerateConfig = (table) => {
  currentTable.value = table
  generateConfigDialog.value = true
}

const handlePreview = async (config) => {
  try {
    $q.loading.show({ message: t('system.generator.preview_generating') })
    const response = await generatorApi.previewCode(config)
    generatedCode.value = response.data.data
    currentConfig.value = config
    codePreviewDialog.value = true
  } catch (error) {
    $q.notify({ type: 'negative', message: error?.response?.data?.message || t('system.generator.preview_failed') })
  } finally {
    $q.loading.hide()
  }
}

const handleGenerate = async (config) => {
  try {
    $q.loading.show({ message: t('system.generator.generate_running') })
    const response = await generatorApi.downloadCode(config)
    let fileName = `${config.businessName}_code.zip`
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const m = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (m && m[1]) fileName = m[1].replace(/['"]/g, '')
    }
    const blob = new Blob([response.data], { type: 'application/zip' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)

    $q.notify({ type: 'positive', message: t('system.generator.generate_success') })
  } catch (error) {
    $q.notify({ type: 'negative', message: error?.response?.data?.message || t('system.generator.generate_failed') })
  } finally {
    $q.loading.hide()
  }
}

const handleDownload = () => {
  if (currentConfig.value) handleGenerate(currentConfig.value)
}

onMounted(loadTables)
</script>

<style lang="scss" scoped></style>
