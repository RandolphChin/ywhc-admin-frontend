import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { LocalStorage } from 'quasar'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: LocalStorage.getItem('token') || null,
    refreshToken: LocalStorage.getItem('refreshToken') || null,
    userInfo: null,
    permissions: [],
    roles: [],
    menus: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },
    hasRole: (state) => (role) => {
      return state.roles.includes(role)
    }
  },

  actions: {
    // 登录
    async login(loginData) {
      try {
        const response = await api.post('/auth/login', loginData)
        const { accessToken, refreshToken, userInfo } = response.data.data
        
        this.token = accessToken
        this.refreshToken = refreshToken
        this.userInfo = userInfo
        
        // 保存到本地存储
        LocalStorage.set('token', accessToken)
        LocalStorage.set('refreshToken', refreshToken)
        
        // 获取用户详细信息
        await this.getUserInfo()
        
        return response.data
      } catch (error) {
        throw error
      }
    },

    // 登出
    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('登出请求失败:', error)
      } finally {
        this.clearAuth()
      }
    },

    // 清除认证信息
    clearAuth() {
      this.token = null
      this.refreshToken = null
      this.userInfo = null
      this.permissions = []
      this.roles = []
      this.menus = []
      
      LocalStorage.remove('token')
      LocalStorage.remove('refreshToken')
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await api.get('/auth/user-info')
        const { userInfo, permissions, roles, menus } = response.data.data
        
        this.userInfo = userInfo
        this.permissions = permissions || []
        this.roles = roles || []
        this.menus = menus || []
        
        return response.data
      } catch (error) {
        throw error
      }
    },

    // 刷新Token
    async refreshAccessToken() {
      try {
        const response = await api.post('/auth/refresh', {
          refreshToken: this.refreshToken
        })
        
        const { accessToken, refreshToken } = response.data.data
        
        this.token = accessToken
        this.refreshToken = refreshToken
        
        LocalStorage.set('token', accessToken)
        LocalStorage.set('refreshToken', refreshToken)
        
        return accessToken
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    // 修改密码
    async changePassword(passwordData) {
      try {
        const response = await api.put('/auth/change-password', passwordData)
        return response.data
      } catch (error) {
        throw error
      }
    }
  }
})
