<template>
  <q-page class="q-pa-md">
    <div class="row" style="height: calc(100vh - 100px)">
      <!-- 左侧部门树 -->
      <div class="col-3">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6 q-mb-md">部门列表</div>
            <q-tree
              :nodes="deptTreeNodes"
              node-key="id"
              label-key="deptName"
              :selected="selectedDeptId"
              @update:selected="onDeptSelect"
              :expanded="expandedDepts"
              @update:expanded="onDeptExpand"
              default-expand-all
            >
              <template v-slot:default-header="prop">
                <div class="row items-center">
                  <q-icon :name="prop.node.icon || 'folder'" color="primary" size="18px" class="q-mr-sm" />
                  <div>{{ prop.node.deptName }}</div>
                </div>
              </template>
            </q-tree>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧用户管理 -->
      <div class="col-9">
        <!-- 搜索和操作栏 -->
          <q-card-section>
            <div class="row q-gutter-sm items-center">
              <q-input
                v-model="queryForm.username"
                label="用户名"
                outlined
                dense
                clearable
                style="width: 160px;"
              />
              <q-input
                v-model="queryForm.nickname"
                label="昵称"
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
              <q-btn color="primary" icon="search" label="搜索" @click="loadUsers" />
              <q-btn color="secondary" icon="refresh" label="重置" @click="resetQuery" />
            </div>
            <div class="row q-mt-xs q-gutter-sm">
              <q-btn
                color="primary"
                icon="add"
                label="添加用户"
                @click="showUserDialog()"
                v-permission="'system:user:add'"
              />
              <q-btn
                color="warning"
                icon="lock_reset"
                label="重置密码"
                :disable="selectedUsers.length === 0"
                @click="batchResetPassword"
                v-permission="'system:user:resetPwd'"
              />
            </div>
            <div class="row justify-between items-center q-mt-xs">
              <div class="text-h6">
                用户列表
                <span v-if="selectedDeptName" class="text-caption text-grey-6">
                  ({{ selectedDeptName }})
                </span>
                <span v-if="selectedUsers.length > 0" class="text-caption text-primary q-ml-sm">
                  已选择 {{ selectedUsers.length }} 个用户
                </span>
              </div>
            </div>

            <q-table
              :rows="users"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination="pagination"
              @request="onRequest"
              binary-state-sort
              selection="multiple"
              :selected="selectedUsers"
              @update:selected="onSelectionChange"
            >
          <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
              <q-avatar size="32px">
                <img v-if="props.row.avatar" :src="props.row.avatar" />
                <q-icon v-else name="person" />
              </q-avatar>
            </q-td>
          </template>

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
                @click="showUserDialog(props.row)"
                v-permission="'system:user:edit'"
              >
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="delete"
                @click="deleteUser(props.row)"
                v-permission="'system:user:delete'"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="warning"
                icon="lock_reset"
                @click="resetPassword(props.row)"
                v-permission="'system:user:reset'"
              >
                <q-tooltip>重置密码</q-tooltip>
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
      </div>
    </div>

    <!-- 用户编辑对话框 -->
    <UserEditDialog
      v-model="userDialog"
      :user-data="userForm"
      :is-edit="isEdit"
      :role-options="roleOptions"
      @submit="submitUser"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi, roleApi, deptApi } from 'src/api'
import { useQuasar } from 'quasar'
import UserEditDialog from './UserEditDialog.vue'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import { formatTime } from 'src/utils/index'

defineOptions({
  name: 'SystemUserPage'
})

const $q = useQuasar()

const loading = ref(false)
const userDialog = ref(false)
const isEdit = ref(false)
const users = ref([])
const roles = ref([])
const deptTreeNodes = ref([])
const selectedDeptId = ref(null)
const selectedDeptName = ref('')
const expandedDepts = ref([])
const selectedUsers = ref([])

const queryForm = ref({
  username: '',
  nickname: '',
  status: null,
  deptId: null
})

