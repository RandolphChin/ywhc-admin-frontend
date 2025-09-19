<template>
  <q-dialog v-model="dialogVisible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 800px; max-width: 1200px; max-height: 90vh">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-h6">{{ isEdit ? '编辑部门' : '添加部门' }}</div>
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
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label required">上级部门：</span>
                <q-select
                  v-model="formData.parentId"
                  :options="flattenedParentOptions"
                  option-value="id"
                  option-label="label"
                  placeholder="上级部门"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  :rules="[rules.required('上级部门')]"
                  class="field-input"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label">部门类型：</span>
                <q-select
                  v-model="formData.deptType"
                  :options="deptTypeOptions"
                  placeholder="部门类型"
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
                <span class="field-label required">部门名称：</span>
                <q-input
                  v-model="formData.deptName"
                  placeholder="部门名称"
                  :rules="[
                    rules.required('部门名称'),
                    rules.deptName
                  ]"
                  outlined
                  dense
                  maxlength="30"
                  class="field-input"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="edit-field-inline">
                <span class="field-label required">部门编码：</span>
                <q-input
                  v-model="formData.deptCode"
                  placeholder="部门编码"
                  :rules="[
                    rules.required('部门编码'),
                    rules.deptCode,
                  ]"
                  outlined
                  dense
                  maxlength="20"
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
                  :rules="[
                    rules.required('排序'),
                    rules.sortOrder
                  ]"
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
                  maxlength="200"
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
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { deptApi } from "src/api";

defineOptions({
  name: "DeptEditDialog"
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  deptData: {
    type: Object,
    default: null,
  },
  parentOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(["update:modelValue", "success"])

const $q = useQuasar();

// 响应式数据
const submitting = ref(false);
const formData = ref({
  id: null,
  parentId: 0,
  deptName: "",
  deptCode: "",
  deptType: 2,
  leaderName: "",
  phone: "",
  email: "",
  sortOrder: 0,
  status: 1,
  remark: "",
});

// 部门类型选项
const deptTypeOptions = [
  { label: "公司", value: 1 },
  { label: "部门", value: 2 },
  { label: "小组", value: 3 },
];

// 状态选项
const statusOptions = [
  { label: "正常", value: 1 },
  { label: "停用", value: 0 },
];

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isEdit = computed(() => !!formData.value.id);

// 扁平化父部门选项
const flattenedParentOptions = computed(() => {
  const flatten = (nodes, level = 0) => {
    const result = [];
    for (const node of nodes) {
      const prefix = "　".repeat(level);
      result.push({
        id: node.id,
        label: prefix + node.deptName,
        disabled: isEdit.value && node.id === formData.value.id, // 不能选择自己作为父部门
      });
      if (node.children && node.children.length > 0) {
        result.push(...flatten(node.children, level + 1));
      }
    }
    return result;
  };
  return flatten(props.parentOptions);
});

// 方法
const resetForm = () => {
  formData.value = {
    id: null,
    parentId: 0,
    deptName: "",
    deptCode: "",
    deptType: 2,
    leaderName: "",
    phone: "",
    email: "",
    sortOrder: 0,
    status: 1,
    remark: "",
  };
};

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`,
  deptName: (val) => val.length <= 30 || '部门名称不能超过30个字符',
  deptCode: (val) => /^[a-zA-Z0-9_-]+$/.test(val) || '部门编码只能包含字母、数字、下划线和横线',
  sortOrder: (val) =>
    /^(0|[1-9]\d*)$/.test(val) || '排序不能小于0',
};

// 监听器
watch(
  () => props.deptData,
  (newData) => {
    if (newData) {
      formData.value = { ...newData };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

const validateForm = async () => {
  // 校验部门名称唯一性
  try {
    const nameResponse = await deptApi.checkDeptNameUnique({
      id: formData.value.id,
      deptName: formData.value.deptName,
      parentId: formData.value.parentId,
    });
    if (!nameResponse.data.data) {
      throw new Error("部门名称已存在");
    }
  } catch (error) {
    throw new Error(error.message || "部门名称校验失败");
  }

  // 校验部门编码唯一性
  try {
    const codeResponse = await deptApi.checkDeptCodeUnique({
      id: formData.value.id,
      deptCode: formData.value.deptCode,
    });
    if (!codeResponse.data.data) {
      throw new Error("部门编码已存在");
    }
  } catch (error) {
    throw new Error(error.message || "部门编码校验失败");
  }
};

const handleSubmit = async () => {
  try {
    submitting.value = true;

    // 表单验证
    await validateForm();

    // 提交数据
    if (isEdit.value) {
      await deptApi.updateDept(formData.value);
      $q.notify({
        type: "positive",
        message: "修改成功",
      });
    } else {
      await deptApi.saveDept(formData.value);
      $q.notify({
        type: "positive",
        message: "新增成功",
      });
    }

    emit("success");
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "操作失败",
    });
  } finally {
    submitting.value = false;
  }
};
</script>

