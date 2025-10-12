<template>
  <q-page class="q-pa-md">
    <div class="row" style="height: calc(100vh - 100px)">
      <!-- 🌳 Liste des départements -->
      <!-- 左侧部门树 -->
      <div class="col-3">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ t('system.deptList') }}</div>
            <q-tree
              :nodes="deptTreeNodes"
              node-key="id"
              label-key="deptName"
              :selected="selectedDeptId"
              @update:selected="onDeptSelect"
              :expanded="expandedDepts"
              @update:expanded="onDeptExpand"
            >
              <template v-slot:default-header="prop">
                <div class="row items-center">
                  <q-icon
                    :name="prop.node.icon || 'folder'"
                    color="primary"
                    size="18px"
                    class="q-mr-sm"
                  />
                  <div>{{ prop.node.deptName }}</div>
                </div>
              </template>
            </q-tree>
          </q-card-section>
        </q-card>
      </div>

      <!-- 👥 Gestion des utilisateurs -->
      <!-- 右侧用户管理 -->
      <div class="col-9">
        <q-card-section>
          <!-- 🔍 Zone de recherche -->
          <!-- 搜索栏 -->
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="queryForm.username"
              :label="t('user.username')"
              outlined
              dense
              clearable
              style="width: 160px;"
            />
            <q-input
              v-model="queryForm.nickname"
              :label="t('user.nickname')"
              outlined
              dense
              clearable
              style="width: 160px;"
            />
            <q-select
              v-model="queryForm.status"
              :options="statusOptions"
              :label="t('common.status')"
              outlined
              dense
              clearable
              emit-value
              map-options
              style="width: 160px;"
            />
            <q-btn
              color="primary"
              icon="search"
              :label="t('action.search')"
              @click="loadUsers"
            />
            <q-btn
              color="secondary"
              icon="refresh"
              :label="t('action.reset')"
              @click="resetQuery"
            />
          </div>

          <!-- ➕ Boutons d’action -->
          <!-- 操作按钮 -->
          <div class="row q-mt-xs q-gutter-sm">
            <q-btn
              color="primary"
              icon="add"
              :label="t('user.addUser')"
              @click="showUserDialog()"
              v-permission="'system:user:add'"
            />
            <q-btn
              color="warning"
              icon="lock_reset"
              :label="t('user.resetPassword')"
              :disable="selectedUsers.length === 0"
              @click="batchResetPassword"
              v-permission="'system:user:resetPwd'"
            />
          </div>

          <!-- 🧾 En-tête de la liste -->
          <!-- 列表头部信息 -->
          <div class="row justify-between items-center q-mt-xs">
            <div class="text-h6">
              {{ t('user.userList') }}
              <span v-if="selectedDeptName" class="text-caption text-grey-6">
                ({{ selectedDeptName }})
              </span>
              <span
                v-if="selectedUsers.length > 0"
                class="text-caption text-primary q-ml-sm"
              >
                {{ t('user.selectedCount', { count: selectedUsers.length }) }}
              </span>
            </div>
          </div>

          <!-- 🧍 Tableau des utilisateurs -->
          <!-- 用户表格 -->
          <q-table
            :rows="users"
            :columns="columns"
            row-key="id"
            :loading="loading"
            v-model:pagination="pagination"
            @request="onRequest"
            binary-state-sort
            selection="multiple"
            v-model:selected="selectedUsers"
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
                  :label="
                    props.row.status === 1
                      ? t('common.enabled')
                      : t('common.disabled')
                  "
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
                  <q-tooltip>{{ t('action.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="delete"
                  @click="deleteUser(props.row)"
                  v-permission="'system:user:delete'"
                >
                  <q-tooltip>{{ t('action.delete') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  color="warning"
                  icon="lock_reset"
                  @click="resetPassword(props.row)"
                  v-permission="'system:user:reset'"
                >
                  <q-tooltip>{{ t('user.resetPassword') }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <!-- 📄 Pagination -->
            <!-- 分页组件 -->
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

    <!-- 🧩 Dialogue d’édition utilisateur -->
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
// 🧭 Importation des dépendances
// 引入依赖
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userApi, roleApi, deptApi } from 'src/api'
import { useQuasar } from 'quasar'
import UserEditDialog from './UserEditDialog.vue'
import DataTablePagination from 'src/components/DataTablePagination.vue'
import { formatTime } from 'src/utils/index'

defineOptions({
  name: 'SystemUserPage'
})

const { t } = useI18n()
const $q = useQuasar()

// ⚙️ Variables réactives
// 响应式变量
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

// 📋 Définition des colonnes du tableau
// 表格列定义
const columns = [
  { name: 'username', label: t('user.username'), field: 'username', align: 'left', sortable: true },
  { name: 'nickname', label: t('user.nickname'), field: 'nickname', align: 'left', sortable: true },
  { name: 'email', label: t('user.email'), field: 'email', align: 'left' },
  { name: 'mobile', label: t('user.mobile'), field: 'mobile', align: 'left' },
  { name: 'status', label: t('common.status'), field: 'status', align: 'center' },
  { name: 'roles', label: t('user.roles'), field: 'roles', align: 'left', format: (val) => val ? val.map(role => role.roleName).join(', ') : '' },
  { name: 'createTime', label: t('common.createTime'), field: 'createTime', align: 'center', format: (val) => formatTime(val, 'YYYY-MM-DD HH:mm:ss') },
  { name: 'actions', label: t('common.actions'), field: 'actions', align: 'center' }
]

// ⚙️ Options de statut
// 状态选项
const statusOptions = [
  { label: t('common.enabled'), value: 1 },
  { label: t('common.disabled'), value: 0 }
]

const roleOptions = ref([])

// 🧭 Chargement des utilisateurs
// 加载用户列表
const loadUsers = async (props) => {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = props?.pagination || pagination.value
    const params = {
      current: page,
      size: rowsPerPage,
      orderBy: sortBy,
      orderDirection: descending ? 'desc' : 'asc',
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
    selectedUsers.value = []
  } catch (error) {
    console.error(t('system.loadUsersFail'), error)
  } finally {
    loading.value = false
  }
}

// 🧭 Chargement des rôles
// 加载角色列表
const loadRoles = async () => {
  try {
    const response = await roleApi.getAll()
    roles.value = response.data.data
    roleOptions.value = roles.value.map(role => ({
      label: role.roleName || role.name,
      value: role.id
    }))
  } catch (error) {
    console.error(t('system.loadRolesFail'), error)
  }
}

// 🧭 Chargement de l’arborescence des départements
// 加载部门树
const loadDeptTree = async () => {
  try {
    const response = await deptApi.getDeptTree()
    const deptTree = response.data.data || []
    deptTreeNodes.value = deptTree
    expandedDepts.value = deptTree.map(dept => dept.id)
  } catch (error) {
    console.error(t('system.loadDeptFail'), error)
  }
}

// 🧭 Sélection d’un département
// 选择部门事件
const onDeptSelect = (deptId) => {
  selectedDeptId.value = deptId
  const findDeptName = (nodes, targetId) => {
    for (const node of nodes) {
      if (node.id === targetId) return node.deptName
      if (node.children?.length) {
        const found = findDeptName(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  selectedDeptName.value = findDeptName(deptTreeNodes.value, deptId) || ''
  queryForm.value.deptId = deptId
  loadUsers()
}

// 展开/收起事件
const onDeptExpand = (expanded) => {
  expandedDepts.value = expanded
}

const onRequest = (props) => {
  loadUsers(props)
}

const resetQuery = () => {
  queryForm.value = { username: '', nickname: '', status: null, deptId: selectedDeptId.value }
  loadUsers()
}

// 🧭 Pagination
// 分页控制
const onRowsPerPageChange = (newRowsPerPage) => {
  pagination.value.rowsPerPage = newRowsPerPage
  pagination.value.page = 1
  loadUsers()
}

const onPageChange = (newPage) => {
  pagination.value.page = newPage
  onRequest({ pagination: pagination.value })
}

// 🧩 Ouverture du dialogue utilisateur
// 打开用户编辑对话框
const showUserDialog = async (user = null) => {
  await loadRoles()
  isEdit.value = !!user
  userForm.value = user
    ? { ...user, roleIds: user.roles?.map(role => role.roleId) || [] }
    : { id: null, username: '', nickname: '', email: '', mobile: '', gender: 0, status: 1, roleIds: [], remark: '' }
  userDialog.value = true
}

// 🧩 Soumission du formulaire
// 提交表单
const submitUser = async (formData) => {
  try {
    if (isEdit.value) {
      await userApi.update(formData)
      $q.notify({ type: 'positive', message: t('user.updateSuccess') })
    } else {
      await userApi.create(formData)
      $q.notify({ type: 'positive', message: t('user.createSuccess') })
    }
    userDialog.value = false
    loadUsers()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('common.operationFail') })
  }
}

// 🗑️ Suppression d’un utilisateur
// 删除用户
const deleteUser = (user) => {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('user.confirmDelete', { name: user.nickname }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await userApi.delete(user.id)
      $q.notify({ type: 'positive', message: t('user.deleteSuccess') })
      loadUsers()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || t('user.deleteFail') })
    }
  })
}

// 🔐 Réinitialisation du mot de passe
// 重置密码
const resetPassword = (user) => {
  $q.dialog({
    title: t('user.confirmReset'),
    message: t('user.confirmResetMessage', { name: user.nickname }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await userApi.resetPassword(user.id, 'admin123')
      $q.notify({ type: 'positive', message: t('user.resetSuccess', { password: 'admin123' }) })
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || t('user.resetFail') })
    }
  })
}

// 🔁 Réinitialisation groupée
// 批量重置密码
const batchResetPassword = () => {
  if (selectedUsers.value.length === 0) {
    return $q.notify({ type: 'warning', message: t('user.selectBeforeReset') })
  }
  const userNames = selectedUsers.value.map(u => u.nickname).join('、')
  $q.dialog({
    title: t('user.confirmBatchReset'),
    message: t('user.batchResetMessage', { users: userNames }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const promises = selectedUsers.value.map(u => userApi.resetPassword(u.id))
      await Promise.all(promises)
      $q.notify({ type: 'positive', message: t('user.batchResetSuccess', { count: selectedUsers.value.length }) })
      selectedUsers.value = []
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || t('user.batchResetFail') })
    }
  })
}

onMounted(() => {
  loadDeptTree()
  loadUsers()
})
</script>

<style scoped>
/* 🎨 Styles du module Utilisateurs */
/* 样式部分 */
</style>
