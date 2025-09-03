<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar class="bg-white text-dark">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="dark"
        />

        <!-- 面包屑导航 -->
        <q-breadcrumbs class="q-ml-md breadcrumb-static">
          <q-breadcrumbs-el
            label="Dashboard"
          />
          <q-breadcrumbs-el
            v-for="(breadcrumb, index) in breadcrumbs"
            :key="index"
            :label="breadcrumb.label"
          />
        </q-breadcrumbs>

        <q-space />

        <q-toolbar-title class="text-right text-dark"> YWHC 后台管理系统 </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- 全屏切换 -->
          <q-btn
            flat
            dense
            round
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="$q.fullscreen.toggle()"
            color="dark"
          />

          <!-- 用户菜单 -->
          <q-btn-dropdown
            flat
            dense
            no-caps
            :label="userInfo?.nickname || '用户'"
            icon="account_circle"
            color="dark"
          >
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
      <div class="bg-white border-bottom">
        <q-tabs
          v-model="activeTab"
          no-caps
          dense
          class="text-grey compact-tabs hide-arrows"
          active-color="white"
          indicator-color="transparent"
          align="left"
        >
          <q-tab
            v-for="tab in openTabs"
            :key="tab.path"
            :name="tab.path"
            @click="switchTab(tab.path)"
            @contextmenu.prevent="showContextMenu($event, tab)"
            class="tab-item"
          >
            <div class="row items-center no-wrap">
              <span>{{ tab.title }}</span>
              <q-icon
                v-if="tab.path !== '/dashboard'"
                name="close"
                size="xs"
                style="font-size: 12px;margin-left: 8px;"
                class="q-ml-xs tab-close-btn"
                @click.stop="closeTab(tab.path)"
              />
            </div>
          </q-tab>
        </q-tabs>
      </div>
    </q-header>

    <!-- 右键菜单 -->
    <q-menu
      v-model="contextMenuVisible"
      context-menu
    >
      <q-list dense style="min-width: 80px">
        <q-item clickable v-close-popup @click="refreshTab">
          <q-item-section>刷新</q-item-section>
        </q-item>
        
        <q-item 
          v-if="contextTab?.path !== '/dashboard'"
          clickable 
          v-close-popup 
          @click="closeTab(contextTab?.path)"
        >
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header> YWHC 后台管理系统 </q-item-label>

        <!-- 仪表盘 - 保留静态菜单 -->
        <q-item
          clickable
          v-ripple
          :active="$route.path === '/dashboard'"
          @click="navigateTo('/dashboard')"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section> 仪表盘 </q-item-section>
        </q-item>

        <!-- 动态菜单 -->
        <template v-for="menu in menuList" :key="menu.id">
          <q-expansion-item
            v-if="menu.children && menu.children.length > 0"
            :icon="menu.icon"
            :label="menu.menuName"
            :model-value="isMenuExpanded(menu)"
            @update:model-value="(val) => onMenuToggle(menu, val)"
          >
            <q-item
              v-for="child in menu.children"
              :key="child.id"
              clickable
              v-ripple
              :active="$route.path === child.path"
              @click="navigateTo(child.path)"
              class="q-ml-md"
            >
              <q-item-section avatar>
                <q-icon :name="child.icon" />
              </q-item-section>
              <q-item-section>
                {{ child.menuName }}
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item
            v-else
            clickable
            v-ripple
            :active="$route.path === menu.path"
            @click="navigateTo(menu.path)"
          >
            <q-item-section avatar>
              <q-icon :name="menu.icon" />
            </q-item-section>
            <q-item-section>
              {{ menu.menuName }}
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
            <q-input
              v-model="passwordForm.oldPassword"
              type="password"
              label="原密码"
              :rules="[(val) => !!val || '请输入原密码']"
              outlined
              dense
            />

            <q-input
              v-model="passwordForm.newPassword"
              type="password"
              label="新密码"
              :rules="[
                (val) => !!val || '请输入新密码',
                (val) => val.length >= 6 || '密码长度至少6位',
              ]"
              outlined
              dense
            />

            <q-input
              v-model="passwordForm.confirmPassword"
              type="password"
              label="确认密码"
              :rules="[
                (val) => !!val || '请确认密码',
                (val) =>
                  val === passwordForm.newPassword || '两次密码输入不一致',
              ]"
              outlined
              dense
            />

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
        path: '/dashboard',
        title: 'Dashboard',
        icon: 'dashboard'
      }
    ]);
    const activeTab = ref('/dashboard');
    
    // 右键菜单
    const contextMenuVisible = ref(false);
    const contextTab = ref(null);

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
      return expandedMenus.value.has(menu.id) || isMenuActive(menu);
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
      
      if (currentPath === '/dashboard') return;

      const findBreadcrumbPath = (menus, targetPath, path = []) => {
        for (const menu of menus) {
          const currentPath = [...path, { label: menu.menuName, icon: menu.icon, to: { path: menu.path } }];
          
          if (menu.path === targetPath) {
            return currentPath;
          }
          
          if (menu.children) {
            const found = findBreadcrumbPath(menu.children, targetPath, currentPath);
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

    // 标签页管理方法
    const addTab = (path) => {
      // 如果标签页已存在，直接切换
      const existingTab = openTabs.value.find(tab => tab.path === path);
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
          icon: pageInfo.icon
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
        '/dashboard': { title: 'Dashboard', icon: 'dashboard' },
        '/profile': { title: '个人中心', icon: 'person' }
      };

      return defaultPages[path] || { title: '未知页面', icon: 'help' };
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
        if (!openTabs.value.find(tab => tab.path === newPath)) {
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
      if (path === '/dashboard') return; // Dashboard 不可关闭

      const index = openTabs.value.findIndex(tab => tab.path === path);
      if (index === -1) return;

      openTabs.value.splice(index, 1);

      // 如果关闭的是当前活动标签页，切换到其他标签页
      if (activeTab.value === path) {
        const newActiveTab = openTabs.value[Math.max(0, index - 1)];
        switchTab(newActiveTab.path);
      }
    };

    const showContextMenu = (event, tab) => {
      contextTab.value = tab;
      contextMenuVisible.value = true;
    };

    const refreshTab = () => {
      if (contextTab.value) {
        // 强制刷新当前页面
        const currentPath = contextTab.value.path;
        router.replace('/').then(() => {
          router.replace(currentPath);
        });
      }
    };

    const closeOtherTabs = () => {
      if (!contextTab.value) return;
      
      const keepTab = contextTab.value;
      openTabs.value = openTabs.value.filter(tab => 
        tab.path === '/dashboard' || tab.path === keepTab.path
      );
      
      if (activeTab.value !== keepTab.path && activeTab.value !== '/dashboard') {
        switchTab(keepTab.path);
      }
    };

    const closeAllTabs = () => {
      openTabs.value = openTabs.value.filter(tab => tab.path === '/dashboard');
      if (activeTab.value !== '/dashboard') {
        switchTab('/dashboard');
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

    const loadUserMenus = async () => {
      try {
        console.log("🔄 MainLayout - 开始加载用户菜单");
        console.log("🔄 MainLayout - 当前token:", !!authStore.token);
        console.log(
          "🔄 MainLayout - 当前菜单数量:",
          authStore.menus?.length || 0
        );

        if (authStore.token && !authStore.menus?.length) {
          await authStore.getUserMenus();
          console.log("✅ MainLayout - 菜单加载完成");
        } else {
          console.log("ℹ️ MainLayout - 跳过菜单加载，已存在或无token");
        }
      } catch (error) {
        console.error("❌ MainLayout - 加载用户菜单失败:", error);
      }
    };

    onMounted(() => {
      console.log("🚀 MainLayout - 组件已挂载");
      console.log("🚀 MainLayout - 用户信息:", userInfo.value);
      console.log("🚀 MainLayout - 菜单列表:", menuList.value);
      loadUserMenus();
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
.q-toolbar__title {
  font-size: 1.2rem;
  font-weight: 500;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.tab-item {
  min-width: 120px;
  max-width: 200px;
  
  .q-tab__content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tab-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.tab-item .q-icon {
  opacity: 0.6;
  transition: opacity 0.2s;
}
  
.tab-item:hover .q-icon {
  opacity: 1;
}

// 覆盖 Quasar 默认的 header 背景色
:deep(.q-header) {
  background-color: white !important;
  color: #333 !important;
}

:deep(.q-toolbar) {
  background-color: white !important;
  color: #333 !important;
  min-height: 48px !important;
}

// 面包屑样式 - 不可点击，灰色字体
.breadcrumb-static {
  :deep(.q-breadcrumbs__el) {
    color: #666 !important;
    cursor: default !important;
  }
    
  :deep(.q-breadcrumbs__el:hover) {
    color: #666 !important;
    text-decoration: none !important;
  }
}

// 紧凑标签页样式
.compact-tabs {
  :deep(.q-tab) {
    min-height: 28px !important;
    padding: 0 8px !important;
    font-size: 12px !important;
    margin-right: 2px !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 4px 4px 0 0 !important;
  }
    
  // 选中标签页的背景色为 primary 色
  :deep(.q-tab--active) {
    background-color: #1976D2 !important;
    color: white !important;
    border-color: #1976D2 !important;
  }
    
  :deep(.q-tab:not(.q-tab--active)) {
    color: #666 !important;
    background-color: #f5f5f5 !important;
  }
    
  :deep(.q-tab:not(.q-tab--active):hover) {
    background-color: rgba(0, 0, 0, 0.04) !important;
  }

  // 隐藏指示器和箭头
  :deep(.q-tabs__content) {
    .q-tab-panels {
      display: none;
    }
  }
      
  :deep(.q-tabs__arrow) {
    display: none !important;
  }
    
  :deep(.q-tabs__arrow--left) {
    display: none !important;
    visibility: hidden !important;
  }
    
  :deep(.q-tabs__arrow--right) {
    display: none !important;
  }
    
  :deep(.material-icons) {
    &.q-tabs__arrow {
      display: none !important;
      visibility: hidden !important;
    }
  }
}

// 关闭按钮样式
.tab-close-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}

// 确保关闭按钮颜色与文字一致
:deep(.q-tab--active .tab-close-btn) {
  color: white !important;
}

:deep(.q-tab:not(.q-tab--active) .tab-close-btn) {
  color: #666 !important;
}

// 隐藏箭头的正确方法
.hide-arrows {
  :deep(.q-tabs__arrow) {
    display: none !important;
  }
    
  :deep(.q-tabs__arrow--left),
  :deep(.q-tabs__arrow--right) {
    display: none !important;
  }
    
  // 针对不同版本的 Quasar 可能的类名
  :deep(.q-tab__arrow),
  :deep(.q-tab__arrow--left),
  :deep(.q-tab__arrow--right) {
    display: none !important;
  }
    
  // 隐藏所有可能的箭头图标
  :deep(.material-icons) {
    &:contains('chevron_left'),
    &:contains('chevron_right') {
      display: none !important;
    }
  }
      
  // 更暴力的方法 - 隐藏包含特定内容的图标
  :deep([class*="arrow"]) {
    display: none !important;
  }
    
  :deep([class*="chevron"]) {
    display: none !important;
  }
}
</style>
