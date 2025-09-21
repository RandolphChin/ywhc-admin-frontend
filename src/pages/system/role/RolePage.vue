<template>
  <q-page>
    <!-- 搜索和操作栏 -->
    <q-card>
      <q-card-section>
        <div class="row q-gutter-sm items-center">
          <q-input
              v-model="queryForm.roleName"
              label="角色名称"
              outlined
              dense
              clearable
              style="width: 160px;"
            />
          <q-input
              v-model="queryForm.roleKey"
              label="角色编码"
              outlined
              dense
              clearable
              style="width: 160px;"
            />
          <q-select
              v-model="queryForm.status"
              :options="statusOptions"
              label="状态"
              outlined
              dense
              clearable
              emit-value
              map-options
              style="width: 160px;"
            />
          <q-btn color="primary" icon="search" label="搜索" @click="loadRoles" />
          <q-btn color="secondary" icon="refresh" label="重置" @click="resetQuery" />
       </div>
      </q-card-section>
    </q-card>

    <!-- 左右布局 -->
    <div class="row q-gutter-md" style="height: calc(100vh - 200px)">
      <!-- 左侧：角色表格 -->
      <div class="col-5">
        <q-card class="full-height">
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6">角色列表</div>
              <q-btn
                color="primary"
                icon="add"
                label="添加角色"
                @click="showRoleDialog()"
                v-permission="'system:role:add'"
              />
            </div>

            <q-table
              :rows="roles"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination="pagination"
              @request="onRequest"
              binary-state-sort
              :selected="selectedRole ? [selectedRole] : []"
              selection="single"
              @selection="onRoleSelection"
              @row-click="onRowClick"
              class="role-table"
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="props.row.status === 1 ? 'positive' : 'negative'"
                    :label="props.row.status === 1 ? '正常' : '禁用'"
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
                    @click="showRoleDialog(props.row)"
                    v-permission="'system:role:edit'"
                  >
                    <q-tooltip>编辑</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="delete"
                    @click="deleteRole(props.row)"
                    v-permission="'system:role:delete'"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
              <template v-slot:bottom>
                <DataTablePagination
                  :pagination="pagination"
                  @rows-per-page-change="onRowsPerPageChange"
                  @page-change="onPageChange"
                />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧：权限树 -->
      <div class="col">
        <q-card class="full-height">
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6">
                权限配置
                <span v-if="selectedRole" class="text-caption text-grey-6">
                  - {{ selectedRole.name }}
                </span>
              </div>
              <q-btn
                color="primary"
                icon="save"
                label="保存权限"
                @click="submitPermission"
                :disable="!selectedRole"
                v-permission="'system:role:auth'"
              />
            </div>

            <div v-if="selectedRole && roles.length > 0" class="permission-tree-container">
              <q-tree
                :nodes="menuTree"
                node-key="id"
                label-key="menuName"
                v-model:ticked="checkedMenus"
                tick-strategy="leaf-filtered"
                :expanded="expandedNodes"
                @update:expanded="expandedNodes = $event"
                class="permission-tree"
              />
            </div>
            <div v-else class="text-center text-grey-6 q-pa-xl">
              <q-icon name="security" size="48px" class="q-mb-md" />
              <div>请选择一个角色查看其权限配置</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 角色编辑对话框 -->
    <RoleEditDialog
      v-model="roleDialog"
      :role-data="roleForm"
      :is-edit="isEdit"
      @submit="submitRole"
    />

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { roleApi, menuApi } from 'src/api'
import { useQuasar } from 'quasar'
import RoleEditDialog from './RoleEditDialog.vue'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import { formatTime } from 'src/utils/index'

defineOptions({
  name: 'RolePage'
})

const $q = useQuasar()

const loading = ref(false)
const roleDialog = ref(false)
const isEdit = ref(false)
const roles = ref([])
const menuTree = ref([])
const checkedMenus = ref([])
const selectedRole = ref(null)
const expandedNodes = ref([])

const queryForm = ref({
  roleName: '',
  roleKey: '',
  status: null
})

