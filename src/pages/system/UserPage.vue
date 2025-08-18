<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">用户管理</div>

    <!-- 搜索和操作栏 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="queryForm.username"
              label="用户名"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="queryForm.nickname"
              label="昵称"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="queryForm.status"
              :options="statusOptions"
              label="状态"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <q-btn color="primary" icon="search" label="搜索" @click="loadUsers" />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <q-btn color="secondary" icon="refresh" label="重置" @click="resetQuery" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 用户表格 -->
    <q-card>
      <q-card-section>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">用户列表</div>
          <q-btn
            color="primary"
            icon="add"
            label="添加用户"
            @click="showUserDialog()"
            v-permission="'system:user:add'"
          />
        </div>

        <q-table
          :rows="users"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
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

          <template v-slot:body-cell-roles="props">
            <q-td :props="props">
              <q-chip
                v-for="role in props.row.roles"
                :key="role.id"
                color="primary"
                text-color="white"
                size="sm"
                :label="role.name"
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
                color="negative"
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
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 用户编辑对话框 -->
    <q-dialog v-model="userDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? '编辑用户' : '添加用户' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitUser" class="q-gutter-md">
            <q-input
              v-model="userForm.username"
              label="用户名"
              :rules="[val => !!val || '请输入用户名']"
              outlined
              dense
              :readonly="isEdit"
            />

            <q-input
              v-model="userForm.nickname"
              label="昵称"
              :rules="[val => !!val || '请输入昵称']"
              outlined
              dense
            />

            <q-input
              v-model="userForm.email"
              label="邮箱"
              type="email"
              outlined
              dense
            />

            <q-input
              v-model="userForm.phone"
              label="手机号"
              outlined
              dense
            />

            <q-select
              v-model="userForm.gender"
              :options="genderOptions"
              label="性别"
              outlined
              dense
              emit-value
              map-options
            />

            <q-select
              v-model="userForm.status"
              :options="statusOptions"
              label="状态"
              outlined
              dense
              emit-value
              map-options
            />

            <q-select
              v-model="userForm.roleIds"
              :options="roleOptions"
              label="角色"
              outlined
              dense
              multiple
              emit-value
              map-options
              use-chips
            />

            <q-input
              v-model="userForm.remark"
              label="备注"
              type="textarea"
              outlined
              dense
              rows="3"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" @click="userDialog = false" />
              <q-btn type="submit" color="primary" label="确定" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { userApi, roleApi } from 'src/api'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'UserPage',

  setup() {
    const $q = useQuasar()

    const loading = ref(false)
    const userDialog = ref(false)
    const isEdit = ref(false)
    const users = ref([])
    const roles = ref([])

    const queryForm = ref({
      username: '',
      nickname: '',
      status: null
    })

    const userForm = ref({
      id: null,
      username: '',
      nickname: '',
      email: '',
      phone: '',
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
        name: 'id',
        label: 'ID',
        field: 'id',
        align: 'left',
        sortable: true
      },
      {
        name: 'avatar',
        label: '头像',
        field: 'avatar',
        align: 'center'
      },
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
        name: 'phone',
        label: '手机号',
        field: 'phone',
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
        align: 'left'
      },
      {
        name: 'createTime',
        label: '创建时间',
        field: 'createTime',
        align: 'center',
        format: (val) => new Date(val).toLocaleString()
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

    const genderOptions = [
      { label: '男', value: 1 },
      { label: '女', value: 2 },
      { label: '未知', value: 0 }
    ]

    const roleOptions = ref([])

    const loadUsers = async (props) => {
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

        const response = await userApi.getList(params)
        const { records, total } = response.data.data

        users.value = records
        pagination.value.rowsNumber = total
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        pagination.value.sortBy = sortBy
        pagination.value.descending = descending
      } catch (error) {
        console.error('加载用户列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const loadRoles = async () => {
      try {
        const response = await roleApi.getAll()
        roles.value = response.data.data
        roleOptions.value = roles.value.map(role => ({
          label: role.name,
          value: role.id
        }))
      } catch (error) {
        console.error('加载角色列表失败:', error)
      }
    }

    const onRequest = (props) => {
      loadUsers(props)
    }

    const resetQuery = () => {
      queryForm.value = {
        username: '',
        nickname: '',
        status: null
      }
      loadUsers()
    }

    const showUserDialog = (user = null) => {
      isEdit.value = !!user
      if (user) {
        userForm.value = {
          ...user,
          roleIds: user.roles?.map(role => role.id) || []
        }
      } else {
        userForm.value = {
          id: null,
          username: '',
          nickname: '',
          email: '',
          phone: '',
          gender: 0,
          status: 1,
          roleIds: [],
          remark: ''
        }
      }
      userDialog.value = true
    }

    const submitUser = async () => {
      try {
        if (isEdit.value) {
          await userApi.update(userForm.value.id, userForm.value)
          $q.notify({
            type: 'positive',
            message: '用户更新成功'
          })
        } else {
          await userApi.create(userForm.value)
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
          await userApi.resetPassword(user.id)
          $q.notify({
            type: 'positive',
            message: '密码重置成功，新密码为：123456'
          })
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error.response?.data?.message || '重置失败'
          })
        }
      })
    }

    onMounted(() => {
      loadUsers()
      loadRoles()
    })

    return {
      loading,
      userDialog,
      isEdit,
      users,
      queryForm,
      userForm,
      pagination,
      columns,
      statusOptions,
      genderOptions,
      roleOptions,
      loadUsers,
      onRequest,
      resetQuery,
      showUserDialog,
      submitUser,
      deleteUser,
      resetPassword
    }
  }
})
</script>
