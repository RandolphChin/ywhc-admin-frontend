import { defineStore } from "pinia";
import { LocalStorage } from "quasar";
import { authApi, menuApi } from "src/api";
import { clearAllComponents } from "src/router/dynamicRoutes";

export const useAuthStore = defineStore("auth", {
  state: () => {
    console.log("🏪 初始化Auth Store状态...");
    const storedUserInfo = LocalStorage.getItem("userInfo");

    console.log("📦 从localStorage读取的数据:");
    console.log("  - userInfo:", storedUserInfo, typeof storedUserInfo);
    console.log("  - 权限数据将通过API实时获取，不从localStorage恢复");

    // 处理userInfo，如果是字符串"undefined"或null，则设为null
    const validUserInfo =
      storedUserInfo &&
      storedUserInfo !== "undefined" &&
      storedUserInfo !== "null"
        ? storedUserInfo
        : null;
    console.log("✅ 处理后的userInfo:", validUserInfo);

    // 如果localStorage中存储的是无效值，清理它
    if (storedUserInfo === "undefined" || storedUserInfo === "null") {
      console.log("🧹 清理localStorage中的无效userInfo");
      LocalStorage.remove("userInfo");
    }

    return {
      token: LocalStorage.getItem("token") || null,
      refreshToken: LocalStorage.getItem("refreshToken") || null,
      userInfo: validUserInfo, // 从本地存储恢复用户信息
      permissions: [], // 不从localStorage恢复，始终为空数组
      roles: [], // 不从localStorage恢复，始终为空数组
      menus: [], // 不从localStorage恢复，始终为空数组
      routesLoaded: false, // 标记动态路由是否已加载
      isInitializing: false, // 标记是否正在初始化路由
      redirectUrl: LocalStorage.getItem("redirectUrl") || null, // 登录后重定向的URL
    };
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission);
    },
    hasRole: (state) => (role) => {
      return state.roles.includes(role);
    },
  },

  actions: {
    // 登录
    async login(loginData) {
      try {
        console.log("🔐 开始登录...");
        const response = await authApi.login(loginData);
        console.log("📥 登录API响应:", response);
        console.log("📥 登录响应数据结构:", response.data);

        const { accessToken, refreshToken, userInfo } = response.data.data;
        console.log("📝 登录解构后的数据:");
        console.log("  - accessToken:", accessToken);
        console.log("  - refreshToken:", refreshToken);
        console.log("  - userInfo:", userInfo);

        this.token = accessToken;
        this.refreshToken = refreshToken;

        // 保存token到本地存储
        LocalStorage.set("token", accessToken);
        LocalStorage.set("refreshToken", refreshToken);

        // 如果登录响应包含userInfo，使用它；否则调用getUserInfo获取
        if (userInfo !== undefined && userInfo !== null) {
          console.log("💾 登录响应包含userInfo，直接使用");
          this.userInfo = userInfo;
          LocalStorage.set("userInfo", userInfo);
        } else {
          console.log("🔄 登录响应不包含userInfo，调用getUserInfo获取");
          await this.getUserInfo();
        }

        // 获取用户菜单
        console.log("🔄 获取用户菜单...");
        await this.getUserMenus();

        console.log("✅ 登录完成，最终userInfo:", this.userInfo);

        return response.data;
      } catch (error) {
        console.error("❌ 登录失败:", error);
        throw error;
      }
    },

    // 登出
    async logout() {
      try {
        await authApi.logout();
      } catch (error) {
        console.error("登出请求失败:", error);
      } finally {
        this.clearAuth();
      }
    },

    // 清除认证信息
    clearAuth() {
      this.token = null;
      this.refreshToken = null;
      this.userInfo = null;
      this.permissions = [];
      this.roles = [];
      this.menus = [];
      this.routesLoaded = false;
      this.isInitializing = false;
      // 注意：不清除 redirectUrl，保留用于登录后重定向

      LocalStorage.remove("token");
      LocalStorage.remove("refreshToken");
      LocalStorage.remove("userInfo");
      // 权限相关数据本来就不持久化，无需清除
      // 注意：不清除 redirectUrl localStorage

      // 清除组件映射缓存
      try {
        clearAllComponents();
        console.log("🧹 已清除组件映射缓存");
      } catch (error) {
        console.warn("⚠️ 清除组件映射缓存失败:", error);
      }
    },

    // 设置重定向URL
    setRedirectUrl(url) {
      this.redirectUrl = url;
      LocalStorage.set("redirectUrl", url);
    },

    // 获取并清除重定向URL
    getAndClearRedirectUrl() {
      const url = this.redirectUrl;
      const localUrl = LocalStorage.getItem("redirectUrl");
      console.log("🔍 获取重定向URL:", { storeUrl: url, localUrl: localUrl });

      this.redirectUrl = null;
      LocalStorage.remove("redirectUrl");

      const finalUrl = url || localUrl;
      console.log("🎯 最终重定向URL:", finalUrl);
      return finalUrl;
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        console.log("🔍 开始获取用户信息...");
        const response = await authApi.getUserInfo();
        console.log("📥 getUserInfo API响应:", response);
        console.log("📥 响应数据结构:", response.data);

        const { userInfo, permissions, roles } = response.data.data;
        console.log("📝 解构后的数据:");
        console.log("  - userInfo:", userInfo);
        console.log("  - permissions:", permissions);
        console.log("  - roles:", roles);

        this.userInfo = userInfo;
        this.permissions = permissions || [];
        this.roles = roles || [];

        // 保存到本地存储（仅保存userInfo，权限数据不持久化）
        console.log("💾 保存到localStorage:");
        console.log("  - userInfo:", userInfo);
        console.log("  - permissions和roles不保存到localStorage，确保每次都获取最新数据");

        // 只有当userInfo不是undefined时才保存
        if (userInfo !== undefined && userInfo !== null) {
          LocalStorage.set("userInfo", userInfo);
        } else {
          console.warn("⚠️ userInfo是undefined或null，不保存到localStorage");
        }

        // 验证保存结果
        console.log("✅ localStorage验证:");
        console.log("  - userInfo:", LocalStorage.getItem("userInfo"));

        // 不在这里设置menus，专门用getUserMenus获取

        return response.data;
      } catch (error) {
        console.error("❌ 获取用户信息失败:", error);
        throw error;
      }
    },

    // 刷新Token
    async refreshAccessToken() {
      try {
        const response = await authApi.refreshToken({
          refreshToken: this.refreshToken,
        });

        const { accessToken, refreshToken } = response.data.data;

        this.token = accessToken;
        this.refreshToken = refreshToken;

        LocalStorage.set("token", accessToken);
        LocalStorage.set("refreshToken", refreshToken);

        return accessToken;
      } catch (error) {
        this.clearAuth();
        throw error;
      }
    },

    // 修改密码
    async changePassword(passwordData) {
      try {
        const response = await authApi.changePassword(passwordData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Helper function to recursively extract permissions from menu tree
    extractPermissionsFromMenus(menus) {
      const permissions = new Set();

      const traverse = (menuItems) => {
        if (!menuItems || !Array.isArray(menuItems)) return;

        menuItems.forEach((menu) => {
          // Extract permission if it exists and is not empty
          if (
            menu.permission &&
            typeof menu.permission === "string" &&
            menu.permission.trim()
          ) {
            permissions.add(menu.permission.trim());
          }

          // Recursively process children
          if (
            menu.children &&
            Array.isArray(menu.children) &&
            menu.children.length > 0
          ) {
            traverse(menu.children);
          }
        });
      };

      traverse(menus);
      return Array.from(permissions);
    },

    // 获取用户动态菜单（用于侧边栏显示）
    async getUserMenus() {
      try {
        console.log("📋 正在获取用户菜单...");
        const response = await menuApi.getUserMenus();
        console.log("📋 用户菜单API响应:", response.data);

        if (response.data && response.data.code === 200) {
          this.menus = response.data.data || [];

          // Extract permissions from menu tree
          const menuPermissions = this.extractPermissionsFromMenus(this.menus);
          console.log("🔑 从菜单树中提取的权限:", menuPermissions);

          // Merge with existing permissions from getUserInfo()
          const existingPermissions = this.permissions || [];
          const allPermissions = [
            ...new Set([...existingPermissions, ...menuPermissions]),
          ];

          // Update permissions array
          this.permissions = allPermissions;
          console.log("✅ 合并后的所有权限:", this.permissions);
          console.log(
            "🔍 检查system:menu:delete权限:",
            this.permissions.includes("system:menu:delete")
          );

          // 不持久化菜单和权限数据到localStorage，确保每次都获取最新数据
          console.log("✅ 用户菜单数据已更新，菜单数量:", this.menus.length);
          console.log("📋 菜单详情:", this.menus);
          console.log("🔑 权限总数:", this.permissions.length);
          console.log("💡 菜单和权限数据不保存到localStorage，确保实时更新");

          return this.menus;
        } else {
          console.warn("⚠️ 获取用户菜单失败，响应数据异常:", response.data);
          this.menus = [];
          return [];
        }
      } catch (error) {
        console.error("❌ 获取用户菜单失败:", error);
        this.menus = [];
        return [];
      }
    },

    // 初始化用户认证信息（用于应用启动时）
    async initializeAuth() {
      try {
        if (!this.token) {
          throw new Error("No token found");
        }

        console.log("🔄 初始化用户认证信息...");

        // 获取用户信息
        await this.getUserInfo();

        // 获取用户菜单
        await this.getUserMenus();

        console.log("✅ 用户认证信息初始化完成");
        return true;
      } catch (error) {
        console.error("❌ 用户认证信息初始化失败:", error);
        this.clearAuth();
        throw error;
      }
    },
  },
});
