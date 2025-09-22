import { boot } from "quasar/wrappers";
import { useAuthStore } from "src/stores/auth";
import { initDynamicRoutes } from "src/router/dynamicRoutes";

export default boot(async ({ router, store }) => {
  console.log("🚀 路由启动初始化...");

  // 获取认证store
  const authStore = useAuthStore(store);

  // 如果用户已登录，实时获取最新的权限数据并初始化动态路由
  if (authStore.token) {
    try {
      console.log("🔄 启动时检测到用户已登录，获取最新权限数据并初始化动态路由...");

      // 设置初始化状态
      authStore.isInitializing = true;

      // 延迟一小段时间确保所有模块都已加载
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 实时获取最新的用户信息和菜单数据
      await authStore.initializeAuth();

      // 使用最新获取的菜单数据初始化路由
      const routeSuccess = await initDynamicRoutes(router, true);

      if (routeSuccess) {
        authStore.routesLoaded = true;
        console.log("✅ 启动时动态路由初始化完成（使用最新权限数据）");
      } else {
        console.warn("⚠️ 启动时动态路由初始化失败");
      }

      authStore.isInitializing = false;
    } catch (error) {
      console.error("❌ 启动时动态路由初始化失败:", error);
      authStore.isInitializing = false;
      // 如果获取权限数据失败，可能是token过期，清除认证信息
      if (error.response?.status === 401) {
        console.log("🔄 Token可能已过期，清除认证信息");
        authStore.clearAuth();
      }
    }
  } else {
    console.log("📋 启动时无用户登录信息，跳过路由初始化");
  }
});
