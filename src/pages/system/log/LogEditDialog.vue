<template>
  <q-dialog v-model="visible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 800px; max-width: 1200px; max-height: 90vh">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon :name="isEdit ? 'edit' : 'add'" class="q-mr-sm text-primary" size="24px" />
            <div>
              <div class="text-h6">{{ isEdit ? '编辑日志' : '添加日志' }}</div>
              <div class="text-caption text-grey-6">
                {{ isEdit ? '修改日志信息' : '创建新的日志记录' }}
              </div>
            </div>
          </div>
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
      </q-card-section>

      <q-separator />

      <!-- Form Content -->
      <q-card-section class="dialog-content">
        <q-form ref="formRef" @submit="handleSubmit" class="full-height">
          <div v-if="loading" class="q-pa-md">
            <q-skeleton height="200px" class="q-mb-md" />
            <q-skeleton height="150px" class="q-mb-md" />
            <q-skeleton height="100px" />
          </div>
          <LogForm 
            v-else
            v-model="formData" 
            :is-readonly="false"
          />
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Footer Actions -->
      <q-card-actions align="right" class="dialog-footer q-pa-md bg-grey-1">
        <div class="flex items-center justify-between full-width">
          <div class="text-caption text-grey-6">
            <q-icon name="info" class="q-mr-xs" />
表单编辑中
          </div>
          <div class="q-gutter-sm">
            <q-btn 
              flat 
              label="重置" 
              color="grey-7"
              @click="handleReset"
              :disable="submitting"
              class="q-px-lg"
            />
            <q-btn 
              flat 
              label="取消" 
              color="grey-7"
              @click="handleClose" 
              :disable="submitting"
              class="q-px-lg"
            />
            <q-btn 
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
import { useQuasar } from 'quasar'
import LogForm from './LogForm.vue'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  logData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref()
const loading = ref(false)
const submitting = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref({
  id: null,
  username: '',
  operation: '',
  method: '',
  uri: '',
  ip: '',
  userAgent: '',
  status: '',
  time: '',
  createTime: '',
  params: '',
  result: '',
  errorMsg: ''
})


watch(() => props.logData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  }
}, { deep: true, immediate: true })


const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    submitting.value = true
    
    // 表单验证
    const isValid = await formRef.value.validate()
    if (!isValid) {
      $q.notify({
        message: '请检查表单输入',
        color: 'negative',
        position: 'top'
      })
      return
    }

    // 提交数据
    await emit('submit', formData.value)
    
    $q.notify({
      message: props.isEdit ? '编辑成功' : '添加成功',
      color: 'positive',
      position: 'top'
    })
    
    visible.value = false
  } catch (error) {
    $q.notify({
      message: error.message || '操作失败',
      color: 'negative',
      position: 'top'
    })
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  visible.value = false
}

const handleReset = () => {
  $q.dialog({
    title: '确认重置',
    message: '确定要重置表单吗？所有修改将丢失。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    formData.value = { ...props.logData }
    $q.notify({
      message: '表单已重置',
      color: 'info',
      position: 'top'
    })
  })
}
</script>

<!-- 样式已移至全局 CSS: src/css/detail-edit-common.scss -->
