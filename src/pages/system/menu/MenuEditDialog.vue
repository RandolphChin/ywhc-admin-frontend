<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? '编辑菜单' : '添加菜单' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-select
            v-model="formData.parentId"
            :options="parentMenuOptions"
            label="父级菜单"
            outlined
            dense
            emit-value
            map-options
            clearable
          />

          <q-select
            v-model="formData.type"
            :options="typeOptions"
            label="菜单类型"
            outlined
            dense
            emit-value
            map-options
            @update:model-value="onTypeChange"
          />

          <q-input
            v-model="formData.title"
            label="菜单标题"
            :rules="[val => !!val || '请输入菜单标题']"
            outlined
            dense
          />

          <q-input
            v-model="formData.name"
            label="菜单名称"
            outlined
            dense
          />

          <q-input
            v-if="formData.type !== 3"
            v-model="formData.path"
            label="路由路径"
            outlined
            dense
          />

          <q-input
            v-if="formData.type === 2"
            v-model="formData.component"
            label="组件路径"
            outlined
            dense
          />

          <q-input
            v-if="formData.type === 3"
            v-model="formData.permission"
            label="权限标识"
            outlined
            dense
          />

          <q-input
            v-model="formData.icon"
            label="菜单图标"
            outlined
            dense
          />

          <q-input
            v-model.number="formData.sort"
            label="排序"
            type="number"
            outlined
            dense
          />

          <div class="row q-gutter-md">
            <q-select
              v-model="formData.status"
              :options="statusOptions"
              label="状态"
              outlined
              dense
              emit-value
              map-options
              class="col"
            />

            <q-select
              v-if="formData.type !== 3"
              v-model="formData.visible"
              :options="visibleOptions"
              label="显示状态"
              outlined
              dense
              emit-value
              map-options
              class="col"
            />
          </div>

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
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref({
  id: null,
  parentId: null,
  type: 1,
  title: '',
  name: '',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  status: 1,
  visible: 1,
  remark: ''
})

const typeOptions = [
  { label: '目录', value: 1 },
  { label: '菜单', value: 2 },
  { label: '按钮', value: 3 }
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

const onTypeChange = (type) => {
  // 根据类型清空相关字段
  if (type === 3) { // 按钮
    formData.value.path = ''
    formData.value.component = ''
    formData.value.visible = 1
  } else {
    formData.value.permission = ''
  }
}

const handleSubmit = () => {
  emit('submit', formData.value)
}

const handleClose = () => {
  visible.value = false
}
</script>
