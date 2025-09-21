<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '编辑角色' : '添加角色' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form ref="formRef" @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.roleName"
            label="角色名称"
            :rules="[rules.required('角色名称')]"
            outlined
            dense
          >
            <template v-slot:before>
              <span class="text-red">*</span>
            </template>
          </q-input>

          <q-input
            v-model="formData.roleKey"
            label="角色编码"
            :rules="[rules.required('角色编码')]"
            outlined
            dense
            :readonly="isEdit"
          >
            <template v-slot:before>
              <span class="text-red">*</span>
            </template>
          </q-input>

          <q-select
            v-model="formData.status"
            :options="statusOptions"
            label="状态"
            outlined
            dense
            emit-value
            map-options
          />

          <q-input
            v-model="formData.remark"
            label="备注"
            type="textarea"
            outlined
            dense
            rows="3"
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="取消" @click="handleClose" />
            <q-btn type="submit" color="primary" label="确定" />
          </div>
        </q-form>
      </q-card-section>
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
  roleData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref({
  id: null,
  roleName: '',
  roleKey: '',
  status: 1,
  remark: ''
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
};

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

watch(() => props.roleData, (newData) => {
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
