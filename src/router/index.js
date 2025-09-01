import { route } from "quasar/wrappers";
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "src/stores/auth";
import { pinia } from "src/boot/pinia";
import { initDynamicRoutes, resetDynamicRoutes } from "./dynamicRoutes";

export default route(function ({ store /*, ssrContext */ }) {
  const createHistory = process.env.SERVER
    ? createWebHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // 路由守卫
  Router.beforeEach(async (to, from, next) => {
    console.log(`🚦 路由守卫: ${from.path} -> ${to.path}`);

    // 白名单路由，不需要登录验证
    const whiteList = ["/login", "/register", "/404"];

    if (whiteList.includes(to.path)) {
      console.log("✅ 白名单路由，直接通过");
      next();
      return;
    }

    // 获取认证store
    const authStore = useAuthStore(pinia);

    // 检查是否已登录
    if (!authStore.token) {
      console.log("❌ 未登录，重定向到登录页");
      next("/login");
      return;
    }

    // 如果正在初始化路由，避免重复处理
    if (authStore.isInitializing) {
      console.log("⏳ 路由初始化中，等待完成...");
      next();
      return;
    }

    // 如果用户信息不存在，获取用户信息
    if (!authStore.userInfo) {
      try {
        console.log("🔄 用户信息不存在，开始初始化...");
        authStore.isInitializing = true;

        console.log("📡 获取用户信息...");
        await authStore.getUserInfo();

        // 获取用户菜单数据
        console.log("📋 获取用户菜单...");
        await authStore.getUserMenus();

        // 初始化动态路由
        console.log("🛣️ 初始化动态路由...");
        const routeSuccess = await initDynamicRoutes(Router);
        if (routeSuccess) {
          authStore.routesLoaded = true;
          console.log("✅ 动态路由初始化完成");
        } else {
          console.warn("⚠️ 动态路由初始化失败，但继续导航");
        }

        authStore.isInitializing = false;

        // 如果目标路由是根路径，重定向到仪表盘
        if (to.path === "/") {
          console.log("🏠 根路径重定向到仪表盘");
          next("/dashboard");
        } else {
          console.log(`✅ 导航到目标路由: ${to.path}`);
          next();
        }
        return;
      } catch (error) {
        console.error("❌ 用户信息获取失败:", error);
        authStore.isInitializing = false;
        authStore.clearAuth();
        resetDynamicRoutes(Router);
        next("/login");
        return;
      }
    }

    // 如果用户信息存在但动态路由未加载
    if (!authStore.routesLoaded) {
      try {
        console.log("👤 用户信息已存在，但动态路由未加载");
        authStore.isInitializing = true;

        console.log("🛠️ 初始化动态路由系统...");

        // 确保菜单数据存在
        if (!authStore.menus || authStore.menus.length === 0) {
          console.log("📋 重新获取菜单数据...");
          await authStore.getUserMenus();
        }

        // 初始化动态路由
        const routeSuccess = await initDynamicRoutes(Router);
        if (routeSuccess) {
          authStore.routesLoaded = true;
          console.log("✅ 动态路由初始化完成");
        } else {
          console.warn("⚠️ 动态路由初始化失败，但继续导航");
        }

        authStore.isInitializing = false;

        // 如果目标路由是根路径，重定向到仪表盘
        if (to.path === "/") {
          console.log("🏠 根路径重定向到仪表盘");
          next("/dashboard");
        } else {
          console.log(`✅ 导航到目标路由: ${to.path}`);
          next();
        }
        return;
      } catch (error) {
        console.error("❌ 动态路由初始化失败:", error);
        authStore.isInitializing = false;
        // 即使动态路由初始化失败，也不阻止访问基础页面
        const baseRoutes = ["/dashboard", "/profile"];
        if (baseRoutes.includes(to.path)) {
          console.log("🛡️ 访问基础页面，允许通过");
          next();
        } else {
          console.log("🔄 重定向到仪表盘");
          next("/dashboard");
        }
        return;
      }
    }

    // 所有条件都满足，正常导航
    console.log(`✅ 路由守卫通过: ${to.path}`);
    next();
  });

  // 路由错误处理
  Router.onError((error) => {
    console.error("路由错误:", error);
  });

  return Router;
});
