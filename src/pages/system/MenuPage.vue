<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">菜单管理</div>

    <!-- 操作栏 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h6">菜单列表</div>
          <div class="q-gutter-sm">
            <q-btn
              color="primary"
              icon="add"
              label="添加菜单"
              @click="showMenuDialog()"
              v-permission="'system:menu:add'"
            />
            <q-btn
              color="secondary"
              icon="refresh"
              label="刷新"
              @click="loadMenus"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 菜单树表格 -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="menus"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 0 }"
          flat
          bordered
        >
          <template v-slot:body-cell-title="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-icon
                  v-if="props.row.icon"
                  :name="props.row.icon"
                  class="q-mr-sm"
                />
                <span>{{ props.row.title }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-badge
                :color="getTypeColor(props.row.type)"
                :label="getTypeLabel(props.row.type)"
              />
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

          <template v-slot:body-cell-visible="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.visible === 1 ? 'positive' : 'negative'"
                :label="props.row.visible === 1 ? '显示' : '隐藏'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="add"
                @click="showMenuDialog(null, props.row)"
                v-permission="'system:menu:add'"
              >
                <q-tooltip>添加子菜单</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="edit"
                @click="showMenuDialog(props.row)"
                v-permission="'system:menu:edit'"
              >
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="negative"
                icon="delete"
                @click="deleteMenu(props.row)"
                v-permission="'system:menu:delete'"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 菜单编辑对话框 -->
    <q-dialog v-model="menuDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? '编辑菜单' : '添加菜单' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitMenu" class="q-gutter-md">
            <q-select
              v-model="menuForm.parentId"
              :options="parentMenuOptions"
              label="父级菜单"
              outlined
              dense
              emit-value
              map-options
              clearable
            />

            <q-select
              v-model="menuForm.type"
              :options="typeOptions"
              label="菜单类型"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="onTypeChange"
            />

            <q-input
              v-model="menuForm.title"
              label="菜单标题"
              :rules="[val => !!val || '请输入菜单标题']"
              outlined
              dense
            />

            <q-input
              v-model="menuForm.name"
              label="菜单名称"
              outlined
              dense
            />

            <q-input
              v-if="menuForm.type !== 3"
              v-model="menuForm.path"
              label="路由路径"
              outlined
              dense
            />

            <q-input
              v-if="menuForm.type === 2"
              v-model="menuForm.component"
              label="组件路径"
              outlined
              dense
            />

            <q-input
              v-if="menuForm.type === 3"
              v-model="menuForm.permission"
              label="权限标识"
              outlined
              dense
            />

            <q-input
              v-model="menuForm.icon"
              label="菜单图标"
              outlined
              dense
            />

            <q-input
              v-model.number="menuForm.sort"
              label="排序"
              type="number"
              outlined
              dense
            />

            <div class="row q-gutter-md">
              <q-select
                v-model="menuForm.status"
                :options="statusOptions"
                label="状态"
                outlined
                dense
                emit-value
                map-options
                class="col"
              />

              <q-select
                v-if="menuForm.type !== 3"
                v-model="menuForm.visible"
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
              v-model="menuForm.remark"
              label="备注"
              type="textarea"
              outlined
              dense
              rows="3"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" @click="menuDialog = false" />
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
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'MenuPage',

  setup() {
    const $q = useQuasar()

    const loading = ref(false)
    const menuDialog = ref(false)
    const isEdit = ref(false)
    const menus = ref([])
    const parentMenuOptions = ref([])

    const menuForm = ref({
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

    const columns = [
      {
        name: 'title',
        label: '菜单名称',
        field: 'title',
        align: 'left'
      },
      {
        name: 'type',
        label: '类型',
        field: 'type',
        align: 'center'
      },
      {
        name: 'path',
        label: '路由路径',
        field: 'path',
        align: 'left'
      },
      {
        name: 'component',
        label: '组件路径',
        field: 'component',
        align: 'left'
      },
      {
        name: 'permission',
        label: '权限标识',
        field: 'permission',
        align: 'left'
      },
      {
        name: 'sort',
        label: '排序',
        field: 'sort',
        align: 'center'
      },
      {
        name: 'status',
        label: '状态',
        field: 'status',
        align: 'center'
      },
      {
        name: 'visible',
        label: '显示',
        field: 'visible',
        align: 'center'
      },
      {
        name: 'actions',
        label: '操作',
        field: 'actions',
        align: 'center'
      }
    ]

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

    const getTypeColor = (type) => {
      const colors = { 1: 'primary', 2: 'secondary', 3: 'accent' }
      return colors[type] || 'grey'
    }

    const getTypeLabel = (type) => {
      const labels = { 1: '目录', 2: '菜单', 3: '按钮' }
      return labels[type] || '未知'
    }

    const loadMenus = async () => {
      loading.value = true
      
      try {
        const response = await api.get('/system/menu/tree')
        menus.value = response.data.data
        
        // 构建父级菜单选项
        buildParentMenuOptions(response.data.data)
      } catch (error) {
        console.error('加载菜单列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const buildParentMenuOptions = (menuList, level = 0) => {
      const options = []
      
      menuList.forEach(menu => {
        if (menu.type !== 3) { // 按钮不能作为父级菜单
          options.push({
            label: '　'.repeat(level) + menu.title,
            value: menu.id
          })
          
          if (menu.children && menu.children.length > 0) {
            options.push(...buildParentMenuOptions(menu.children, level + 1))
          }
        }
      })
      
      parentMenuOptions.value = [
        { label: '顶级菜单', value: null },
        ...options
      ]
    }

    const showMenuDialog = (menu = null, parent = null) => {
      isEdit.value = !!menu
      if (menu) {
        menuForm.value = { ...menu }
      } else {
        menuForm.value = {
          id: null,
          parentId: parent?.id || null,
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
        }
      }
      menuDialog.value = true
    }

    const onTypeChange = (type) => {
      // 根据类型清空相关字段
      if (type === 3) { // 按钮
        menuForm.value.path = ''
        menuForm.value.component = ''
        menuForm.value.visible = 1
      } else {
        menuForm.value.permission = ''
      }
    }

    const submitMenu = async () => {
      try {
        if (isEdit.value) {
          await api.put(`/system/menu/${menuForm.value.id}`, menuForm.value)
          $q.notify({
            type: 'positive',
            message: '菜单更新成功'
          })
        } else {
          await api.post('/system/menu', menuForm.value)
          $q.notify({
            type: 'positive',
            message: '菜单创建成功'
          })
        }
        
        menuDialog.value = false
        loadMenus()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || '操作失败'
        })
      }
    }

    const deleteMenu = (menu) => {
      $q.dialog({
        title: '确认删除',
        message: `确定要删除菜单 "${menu.title}" 吗？`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await api.delete(`/system/menu/${menu.id}`)
          $q.notify({
            type: 'positive',
            message: '菜单删除成功'
          })
          loadMenus()
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error.response?.data?.message || '删除失败'
          })
        }
      })
    }

    onMounted(() => {
      loadMenus()
    })

    return {
      loading,
      menuDialog,
      isEdit,
      menus,
      parentMenuOptions,
      menuForm,
      columns,
      typeOptions,
      statusOptions,
      visibleOptions,
      getTypeColor,
      getTypeLabel,
      loadMenus,
      showMenuDialog,
      onTypeChange,
      submitMenu,
      deleteMenu
    }
  }
})
</script>
