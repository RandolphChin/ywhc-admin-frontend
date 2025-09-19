import { boot } from "quasar/wrappers";
import { useAuthStore } from "src/stores/auth";
import { initDynamicRoutes } from "src/router/dynamicRoutes";

export default boot(async ({ router, store }) => {
  console.log("🚀 路由启动初始化...");

  // 获取认证store
  const authStore = useAuthStore(store);

  // 如果用户已登录且有持久化的菜单数据，提前初始化动态路由
  if (authStore.token && authStore.menus && authStore.menus.length > 0) {
    try {
      console.log("🔄 启动时检测到用户已登录且有菜单数据，预初始化动态路由...");

      // 设置初始化状态
      authStore.isInitializing = true;

      // 延迟一小段时间确保所有模块都已加载
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 使用持久化的菜单数据初始化路由
      const routeSuccess = await initDynamicRoutes(router, true);

      if (routeSuccess) {
        authStore.routesLoaded = true;
        console.log("✅ 启动时动态路由预初始化完成");
      } else {
        console.warn("⚠️ 启动时动态路由预初始化失败");
      }

      authStore.isInitializing = false;
    } catch (error) {
      console.error("❌ 启动时动态路由初始化失败:", error);
      authStore.isInitializing = false;
    }
  } else {
    console.log("📋 启动时无用户登录信息或菜单数据，跳过路由预初始化");
  }
});
