<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> YWHC 后台管理系统 </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- 全屏切换 -->
          <q-btn
            flat
            dense
            round
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="$q.fullscreen.toggle()"
          />

          <!-- 用户菜单 -->
          <q-btn-dropdown
            flat
            dense
            no-caps
            :label="userInfo?.nickname || '用户'"
            icon="account_circle"
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
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header> 导航菜单 </q-item-label>

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

    // 监听路由变化，更新菜单展开状态
    watch(
      () => route.path,
      (newPath) => {
        console.log("🚦 路由变化:", newPath);
        updateExpandedMenus(newPath);
      },
      { immediate: true }
    );

    // 方法
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const navigateTo = (path) => {
      router.push(path);
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
      toggleLeftDrawer,
      navigateTo,
      goToProfile,
      changePassword,
      submitPasswordChange,
      logout,
      isMenuActive,
      isMenuExpanded,
      onMenuToggle,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-toolbar__title
  font-size: 1.2rem
  font-weight: 500
</style>
