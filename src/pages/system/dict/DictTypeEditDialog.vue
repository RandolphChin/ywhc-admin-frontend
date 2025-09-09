<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '编辑字典类型' : '新增字典类型' }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.dictName"
            label="字典名称 *"
            outlined
            :rules="[val => !!val || '字典名称不能为空']"
          />

          <q-input
            v-model="formData.dictType"
            label="字典类型 *"
            outlined
            :rules="[
              val => !!val || '字典类型不能为空',
              val => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val) || '字典类型只能包含字母、数字和下划线，且不能以数字开头'
            ]"
            hint="建议格式：sys_user_sex"
          />

          <q-select
            v-model="formData.status"
            :options="statusOptions"
            label="状态 *"
            outlined
            emit-value
            map-options
            :rules="[val => val !== null && val !== undefined || '请选择状态']"
          />

          <q-input
            v-model="formData.remark"
            label="备注"
            outlined
            type="textarea"
            rows="3"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey" @click="onCancel" />
        <q-btn 
          label="确定" 
          color="primary" 
          @click="onSubmit"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  dictTypeData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const loading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formData = ref({
  id: null,
  dictName: '',
  dictType: '',
  status: 1,
  remark: ''
})

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '停用', value: 0 }
]

// 监听数据变化，初始化表单
watch(() => props.dictTypeData, (newData) => {
  if (newData) {
    formData.value = {
      id: newData.id,
      dictName: newData.dictName,
      dictType: newData.dictType,
      status: newData.status,
      remark: newData.remark || ''
    }
  } else {
    formData.value = {
      id: null,
      dictName: '',
      dictType: '',
      status: 1,
      remark: ''
    }
  }
}, { immediate: true })

const onSubmit = () => {
  // 验证表单
  if (!formData.value.dictName) {
    return
  }
  if (!formData.value.dictType) {
    return
  }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.value.dictType)) {
    return
  }
  if (formData.value.status === null || formData.value.status === undefined) {
    return
  }

  loading.value = true
  
  // 提交数据
  emit('submit', { ...formData.value })
  
  setTimeout(() => {
    loading.value = false
    dialogVisible.value = false
  }, 500)
}

const onCancel = () => {
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
</style>
