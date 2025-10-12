<template>
  <q-layout view="lHh Lpr lFf">
    <!-- === HEADER / 头部 / Header === -->
    <q-header elevated class="modern-header">
      <q-toolbar class="modern-toolbar">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" color="dark" />

        <!-- Fil d’Ariane / 面包屑导航 / Breadcrumbs -->
        <q-breadcrumbs class="q-ml-md modern-breadcrumbs">
          <q-breadcrumbs-el :label="t('menu.dashboard')" class="breadcrumb-item" />
          <q-breadcrumbs-el
            v-for="(breadcrumb, index) in breadcrumbs"
            :key="index"
            :label="breadcrumb.label"
            class="breadcrumb-item"
          />
        </q-breadcrumbs>

        <q-space />

        <!-- Actions utilisateur / 用户操作 / User actions -->
        <div class="q-gutter-sm row items-center no-wrap">
          <!-- Plein écran / 全屏 / Fullscreen -->
          <q-btn
            flat dense round
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="$q.fullscreen.toggle()"
            color="dark"
          />

          <!-- Menu utilisateur / 用户菜单 / User menu -->
          <q-btn-dropdown
            flat dense no-caps
            :label="userInfo && userInfo.username ? userInfo.username : t('user.profile')"
            icon="account_circle"
            color="dark"
          >
            <q-list>
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar><q-icon name="person" /></q-item-section>
                <q-item-section>{{ t('user.profile') }}</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>{{ t('auth.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>

      <!-- Onglets ouverts / 打开标签页 / Open tabs -->
      <div class="tabs-container">
        <q-tabs
          v-model="activeTab"
          no-caps dense class="modern-tabs hide-arrows"
          active-color="primary" indicator-color="primary" align="left"
        >
          <q-tab
            v-for="tab in openTabs"
            :key="tab.path"
            :name="tab.path"
            @click="switchTab(tab.path)"
            @contextmenu.prevent="showContextMenu($event, tab)"
            class="modern-tab-item"
          >
            <div class="tab-content">
              <span class="tab-label">{{ tab.title }}</span>
              <q-btn
                v-if="tab.path !== '/dashboard'"
                flat dense round size="xs" icon="close"
                class="tab-close-btn"
                @click.stop="closeTab(tab.path)"
              />
            </div>
          </q-tab>
        </q-tabs>
      </div>
    </q-header>

    <!-- Menu contextuel (onglets) / 右键菜单（标签）/ Tab context menu -->
    <q-menu
      v-model="contextMenuVisible"
      :target="contextMenuTarget"
      anchor="bottom left"
      self="top left"
      :offset="[0, 5]"
      v-if="contextMenuTarget"
    >
      <q-list dense style="min-width: 80px">
        <q-item clickable v-close-popup @click="refreshTab">
          <q-item-section>{{ t('action.refresh') }}</q-item-section>
        </q-item>

        <q-item v-if="contextTab?.path !== '/dashboard'" clickable v-close-popup @click="closeTab(contextTab?.path || '')">
          <q-item-section>{{ t('action.close') }}</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="closeOtherTabs">
          <q-item-section>{{ t('action.close_others') }}</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="closeAllTabs">
          <q-item-section>{{ t('action.close_all') }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- === DRAWER LATÉRAL / 侧边抽屉 / Left drawer === -->
    <q-drawer v-model="leftDrawerOpen" show-if-above class="modern-drawer" style="background: #1a1d29 !important">
      <div class="drawer-header" style="background: #0f1419 !important">
        <div class="logo-container">
          <q-icon name="admin_panel_settings" class="logo-icon" />
          <div class="logo-text">
            <div class="system-name">YWHC {{ t('menu.system') }}</div>
          </div>
        </div>
      </div>

      <q-list class="navigation-menu" style="background: transparent !important">
        <!-- Tableau de bord / 仪表盘 / Dashboard -->
        <q-item
          clickable v-ripple
          :active="$route.path === '/dashboard'"
          @click="navigateTo('/dashboard')"
          class="menu-item"
          :class="{ 'menu-item--active': $route.path === '/dashboard' }"
        >
          <q-item-section avatar><q-icon name="dashboard" class="menu-icon" /></q-item-section>
          <q-item-section class="menu-label">
            <span>{{ t('menu.dashboard') }}</span>
            <div class="item-indicator"></div>
          </q-item-section>
        </q-item>

        <!-- Menus dynamiques / 动态菜单 / Dynamic menus -->
        <template v-for="menu in menuList as MenuItem[]" :key="menu.id">
          <q-expansion-item
            v-if="menu.children && menu.children.length > 0"
            :icon="menu.icon"
            :label="menu.menuName"
            :model-value="isMenuExpanded(menu)"
            @update:model-value="(val) => onMenuToggle(menu, val)"
            class="menu-group"
            header-class="menu-group-header"
            expand-icon="keyboard_arrow_down"
          >
            <template v-slot:header>
              <q-item-section avatar><q-icon :name="menu.icon" class="menu-icon" /></q-item-section>
              <q-item-section class="menu-label"><span>{{ menu.menuName }}</span></q-item-section>
            </template>

            <q-item
              v-for="child in menu.children"
              :key="child.id"
              clickable v-ripple
              :active="$route.path === child.path"
              @click="navigateTo(child.path)"
              class="menu-item menu-item--sub"
              :class="{ 'menu-item--active': $route.path === child.path }"
            >
              <q-item-section avatar><q-icon :name="child.icon" class="menu-icon" /></q-item-section>
              <q-item-section class="menu-label">
                <span>{{ child.menuName }}</span>
                <div class="item-indicator"></div>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item
            v-else clickable v-ripple
            :active="$route.path === menu.path"
            @click="navigateTo(menu.path)"
            class="menu-item"
            :class="{ 'menu-item--active': $route.path === menu.path }"
          >
            <q-item-section avatar><q-icon :name="menu.icon" class="menu-icon" /></q-item-section>
            <q-item-section class="menu-label">
              <span>{{ menu.menuName }}</span>
              <div class="item-indicator"></div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <!-- === CONTENU PRINCIPAL / 主内容 / Main content === -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>

    <!-- === DIALOGUE CHANGEMENT MOT DE PASSE / 修改密码对话框 / Change password dialog === -->
    <q-dialog v-model="passwordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">{{ t('user.change_password') }}</div></q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit="submitPasswordChange" class="q-gutter-md">
            <q-input v-model="passwordForm.oldPassword" type="password" :label="t('auth.old_password')" outlined dense />
            <q-input v-model="passwordForm.newPassword" type="password" :label="t('auth.new_password')" outlined dense />
            <q-input v-model="passwordForm.confirmPassword" type="password" :label="t('auth.confirm_password')" outlined dense />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat :label="t('action.cancel')" @click="passwordDialog = false" />
              <q-btn type="submit" color="primary" :label="t('action.confirm')" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
/**
 * FR  : Mise en page principale de l’application (header, drawer, tabs, contenu).
 * ZH  : 应用主布局（头部、侧边栏、标签页、内容）。
 * EN  : Application main layout (header, drawer, tabs, content).
 */
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { useQuasar } from "quasar";
import { resetDynamicRoutes } from "src/router/dynamicRoutes";
import { useI18n } from "vue-i18n";

// ======================= Types =======================
interface MenuItem {
  id: number | string;
  path: string;
  icon?: string;
  menuName: string;
  children?: MenuItem[];
}

interface UserInfo {
  username?: string;
  [key: string]: any;
}

// =====================================================
const { t } = useI18n(); // FR: i18n / ZH: 国际化 / EN: internationalization
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);
const passwordDialog = ref(false);
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 菜单展开状态管理
// FR: Gestion de l’état d’expansion des menus
// EN: Manage menu expanded state
const expandedMenus = ref<Set<number | string>>(new Set());

// 标签页管理
// FR: Gestion des onglets ouverts
// EN: Open tabs management
const openTabs = ref<{ path: string; title: string; icon?: string }[]>([
  { path: "/dashboard", title: t("menu.dashboard"), icon: "dashboard" },
]);
const activeTab = ref("/dashboard");

// 右键菜单
// FR: Menu contextuel (clic droit sur onglet)
// EN: Context menu (tab right-click)
const contextMenuVisible = ref(false);
const contextTab = ref<{ path: string } | null>(null);
const contextMenuTarget = ref<HTMLElement | null>(null);

// 面包屑导航
// FR: Fil d’Ariane
// EN: Breadcrumbs
const breadcrumbs = ref<{ label: string; icon?: string; to?: any }[]>([]);

// 计算属性 / FR: Propriétés calculées / EN: Computed
const userInfo = computed<UserInfo | null>(() => {
  const info = authStore.userInfo;
  return (info && typeof info === 'object' && !Array.isArray(info)) ? info as UserInfo : null;
});
const menuList = computed(() => authStore.menus || []);

/**
 * 初始化菜单展开状态
 * FR : Initialiser l’état d’expansion des menus à partir de la route active
 * EN : Initialize expanded menus based on current route
 */
const initExpandedMenus = (menus: MenuItem[]) => {
  if (!menus || menus.length === 0) return;

  const currentPath = route.path;
  menus.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      const hasActiveChild = menu.children.some((child: any) =>
        currentPath.startsWith(child.path)
      );
      if (hasActiveChild) {
        expandedMenus.value.add(menu.id);
      }
    }
  });
};

