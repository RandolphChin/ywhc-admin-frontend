<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '编辑字典数据' : '新增字典数据' }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model.number="formData.dictSort"
                label="字典排序"
                outlined
                type="number"
                :rules="[val => val >= 0 || '排序不能小于0']"
              />
            </div>
            <div class="col">
              <q-select
                v-model="formData.status"
                :options="statusOptions"
                label="状态 *"
                outlined
                emit-value
                map-options
                :rules="[val => val !== null && val !== undefined || '请选择状态']"
              />
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="formData.dictLabel"
                label="字典标签 *"
                outlined
                :rules="[val => !!val || '字典标签不能为空']"
              />
            </div>
            <div class="col">
              <q-input
                v-model="formData.dictValue"
                label="字典键值 *"
                outlined
                :rules="[val => !!val || '字典键值不能为空']"
              />
            </div>
          </div>

          <q-input
            v-model="formData.dictType"
            label="字典类型"
            outlined
            readonly
            bg-color="grey-2"
          />

          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="formData.cssClass"
                label="样式属性"
                outlined
                hint="CSS样式类名"
              />
            </div>
            <div class="col">
              <q-select
                v-model="formData.listClass"
                :options="listClassOptions"
                label="表格回显样式"
                outlined
                clearable
                emit-value
                map-options
              />
            </div>
          </div>

          <q-checkbox
            v-model="formData.isDefault"
            :true-value="1"
            :false-value="0"
            label="是否默认"
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
  dictDataData: {
    type: Object,
    default: null
  },
  dictType: {
    type: String,
    default: ''
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
  dictSort: 0,
  dictLabel: '',
  dictValue: '',
  dictType: '',
  cssClass: '',
  listClass: '',
  isDefault: 0,
  status: 1,
  remark: ''
})

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '停用', value: 0 }
]

const listClassOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Positive', value: 'positive' },
  { label: 'Negative', value: 'negative' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
  { label: 'Success', value: 'success' },
  { label: 'Danger', value: 'danger' }
]

// 监听数据变化，初始化表单
watch(() => props.dictDataData, (newData) => {
  if (newData) {
    formData.value = {
      id: newData.id,
      dictSort: newData.dictSort || 0,
      dictLabel: newData.dictLabel,
      dictValue: newData.dictValue,
      dictType: newData.dictType,
      cssClass: newData.cssClass || '',
      listClass: newData.listClass || '',
      isDefault: newData.isDefault || 0,
      status: newData.status,
      remark: newData.remark || ''
    }
  } else {
    formData.value = {
      id: null,
      dictSort: 0,
      dictLabel: '',
      dictValue: '',
      dictType: props.dictType,
      cssClass: '',
      listClass: '',
      isDefault: 0,
      status: 1,
      remark: ''
    }
  }
}, { immediate: true })

// 监听字典类型变化
watch(() => props.dictType, (newType) => {
  if (newType && !props.isEdit) {
    formData.value.dictType = newType
  }
})

const onSubmit = () => {
  // 验证表单
  if (!formData.value.dictLabel) {
    return
  }
  if (!formData.value.dictValue) {
    return
  }
  if (formData.value.dictSort < 0) {
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
