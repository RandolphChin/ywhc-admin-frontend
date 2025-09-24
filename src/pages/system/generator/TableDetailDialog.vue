<template>
  <q-dialog v-model="visible" class="table-detail-dialog">
    <q-card class="dialog-card" style="min-width: 1000px; max-width: 1200px; max-height: 90vh">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-h6">表结构详情</div>
            <q-chip 
              v-if="tableData" 
              color="primary" 
              text-color="white" 
              :label="tableData.tableName"
              class="q-ml-md"
            />
          </div>
          <div class="flex items-center q-gutter-sm">
            <q-btn 
              flat 
              round 
              icon="close" 
              color="grey-7"
              @click="handleClose"
            >
              <q-tooltip>关闭</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="dialog-content">
        <div v-if="tableData">
          <!-- 表基本信息 -->
          <div class="q-mb-md">
            <div class="text-h6 q-mb-sm">基本信息</div>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  :model-value="tableData.tableName"
                  label="表名"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-6">
                <q-input
                  :model-value="tableData.tableComment"
                  label="表注释"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-6">
                <q-input
                  :model-value="tableData.engine"
                  label="存储引擎"
                  outlined
                  dense
                  readonly
                />
              </div>
              <div class="col-6">
                <q-input
                  :model-value="tableData.createTime"
                  label="创建时间"
                  outlined
                  dense
                  readonly
                />
              </div>
            </div>
          </div>

          <!-- 字段信息 -->
          <div>
            <div class="text-h6 q-mb-sm">字段信息</div>
            <q-table
              :rows="tableData.columns || []"
              :columns="columns"
              row-key="columnName"
              :pagination="{ rowsPerPage: 0 }"
              :no-data-label="'暂无字段'"
              flat
              bordered
            >
              <template v-slot:body-cell-isPrimaryKey="props">
                <q-td :props="props">
                  <q-icon 
                    v-if="props.row.isPrimaryKey" 
                    name="key" 
                    color="warning" 
                    size="sm"
                  >
                    <q-tooltip>主键</q-tooltip>
                  </q-icon>
                </q-td>
              </template>

              <template v-slot:body-cell-isAutoIncrement="props">
                <q-td :props="props">
                  <q-icon 
                    v-if="props.row.isAutoIncrement" 
                    name="auto_awesome" 
                    color="positive" 
                    size="sm"
                  >
                    <q-tooltip>自增</q-tooltip>
                  </q-icon>
                </q-td>
              </template>

              <template v-slot:body-cell-isNullable="props">
                <q-td :props="props">
                  <q-badge
                    :color="props.row.isNullable ? 'positive' : 'negative'"
                    :label="props.row.isNullable ? '是' : '否'"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-javaType="props">
                <q-td :props="props">
                  <q-badge
                    color="info"
                    :label="props.row.javaType"
                  />
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Footer Actions -->
      <q-card-actions class="dialog-footer q-pa-md bg-grey-1">
        <div class="flex items-center justify-end full-width">
          <q-btn 
            flat 
            label="关闭" 
            color="grey-7"
            @click="handleClose" 
            class="q-px-lg"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tableData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const columns = [
  {
    name: 'columnName',
    label: '字段名',
    field: 'columnName',
    align: 'left',
    style: 'width: 150px'
  },
  {
    name: 'dataType',
    label: '数据类型',
    field: 'dataType',
    align: 'center',
    style: 'width: 100px'
  },
  {
    name: 'columnLength',
    label: '长度',
    field: 'columnLength',
    align: 'center',
    style: 'width: 80px'
  },
  {
    name: 'isPrimaryKey',
    label: '主键',
    field: 'isPrimaryKey',
    align: 'center',
    style: 'width: 60px'
  },
  {
    name: 'isAutoIncrement',
    label: '自增',
    field: 'isAutoIncrement',
    align: 'center',
    style: 'width: 60px'
  },
  {
    name: 'isNullable',
    label: '允许空',
    field: 'isNullable',
    align: 'center',
    style: 'width: 80px'
  },
  {
    name: 'columnDefault',
    label: '默认值',
    field: 'columnDefault',
    align: 'center',
    style: 'width: 100px'
  },
  {
    name: 'javaType',
    label: 'Java类型',
    field: 'javaType',
    align: 'center',
    style: 'width: 100px'
  },
  {
    name: 'javaField',
    label: 'Java字段',
    field: 'javaField',
    align: 'left',
    style: 'width: 120px'
  },
  {
    name: 'columnComment',
    label: '注释',
    field: 'columnComment',
    align: 'left'
  }
]

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.table-detail-dialog {
  .dialog-card {
    .dialog-header {
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .dialog-footer {
      border-top: 1px solid #e0e0e0;
    }
  }
}
</style>