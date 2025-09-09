<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md" style="height: calc(100vh - 120px)">
      <!-- 左侧字典类型列表 -->
      <div class="col-4">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6 q-mb-md">字典类型</div>
            
            <!-- 搜索栏 -->
            <div class="row q-gutter-sm q-mb-md">
              <q-input
                v-model="typeQueryForm.dictNameLike"
                label="字典名称"
                outlined
                dense
                clearable
                style="width: 120px;"
              />
              <q-input
                v-model="typeQueryForm.dictTypeLike"
                label="字典类型"
                outlined
                dense
                clearable
                style="width: 120px;"
              />
              <q-btn color="primary" icon="search" @click="loadDictTypes" dense />
              <q-btn color="secondary" icon="refresh" @click="resetTypeQuery" dense />
            </div>

            <!-- 操作按钮 -->
            <div class="q-mb-md">
              <q-btn
                color="primary"
                icon="add"
                label="新增"
                @click="showTypeCreate"
                v-permission="'system:dict:add'"
                size="sm"
              />
            </div>

            <!-- 字典类型表格 -->
            <q-table
              :rows="dictTypes"
              :columns="typeColumns"
              row-key="id"
              :loading="typeLoading"
              :pagination="typePagination"
              @request="onTypeRequest"
              binary-state-sort
              :rows-per-page-options="rowsPerPageOptions"
              :no-data-label="'暂无数据'"
              :no-results-label="'未找到匹配的记录'"
              :loading-label="'加载中...'"
              :rows-per-page-label="'每页显示:'"
              selection="single"
              v-model:selected="selectedDictType"
              @selection="onDictTypeSelect"
              dense
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="props.row.status == 1 ? 'positive' : 'negative'"
                    :label="props.row.status == 1 ? '正常' : '停用'"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="edit"
                    @click="showTypeEdit(props.row)"
                    v-permission="'system:dict:edit'"
                  >
                    <q-tooltip>编辑</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    color="negative"
                    icon="delete"
                    @click="deleteType(props.row)"
                    v-permission="'system:dict:delete'"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:bottom>
                <DataTablePagination
                  :pagination="typePagination"
                  :rows-per-page-options="rowsPerPageOptions"
                  @rows-per-page-change="onTypeRowsPerPageChange"
                  @page-change="onTypePageChange"
                />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧字典数据列表 -->
      <div class="col-8">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              字典数据
              <span v-if="currentDictType" class="text-caption text-grey-6">
                ({{ currentDictType.dictName }} - {{ currentDictType.dictType }})
              </span>
            </div>

            <div v-if="!currentDictType" class="text-center text-grey-6 q-mt-xl">
              <q-icon name="info" size="48px" />
              <div class="q-mt-md">请先选择左侧字典类型</div>
            </div>

            <div v-else>
              <!-- 搜索栏 -->
              <div class="row q-gutter-sm q-mb-md">
                <q-input
                  v-model="dataQueryForm.dictLabelLike"
                  label="字典标签"
                  outlined
                  dense
                  clearable
                  style="width: 120px;"
                />
                <q-input
                  v-model="dataQueryForm.dictValueLike"
                  label="字典键值"
                  outlined
                  dense
                  clearable
                  style="width: 120px;"
                />
                <q-select
                  v-model="dataQueryForm.status"
                  :options="statusOptions"
                  label="状态"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  style="width: 100px;"
                />
                <q-btn color="primary" icon="search" @click="loadDictData" dense />
                <q-btn color="secondary" icon="refresh" @click="resetDataQuery" dense />
              </div>

              <!-- 操作按钮 -->
              <div class="q-mb-md">
                <q-btn
                  color="primary"
                  icon="add"
                  label="新增"
                  @click="showDataCreate"
                  v-permission="'system:dict:add'"
                  size="sm"
                />
              </div>

              <!-- 字典数据表格 -->
              <q-table
                :rows="dictData"
                :columns="dataColumns"
                row-key="id"
                :loading="dataLoading"
                :pagination="dataPagination"
                @request="onDataRequest"
                binary-state-sort
                :rows-per-page-options="rowsPerPageOptions"
                :no-data-label="'暂无数据'"
                :no-results-label="'未找到匹配的记录'"
                :loading-label="'加载中...'"
                :rows-per-page-label="'每页显示:'"
                dense
              >
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-badge
                      :color="props.row.status == 1 ? 'positive' : 'negative'"
                      :label="props.row.status == 1 ? '正常' : '停用'"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-isDefault="props">
                  <q-td :props="props">
                    <q-badge
                      :color="props.row.isDefault == 1 ? 'primary' : 'grey'"
                      :label="props.row.isDefault == 1 ? '是' : '否'"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-listClass="props">
                  <q-td :props="props">
                    <q-badge
                      v-if="props.row.listClass"
                      :color="props.row.listClass"
                      :label="props.row.listClass"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      dense
                      color="primary"
                      icon="edit"
                      @click="showDataEdit(props.row)"
                      v-permission="'system:dict:edit'"
                    >
                      <q-tooltip>编辑</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      color="negative"
                      icon="delete"
                      @click="deleteData(props.row)"
                      v-permission="'system:dict:delete'"
                    >
                      <q-tooltip>删除</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>

                <template v-slot:bottom>
                  <DataTablePagination
                    :pagination="dataPagination"
                    :rows-per-page-options="rowsPerPageOptions"
                    @rows-per-page-change="onDataRowsPerPageChange"
                    @page-change="onDataPageChange"
                  />
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 字典类型编辑对话框 -->
    <DictTypeEditDialog 
      v-model="typeEditDialog" 
      :dict-type-data="currentTypeData" 
      :is-edit="isTypeEdit"
      @submit="handleTypeSubmit"
    />

    <!-- 字典数据编辑对话框 -->
    <DictDataEditDialog 
      v-model="dataEditDialog" 
      :dict-data-data="currentDataData" 
      :dict-type="currentDictType?.dictType"
      :is-edit="isDataEdit"
      @submit="handleDataSubmit"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { dictApi } from 'src/api'
