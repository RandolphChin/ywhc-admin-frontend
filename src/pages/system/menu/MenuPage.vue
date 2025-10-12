<template>
  <q-page>
    <!-- 🔍 Barre de recherche -->
    <q-card>
      <q-card-section>
        <div class="row items-center q-gutter-sm">
          <q-input
            v-model="queryMenuName"
            dense
            outlined
            clearable
            :label="t('system.menu.name')"
            :placeholder="t('system.menu.searchPlaceholder')"
            @keyup.enter="onSearch"
          />
          <q-btn color="primary" icon="search" :label="t('action.search')" @click="onSearch" />
          <q-btn color="warning" icon="restart_alt" :label="t('action.reset')" @click="onReset" />
        </div>
        <div class="row q-mt-xs q-gutter-sm">
          <q-btn
            color="primary"
            icon="add"
            :label="t('system.menu.addMenu')"
            @click="showMenuDialog()"
            v-permission="'system:menu:add'"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 🌲 Arbre des menus -->
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
                <q-icon v-if="props.row.icon" :name="props.row.icon" class="q-mr-sm" />
                <span>{{ props.row.menuName }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-menuType="props">
            <q-td :props="props">
              <q-badge :color="getTypeColor(props.row.menuType)" :label="getTypeLabel(props.row.menuType)" />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status === 1 ? 'positive' : 'negative'"
                :label="props.row.status === 1 ? t('common.enabled') : t('common.disabled')"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-isVisible="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.isVisible === 1 ? 'positive' : 'negative'"
                :label="props.row.isVisible === 1 ? t('common.visible') : t('common.hidden')"
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
                <q-tooltip>{{ t('system.menu.addSubmenu') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="edit"
                @click="showMenuDialog(props.row)"
                v-permission="'system:menu:edit'"
              >
                <q-tooltip>{{ t('action.edit') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="primary"
                icon="delete"
                @click="deleteMenu(props.row)"
                v-permission="'system:menu:delete'"
              >
                <q-tooltip>{{ t('action.delete') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 📝 Dialogue d’édition de menu -->
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
import { useI18n } from 'vue-i18n'
import { menuApi } from 'src/api'
import { useQuasar } from 'quasar'
import MenuEditDialog from './MenuEditDialog.vue'

defineOptions({ name: 'SystemMenuPage' })
const { t } = useI18n()
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
  { name: 'menuName', label: t('system.menu.name'), field: 'menuName', align: 'left' },
  { name: 'menuType', label: t('system.menu.type'), field: 'menuType', align: 'center' },
  { name: 'path', label: t('system.menu.path'), field: 'path', align: 'left' },
  { name: 'component', label: t('system.menu.component'), field: 'component', align: 'left' },
  { name: 'permission', label: t('system.menu.permission'), field: 'permission', align: 'left' },
  { name: 'sortOrder', label: t('system.menu.sortOrder'), field: 'sortOrder', align: 'center' },
  { name: 'status', label: t('common.status'), field: 'status', align: 'center' },
  { name: 'isVisible', label: t('system.menu.visibility'), field: 'isVisible', align: 'center' },
  { name: 'actions', label: t('common.actions'), field: 'actions', align: 'center' },
]

const getTypeColor = (menuType) => {
  const colors = { 0: 'primary', 1: 'secondary', 2: 'accent' }
  return colors[menuType] || 'grey'
}

const getTypeLabel = (menuType) => {
  const labels = {
    0: t('system.menu.dir'),
    1: t('system.menu.menu'),
    2: t('system.menu.button'),
  }
  return labels[menuType] || t('common.unknown')
}

const loadMenus = async () => {
  loading.value = true
  try {
    const response = await menuApi.getTree()
    menus.value = response.data.data
    flatMenus.value = response.data.data
    buildParentMenuOptions(menus.value)
  } catch (error) {
    console.error('加载菜单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// ✅ mêmes helpers que la version originale (inchangés)
const buildMenuDisplay = (menuData) => {
  const keyword = queryMenuName.value?.trim()
  if (keyword) {
    const filtered = filterMenuTreeByMenuName(menuData, keyword)
    const ids = collectIds(filtered)
    expandedRows.value = new Set(ids)
    flatMenus.value = buildFlatMenus(filtered)
  } else {
    flatMenus.value = buildFlatMenus(menuData)
  }
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
  if (expandedRows.value.has(menuId)) expandedRows.value.delete(menuId)
  else expandedRows.value.add(menuId)
  buildMenuDisplay(menus.value)
}

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

const collectIds = (menuList) => {
  const ids = []
  const walk = (list) => {
    list.forEach(item => {
      ids.push(item.id)
      if (item.children?.length) walk(item.children)
    })
  }
  walk(menuList)
  return ids
}

const onSearch = () => buildMenuDisplay(menus.value)
const onReset = () => { queryMenuName.value = ''; expandedRows.value = new Set(); buildMenuDisplay(menus.value) }

const buildParentMenuOptions = (menuList, level = 0) => {
  const options = []
  menuList.forEach(menu => {
    if (menu.menuType !== 2) {
      options.push({ label: '　'.repeat(level) + menu.menuName, value: menu.id })
      if (menu.children?.length) options.push(...buildParentMenuOptions(menu.children, level + 1))
    }
  })
  if (level === 0) parentMenuOptions.value = [{ label: t('system.menu.rootMenu'), value: '0' }, ...options]
  return options
}

const showMenuDialog = (menu = null, parent = null) => {
  isEdit.value = !!menu
  menuForm.value = menu
    ? { ...menu }
    : {
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
  menuDialog.value = true
}

const submitMenu = async (formData) => {
  try {
    if (isEdit.value) {
      await menuApi.update(formData)
      $q.notify({ type: 'positive', message: t('system.menu.updateSuccess') })
    } else {
      await menuApi.create(formData)
      $q.notify({ type: 'positive', message: t('system.menu.createSuccess') })
    }
    menuDialog.value = false
    loadMenus()
  } catch (error) {
    $q.notify({ type: 'negative', message: t('common.operationFail') })
  }
}

const deleteMenu = (menu) => {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('system.menu.confirmDelete', { name: menu.menuName }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await menuApi.delete(menu.id)
      $q.notify({ type: 'positive', message: t('system.menu.deleteSuccess') })
      loadMenus()
    } catch (error) {
      $q.notify({ type: 'negative', message: t('system.menu.deleteFail') })
    }
  })
}

onMounted(() => loadMenus())
</script>
