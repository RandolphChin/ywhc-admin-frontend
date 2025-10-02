<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '编辑字典数据' : '新增字典数据' }}</div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.dictLabel"
            label="字典标签"
            outlined
            dense
            :rules="[rules.required('字典标签')]"
          >
            <template v-slot:before>
              <span class="text-red">*</span>
            </template>
          </q-input>

          <q-input
            v-model="formData.dictValue"
            label="字典键值"
            outlined
            dense
            :rules="[rules.required('字典键值')]"
          >
          <template v-slot:before>
              <span class="text-red">*</span>
            </template>
          </q-input>

          <q-input
            v-model="formData.dictSort"
            label="字典排序"
            outlined
            dense
            :rules="[rules.required('字典排序'), rules.dictSort]"
          >
          <template v-slot:before>
            <span class="text-red">*</span>
          </template>
        </q-input>

          <q-input
            v-model="formData.dictType"
            label="字典类型"
            outlined
            readonly
            bg-color="grey-2"
            dense
            style="margin-left: 35px;"
          />

          <q-input
            v-model="formData.remark"
            label="备注"
            outlined
            type="textarea"
            rows="3"
            dense
            style="margin-left: 35px;"
            />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey" @click="onCancel" />
        <q-btn 
          label="确定" 
          color="primary" 
          @click="onSubmit"
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

const formRef = ref(null);

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
  remark: ''
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
  dictSort: (val) =>
    /^(0|[1-9]\d*)$/.test(val) || '字典排序不能小于0',
};

// 监听数据变化，初始化表单
watch(() => props.dictDataData, (newData) => {
  if (newData) {
    formData.value = {
      id: newData.id,
      dictSort: newData.dictSort || 0,
      dictLabel: newData.dictLabel,
      dictValue: newData.dictValue,
      dictType: newData.dictType,
      remark: newData.remark || ''
    }
  } else {
    formData.value = {
      id: null,
      dictSort: 0,
      dictLabel: '',
      dictValue: '',
      dictType: props.dictType,
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
  formRef.value.validate().then((success) => {
    if (!success) {
      return
    }
    // 提交数据
    emit('submit', { ...formData.value })
    // 重置表单数据
      formData.value = {
        id: null,
        dictSort: 0,
        dictLabel: '',
        dictValue: '',
        dictType: props.dictType,
        remark: ''
      }
  })
}

const onCancel = () => {
  // 重置表单数据
  formData.value = {
    id: null,
    dictSort: 0,
    dictLabel: '',
    dictValue: '',
    dictType: props.dictType,
    remark: ''
  }
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
</style>