const userForm = ref({
  id: null,
  username: '',
  nickname: '',
  email: '',
  mobile: '',
  gender: 0,
  status: 1,
  roleIds: [],
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
    name: 'username',
    label: '用户名',
    field: 'username',
    align: 'left',
    sortable: true
  },
  {
    name: 'nickname',
    label: '昵称',
    field: 'nickname',
    align: 'left',
    sortable: true
  },
  {
    name: 'email',
    label: '邮箱',
    field: 'email',
    align: 'left'
  },
  {
    name: 'mobile',
    label: '手机号',
    field: 'mobile',
    align: 'left'
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'roles',
    label: '角色',
    field: 'roles',
    align: 'left',
    format: (val) => val ? val.map(role => role.roleName).join(', ') : ''
  },
  {
    name: 'createTime',
    label: '创建时间',
    field: 'createTime',
    align: 'center',
    format: (val) => formatTime(val,'YYYY-MM-DD HH:mm:ss')
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

const roleOptions = ref([])

const loadUsers = async (props) => {
  loading.value = true
  
  try {
    const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value
    
    const params = {
      current: page,
      size: rowsPerPage,
      sortBy: sortBy,
      sortOrder: descending ? 'desc' : 'asc',
      ...queryForm.value
    }

    const response = await userApi.getList(params)
    const { records, total } = response.data.data

    users.value = records
    pagination.value.rowsNumber = total
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
    
    // 清空选择
    selectedUsers.value = []
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    console.log('开始加载角色列表...')
    const response = await roleApi.getAll()
    console.log('角色API响应:', response.data)
    roles.value = response.data.data
    roleOptions.value = roles.value.map(role => ({
      label: role.roleName || role.name,
      value: role.id
    }))
    console.log('处理后的角色选项:', roleOptions.value)
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 加载部门树
const loadDeptTree = async () => {
  try {
    const response = await deptApi.getDeptTree()
    const deptTree = response.data.data || []
    
    // 转换为 QTree 需要的格式
    const convertToTreeNodes = (depts) => {
      return depts.map(dept => ({
        id: dept.id,
        deptName: dept.deptName,
        deptCode: dept.deptCode,
        parentId: dept.parentId,
        icon: dept.deptType === 1 ? 'business' : dept.deptType === 2 ? 'folder' : 'group',
        children: dept.children ? convertToTreeNodes(dept.children) : []
      }))
    }
    
    deptTreeNodes.value = convertToTreeNodes(deptTree)
    
    // 默认展开一级部门
    expandedDepts.value = deptTree.map(dept => dept.id)
    
  } catch (error) {
    console.error('加载部门树失败:', error)
  }
}

// 部门选择事件
const onDeptSelect = (deptId) => {
  selectedDeptId.value = deptId
  
  // 查找选中的部门名称
  const findDeptName = (nodes, targetId) => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return node.deptName
      }
      if (node.children && node.children.length > 0) {
        const found = findDeptName(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  
  selectedDeptName.value = findDeptName(deptTreeNodes.value, deptId) || ''
  
  // 更新查询条件并加载用户
  queryForm.value.deptId = deptId
  loadUsers()
}

// 部门树展开/收起事件
const onDeptExpand = (expanded) => {
  expandedDepts.value = expanded
}

const onRequest = (props) => {
  loadUsers(props)
}

const resetQuery = () => {
  queryForm.value = {
    username: '',
    nickname: '',
    status: null,
    deptId: selectedDeptId.value
  }
  loadUsers()
}

const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1 // Reset to first page when changing rows per page
  loadUsers()
}

const onPageChange = (newPage) => {
  pagination.value.page = newPage
  onRequest({ pagination: pagination.value })
}

const showUserDialog = async (user = null) => {
  // 加载角色选项
  await loadRoles()
  
  isEdit.value = !!user
  if (user) {
    userForm.value = {
      ...user,
      roleIds: user.roles?.map(role => role.roleId) || []
    }
  } else {
    userForm.value = {
      id: null,
      username: '',
      nickname: '',
      email: '',
      mobile: '',
      gender: 0,
      status: 1,
      roleIds: [],
      remark: ''
    }
  }
  userDialog.value = true
}

const submitUser = async (formData) => {
  try {
    if (isEdit.value) {
      await userApi.update(formData)
      $q.notify({
        type: 'positive',
        message: '用户更新成功'
      })
    } else {
      await userApi.create(formData)
      $q.notify({
        type: 'positive',
        message: '用户创建成功'
      })
    }
    
    userDialog.value = false
    loadUsers()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '操作失败'
    })
  }
}

const deleteUser = (user) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除用户 "${user.nickname}" 吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await userApi.delete(user.id)
      $q.notify({
        type: 'positive',
        message: '用户删除成功'
      })
      loadUsers()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '删除失败'
      })
    }
  })
}

const resetPassword = (user) => {
  $q.dialog({
    title: '确认重置',
    message: `确定要重置用户 "${user.nickname}" 的密码吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await userApi.resetPassword(user.id, 'admin123')
      $q.notify({
        type: 'positive',
        message: '密码重置成功，新密码为：admin123'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '重置失败'
      })
    }
  })
}

// 选择变化处理
const onSelectionChange = (selected) => {
  selectedUsers.value = selected
}

// 批量重置密码
const batchResetPassword = () => {
  if (selectedUsers.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: '请先选择要重置密码的用户'
    })
    return
  }

  const userNames = selectedUsers.value.map(user => user.nickname).join('、')
  
  $q.dialog({
    title: '确认批量重置',
    message: `确定要重置以下用户的密码吗？\n${userNames}\n\n新密码将设置为：admin123`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      // 批量重置密码
      const promises = selectedUsers.value.map(user => 
        userApi.resetPassword(user.id)
      )
      
      await Promise.all(promises)
      
      $q.notify({
        type: 'positive',
        message: `成功重置 ${selectedUsers.value.length} 个用户的密码，新密码为：admin123`
      })
      
      // 清空选择
      selectedUsers.value = []
      
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '批量重置失败'
      })
    }
  })
}

onMounted(() => {
  loadDeptTree()
  loadUsers()
})
</script>

<style scoped>

</style>
