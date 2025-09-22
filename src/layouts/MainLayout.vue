<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="modern-header">
      <q-toolbar class="modern-toolbar">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" color="dark" />

        <!-- 面包屑导航 icon="dashboard"  :icon="breadcrumb.icon"  -->
        <q-breadcrumbs class="q-ml-md modern-breadcrumbs">
          <q-breadcrumbs-el label="Dashboard" class="breadcrumb-item" />
          <q-breadcrumbs-el v-for="(breadcrumb, index) in breadcrumbs" :key="index" :label="breadcrumb.label"
            class="breadcrumb-item" />
        </q-breadcrumbs>

        <q-space />
        <!-- 
        <q-toolbar-title class="system-title-header">
          <div class="title-content">
            <span class="title-text">YWHC 后台管理系统</span>
            <span class="title-version">v2.0</span>
          </div>
        </q-toolbar-title>
-->
        <div class="q-gutter-sm row items-center no-wrap">
          <!-- 全屏切换 -->
          <q-btn flat dense round :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="$q.fullscreen.toggle()" color="dark" />

          <!-- 用户菜单 -->
          <q-btn-dropdown flat dense no-caps :label="userInfo?.username || '用户'" icon="account_circle" color="dark">
            <q-list>
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>个人中心</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="changePassword">
                <q-item-section avatar>
                  <q-icon name="lock" />
                </q-item-section>
                <q-item-section>修改密码</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>退出登录</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>

      <!-- 标签页区域 -->
      <div class="tabs-container">
        <q-tabs v-model="activeTab" no-caps dense class="modern-tabs hide-arrows" active-color="primary"
          indicator-color="primary" align="left">
          <q-tab v-for="tab in openTabs" :key="tab.path" :name="tab.path" @click="switchTab(tab.path)"
            @contextmenu.prevent="showContextMenu($event, tab)" class="modern-tab-item">
            <div class="tab-content">
            <!--   <q-icon :name="tab.icon || 'description'" class="tab-icon" /> -->
              <span class="tab-label">{{ tab.title }}</span>
              <q-btn v-if="tab.path !== '/dashboard'" flat dense round size="xs" icon="close" class="tab-close-btn"
                @click.stop="closeTab(tab.path)" />
            </div>
          </q-tab>
        </q-tabs>
      </div>
    </q-header>

    <!-- 右键菜单 -->
    <q-menu v-model="contextMenuVisible" :target="contextMenuTarget" anchor="bottom left" self="top left"
      :offset="[0, 5]">
      <q-list dense style="min-width: 80px">
        <q-item clickable v-close-popup @click="refreshTab">
          <q-item-section>刷新</q-item-section>
        </q-item>

        <q-item v-if="contextTab?.path !== '/dashboard'" clickable v-close-popup @click="closeTab(contextTab?.path)">
          <q-item-section>关闭</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="closeOtherTabs">
          <q-item-section>关闭其他</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="closeAllTabs">
          <q-item-section>关闭全部</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="modern-drawer" style="background: #1a1d29 !important">
      <div class="drawer-header" style="background: #0f1419 !important">
        <div class="logo-container">
          <q-icon name="admin_panel_settings" class="logo-icon" />
          <div class="logo-text">
            <div class="system-name">YWHC 后台管理系统</div>
            <!-- 
            <div class="system-desc">管理系统</div>
             -->
          </div>
        </div>
      </div>

      <q-list class="navigation-menu" style="background: transparent !important">
        <!-- 仪表盘 - 保留静态菜单 -->
        <q-item clickable v-ripple :active="$route.path === '/dashboard'" @click="navigateTo('/dashboard')"
          class="menu-item" :class="{ 'menu-item--active': $route.path === '/dashboard' }">
          <q-item-section avatar>
            <q-icon name="dashboard" class="menu-icon" />
          </q-item-section>
          <q-item-section class="menu-label">
            <span>仪表盘</span>
            <div class="item-indicator"></div>
          </q-item-section>
        </q-item>

        <!-- 动态菜单 -->
        <template v-for="menu in menuList" :key="menu.id">
          <q-expansion-item v-if="menu.children && menu.children.length > 0" :icon="menu.icon" :label="menu.menuName"
            :model-value="isMenuExpanded(menu)" @update:model-value="(val) => onMenuToggle(menu, val)"
            class="menu-group" header-class="menu-group-header" expand-icon="keyboard_arrow_down">
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon :name="menu.icon" class="menu-icon" />
              </q-item-section>
              <q-item-section class="menu-label">
                <span>{{ menu.menuName }}</span>
              </q-item-section>
            </template>

            <q-item v-for="child in menu.children" :key="child.id" clickable v-ripple
              :active="$route.path === child.path" @click="navigateTo(child.path)" class="menu-item menu-item--sub"
              :class="{ 'menu-item--active': $route.path === child.path }">
              <q-item-section avatar>
                <q-icon :name="child.icon" class="menu-icon" />
              </q-item-section>
              <q-item-section class="menu-label">
                <span>{{ child.menuName }}</span>
                <div class="item-indicator"></div>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item v-else clickable v-ripple :active="$route.path === menu.path" @click="navigateTo(menu.path)"
            class="menu-item" :class="{ 'menu-item--active': $route.path === menu.path }">
            <q-item-section avatar>
              <q-icon :name="menu.icon" class="menu-icon" />
            </q-item-section>
            <q-item-section class="menu-label">
              <span>{{ menu.menuName }}</span>
              <div class="item-indicator"></div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- 修改密码对话框 -->
    <q-dialog v-model="passwordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">修改密码</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitPasswordChange" class="q-gutter-md">
            <q-input v-model="passwordForm.oldPassword" type="password" label="原密码"
              :rules="[(val) => !!val || '请输入原密码']" outlined dense />

            <q-input v-model="passwordForm.newPassword" type="password" label="新密码" :rules="[
              (val) => !!val || '请输入新密码',
              (val) => val.length >= 6 || '密码长度至少6位',
            ]" outlined dense />

            <q-input v-model="passwordForm.confirmPassword" type="password" label="确认密码" :rules="[
              (val) => !!val || '请确认密码',
              (val) =>
                val === passwordForm.newPassword || '两次密码输入不一致',
            ]" outlined dense />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" @click="passwordDialog = false" />
              <q-btn type="submit" color="primary" label="确定" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { useQuasar } from "quasar";
