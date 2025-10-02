<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '编辑字典类型' : '新增字典类型' }}</div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.dictName"
            outlined
            label="字典名称"
            dense
            :rules="[rules.required('字典名称')]"
          >
            <template v-slot:before>
              <span class="text-red">*</span>
            </template>
          </q-input>

          <q-input
            v-model="formData.dictType"
            outlined
            label="字典类型"
            dense
            :rules="[rules.required('字典类型'), rules.dictType]"
            hint="建议格式：sys_user_sex"
          >
            <template v-slot:before>
              <span class="text-red">*</span>
            </template>
          </q-input>

          <q-input
            v-model="formData.remark"
            label="备注"
            outlined
            type="textarea"
            rows="3"
            dense
            style="margin-left: 38px;"
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

const formRef = ref(null);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formData = ref({
  id: null,
  dictName: '',
  dictType: '',
  remark: ''
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
  dictType: (val) =>
    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val) || '字典类型只能包含字母、数字和下划线，且不能以数字开头',
};

// 监听数据变化，初始化表单
watch(() => props.dictTypeData, (newData) => {
  if (newData) {
    formData.value = {
      id: newData.id,
      dictName: newData.dictName,
      dictType: newData.dictType,
      remark: newData.remark || ''
    }
  } else {
    formData.value = {
      id: null,
      dictName: '',
      dictType: '',
      remark: ''
    }
  }
}, { immediate: true })

const onSubmit = () => {
  // 验证表单
  formRef.value.validate().then((success) => {
    if (!success) {
      return
    }
    // 提交数据
    emit('submit', { ...formData.value })
  })
}

const onCancel = () => {
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
</style>
