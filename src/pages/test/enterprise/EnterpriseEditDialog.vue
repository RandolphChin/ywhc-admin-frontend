<template>
  <q-dialog v-model="visible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 800px; max-width: 1200px; max-height: 90vh">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-h6">
              <span v-if="isReadonly">查看测试企业</span>
              <span v-else-if="isEdit">编辑测试企业</span>
              <span v-else>添加测试企业</span>
            </div>
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
        <div class="edit-form">
          <q-form ref="formRef" @submit="handleSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">企业名称：</span>
                  <q-input
                    v-model="formData.enterpriseName"
                    placeholder="企业名称"
                    outlined
                    dense
                    :readonly="isReadonly"
                    :rules="[rules.required('企业名称')]"
                    class="field-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">企业地址：</span>
                  <q-input
                    v-model="formData.enterpriseAddress"
                    placeholder="企业地址"
                    outlined
                    dense
                    :readonly="isReadonly"
                    :rules="[rules.required('企业地址')]"
                    class="field-input"
                  />
                </div>
              </div>
              
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">企业状态：</span>
                  <q-select
                    v-model="formData.status"
                    :options="statusOptions"
                    placeholder="请选择状态"
                    outlined
                    dense
                    emit-value
                    map-options
                    :readonly="isReadonly"
                    class="field-input"
                  />
                </div>
              </div>
              
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">创建者：</span>
                  <q-input
                    v-model="formData.createByName"
                    placeholder="创建者"
                    outlined
                    dense
                    readonly
                    class="field-input readonly-field"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">创建时间：</span>
                  <q-input
                    v-model="formattedCreateTime"
                    placeholder="创建时间"
                    outlined
                    dense
                    readonly
                    class="field-input readonly-field"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">更新者：</span>
                  <q-input
                    v-model="formData.updateByName"
                    placeholder="更新者"
                    outlined
                    dense
                    readonly
                    class="field-input readonly-field"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">更新时间：</span>
                  <q-input
                    v-model="formattedUpdateTime"
                    placeholder="更新时间"
                    outlined
                    dense
                    readonly
                    class="field-input readonly-field"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Footer Actions -->
      <q-card-actions class="dialog-footer q-pa-md bg-grey-1">
        <div class="flex items-center justify-end full-width">
          <div class="q-gutter-sm">
            <q-btn 
              flat 
              label="取消" 
              color="grey-7"
              @click="handleClose" 
              class="q-px-lg"
            />
            <q-btn 
              v-if="!isReadonly"
              color="primary" 
              label="保存" 
              @click="handleSubmit"
              class="q-px-lg"
            />
          </div>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { formatTime } from 'src/utils/index'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  enterpriseData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  isReadonly: {
    type: Boolean,
    default: false
  },
  dictDataMap: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})


const formData = ref({
  id: null,
  enterpriseName: '',
  enterpriseAddress: '',
  deptId: null,
  status: null,
  deleted: null,
  createTime: null,
  updateTime: null,
  createByName: null,
  updateByName: null,
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
  number: (val) => /^(0|[1-9]\d*)$/.test(val) || '请输入有效数字'
}

const statusOptions = computed(() => {
  if (props.dictDataMap?.enterprise_status?.value) {
    return props.dictDataMap.enterprise_status.value.map(item => ({
      label: item.dictLabel,
      value: Number(item.dictValue) // 将字符串转换为数值类型
    }))
  }
  // 默认选项，当字典数据未加载时使用
  return []
})

// 格式化创建时间
const formattedCreateTime = computed(() => {
  return formData.value.createTime ? formatTime(formData.value.createTime, 'YYYY-MM-DD HH:mm:ss') : ''
})

// 格式化更新时间
const formattedUpdateTime = computed(() => {
  return formData.value.updateTime ? formatTime(formData.value.updateTime, 'YYYY-MM-DD HH:mm:ss') : ''
})

watch(() => props.enterpriseData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  } else {
    // 重置表单
    formData.value = {
      id: null,
      enterpriseName: '',
      enterpriseAddress: '',
      deptId: null,
      status: null,
      deleted: null,
      createTime: null,
      updateTime: null,
      createBy: null,
      updateBy: null,
    }
  }
}, { deep: true, immediate: true })

const formRef = ref(null)

const handleSubmit = () => {
  if (props.isReadonly) return
  
  formRef.value.validate().then((success) => {
    if (success) {
      emit('submit', formData.value)
    }
  })
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>

</style>