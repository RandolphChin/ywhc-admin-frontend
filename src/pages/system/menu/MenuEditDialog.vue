<template>
  <q-dialog v-model="visible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 800px; max-width: 1200px; max-height: 90vh">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-h6">{{ isEdit ? '编辑菜单' : '添加菜单' }}</div>
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
                <span class="field-label required">父级菜单：</span>
                <q-select
                  v-model="formData.parentId"
                  :options="parentMenuOptions"
                  placeholder="父级菜单"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[rules.required('父级菜单')]"
                  clearable
                  class="field-input"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">菜单类型：</span>
                <q-select
                  v-model="formData.menuType"
                  :options="typeOptions"
                  placeholder="菜单类型"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="onTypeChange"
                  class="field-input"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label required">菜单标题：</span>
                <q-input
                  v-model="formData.menuName"
                  placeholder="菜单标题"
                  :rules="[rules.required('菜单标题')]"
                  outlined
                  dense
                  class="field-input"
                />
              </div>
            </div>
            <div v-if="formData.menuType !== 2" class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label required">路由路径：</span>
                <q-input
                  v-model="formData.path"
                  placeholder="路由路径"
                  :rules="[rules.required('路由路径')]"
                  outlined
                  dense
                  class="field-input"
                  hint="以/开头 + 父级菜单路由路径 + 模块名称 ，如: /system/menu"
                />
              </div>
            </div>
            <div v-if="formData.menuType === 1" class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label required">组件路径：</span>
                <q-input
                  v-model="formData.component"
                  placeholder="组件路径"
                  :rules="[rules.required('组件路径')]"
                  outlined
                  dense
                  class="field-input"
                  hint="相对于pages路径，没有/开头，如: system/menu 或者 system/menu/MenuPage.vue"
                />
              </div>
            </div>  
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label required">权限标识：</span>
                <q-input
                  v-model="formData.permission"
                  placeholder="权限标识"
                  :rules="[rules.required('权限标识')]"
                  outlined
                  dense
                  class="field-input"
                  hint="父级模块+:子模块:操作，如: system:menu:list 和 system:menu:add"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">菜单图标：</span>
                <IconSelector
                  v-model="formData.icon"
                  class="field-input"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label required">排序：</span>
                <q-input
                  v-model.number="formData.sortOrder"
                  placeholder="排序"
                  type="number"
                  :rules="[rules.required('排序'), rules.sortOrder]"
                  outlined
                  dense
                  class="field-input"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">状态：</span>
                <q-select
                  v-model="formData.status"
                  :options="statusOptions"
                  placeholder="状态"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="field-input"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">显示状态：</span>
                <q-select
                  v-model="formData.isVisible"
                  :options="visibleOptions"
                  placeholder="显示状态"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="field-input"
                />
              </div>
            </div>
            <div class="col-12">
              <div class="edit-field-block">
                <div class="field-label q-mb-xs">备注：</div>
                <q-input
                  v-model="formData.remark"
                  placeholder="备注"
                  type="textarea"
                  outlined
                  dense
                  rows="3"
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
import IconSelector from '@/components/IconSelector.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  menuData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  parentMenuOptions: {
    type: Array,
    default: () => []
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
  parentId: null,
  menuType: 0,
  menuName: '',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sortOrder: 0,
  status: 1,
  isVisible: 1,
  remark: ''
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
  sortOrder: (val) =>
    /^(0|[1-9]\d*)$/.test(val) || '排序不能小于0',
};

const typeOptions = [
  { label: '目录', value: 0 },
  { label: '菜单', value: 1 },
  { label: '按钮', value: 2 }
]

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

const visibleOptions = [
  { label: '显示', value: 1 },
  { label: '隐藏', value: 0 }
]

watch(() => props.menuData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  }
}, { deep: true, immediate: true })

const onTypeChange = (menuType) => {
  // 根据类型清空相关字段
  if (menuType === 2) { // 按钮
    formData.value.path = ''
    formData.value.component = ''
    formData.value.isVisible = 1
  } else {
    formData.value.permission = ''
  }
}

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
