<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '编辑用户' : '添加用户' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.username"
            label="用户名"
            :rules="[val => !!val || '请输入用户名']"
            outlined
            dense
            :readonly="isEdit"
          />

          <q-input
            v-model="formData.nickname"
            label="昵称"
            :rules="[val => !!val || '请输入昵称']"
            outlined
            dense
          />

          <q-input
            v-model="formData.email"
            label="邮箱"
            type="email"
            outlined
            dense
          />

          <q-input
            v-model="formData.phone"
            label="手机号"
            outlined
            dense
          />

          <q-select
            v-model="formData.gender"
            :options="genderOptions"
            label="性别"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-model="formData.status"
            :options="statusOptions"
            label="状态"
            outlined
            dense
            emit-value
            map-options
          />

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
  userData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  roleOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref({
  id: null,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  gender: 0,
  status: 1,
  roleIds: [],
  remark: ''
})

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

const handleSubmit = () => {
  emit('submit', formData.value)
}

const handleClose = () => {
  visible.value = false
}
</script>