/**
 * 更新菜单展开状态
 * FR : Mettre à jour l’état d’expansion des menus selon la route
 * EN : Update expanded menus according to the route
 */
const updateExpandedMenus = (currentPath: string) => {
  const menus = authStore.menus || [];
  menus.forEach((menu: MenuItem) => {
    if (menu.children && menu.children.length > 0) {
      const hasActiveChild = menu.children.some((child: any) =>
        currentPath.startsWith(child.path)
      );
      if (hasActiveChild) {
        expandedMenus.value.add(menu.id);
      }
    }
  });
};

/**
 * 检查菜单是否激活
 * FR : Indique si un menu est actif
 * EN : Check if menu is active
 */
const isMenuActive = (menu: any) => {
  if (menu.children && menu.children.length > 0) {
    return menu.children.some((child: any) => route.path.startsWith(child.path));
  }
  return route.path === menu.path;
};

/**
 * 检查菜单是否展开
 * FR : Indique si un menu doit être affiché comme « déployé »
 * EN : Check if a menu should be expanded
 */
const isMenuExpanded = (menu: MenuItem) => {
  return expandedMenus.value.has(menu.id);
};

/**
 * 处理菜单展开/折叠事件
 * FR : Gérer l’évènement d’expansion/réduction d’un menu
 * EN : Handle menu expand/collapse event
 */
