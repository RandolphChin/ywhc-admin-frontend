<template>
  <q-page>
    <!-- 检索条件 -->
    <q-card>
      <q-card-section>
        <div class="row items-center q-gutter-sm">
            <q-input
              v-model="queryMenuName"
              dense
              outlined
              clearable
              label="菜单名称"
              placeholder="输入菜单名称"
              @keyup.enter="onSearch"
            />
            <q-btn color="primary" icon="search" label="检索" @click="onSearch" />
            <q-btn color="warning" icon="restart_alt" label="重置" @click="onReset" />
        </div>
        <div class="row q-mt-xs q-gutter-sm">
          <q-btn
            color="primary"
            icon="add"
            label="添加菜单"
            @click="showMenuDialog()"
            v-permission="'system:menu:add'"
          />
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
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          flat
          bordered
        >
          <template v-slot:body-cell-menuName="props">
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
                <span>{{ props.row.menuName }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-menuType="props">
            <q-td :props="props">
              <q-badge
                :color="getTypeColor(props.row.menuType)"
                :label="getTypeLabel(props.row.menuType)"
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

          <template v-slot:body-cell-isVisible="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.isVisible === 1 ? 'positive' : 'negative'"
                :label="props.row.isVisible === 1 ? '显示' : '隐藏'"
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
                color="primary"
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
const queryMenuName = ref('')

const menuForm = ref({
  id: null,
  parentId: null,
  menuType: 0,
  menuName: '',
  name: '',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sortOrder: 0,
  status: 1,
  isVisible: 1,
  remark: ''
})

const columns = [
  {
    name: 'menuName',
    label: '菜单名称',
    field: 'menuName',
    align: 'left'
  },
  {
    name: 'menuType',
    label: '类型',
    field: 'menuType',
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
    name: 'sortOrder',
    label: '排序',
    field: 'sortOrder',
    align: 'center'
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'isVisible',
    label: '显示',
    field: 'isVisible',
    align: 'center'
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
]

const getTypeColor = (menuType) => {
  const colors = { 0: 'primary', 1: 'secondary', 2: 'accent' }
  return colors[menuType] || 'grey'
}

const getTypeLabel = (menuType) => {
  const labels = { 0: '目录', 1: '菜单', 2: '按钮' }
  return labels[menuType] || '未知'
}

const loadMenus = async () => {
  loading.value = true
  
  try {
    const response = await menuApi.getTree()
    menus.value = response.data.data
    
    // 转换数据格式并构建平铺结构
    const transformedMenus = transformMenuData(response.data.data)
    if (queryMenuName.value && queryMenuName.value.trim() !== '') {
      // 有检索关键字时，过滤并展开相关节点
      const filtered = filterMenuTreeByMenuName(transformedMenus, queryMenuName.value.trim())
      const ids = collectIds(filtered)
      expandedRows.value = new Set(ids)
      flatMenus.value = buildFlatMenus(filtered)
    } else {
      // 无检索关键字，显示完整树
      flatMenus.value = buildFlatMenus(transformedMenus)
    }
    
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
    menuName: menu.menuName,
    menuType: menu.menuType,
    path: menu.path,
    component: menu.component,
    permission: menu.permission,
    icon: menu.icon,
    sortOrder: menu.sortOrder,
    status: menu.status,
    isVisible: menu.isVisible,
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
  let baseTree = transformMenuData(menus.value)
  if (queryMenuName.value && queryMenuName.value.trim() !== '') {
    baseTree = filterMenuTreeByMenuName(baseTree, queryMenuName.value.trim())
  }
  flatMenus.value = buildFlatMenus(baseTree)
}

// 根据菜单名称过滤菜单树，保留匹配节点及其所有父级
const filterMenuTreeByMenuName = (menuList, keyword) => {
  const kw = keyword.toLowerCase()
  const result = []
  menuList.forEach(menu => {
    const childrenFiltered = menu.children ? filterMenuTreeByMenuName(menu.children, keyword) : []
    const selfMatch = (menu.menuName || '').toLowerCase().includes(kw)
    if (selfMatch || (childrenFiltered && childrenFiltered.length > 0)) {
      result.push({
        ...menu,
        children: childrenFiltered,
        hasChildren: childrenFiltered.length > 0
      })
    }
  })
  return result
}

// 收集树中所有节点 id
const collectIds = (menuList) => {
  const ids = []
  const walk = (list) => {
    list.forEach(item => {
      ids.push(item.id)
      if (item.children && item.children.length > 0) {
        walk(item.children)
      }
    })
  }
  walk(menuList)
  return ids
}

// 执行检索
const onSearch = () => {
  const transformedMenus = transformMenuData(menus.value)
  if (queryMenuName.value && queryMenuName.value.trim() !== '') {
    const filtered = filterMenuTreeByMenuName(transformedMenus, queryMenuName.value.trim())
    const ids = collectIds(filtered)
    expandedRows.value = new Set(ids)
    flatMenus.value = buildFlatMenus(filtered)
  } else {
    // 关键字为空则恢复完整列表
    expandedRows.value = new Set()
    flatMenus.value = buildFlatMenus(transformedMenus)
  }
}

// 重置检索
const onReset = () => {
  queryMenuName.value = ''
  expandedRows.value = new Set()
  const transformedMenus = transformMenuData(menus.value)
  flatMenus.value = buildFlatMenus(transformedMenus)
}

const buildParentMenuOptions = (menuList, level = 0) => {
  const options = []
  
  menuList.forEach(menu => {
    if (menu.menuType !== 2) { // 按钮不能作为父级菜单
      options.push({
        label: '　'.repeat(level) + menu.menuName,
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
      { label: '顶级菜单', value: '0' },
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
      menuType: 0,
      menuName: '',
      name: '',
      path: '',
      component: '',
      permission: '',
      icon: '',
      sortOrder: 0,
      status: 1,
      isVisible: 1,
      remark: ''
    }
  }
  menuDialog.value = true
}

const submitMenu = async (formData) => {
  try {
    if (isEdit.value) {
      await menuApi.update(formData)
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
    message: `确定要删除菜单 "${menu.menuName}" 吗？`,
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