import { resetDynamicRoutes } from "src/router/dynamicRoutes";

export default defineComponent({
  name: "MainLayout",

  setup() {
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
    const expandedMenus = ref(new Set());

    // 标签页管理
    const openTabs = ref([
      {
        path: "/dashboard",
        title: "Dashboard",
        icon: "dashboard",
      },
    ]);
    const activeTab = ref("/dashboard");

    // 右键菜单
    const contextMenuVisible = ref(false);
    const contextTab = ref(null);
    const contextMenuTarget = ref(null);

    // 面包屑导航
    const breadcrumbs = ref([]);

    // 计算属性
    const userInfo = computed(() => authStore.userInfo);
    const menuList = computed(() => authStore.menus || []);

    // 初始化菜单展开状态
    const initExpandedMenus = (menus) => {
      if (!menus || menus.length === 0) return;

      const currentPath = route.path;
      menus.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          // 检查当前路由是否在这个菜单的子菜单中
          const hasActiveChild = menu.children.some((child) =>
            currentPath.startsWith(child.path)
          );
          if (hasActiveChild) {
            expandedMenus.value.add(menu.id);
          }
        }
      });
    };

    // 更新菜单展开状态
    const updateExpandedMenus = (currentPath) => {
      const menus = authStore.menus || [];
      menus.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          const hasActiveChild = menu.children.some((child) =>
            currentPath.startsWith(child.path)
          );
          if (hasActiveChild) {
            expandedMenus.value.add(menu.id);
          }
        }
      });
    };

    // 检查菜单是否激活
    const isMenuActive = (menu) => {
      if (menu.children && menu.children.length > 0) {
        return menu.children.some((child) => route.path.startsWith(child.path));
      }
      return route.path === menu.path;
    };

    // 检查菜单是否应该展开
    const isMenuExpanded = (menu) => {
      return expandedMenus.value.has(menu.id);
    };

    // 处理菜单展开/折叠事件
    const onMenuToggle = (menu, expanded) => {
      if (expanded) {
        expandedMenus.value.add(menu.id);
      } else {
        expandedMenus.value.delete(menu.id);
      }
    };

    // 更新面包屑导航
    const updateBreadcrumbs = (currentPath) => {
      breadcrumbs.value = [];

      if (currentPath === "/dashboard") return;

      const findBreadcrumbPath = (menus, targetPath, path = []) => {
        for (const menu of menus) {
          const currentPath = [
            ...path,
            { label: menu.menuName, icon: menu.icon, to: { path: menu.path } },
          ];

          if (menu.path === targetPath) {
            return currentPath;
          }

          if (menu.children) {
            const found = findBreadcrumbPath(
              menu.children,
              targetPath,
              currentPath
            );
            if (found) return found;
          }
        }
        return null;
      };

      const breadcrumbPath = findBreadcrumbPath(
        authStore.menus || [],
        currentPath
      );
      if (breadcrumbPath) {
        breadcrumbs.value = breadcrumbPath;
      }
    };

    // 标签页管理方法
    const addTab = (path) => {
      // 如果标签页已存在，直接切换
      const existingTab = openTabs.value.find((tab) => tab.path === path);
      if (existingTab) {
        activeTab.value = path;
        return;
      }

      // 根据路径获取页面信息
      const pageInfo = getPageInfo(path);
      if (pageInfo) {
        openTabs.value.push({
          path: path,
          title: pageInfo.title,
          icon: pageInfo.icon,
        });
        activeTab.value = path;
      }
    };

    const getPageInfo = (path) => {
      // 从菜单中查找页面信息
      const findInMenus = (menus, targetPath) => {
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

      // 默认页面信息
      const defaultPages = {
        "/dashboard": { title: "Dashboard", icon: "dashboard" },
        "/profile": { title: "个人中心", icon: "person" },
      };

      return defaultPages[path] || { title: "未知页面", icon: "help" };
    };

    // 监听菜单数据变化
    watch(
      () => authStore.menus,
      (newMenus) => {
        console.log("📋 MainLayout - 菜单数据已更新:", newMenus);
        console.log("📋 MainLayout - 菜单数组长度:", newMenus?.length || 0);
        if (newMenus?.length > 0) {
          console.log("📋 MainLayout - 第一个菜单项:", newMenus[0]);
          // 初始化展开状态，如果当前路由在某个菜单下，自动展开该菜单
          initExpandedMenus(newMenus);
        }
      },
      { immediate: true }
    );

    // 监听路由变化，更新菜单展开状态、面包屑和标签页
    watch(
      () => route.path,
      (newPath) => {
        console.log("🚦 路由变化:", newPath);
        updateExpandedMenus(newPath);
        updateBreadcrumbs(newPath);

        // 更新活动标签页
        activeTab.value = newPath;

        // 如果是通过直接访问URL进入的页面，确保标签页存在
        if (!openTabs.value.find((tab) => tab.path === newPath)) {
          addTab(newPath);
        }
      },
      { immediate: true }
    );

    // 方法
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const navigateTo = (path) => {
      addTab(path);
      router.push(path);
    };

    const switchTab = (path) => {
      activeTab.value = path;
      router.push(path);
    };

    const closeTab = (path) => {
      if (path === "/dashboard") return; // Dashboard 不可关闭

      const index = openTabs.value.findIndex((tab) => tab.path === path);
      if (index === -1) return;

      openTabs.value.splice(index, 1);

      // 如果关闭的是当前活动标签页，切换到其他标签页
      if (activeTab.value === path) {
        const newActiveTab = openTabs.value[Math.max(0, index - 1)];
        switchTab(newActiveTab.path);
      }
    };

    const showContextMenu = (event, tab) => {
      event.preventDefault();
      contextTab.value = tab;
      contextMenuTarget.value = event.target;
      contextMenuVisible.value = true;
    };

    const refreshTab = () => {
      if (contextTab.value) {
        // 强制刷新当前页面
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

      if (
        activeTab.value !== keepTab.path &&
        activeTab.value !== "/dashboard"
      ) {
        switchTab(keepTab.path);
      }
    };

    const closeAllTabs = () => {
      openTabs.value = openTabs.value.filter(
        (tab) => tab.path === "/dashboard"
      );
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
          message: "密码修改成功",
        });

        passwordDialog.value = false;
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.message || "密码修改失败",
        });
      }
    };

    const logout = async () => {
      $q.dialog({
        title: "确认",
        message: "确定要退出登录吗？",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await authStore.logout();
          // 清除动态路由
          resetDynamicRoutes(router);
          router.push("/login");
        } catch (error) {
          console.error("退出登录失败:", error);
          // 清除动态路由
          resetDynamicRoutes(router);
          router.push("/login");
        }
      });
    };

    const loadUserData = async () => {
      try {
        console.log("🔄 MainLayout - 开始加载用户数据");
        console.log("🔄 MainLayout - 当前token:", !!authStore.token);
        console.log(
          "🔄 MainLayout - 当前用户信息:", authStore.userInfo
        );
        console.log(
          "🔄 MainLayout - 当前菜单数量:",
          authStore.menus?.length || 0
        );

        if (authStore.token) {
          // 如果没有用户信息，先获取用户信息
          if (!authStore.userInfo) {
            console.log("📝 MainLayout - 用户信息为空，开始获取用户信息");
            await authStore.getUserInfo();
            console.log("📝 MainLayout - 获取用户信息完成，当前userInfo:", authStore.userInfo);
          } else {
            console.log("📝 MainLayout - 用户信息已存在，跳过获取");
          }

          // 如果没有菜单数据，获取菜单
          if (!authStore.menus?.length) {
            console.log("📋 MainLayout - 获取用户菜单");
            await authStore.getUserMenus();
          }

          console.log("✅ MainLayout - 用户数据加载完成");
          console.log("✅ MainLayout - 最终userInfo:", authStore.userInfo);
        } else {
          console.log("ℹ️ MainLayout - 跳过数据加载，无token");
        }
      } catch (error) {
        console.error("❌ MainLayout - 加载用户数据失败:", error);
      }
    };

    onMounted(() => {
      console.log("🚀 MainLayout - 组件已挂载");
      console.log("🚀 MainLayout - 用户信息:", userInfo.value);
      console.log("🚀 MainLayout - 菜单列表:", menuList.value);
      loadUserData();
    });

    return {
      leftDrawerOpen,
      passwordDialog,
      passwordForm,
      userInfo,
      menuList,
      expandedMenus,
      // 标签页相关
      openTabs,
      activeTab,
      contextMenuVisible,
      contextTab,
      contextMenuTarget,
      breadcrumbs,
      // 方法
      toggleLeftDrawer,
      navigateTo,
      goToProfile,
      changePassword,
      submitPasswordChange,
      logout,
      isMenuActive,
      isMenuExpanded,
      onMenuToggle,
      // 标签页方法
      addTab,
      switchTab,
      closeTab,
      showContextMenu,
      refreshTab,
      closeOtherTabs,
      closeAllTabs,
    };
  },
});
</script>

<style lang="scss" scoped>
// ========== Header 样式 ==========
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

// ========== 面包屑导航样式 ==========
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
    margin: 0 8px;
  }

  .breadcrumb-item:hover {
    :deep(.q-icon) {
      opacity: 1;
    }
  }
}

// ========== 标签页样式 ==========
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

// ========== 左侧抽屉样式 ==========
.modern-drawer {
  background: #1a1d29 !important;
  border: none;
  width: 280px;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}

// 全局强制覆盖
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

// ========== 响应式设计 ==========
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

// ========== 隐藏箭头 ==========
.hide-arrows {
  :deep(.q-tabs__arrow) {
    display: none !important;
  }

  :deep(.q-tabs__arrow--left),
  :deep(.q-tabs__arrow--right) {
    display: none !important;
  }
}

// ========== 深色主题适配 ==========
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