const onMenuToggle = (menu: MenuItem, expanded: boolean) => {
  if (expanded) {
    expandedMenus.value.add(menu.id);
  } else {
    expandedMenus.value.delete(menu.id);
  }
};

/**
 * 更新面包屑导航
 * FR : Mettre à jour le fil d’Ariane selon la route courante
 * EN : Update breadcrumbs based on current route
 */
const updateBreadcrumbs = (currentPath: string) => {
  breadcrumbs.value = [];

  if (currentPath === "/dashboard") return;

  const findBreadcrumbPath = (menus: any[], targetPath: string, path: any[] = []) => {
    for (const menu of menus) {
      const current = [
        ...path,
        { label: menu.menuName, icon: menu.icon, to: { path: menu.path } },
      ];

      if (menu.path === targetPath) {
        return current;
      }

      if (menu.children) {
        const found = findBreadcrumbPath(menu.children, targetPath, current);
        if (found) return found;
      }
    }
    return null;
  };

  const breadcrumbPath = findBreadcrumbPath(authStore.menus || [], currentPath);
  if (breadcrumbPath) {
    breadcrumbs.value = breadcrumbPath;
  }
};

/**
 * 添加并切换标签页
 * FR : Ajouter (si besoin) et basculer vers un onglet
 * EN : Add (if needed) and switch to a tab
 */
const addTab = (path: string) => {
  const existingTab = openTabs.value.find((tab) => tab.path === path);
  if (existingTab) {
    activeTab.value = path;
    return;
  }

  const pageInfo = getPageInfo(path);
  if (pageInfo) {
    openTabs.value.push({
      path,
      title: pageInfo.title,
      icon: pageInfo.icon,
    });
    activeTab.value = path;
  }
};

/**
 * 根据路径获取页面信息
 * FR : Obtenir les infos d’une page depuis son chemin
 * EN : Get page info from path
 */
