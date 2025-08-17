import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify, Loading } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ 
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000
})

export default boot(({ app, router }) => {
  // 请求拦截器
  api.interceptors.request.use(
    (config) => {
      // 显示加载动画
      Loading.show({
        delay: 200
      })

      // 添加认证头
      const authStore = useAuthStore()
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }

      return config
    },
    (error) => {
      Loading.hide()
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  api.interceptors.response.use(
    (response) => {
      Loading.hide()
      
      // 统一处理响应
      const { code, message } = response.data
      
      if (code === 200) {
        return response
      } else {
        // 业务错误
        Notify.create({
          type: 'negative',
          message: message || '请求失败',
          position: 'top-right'
        })
        return Promise.reject(new Error(message || '请求失败'))
      }
    },
    async (error) => {
      Loading.hide()
      
      const { response } = error
      const authStore = useAuthStore()
      
      if (response) {
        const { status, data } = response
        
        switch (status) {
          case 401:
            // Token过期或无效
            if (authStore.refreshToken) {
              try {
                // 尝试刷新Token
                await authStore.refreshAccessToken()
                // 重新发送原请求
                return api.request(error.config)
              } catch (refreshError) {
                // 刷新失败，跳转到登录页
                authStore.clearAuth()
                router.push('/login')
              }
            } else {
              authStore.clearAuth()
              router.push('/login')
            }
            break
            
          case 403:
            Notify.create({
              type: 'negative',
              message: '权限不足',
              position: 'top-right'
            })
            break
            
          case 404:
            Notify.create({
              type: 'negative',
              message: '请求的资源不存在',
              position: 'top-right'
            })
            break
            
          case 500:
            Notify.create({
              type: 'negative',
              message: '服务器内部错误',
              position: 'top-right'
            })
            break
            
          default:
            Notify.create({
              type: 'negative',
              message: data?.message || `请求失败 (${status})`,
              position: 'top-right'
            })
        }
      } else {
        // 网络错误
        Notify.create({
          type: 'negative',
          message: '网络连接失败，请检查网络设置',
          position: 'top-right'
        })
      }
      
      return Promise.reject(error)
    }
  )

  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
