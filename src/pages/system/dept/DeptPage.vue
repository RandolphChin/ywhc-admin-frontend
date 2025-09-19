<template>
  <q-page>
    <!-- 检索条件 -->
    <q-card>
      <q-card-section>
        <div class="row items-center q-gutter-sm">
            <q-input
              v-model="queryForm.deptName"
              dense
              outlined
              clearable
              label="部门名称"
              placeholder="输入部门名称"
              @keyup.enter="handleQuery"
            />
            
            <q-btn color="primary" icon="search" label="检索" @click="handleQuery" />
            <q-btn color="warning" icon="restart_alt" label="重置" @click="handleReset" />
        </div>
        <div class="row q-mt-xs q-gutter-sm">
          <q-btn
            color="primary"
            icon="add"
            label="添加部门"
            @click="handleAdd"
            v-permission="'system:dept:add'"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 部门树表格 -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="flatDeptList"
          :columns="columns"
          row-key="id"
          :loading="loading"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          flat
          bordered
        >
          <template v-slot:body-cell-deptName="props">
            <q-td :props="props">
              <div class="row items-center no-wrap" :style="{ paddingLeft: (props.row.level * 20) + 'px' }">
                <q-btn v-if="props.row.hasChildren" flat dense size="sm"
                  :icon="expandedRows.has(props.row.id) ? 'expand_less' : 'expand_more'"
                  @click="toggleExpand(props.row.id)" class="q-mr-xs" />
                <div v-else style="width: 32px;" class="q-mr-xs"></div>
                <span>{{ props.row.deptName }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="props.value === 1 ? 'positive' : 'negative'" :label="props.value === 1 ? '正常' : '停用'" />
            </q-td>
          </template>

          <template v-slot:body-cell-deptType="props">
            <q-td :props="props">
              <q-chip :color="getDeptTypeColor(props.value)" text-color="white" :label="getDeptTypeName(props.value)"
                size="sm" />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="add"
                @click="handleAddChild(props.row)"
                v-permission="'system:dept:add'"
              >
                <q-tooltip>添加子部门</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="edit"
                @click="handleEdit(props.row)"
                v-permission="'system:dept:edit'"
              >
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="delete"
                @click="handleDelete(props.row)"
                v-permission="'system:dept:remove'"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 部门编辑对话框 -->
    <DeptEditDialog v-model="editDialog" :dept-data="currentDept" :parent-options="parentOptions"
      @success="handleSuccess" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { deptApi } from "src/api";
import DeptEditDialog from "./DeptEditDialog.vue";
import { formatTime } from 'src/utils/index'

defineOptions({
  name: 'DeptPage'
})

const $q = useQuasar();

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
});


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
    format: (val) =>  formatTime(val, 'YYYY-MM-DD HH:mm:ss'),
  },
  {
    name: "actions",
    label: "操作",
    field: "actions",
    align: "center",
    style: "width: 150px",
  },
];


// 方法
const loadDeptTree = async () => {
  try {
    loading.value = true;
    const response = await deptApi.getDeptTree(queryForm.value);
    deptList.value = response.data.data || [];
    
    // 如果有部门名称筛选条件，则过滤并展开相关节点
    if (queryForm.value.deptName && queryForm.value.deptName.trim() !== '') {
      const filtered = filterDeptTreeByName(deptList.value, queryForm.value.deptName.trim());
      const ids = collectIds(filtered);
      expandedRows.value = new Set(ids);
      flatDeptList.value = buildFlatDeptList(filtered);
    } else {
      // 无筛选条件，显示完整树
      flatDeptList.value = buildFlatDeptList(deptList.value);
    }
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
const buildFlatDeptList = (deptTreeList = deptList.value) => {
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

  return buildFlat(deptTreeList);
};

// 切换展开/收起状态
const toggleExpand = (deptId) => {
  if (expandedRows.value.has(deptId)) {
    expandedRows.value.delete(deptId);
  } else {
    expandedRows.value.add(deptId);
  }
  
  // 重新构建平铺列表
  let baseTree = deptList.value;
  if (queryForm.value.deptName && queryForm.value.deptName.trim() !== '') {
    baseTree = filterDeptTreeByName(deptList.value, queryForm.value.deptName.trim());
  }
  flatDeptList.value = buildFlatDeptList(baseTree);
};

// 根据部门名称过滤部门树，保留匹配节点及其所有父级
const filterDeptTreeByName = (deptList, keyword) => {
  const kw = keyword.toLowerCase();
  const result = [];
  
  deptList.forEach(dept => {
    const childrenFiltered = dept.children ? filterDeptTreeByName(dept.children, keyword) : [];
    const selfMatch = (dept.deptName || '').toLowerCase().includes(kw);
    
    if (selfMatch || (childrenFiltered && childrenFiltered.length > 0)) {
      result.push({
        ...dept,
        children: childrenFiltered,
        hasChildren: childrenFiltered.length > 0
      });
    }
  });
  
  return result;
};

// 收集树中所有节点 id
const collectIds = (deptList) => {
  const ids = [];
  const walk = (list) => {
    list.forEach(item => {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        walk(item.children);
      }
    });
  };
  walk(deptList);
  return ids;
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
  const transformedDepts = deptList.value;
  if (queryForm.value.deptName && queryForm.value.deptName.trim() !== '') {
    const filtered = filterDeptTreeByName(transformedDepts, queryForm.value.deptName.trim());
    const ids = collectIds(filtered);
    expandedRows.value = new Set(ids);
    flatDeptList.value = buildFlatDeptList(filtered);
  } else {
    // 关键字为空则恢复完整列表
    expandedRows.value = new Set();
    flatDeptList.value = buildFlatDeptList(transformedDepts);
  }
};

const handleReset = () => {
  queryForm.value = {
    deptName: "",
    status: null,
  };
  expandedRows.value = new Set();
  flatDeptList.value = buildFlatDeptList(deptList.value);
};

const handleAdd = async () => {
  await loadParentOptions();
  currentDept.value = null;
  editDialog.value = true;
};

const handleAddChild = async (row) => {
  await loadParentOptions();
  currentDept.value = {
    parentId: row.id,
    parentName: row.deptName,
  };
  editDialog.value = true;
};

const handleEdit = async (row) => {
  await loadParentOptions();
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
});

</script>

