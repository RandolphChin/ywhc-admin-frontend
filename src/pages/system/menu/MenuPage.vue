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
          :rows="flatMenus"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 0 }"
          flat
          bordered
        >
          <template v-slot:body-cell-title="props">
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
    <MenuEditDialog
      v-model="menuDialog"
      :menu-data="menuForm"
      :is-edit="isEdit"
      :parent-menu-options="parentMenuOptions"
      @submit="submitMenu"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { menuApi } from 'src/api'
import { useQuasar } from 'quasar'
import MenuEditDialog from './MenuEditDialog.vue'

defineOptions({
  name: 'MenuPage'
})

const $q = useQuasar()

const loading = ref(false)
const menuDialog = ref(false)
const isEdit = ref(false)
const menus = ref([])
const flatMenus = ref([])
const expandedRows = ref(new Set())
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
    const response = await menuApi.getTree()
    menus.value = response.data.data
    
    // 转换数据格式并构建平铺结构
    const transformedMenus = transformMenuData(response.data.data)
    flatMenus.value = buildFlatMenus(transformedMenus)
    
    // 构建父级菜单选项
    buildParentMenuOptions(transformedMenus)
  } catch (error) {
    console.error('加载菜单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const transformMenuData = (menuList) => {
  return menuList.map(menu => ({
    id: menu.id,
    parentId: menu.parentId,
    title: menu.menuName,
    type: menu.menuType,
    path: menu.path,
    component: menu.component,
    permission: menu.permission,
    icon: menu.icon,
    sort: menu.sortOrder,
    status: menu.status,
    visible: menu.isVisible,
    remark: menu.remark,
    children: menu.children ? transformMenuData(menu.children) : [],
    hasChildren: menu.hasChildren || (menu.children && menu.children.length > 0)
  }))
}

const buildFlatMenus = (menuList, level = 0) => {
  const result = []
  
  menuList.forEach(menu => {
    const menuItem = { ...menu, level }
    result.push(menuItem)
    
    if (menu.hasChildren && expandedRows.value.has(menu.id) && menu.children) {
      result.push(...buildFlatMenus(menu.children, level + 1))
    }
  })
  
  return result
}

const toggleExpand = (menuId) => {
  if (expandedRows.value.has(menuId)) {
    expandedRows.value.delete(menuId)
  } else {
    expandedRows.value.add(menuId)
  }
  
  // 重新构建平铺菜单列表
  const transformedMenus = transformMenuData(menus.value)
  flatMenus.value = buildFlatMenus(transformedMenus)
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
  
  if (level === 0) {
    // 只在顶层调用时设置 parentMenuOptions
    parentMenuOptions.value = [
      { label: '顶级菜单', value: null },
      ...options
    ]
  }
  
  return options
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

const submitMenu = async (formData) => {
  try {
    if (isEdit.value) {
      await menuApi.update(formData.id, formData)
      $q.notify({
        type: 'positive',
        message: '菜单更新成功'
      })
    } else {
      await menuApi.create(formData)
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
      await menuApi.delete(menu.id)
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
</script>
