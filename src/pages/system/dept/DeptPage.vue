<template>
  <q-page class="q-pa-md">
    <q-card class="modern-card">
      <q-card-section class="card-header">
        <div class="row items-center justify-between">
          <div class="text-h6 text-weight-bold">部门管理</div>
          <q-btn
            color="primary"
            icon="add"
            label="新增部门"
            @click="handleAdd"
            v-if="hasPermission('system:dept:add')"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <!-- 查询条件 -->
        <q-form @submit="handleQuery" class="q-mb-md">
          <div class="row q-gutter-md">
            <q-input
              v-model="queryForm.deptName"
              label="部门名称"
              outlined
              dense
              style="width: 200px"
              clearable
            />
            <q-select
              v-model="queryForm.status"
              :options="statusOptions"
              label="状态"
              outlined
              dense
              style="width: 120px"
              clearable
              emit-value
              map-options
            />
            <q-btn
              type="submit"
              color="primary"
              icon="search"
              label="查询"
            />
            <q-btn
              color="grey-7"
              icon="refresh"
              label="重置"
              @click="handleReset"
            />
          </div>
        </q-form>

        <!-- 部门树表格 -->
        <q-table
          :rows="flatDeptList"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          :pagination="{ rowsPerPage: 0 }"
          class="modern-table"
        >
          <template v-slot:body-cell-deptName="props">
            <q-td :props="props">
              <div class="row items-center no-wrap" :style="{ paddingLeft: (props.row.level * 20) + 'px' }">
                <q-btn
                  v-if="props.row.hasChildren"
                  flat
                  dense
                  size="sm"
                  :icon="expandedRows.has(props.row.id) ? 'expand_less' : 'expand_more'"
                  @click="toggleExpand(props.row.id)"
                  class="q-mr-xs"
                />
                <div v-else style="width: 32px;" class="q-mr-xs"></div>
                <span>{{ props.row.deptName }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.value === 1 ? 'positive' : 'negative'"
                :label="props.value === 1 ? '正常' : '停用'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-deptType="props">
            <q-td :props="props">
              <q-chip
                :color="getDeptTypeColor(props.value)"
                text-color="white"
                :label="getDeptTypeName(props.value)"
                size="sm"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="edit"
                size="sm"
                @click="handleEdit(props.row)"
                v-if="hasPermission('system:dept:edit')"
              >
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="positive"
                icon="add"
                size="sm"
                @click="handleAddChild(props.row)"
                v-if="hasPermission('system:dept:add')"
              >
                <q-tooltip>新增子部门</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="negative"
                icon="delete"
                size="sm"
                @click="handleDelete(props.row)"
                v-if="hasPermission('system:dept:remove')"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 部门编辑对话框 -->
    <DeptEditDialog
      v-model="editDialog"
      :dept-data="currentDept"
      :parent-options="parentOptions"
      @success="handleSuccess"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import deptApi from "src/api/system/dept/dept";
import DeptEditDialog from "./DeptEditDialog.vue";
import { useAuthStore } from "src/stores/auth";

export default defineComponent({
  name: "DeptPage",
  components: {
    DeptEditDialog,
  },

  setup() {
    const $q = useQuasar();
    const authStore = useAuthStore();

    // 响应式数据
    const loading = ref(false);
    const deptList = ref([]);
    const flatDeptList = ref([]);
    const expandedRows = ref(new Set());
    const editDialog = ref(false);
    const currentDept = ref(null);
    const parentOptions = ref([]);

    // 查询表单
    const queryForm = ref({
      deptName: "",
      status: null,
    });

    // 状态选项
    const statusOptions = [
      { label: "正常", value: 1 },
      { label: "停用", value: 0 },
    ];

    // 表格列定义
    const columns = [
      {
        name: "deptName",
        label: "部门名称",
        field: "deptName",
        align: "left",
        style: "width: 200px",
      },
      {
        name: "deptCode",
        label: "部门编码",
        field: "deptCode",
        align: "left",
      },
      {
        name: "deptType",
        label: "部门类型",
        field: "deptType",
        align: "center",
      },
      {
        name: "leaderName",
        label: "负责人",
        field: "leaderName",
        align: "center",
      },
      {
        name: "phone",
        label: "联系电话",
        field: "phone",
        align: "center",
      },
      {
        name: "status",
        label: "状态",
        field: "status",
        align: "center",
      },
      {
        name: "createTime",
        label: "创建时间",
        field: "createTime",
        align: "center",
        format: (val) => val?.substring(0, 19) || "",
      },
      {
        name: "actions",
        label: "操作",
        field: "actions",
        align: "center",
        style: "width: 150px",
      },
    ];

    // 计算属性
    const hasPermission = computed(() => authStore.hasPermission);

    // 方法
    const loadDeptTree = async () => {
      try {
        loading.value = true;
        const response = await deptApi.getDeptTree(queryForm.value);
        deptList.value = response.data.data || [];
        // 构建平铺的部门列表用于表格显示
        buildFlatDeptList();
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.message || "获取部门列表失败",
        });
      } finally {
        loading.value = false;
      }
    };

    // 构建平铺的部门列表
    const buildFlatDeptList = () => {
      const buildFlat = (deptList, level = 0) => {
        const result = [];
        
        deptList.forEach(dept => {
          const deptItem = { 
            ...dept, 
            level,
            hasChildren: dept.children && dept.children.length > 0
          };
          result.push(deptItem);
          
          // 如果部门有子部门且处于展开状态，则递归添加子部门
          if (dept.hasChildren && expandedRows.value.has(dept.id) && dept.children) {
            result.push(...buildFlat(dept.children, level + 1));
          }
        });
        
        return result;
      };
      
      flatDeptList.value = buildFlat(deptList.value);
    };

    // 切换展开/收起状态
    const toggleExpand = (deptId) => {
      if (expandedRows.value.has(deptId)) {
        expandedRows.value.delete(deptId);
      } else {
        expandedRows.value.add(deptId);
      }
      // 重新构建平铺列表
      buildFlatDeptList();
    };

    const loadParentOptions = async () => {
      try {
        const response = await deptApi.getDeptTreeSelect();
        parentOptions.value = [
          { id: 0, deptName: "顶级部门", children: response.data.data || [] },
        ];
      } catch (error) {
        console.error("获取父部门选项失败:", error);
      }
    };

    const handleQuery = () => {
      loadDeptTree();
    };

    const handleReset = () => {
      queryForm.value = {
        deptName: "",
        status: null,
      };
      loadDeptTree();
    };

    const handleAdd = () => {
      currentDept.value = null;
      editDialog.value = true;
    };

    const handleAddChild = (row) => {
      currentDept.value = {
        parentId: row.id,
        parentName: row.deptName,
      };
      editDialog.value = true;
    };

    const handleEdit = (row) => {
      currentDept.value = { ...row };
      editDialog.value = true;
    };

    const handleDelete = (row) => {
      $q.dialog({
        title: "确认删除",
        message: `确定要删除部门"${row.deptName}"吗？`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await deptApi.deleteDept(row.id);
          $q.notify({
            type: "positive",
            message: "删除成功",
          });
          loadDeptTree();
        } catch (error) {
          $q.notify({
            type: "negative",
            message: error.message || "删除失败",
          });
        }
      });
    };

    const handleSuccess = () => {
      editDialog.value = false;
      loadDeptTree();
    };

    const getDeptTypeName = (type) => {
      const typeMap = {
        1: "公司",
        2: "部门",
        3: "小组",
      };
      return typeMap[type] || "未知";
    };

    const getDeptTypeColor = (type) => {
      const colorMap = {
        1: "purple",
        2: "primary",
        3: "orange",
      };
      return colorMap[type] || "grey";
    };

    // 生命周期
    onMounted(() => {
      loadDeptTree();
      loadParentOptions();
    });

    return {
      loading,
      deptList,
      flatDeptList,
      expandedRows,
      editDialog,
      currentDept,
      parentOptions,
      queryForm,
      statusOptions,
      columns,
      hasPermission,
      loadDeptTree,
      buildFlatDeptList,
      toggleExpand,
      handleQuery,
      handleReset,
      handleAdd,
      handleAddChild,
      handleEdit,
      handleDelete,
      handleSuccess,
      getDeptTypeName,
      getDeptTypeColor,
    };
  },
});
</script>

<style lang="scss" scoped>
.modern-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modern-table {
  :deep(.q-table__top) {
    padding: 12px 16px;
  }

  :deep(.q-table thead th) {
    background: #f5f7fa;
    font-weight: 600;
    color: #2c3e50;
  }

  :deep(.q-table tbody tr:hover) {
    background: #f8f9ff;
  }
}
</style>