const roleForm = ref({
  id: null,
  roleName: '',
  roleKey: '',
  status: 1,
  remark: ''
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const columns = [
  {
    name: 'roleName',
    label: '角色名称',
    field: 'roleName',
    align: 'left',
    sortable: true
  },
  {
    name: 'roleKey',
    label: '角色编码',
    field: 'roleKey',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'remark',
    label: '备注',
    field: 'remark',
    align: 'left'
  },
  {
    name: 'createTime',
    label: '创建时间',
    field: 'createTime',
    align: 'center',
    format: (val) => formatTime(val, 'YYYY-MM-DD HH:mm:ss')
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
]

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

const loadRoles = async (props) => {
  loading.value = true
  
  try {
    const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value
    
    const params = {
      page: page,
      size: rowsPerPage,
      sortBy: sortBy,
      sortOrder: descending ? 'desc' : 'asc',
      ...queryForm.value
    }

    const response = await roleApi.getList(params)
    const { records, total } = response.data.data

    roles.value = records
    pagination.value.rowsNumber = total
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
    
    // 默认选择第一个角色
    if (records.length > 0 && !selectedRole.value) {
      await selectRole(records[0])
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMenuTree = async () => {
  try {
    const response = await menuApi.getTree()
    menuTree.value = response.data.data
    // 默认展开所有节点
    expandAllNodes(menuTree.value)
  } catch (error) {
    console.error('加载菜单树失败:', error)
  }
}

const expandAllNodes = (nodes) => {
  const expanded = []
  const traverse = (nodeList) => {
    nodeList.forEach(node => {
      expanded.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  expandedNodes.value = expanded
}

const onRequest = (props) => {
  loadRoles(props)
}

const resetQuery = () => {
  queryForm.value = {
    name: '',
    code: '',
    status: null
  }
  loadRoles()
}

const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1 // Reset to first page when changing rows per page
  loadRoles()
}

const onPageChange = (newPage) => {
  pagination.value.page = newPage
  onRequest({ pagination: pagination.value })
}

const showRoleDialog = (role = null) => {
  isEdit.value = !!role
  if (role) {
    roleForm.value = { ...role }
  } else {
    roleForm.value = {
      id: null,
      name: '',
      code: '',
      status: 1,
      remark: ''
    }
  }
  roleDialog.value = true
}

const submitRole = async (formData) => {
  try {
    if (isEdit.value) {
      await roleApi.update(formData)
      $q.notify({
        type: 'positive',
        message: '角色更新成功'
      })
    } else {
      await roleApi.create(formData)
      $q.notify({
        type: 'positive',
        message: '角色创建成功'
      })
    }
    
    roleDialog.value = false
    loadRoles()
  } catch (error) {
    console.error('加载角色列表失败:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '操作失败'
    })
  }
}

const deleteRole = (role) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除角色 "${role.roleName}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await roleApi.delete(role.id)
      $q.notify({
        type: 'positive',
        message: '角色删除成功'
      })
      loadRoles()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '删除失败'
      })
    }
  })
}

const onRoleSelection = ({ added, removed }) => {
  if (added.length > 0) {
    selectRole(added[0])
  } else if (removed.length > 0 && added.length === 0) {
    selectedRole.value = null
    checkedMenus.value = []
  }
}

const onRowClick = (_, row) => {
  selectRole(row)
}

const selectRole = async (role) => {
  selectedRole.value = role
  try {
    const roleMenusResponse = await roleApi.getMenus(role.id)
    checkedMenus.value = roleMenusResponse.data.data
  } catch (error) {
    console.error('加载角色权限失败:', error)
    checkedMenus.value = []
  }
}

const submitPermission = async () => {
  if (!selectedRole.value) {
    $q.notify({
      type: 'warning',
      message: '请先选择一个角色'
    })
    return
  }
  
  try {
    await roleApi.assignMenus(selectedRole.value.id, checkedMenus.value)
    $q.notify({
      type: 'positive',
      message: '权限分配成功'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '权限分配失败'
    })
  }
}

onMounted(() => {
  loadRoles()
  loadMenuTree()
})
</script>

<style lang="scss" scoped>

</style>