import { useQuasar } from 'quasar'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import DictTypeEditDialog from './DictTypeEditDialog.vue'
import DictDataEditDialog from './DictDataEditDialog.vue'

defineOptions({
  name: 'DictPage'
})

const $q = useQuasar()

// 字典类型相关
const typeLoading = ref(false)
const dictTypes = ref([])
const selectedDictType = ref([])
const currentDictType = ref(null)
const currentTypeData = ref(null)
const typeEditDialog = ref(false)
const isTypeEdit = ref(false)

// 字典数据相关
const dataLoading = ref(false)
const dictData = ref([])
const currentDataData = ref(null)
const dataEditDialog = ref(false)
const isDataEdit = ref(false)

// 查询表单
const typeQueryForm = ref({
  dictNameLike: '',
  dictTypeLike: '',
  status: null
})

const dataQueryForm = ref({
  dictLabelLike: '',
  dictValueLike: '',
  status: null
})

// 分页
const typePagination = ref({
  sortBy: 'createTime',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const dataPagination = ref({
  sortBy: 'dictSort',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// 表格列定义
const typeColumns = [
  {
    name: 'dictName',
    label: '字典名称',
    field: 'dictName',
    align: 'left',
    sortable: true
  },
  {
    name: 'dictType',
    label: '字典类型',
    field: 'dictType',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'remark',
    label: '备注',
    field: 'remark',
    align: 'left'
  },
  {
    name: 'createTime',
    label: '创建时间',
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

const dataColumns = [
  {
    name: 'dictSort',
    label: '排序',
    field: 'dictSort',
    align: 'center',
    sortable: true
  },
  {
    name: 'dictLabel',
    label: '字典标签',
    field: 'dictLabel',
    align: 'left',
    sortable: true
  },
  {
    name: 'dictValue',
    label: '字典键值',
    field: 'dictValue',
    align: 'left',
    sortable: true
  },
  {
    name: 'listClass',
    label: '回显样式',
    field: 'listClass',
    align: 'center'
  },
  {
    name: 'isDefault',
    label: '默认',
    field: 'isDefault',
    align: 'center'
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'remark',
    label: '备注',
    field: 'remark',
    align: 'left'
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
]

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '停用', value: 0 }
]

const rowsPerPageOptions = [5, 10, 20, 50, 100]

// 监听字典类型选择
watch(selectedDictType, (newVal) => {
  if (newVal && newVal.length > 0) {
    currentDictType.value = newVal[0]
    dataQueryForm.value.dictType = newVal[0].dictType
    loadDictData()
  } else {
    currentDictType.value = null
    dictData.value = []
  }
})

// 字典类型相关方法
const loadDictTypes = async (props) => {
  typeLoading.value = true
  
  try {
    const { page, rowsPerPage, sortBy, descending } = props?.pagination || typePagination.value
    
    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy || 'createTime',
      orderDirection: descending ? 'desc' : 'asc',
      dictNameLike: typeQueryForm.value.dictNameLike,
      dictTypeLike: typeQueryForm.value.dictTypeLike,
      status: typeQueryForm.value.status
    }
    
    const response = await dictApi.getDictTypeList(params)
    const pageData = response.data.data
    const records = pageData.records || []
    const total = pageData.total || 0

    dictTypes.value = records
    typePagination.value.rowsNumber = total
    typePagination.value.page = page
    typePagination.value.rowsPerPage = rowsPerPage
    typePagination.value.sortBy = sortBy
    typePagination.value.descending = descending
  } catch (error) {
    console.error('加载字典类型列表失败:', error)
  } finally {
    typeLoading.value = false
  }
}

const onTypeRequest = (props) => {
  loadDictTypes(props)
}

const onTypeRowsPerPageChange = (newRowsPerPage) => {
  typePagination.value.rowsPerPage = newRowsPerPage
  typePagination.value.page = 1
  loadDictTypes()
}

const onTypePageChange = (newPage) => {
  typePagination.value.page = newPage
  onTypeRequest({ pagination: typePagination.value })
}

const resetTypeQuery = () => {
  typeQueryForm.value = {
    dictNameLike: '',
    dictTypeLike: '',
    status: null
  }
  loadDictTypes()
}

const onDictTypeSelect = (details) => {
  // 处理字典类型选择
}

// 字典数据相关方法
const loadDictData = async (props) => {
  if (!currentDictType.value) return
  
  dataLoading.value = true
  
  try {
    const { page, rowsPerPage, sortBy, descending } = props?.pagination || dataPagination.value
    
    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy || 'dictSort',
      orderDirection: descending ? 'desc' : 'asc',
      dictType: currentDictType.value.dictType,
      dictLabelLike: dataQueryForm.value.dictLabelLike,
      dictValueLike: dataQueryForm.value.dictValueLike,
      status: dataQueryForm.value.status
    }
    
    const response = await dictApi.getDictDataList(params)
    const pageData = response.data.data
    const records = pageData.records || []
    const total = pageData.total || 0

    dictData.value = records
    dataPagination.value.rowsNumber = total
    dataPagination.value.page = page
    dataPagination.value.rowsPerPage = rowsPerPage
    dataPagination.value.sortBy = sortBy
    dataPagination.value.descending = descending
  } catch (error) {
    console.error('加载字典数据列表失败:', error)
  } finally {
    dataLoading.value = false
  }
}

const onDataRequest = (props) => {
  loadDictData(props)
}

const onDataRowsPerPageChange = (newRowsPerPage) => {
  dataPagination.value.rowsPerPage = newRowsPerPage
  dataPagination.value.page = 1
  loadDictData()
}

const onDataPageChange = (newPage) => {
  dataPagination.value.page = newPage
  onDataRequest({ pagination: dataPagination.value })
}

const resetDataQuery = () => {
  dataQueryForm.value = {
    dictLabelLike: '',
    dictValueLike: '',
    status: null
  }
  loadDictData()
}

// 字典类型CRUD操作
const showTypeCreate = () => {
  currentTypeData.value = null
  isTypeEdit.value = false
  typeEditDialog.value = true
}

const showTypeEdit = (dictType) => {
  currentTypeData.value = dictType
  isTypeEdit.value = true
  typeEditDialog.value = true
}

const deleteType = (dictType) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除字典类型"${dictType.dictName}"吗？删除后对应的字典数据也会被删除！`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await dictApi.deleteDictType(dictType.id)
      $q.notify({
        type: 'positive',
        message: '字典类型删除成功'
      })
      loadDictTypes()
      // 如果删除的是当前选中的字典类型，清空右侧数据
      if (currentDictType.value && currentDictType.value.id === dictType.id) {
        selectedDictType.value = []
        currentDictType.value = null
        dictData.value = []
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '删除失败'
      })
    }
  })
}

const handleTypeSubmit = async (typeData) => {
  try {
    if (typeData.id) {
      await dictApi.updateDictType(typeData)
      $q.notify({
        type: 'positive',
        message: '字典类型更新成功'
      })
    } else {
      await dictApi.createDictType(typeData)
      $q.notify({
        type: 'positive',
        message: '字典类型创建成功'
      })
    }
    loadDictTypes()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '操作失败'
    })
  }
}

// 字典数据CRUD操作
const showDataCreate = () => {
  currentDataData.value = null
  isDataEdit.value = false
  dataEditDialog.value = true
}

const showDataEdit = (dictData) => {
  currentDataData.value = dictData
  isDataEdit.value = true
  dataEditDialog.value = true
}

const deleteData = (dictDataItem) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除字典数据"${dictDataItem.dictLabel}"吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await dictApi.deleteDictData(dictDataItem.id)
      $q.notify({
        type: 'positive',
        message: '字典数据删除成功'
      })
      loadDictData()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '删除失败'
      })
    }
  })
}

const handleDataSubmit = async (dataData) => {
  try {
    if (dataData.id) {
      await dictApi.updateDictData(dataData)
      $q.notify({
        type: 'positive',
        message: '字典数据更新成功'
      })
    } else {
      await dictApi.createDictData(dataData)
      $q.notify({
        type: 'positive',
        message: '字典数据创建成功'
      })
    }
    loadDictData()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '操作失败'
    })
  }
}

onMounted(() => {
  loadDictTypes()
})
</script>

<style lang="scss" scoped>
</style>
