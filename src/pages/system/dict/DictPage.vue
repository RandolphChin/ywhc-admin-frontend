<template>
  <q-page>
    <!-- 搜索和操作栏 -->
    <q-card class="q-mb-sm">
      <q-card-section>
        <div class="row q-gutter-md items-center">
            <q-input
              v-model="typeQueryForm.dictName"
              label="字典名称"
              outlined
              dense
              clearable
              style="width: 160px;"
            />
            <q-input
              v-model="typeQueryForm.dictType"
              label="字典类型"
              outlined
              dense
              clearable
              style="width: 160px;"
            />
           
            <q-btn color="primary" icon="search" label="搜索" @click="loadDictTypes" />
            <q-btn color="secondary" icon="refresh" label="重置" @click="resetTypeQuery" />
        </div>
      </q-card-section>
    </q-card>

    <!-- 左右布局 -->
    <div class="row q-gutter-sm" style="height: calc(100vh - 200px)">
      <!-- 左侧：字典类型表格 -->
      <div class="col-5">
        <q-card>
          <q-card-section>
            <div class="row justify-between items-center q-mb-xs">
              <div class="text-h6">字典类型</div>
              <q-btn
                color="primary"
                icon="add"
                label="添加类型"
                @click="showTypeCreate"
              />
            </div>

            <q-table
              :rows="dictTypes"
              :columns="typeColumns"
              row-key="id"
              :loading="typeLoading"
              :pagination="typePagination"
              @request="onTypeRequest"
              binary-state-sort
              @row-click="onRowClick"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="edit"
                    @click="showTypeEdit(props.row)"
                  >
                    <q-tooltip>编辑</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="delete"
                    @click="deleteType(props.row)"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:bottom>
                <DataTablePagination
                  :pagination="typePagination"
                  @rows-per-page-change="onTypeRowsPerPageChange"
                  @page-change="onTypePageChange"
                />
          </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧：字典数据列表 -->
      <div class="col">
        <q-card>
          <q-card-section>
            <div class="row justify-between items-center q-mb-xs">
              <div class="text-h6">
                字典数据
                <span v-if="currentDictType" class="text-caption text-grey-6">
                  - {{ currentDictType.dictName }}
                </span>
              </div>
              <q-btn
                color="primary"
                icon="add"
                label="添加数据"
                @click="showDataCreate"
                :disable="!currentDictType"
              />
            </div>

            <div v-if="currentDictType">

              <q-table
                :rows="dictData"
                :columns="dataColumns"
                row-key="id"
                :loading="dataLoading"
                :pagination="dataPagination"
                @request="onDataRequest"
                binary-state-sort
              >
               <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      dense
                      color="primary"
                      icon="edit"
                      @click="showDataEdit(props.row)"
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
                    @rows-per-page-change="onDataRowsPerPageChange"
                    @page-change="onDataPageChange"
                  />
                </template>
              </q-table>
            </div>
            <div v-else class="text-center text-grey-6 q-pa-xl">
              <q-icon name="list" size="48px" class="q-mb-md" />
              <div>请选择一个字典类型查看其数据</div>
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
const selectedDictType = ref(null)
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
  dictName: '',
  dictType: '',
  status: null
})

const dataQueryForm = ref({
  dictLabel: '',
  dictValue: '',
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
  descending: true,
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


// 监听字典类型选择
watch(selectedDictType, (newVal) => {
  if (newVal) {
    currentDictType.value = newVal
    dataQueryForm.value.dictType = newVal.dictType
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
      orderBy: sortBy || 'id',
      orderDirection: descending ? 'desc' : 'asc',
      dictNameLike: typeQueryForm.value.dictName,
      dictTypeLike: typeQueryForm.value.dictType
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
    dictName: '',
    dictType: '',
    status: null
  }
  loadDictTypes()
}


const onRowClick = (evt, row) => {
  selectDictType(row)
}

const selectDictType = async (dictType) => {
  selectedDictType.value = dictType
  currentDictType.value = dictType
  dataQueryForm.value.dictType = dictType.dictType
  loadDictData()
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
        selectedDictType.value = null
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
