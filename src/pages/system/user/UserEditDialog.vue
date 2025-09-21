<template>
  <q-dialog v-model="visible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 500px; max-width: 1200px; max-height: 90vh">
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
        <div class="text-h6">{{ isEdit ? '编辑用户' : '添加用户' }}</div>
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
                <span class="field-label required">用户名：</span>     
                <q-input
                  v-model="formData.username"
                  label="用户名"
                  :rules="[rules.required('用户名')]"
                  outlined
                  dense
                  :readonly="isEdit"
                  style="width: 100%;"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">昵称：</span>
                <q-input
                  v-model="formData.nickname"
                  label="昵称"
                  :rules="[rules.required('昵称')]"
                  outlined
                  dense
                  style="width: 100%;"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">邮箱：</span>
                <q-input
                  v-model="formData.email"
                  label="邮箱"
                  type="email"
                  outlined
                  dense
                  style="width: 100%;"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">手机号：</span>
                <q-input
                  v-model="formData.mobile"
                  label="手机号"
                  outlined
                  dense
                  style="width: 100%;"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">性别：</span>
                <q-select
                  v-model="formData.gender"
                  :options="genderOptions"
                  label="性别"
                  outlined
                  dense
                  emit-value
                  map-options
                  style="width: 100%;"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">状态：</span>
                <q-select
                  v-model="formData.status"
                  :options="statusOptions"
                  label="状态"
                  outlined
                  dense
                  emit-value
                  map-options
                  style="width: 100%;"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label require">角色：</span>
                <q-select
                  v-model="formData.roleIds"
                  :options="roleOptions"
                  label="角色"
                  outlined
                  dense
                  multiple
                  emit-value
                  map-options
                  use-chips
                  :rules="[rules.required('角色')]"
                  style="width: 100%;"
                />
              </div>
            </div>
            <div class="col-12">
              <div class="edit-field-block">
                <span class="field-label">备注：</span>
                <q-input
                  v-model="formData.remark"
                  label="备注"
                  type="textarea"
                  outlined
                  dense
                  rows="3"
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
  userData: {
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
  roleOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const submitting = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref({
  id: null,
  username: '',
  nickname: '',
  email: '',
  mobile: '',
  gender: 0,
  status: 1,
  roleIds: [],
  remark: ''
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
};

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未知', value: 0 }
]

watch(() => props.userData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  }
}, { deep: true, immediate: true })

const formRef = ref(null)

const handleSubmit = () => {
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
