<template>
  <q-dialog v-model="dialogVisible" persistent @hide="handleClose">
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isEdit ? '编辑部门' : '新增部门' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="handleClose" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- 父部门选择 -->
          <q-select
            v-model="formData.parentId"
            :options="flattenedParentOptions"
            option-value="id"
            option-label="label"
            label="上级部门"
            outlined
            clearable
            emit-value
            map-options
          />

          <!-- 部门名称 -->
          <q-input
            v-model="formData.deptName"
            label="部门名称"
            outlined
            :rules="[
              (val) => !!val || '请输入部门名称',
              (val) => val.length <= 30 || '部门名称不能超过30个字符',
            ]"
            maxlength="30"
          />

          <!-- 部门编码 -->
          <q-input
            v-model="formData.deptCode"
            label="部门编码"
            outlined
            :rules="[
              (val) => !!val || '请输入部门编码',
              (val) => /^[a-zA-Z0-9_-]+$/.test(val) || '部门编码只能包含字母、数字、下划线和横线',
            ]"
            maxlength="20"
          />

          <!-- 部门类型 -->
          <q-select
            v-model="formData.deptType"
            :options="deptTypeOptions"
            label="部门类型"
            outlined
            emit-value
            map-options
            :rules="[(val) => val !== null && val !== undefined || '请选择部门类型']"
          />

          <!-- 负责人姓名 -->
          <q-input
            v-model="formData.leaderName"
            label="负责人姓名"
            outlined
            maxlength="20"
          />

          <!-- 联系电话 -->
          <q-input
            v-model="formData.phone"
            label="联系电话"
            outlined
            :rules="[
              (val) => !val || /^1[3-9]\d{9}$/.test(val) || '请输入正确的手机号码',
            ]"
            maxlength="11"
          />

          <!-- 邮箱 -->
          <q-input
            v-model="formData.email"
            label="邮箱"
            outlined
            :rules="[
              (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || '请输入正确的邮箱地址',
            ]"
            maxlength="50"
          />

          <!-- 排序 -->
          <q-input
            v-model.number="formData.sortOrder"
            label="排序"
            outlined
            type="number"
            :rules="[(val) => val >= 0 || '排序必须大于等于0']"
          />

          <!-- 状态 -->
          <q-select
            v-model="formData.status"
            :options="statusOptions"
            label="状态"
            outlined
            emit-value
            map-options
            :rules="[(val) => val !== null && val !== undefined || '请选择状态']"
          />

          <!-- 备注 -->
          <q-input
            v-model="formData.remark"
            label="备注"
            outlined
            type="textarea"
            rows="3"
            maxlength="200"
          />

          <!-- 操作按钮 -->
          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn
              flat
              label="取消"
              @click="handleClose"
            />
            <q-btn
              type="submit"
              color="primary"
              label="确定"
              :loading="submitting"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import deptApi from "src/api/system/dept/dept";

export default defineComponent({
  name: "DeptEditDialog",
  props: {
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
  },
  emits: ["update:modelValue", "success"],

  setup(props, { emit }) {
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

    return {
      dialogVisible,
      submitting,
      formData,
      deptTypeOptions,
      statusOptions,
      isEdit,
      flattenedParentOptions,
      handleClose,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
}

:deep(.q-btn) {
  border-radius: 6px;
}
</style>
