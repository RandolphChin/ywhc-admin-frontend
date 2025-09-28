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
                  <span class="field-label">数据权限-当前用户所在部门：</span>
                  <q-input
                    v-model.number="formData.deptId"
                    placeholder="数据权限-当前用户所在部门"
                    type="number"
                    outlined
                    dense
                    :readonly="isReadonly"
                    class="field-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">状态：0-禁用，1-正常：</span>
                  <q-select
                    v-model="formData.status"
                    :options="statusOptions"
                    placeholder="状态：0-禁用，1-正常"
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
                  <span class="field-label">删除标志：0-正常，1-删除：</span>
                  <q-input
                    v-model.number="formData.deleted"
                    placeholder="删除标志：0-正常，1-删除"
                    type="number"
                    outlined
                    dense
                    :readonly="isReadonly"
                    class="field-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">创建者：</span>
                  <q-input
                    v-model.number="formData.createBy"
                    placeholder="创建者"
                    type="number"
                    outlined
                    dense
                    :readonly="isReadonly"
                    class="field-input"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">更新者：</span>
                  <q-input
                    v-model.number="formData.updateBy"
                    placeholder="更新者"
                    type="number"
                    outlined
                    dense
                    :readonly="isReadonly"
                    class="field-input"
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
              :disable="submitting"
              class="q-px-lg"
            />
            <q-btn 
              v-if="!isReadonly"
              color="primary" 
              label="保存" 
              @click="handleSubmit"
              :loading="submitting"
              :disable="submitting"
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
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const submitting = ref(false)

const formData = ref({
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
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
  number: (val) => /^(0|[1-9]\d*)$/.test(val) || '请输入有效数字'
}

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

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