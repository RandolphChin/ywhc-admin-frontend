import { defineStore } from "pinia";
import { LocalStorage } from "quasar";
import { authApi, menuApi } from 'src/api'

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: LocalStorage.getItem("token") || null,
    refreshToken: LocalStorage.getItem("refreshToken") || null,
    userInfo: null,
    permissions: [],
    roles: [],
    menus: LocalStorage.getItem("userMenus") || [], // 从本地存储恢复菜单数据
    routesLoaded: false, // 标记动态路由是否已加载
    isInitializing: false, // 标记是否正在初始化路由
  }),

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
        const response = await authApi.login(loginData);
        const { accessToken, refreshToken, userInfo } = response.data.data;

        this.token = accessToken;
        this.refreshToken = refreshToken;
        this.userInfo = userInfo;

        // 保存到本地存储
        LocalStorage.set("token", accessToken);
        LocalStorage.set("refreshToken", refreshToken);

        // 获取用户详细信息和菜单
        await this.getUserInfo();
        await this.getUserMenus();

        return response.data;
      } catch (error) {
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

      LocalStorage.remove("token");
      LocalStorage.remove("refreshToken");
      LocalStorage.remove("userMenus");
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await authApi.getUserInfo();
        const { userInfo, permissions, roles } = response.data.data;

        this.userInfo = userInfo;
        this.permissions = permissions || [];
        this.roles = roles || [];
        // 不在这里设置menus，专门用getUserMenus获取

        return response.data;
      } catch (error) {
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

    // 获取用户动态菜单（用于侧边栏显示）
    async getUserMenus() {
      try {
        console.log("📋 正在获取用户菜单...");
        const response = await menuApi.getUserMenus();
        console.log("📋 用户菜单API响应:", response.data);

        if (response.data && response.data.code === 200) {
          this.menus = response.data.data || [];
          // 持久化菜单数据到本地存储
          LocalStorage.set("userMenus", this.menus);
          console.log("✅ 用户菜单数据已更新，菜单数量:", this.menus.length);
          console.log("📋 菜单详情:", this.menus);
          return this.menus;
        } else {
          console.warn("⚠️ 获取用户菜单失败，响应数据异常:", response.data);
          this.menus = [];
          LocalStorage.remove("userMenus");
          return [];
        }
      } catch (error) {
        console.error("❌ 获取用户菜单失败:", error);
        this.menus = [];
        LocalStorage.remove("userMenus");
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