const getPageInfo = (path: string) => {
  const findInMenus = (menus: any[], targetPath: string): { title: string; icon: string } | null => {
    for (const menu of menus) {
      if (menu.path === targetPath) {
        return { title: menu.menuName, icon: menu.icon };
      }
      if (menu.children) {
        const found = findInMenus(menu.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const menuInfo = findInMenus(authStore.menus || [], path);
  if (menuInfo) return menuInfo;

  const defaultPages: Record<string, { title: string; icon: string }> = {
    "/dashboard": { title: t("menu.dashboard"), icon: "dashboard" },
    "/profile": { title: t("user.profile"), icon: "person" },
  };

  return defaultPages[path] || { title: t("common.unknownPage"), icon: "help" };
};

// 监听菜单数据变化
// FR : Surveiller les changements du menu (et init. expansion)
// EN : Watch menus changes (and init expansion)
watch(
  () => authStore.menus,
  (newMenus) => {
    if (newMenus?.length > 0) {
      initExpandedMenus(newMenus);
    }
  },
  { immediate: true }
);

// 监听路由变化，更新菜单展开状态、面包屑和标签页
// FR : Surveiller la route et mettre à jour menus, breadcrumbs, onglets
// EN : Watch route to update menus, breadcrumbs, tabs
watch(
  () => route.path,
  (newPath) => {
    updateExpandedMenus(newPath);
    updateBreadcrumbs(newPath);

    activeTab.value = newPath;

    if (!openTabs.value.find((tab) => tab.path === newPath)) {
      addTab(newPath);
    }
  },
  { immediate: true }
);

// 方法 / FR: Méthodes / EN: Methods
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const navigateTo = (path: string) => {
  addTab(path);
  router.push(path);
};

const switchTab = (path: string) => {
  activeTab.value = path;
  router.push(path);
};

const closeTab = (path: string) => {
  if (path === "/dashboard") return; // Dashboard 不可关闭 / FR: non fermable / EN: not closable

  const index = openTabs.value.findIndex((tab) => tab.path === path);
  if (index === -1) return;

  openTabs.value.splice(index, 1);

  if (activeTab.value === path) {
    const newActiveTab = openTabs.value[Math.max(0, index - 1)];
    switchTab(newActiveTab.path);
  }
};

const showContextMenu = (event: MouseEvent, tab: { path: string }) => {
  event.preventDefault();
  if (event.target) {
    contextTab.value = tab;
    contextMenuTarget.value = event.target as HTMLElement;
    contextMenuVisible.value = true;
  }
};

const refreshTab = () => {
  if (contextTab.value) {
    const currentPath = contextTab.value.path;
    router.replace("/").then(() => {
      router.replace(currentPath);
    });
  }
};

const closeOtherTabs = () => {
  if (!contextTab.value) return;

  const keepTab = contextTab.value;
  openTabs.value = openTabs.value.filter(
    (tab) => tab.path === "/dashboard" || tab.path === keepTab.path
  );

  if (activeTab.value !== keepTab.path && activeTab.value !== "/dashboard") {
    switchTab(keepTab.path);
  }
};

const closeAllTabs = () => {
  openTabs.value = openTabs.value.filter((tab) => tab.path === "/dashboard");
  if (activeTab.value !== "/dashboard") {
    switchTab("/dashboard");
  }
};

const goToProfile = () => {
  router.push("/profile");
};

const changePassword = () => {
  passwordDialog.value = true;
  passwordForm.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};

const submitPasswordChange = async () => {
  try {
    await authStore.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });

    $q.notify({
      type: "positive",
      message: t("user.password_success"),
    });

    passwordDialog.value = false;
  } catch (error: any) {
    $q.notify({
      type: "negative",
      message: error?.message || t("user.password_failed"),
    });
  }
};

/**
 * 退出登录对话框
 * FR : Boîte de dialogue de déconnexion (confirmation)
 * EN : Logout confirmation dialog
 */
const logout = async () => {
  $q.dialog({
    title: t("action.confirm"),
    message: t("auth.confirm_logout"),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await authStore.logout();
      // 清除动态路由 / FR: Réinitialiser les routes dynamiques / EN: Reset dynamic routes
      resetDynamicRoutes(router);
      router.push("/login");
    } catch (error) {
      // 同上：确保回到登录页 / FR: fallback / EN: fallback
      resetDynamicRoutes(router);
      router.push("/login");
    }
  });
};

/**
 * 加载用户相关数据（用户信息、菜单等）
 * FR : Charger les données utilisateur (profil, menus)
 * EN : Load user-related data (profile, menus)
 */
const loadUserData = async () => {
  try {
    if (authStore.token) {
      if (!authStore.userInfo) {
        await authStore.getUserInfo();
      }
      if (!authStore.menus?.length) {
        await authStore.getUserMenus();
      }
    }
  } catch (error) {
    // 可按需记录日志 / FR: log si besoin / EN: optional logging
    // console.error("Load user data failed:", error);
  }
};

onMounted(() => {
  loadUserData();
});
</script>

<style lang="scss" scoped>
/* ========== Header 样式 / FR: Styles header / EN: Header styles ========== */
.modern-header {
  background: #ffffff;
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
}

.modern-toolbar {
  background: #ffffff;
  color: #333;
  min-height: 64px;
  padding: 0 24px;
}

.system-title-header {
  text-align: right;

  .title-content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;

    .title-text {
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .title-version {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
  }
}

/* ========== 面包屑导航样式 / FR: Styles breadcrumbs / EN: Breadcrumbs styles ========== */
.modern-breadcrumbs {
  :deep(.q-breadcrumbs__el) {
    color: #666 !important;
    cursor: default !important;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;

    .q-icon {
      font-size: 1.1rem;
      opacity: 0.8;
      color: #1976d2;
    }
  }

  :deep(.q-breadcrumbs__separator) {
    color: #999 !important;
  }

  .breadcrumb-item:hover {
    :deep(.q-icon) {
      opacity: 1;
    }
  }
}

/* ========== 标签页样式 / FR: Tabs styles / EN: Tabs styles ========== */
.tabs-container {
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  padding: 1px 1px 0;
}

.modern-tabs {
  :deep(.q-tabs__content) {
    border-bottom: none;
  }

  :deep(.q-tab-panels) {
    display: none;
  }
}

.modern-tab-item {
  min-width: 140px;
  max-width: 220px;
  margin-right: 4px;
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: all 0.3s ease;

  :deep(.q-tab__content) {
    padding: 8px 16px;
    overflow: visible;
  }

  &:not(.q-tab--active) {
    background: rgba(255, 255, 255, 0.7);
    color: #666;
    border: 1px solid rgba(102, 126, 234, 0.1);
    border-bottom: none;

    &:hover {
      background: rgba(102, 126, 234, 0.08);
      color: #333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }
  }

  &.q-tab--active {
    background: white;
    color: #667eea;
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-bottom: 1px solid white;
    box-shadow: 0 -2px 8px rgba(102, 126, 234, 0.1);
    z-index: 1;

    &::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0 0 2px 2px;
    }
  }
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.tab-icon {
  font-size: 1rem;
  opacity: 0.8;
}

.tab-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
}

.tab-close-btn {
  opacity: 0.6;
  transition: all 0.2s ease;
  margin-left: 4px;

  &:hover {
    opacity: 1;
    background: rgba(255, 0, 0, 0.1);
    color: #ff4757;
  }
}

/* ========== 左侧抽屉样式 / FR: Drawer styles / EN: Drawer styles ========== */
.modern-drawer {
  background: #1a1d29 !important;
  border: none;
  width: 280px;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}

/* 强制覆盖（全局）/ FR: Override (global) / EN: Force override (global) */
:deep(.modern-drawer) {
  background: #1a1d29 !important;
  color: rgba(255, 255, 255, 0.9) !important;

  &,
  &.q-drawer,
  &.q-drawer--standard,
  &.q-drawer--bordered,
  &.q-drawer--elevated {
    background: #1a1d29 !important;
  }

  .q-drawer__content {
    background: #1a1d29 !important;
  }

  .q-drawer__backdrop {
    background: #1a1d29 !important;
  }

  .q-list {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .q-item {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .q-expansion-item {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .q-item__section {
    background: transparent !important;
    color: inherit !important;
  }

  .q-icon {
    color: inherit !important;
  }
}

.drawer-header {
  background: #0f1419;
  padding: 2px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .logo-container {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo-icon {
      font-size: 2.5rem;
      color: #4fc3f7;
      border-radius: 12px;
      padding: 8px;
    }

    .logo-text {
      .system-name {
        font-size: 1.0rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 2px;
      }

      .system-desc {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 2px;
        letter-spacing: 1px;
      }
    }
  }
}

.navigation-menu {
  padding: 16px 0;
  background: transparent !important;

  .menu-item {
    margin: 4px 16px;
    border-radius: 10px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: rgba(255, 255, 255, 0.85);

    &:hover {
      background: rgba(79, 195, 247, 0.12);
      color: #ffffff;
      transform: translateX(6px);
      box-shadow: 0 2px 8px rgba(79, 195, 247, 0.2);
    }

    &--active {
      background: #4fc3f7;
      color: #000000;
      box-shadow: 0 4px 20px rgba(79, 195, 247, 0.4);
      font-weight: 600;
      border-left: 2px solid rgba(79, 195, 247, 0.3);

      .item-indicator {
        opacity: 1;
        transform: scaleY(1);
        background: #000000;
      }

      .menu-icon {
        color: #000000;
        transform: scale(1.1);
      }

      &:hover {
        background: #29b6f6;
        transform: translateX(6px);
      }
    }

    &--sub {
      margin-left: 40px;
      margin-right: 16px;

      border-radius: 0 10px 10px 0;
      padding-left: 8px;

      .menu-icon {
        font-size: 1rem;
      }

      &--active {
        border-left-color: #4fc3f7;
      }
    }
  }

  .menu-icon {
    color: rgba(255, 255, 255, 0.75);
    transition: all 0.3s ease;
    font-size: 1.2rem;
  }

  .menu-label {
    position: relative;

    span {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .item-indicator {
      position: absolute;
      right: -16px;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3px;
      height: 20px;
      background: #4fc3f7;
      border-radius: 2px;
      opacity: 0;
      transition: all 0.3s ease;
    }
  }

  .menu-group {
    margin: 8px 16px;
    border-radius: 10px;
    overflow: hidden;

    :deep(.q-expansion-item__container) {
      background: transparent;
    }

    :deep(.q-expansion-item__header) {
      color: rgba(255, 255, 255, 0.9);
      transition: all 0.3s ease;
      border-radius: 10px;

      &:hover {
        background: rgba(79, 195, 247, 0.08);
        color: #ffffff;
      }
    }

    :deep(.q-expansion-item__toggle-icon) {
      color: rgba(255, 255, 255, 0.6);
    }

    :deep(.q-expansion-item__content) {
      background: rgba(0, 0, 0, 0.15);
      margin-top: 4px;
      border-radius: 0 0 10px 10px;
    }
  }
}

/* ========== 响应式设计 / FR: Responsive / EN: Responsive ========== */
@media (max-width: 768px) {
  .modern-toolbar {
    padding: 0 16px;
    min-height: 56px;
  }

  .system-title-header .title-content {
    .title-text {
      font-size: 1.1rem;
    }

    .title-version {
      display: none;
    }
  }

  .tabs-container {
    padding: 4px 8px 0;
  }

  .modern-tab-item {
    min-width: 100px;
    max-width: 160px;

    :deep(.q-tab__content) {
      padding: 6px 12px;
    }
  }

  .tab-label {
    font-size: 0.8rem;
  }

  .modern-drawer {
    width: 260px;
  }

  .drawer-header {
    padding: 20px 16px;

    .logo-container {
      gap: 12px;

      .logo-icon {
        font-size: 2rem;
        padding: 6px;
      }

      .system-name {
        font-size: 1.3rem;
      }
    }
  }
}

/* ========== 隐藏箭头 / FR: Hide arrows / EN: Hide arrows ========== */
.hide-arrows {
  :deep(.q-tabs__arrow) {
    display: none !important;
  }

  :deep(.q-tabs__arrow--left),
  :deep(.q-tabs__arrow--right) {
    display: none !important;
  }
}

/* ========== 深色主题适配 / FR: Dark theme / EN: Dark theme ========== */
.body--dark {
  .modern-header {
    background: #1e1e1e;
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .modern-toolbar {
    background: #1e1e1e;
    color: #ffffff;
  }

  .modern-breadcrumbs {
    :deep(.q-breadcrumbs__el) {
      color: rgba(255, 255, 255, 0.7) !important;

      .q-icon {
        color: #4fc3f7 !important;
      }
    }

    :deep(.q-breadcrumbs__separator) {
      color: rgba(255, 255, 255, 0.5) !important;
    }
  }

  .system-title-header {
    .title-content {
      .title-text {
        color: #ffffff;
      }

      .title-version {
        background: rgba(79, 195, 247, 0.2);
        color: #4fc3f7;
      }
    }
  }

  .tabs-container {
    background: linear-gradient(to right, #1e1e1e, #2a2a2a);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .modern-tab-item {
    &:not(.q-tab--active) {
      background: rgba(255, 255, 255, 0.05);
      color: #ccc;
      border-color: rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }

    &.q-tab--active {
      background: #2a2a2a;
      color: #4fc3f7;
      border-color: rgba(79, 195, 247, 0.3);

      &::after {
        background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
      }
    }
  }
}
</style>
