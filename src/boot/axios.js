/**
 * ---------------------------------------------------------------
 * 🌍 Axios Interceptor – Version i18n / Secure / Compatible CAPTCHA
 * 🎯 Gestion centralisée des requêtes HTTP, tokens, erreurs réseau
 * ---------------------------------------------------------------
 * ✅ Basé sur la version originale fonctionnelle
 * ✅ Conserve le flux complet de rafraîchissement des tokens
 * ✅ Compatible CAPTCHA / public-key / i18n
 * ✅ Tous les commentaires chinois et anglais originaux restaurés
 * ---------------------------------------------------------------
 */

import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify, Loading, LocalStorage } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { serializeParams } from 'src/utils'
import { resetDynamicRoutes } from 'src/router/dynamicRoutes'
import { i18n } from 'src/boot/i18n' // ⚠️ utiliser ton initialisation i18n
const t = i18n.global.t

// ⚠️ 注意在 SSR 中避免跨请求状态污染。
// ⚠️ Attention : éviter la pollution de requêtes croisées en SSR.
// ⚠️ Be careful: avoid cross-request state pollution in SSR.
const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:8008/api',
  timeout: 30000
})

/**
 * ---------------------------------------------------------------
 * 🧩 辅助函数：安全获取 auth store
 * 🔹 Fonction utilitaire : récupérer le store d’authentification
 * 🔹 Helper: safely get authentication store
 * ---------------------------------------------------------------
 */
const getAuthStore = () => {
  try {
    return useAuthStore()
  } catch (error) {
    console.warn('⚠️ AuthStore 未初始化 / AuthStore non initialisé / AuthStore not initialized')
    return null
  }
}

/**
 * ---------------------------------------------------------------
 * 🔑 辅助函数：获取 token（包括验证码令牌）
 * 🔹 Fonction utilitaire : récupérer le jeton d’accès (y compris captcha)
 * 🔹 Helper: get access token (including captcha token)
 * ---------------------------------------------------------------
 */
const getToken = () => {
  const authStore = getAuthStore()
  const storeToken = authStore ? authStore.token : null
  const localToken = LocalStorage.getItem('token')
  const captchaToken = LocalStorage.getItem('captchaToken') // ✅ pour compatibilité CAPTCHA

  return storeToken || captchaToken || localToken
}

/**
 * ---------------------------------------------------------------
 * 🧹 清理空参数的工具函数
 * 🔹 Fonction utilitaire : nettoyage récursif des paramètres vides
 * 🔹 Utility: recursively clean empty params
 * ---------------------------------------------------------------
 */
const cleanEmptyParams = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const cleaned = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    const value = obj[key]

    // 跳过空值 / Ignorer les valeurs vides / Skip empty values
    if (
      value === undefined ||
      value === '' ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
    ) {
      continue
    }

    // 递归清理嵌套对象 / Nettoyage récursif / Recursive cleaning
    if (typeof value === 'object' && value !== null) {
      const cleanedValue = cleanEmptyParams(value)
      if (
        (Array.isArray(cleanedValue) && cleanedValue.length > 0) ||
        (!Array.isArray(cleanedValue) && Object.keys(cleanedValue).length > 0)
      ) {
        cleaned[key] = cleanedValue
      }
    } else {
      cleaned[key] = value
    }
  }

  return cleaned
}

/**
 * ---------------------------------------------------------------
 * 📤 在模块级别设置请求拦截器
 * 🔹 Configuration de l’intercepteur de requêtes au niveau module
 * 🔹 Module-level request interceptor
 * ---------------------------------------------------------------
 */
api.interceptors.request.use(
  (config) => {
    // 显示加载动画 / Afficher le chargement / Show loading indicator
    Loading.show({ delay: 200 })

    // 添加认证头 / Ajouter l’en-tête Authorization / Add Authorization header
    const token = getToken()
    const isPublic = config.url?.includes('/auth/captcha') || config.url?.includes('/auth/public-key')

    // ⚠️ N’ajoute pas de token sur les routes publiques (CAPTCHA / public-key)
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 处理GET请求的参数序列化 / Sérialiser les paramètres GET / Serialize GET params
    if (config.method?.toLowerCase() === 'get' && config.params) {
      config.params = cleanEmptyParams(config.params)
      config.paramsSerializer = (params) => serializeParams(params)
    } else if (config.params) {
      // 对非GET请求仅清理空参数 / Nettoyer uniquement / Only clean for non-GET
      config.params = cleanEmptyParams(config.params)
    }

    // 清理空的请求体参数 (POST/PUT/PATCH)
    // Nettoyer le corps / Clean body data
    if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
      const skip = config.skipInterceptor
      config.data = cleanEmptyParams(config.data)
      config.skipInterceptor = skip // ✅ conserve le drapeau si défini
    }

    return config
  },
  (error) => {
    Loading.hide()
    return Promise.reject(error)
  }
)

/**
 * ---------------------------------------------------------------
 * 📥 在模块级别设置响应拦截器
 * 🔹 Configuration de l’intercepteur de réponses
 * 🔹 Response interceptor
 * ---------------------------------------------------------------
 */

let routerInstance = null

api.interceptors.response.use(
  (response) => {
    Loading.hide()

    // 如果是blob响应或者标记跳过拦截器，直接返回
    // Si c’est un blob ou skipInterceptor → ignorer
    // If blob or skipInterceptor → return directly
    if (response.config.responseType === 'blob' || response.config.skipInterceptor) {
      return response
    }

    // 统一处理响应 / Gestion unifiée / Unified response handling
    const { code, message } = response.data

    if (code === 200) {
      return response
    } else {
      // 业务错误 / Erreur métier / Business logic error
      Notify.create({
        type: 'negative',
        message: message || t('core.operationFail'),
        position: 'top-right'
      })
      return Promise.reject(new Error(message || t('core.operationFail')))
    }
  },

  async (error) => {
    Loading.hide()

    const { response } = error
    const authStore = getAuthStore()

    if (response) {
      const { status, data } = response

      switch (status) {
        /**
         * ---------------------------------------------------------------
         * 🔐 401 – Token过期或无效
         * 🔹 Jeton expiré ou invalide
         * 🔹 Token expired or invalid
         * ---------------------------------------------------------------
         */
        case 401:
          const refreshToken = authStore?.refreshToken || LocalStorage.getItem('refreshToken')

          if (refreshToken) {
            try {
              // 尝试刷新 Token / Tentative de refresh / Try token refresh
              if (authStore) {
                await authStore.refreshAccessToken()
              } else {
                throw new Error('AuthStore not initialized')
              }

              // 重新发送原请求 / Relancer la requête / Replay request
              return api.request(error.config)
            } catch (refreshError) {
              // 显示认证失败提示 / Afficher erreur auth / Auth failed
              Notify.create({
                type: 'negative',
                message: t('core.tokenExpired'),
                position: 'top-right'
              })

              // 刷新失败，保存当前路由并跳转到登录页
              // Sauvegarde route + redirection login
              const currentRoute = routerInstance?.currentRoute.value.fullPath
              if (currentRoute && currentRoute !== '/login' && currentRoute !== '/') {
                if (authStore) {
                  authStore.setRedirectUrl(currentRoute)
                } else {
                  LocalStorage.set('redirectUrl', currentRoute)
                }
              }

              // 清理认证信息 / Nettoyer l’auth / Clear auth info
              if (authStore) authStore.clearAuth()
              else {
                LocalStorage.remove('token')
                LocalStorage.remove('refreshToken')
                LocalStorage.remove('userInfo')
                LocalStorage.remove('permissions')
                LocalStorage.remove('roles')
                LocalStorage.remove('userMenus')
              }

              if (routerInstance) resetDynamicRoutes(routerInstance)

              // 确保跳转到登录页 / Forcer la redirection / Force login redirect
              if (routerInstance) {
                try {
                  await routerInstance.replace('/login')
                } catch {
                  window.location.replace('/login')
                }
              } else {
                window.location.replace('/login')
              }
            }
          } else {
            // 无刷新令牌，直接跳转登录
            // Pas de refreshToken → redirect login
            Notify.create({
              type: 'negative',
              message: t('core.unauthorized'),
              position: 'top-right'
            })
            if (authStore) authStore.clearAuth()
            if (routerInstance) await routerInstance.replace('/login')
            else window.location.replace('/login')
          }
          break

        /**
         * ---------------------------------------------------------------
         * 🚫 403 – 权限不足
         * 🔹 Permission insuffisante
         * 🔹 Permission denied
         * ---------------------------------------------------------------
         */
        case 403:
          Notify.create({
            type: 'negative',
            message: t('core.permissionDenied'),
            position: 'top-right'
          })
          break

        /**
         * ---------------------------------------------------------------
         * ❓ 404 – 请求的资源不存在
         * 🔹 Ressource demandée introuvable
         * 🔹 Requested resource not found
         * ---------------------------------------------------------------
         */
        case 404:
          Notify.create({
            type: 'negative',
            message: t('core.notFound'),
            position: 'top-right'
          })
          break

        /**
         * ---------------------------------------------------------------
         * 💥 500 – 服务器内部错误
         * 🔹 Erreur interne du serveur
         * 🔹 Internal server error
         * ---------------------------------------------------------------
         */
        case 500:
          Notify.create({
            type: 'negative',
            message: t('core.serverError'),
            position: 'top-right'
          })
          break

        /**
         * ---------------------------------------------------------------
         * ❗ 默认错误处理
         * 🔹 Gestion générique
         * 🔹 Default error handler
         * ---------------------------------------------------------------
         */
        default:
          Notify.create({
            type: 'negative',
            message: data?.message || `${t('core.operationFail')} (${status})`,
            position: 'top-right'
          })
      }
    } else {
      /**
       * ---------------------------------------------------------------
       * 🌐 网络错误
       * 🔹 Erreur réseau : impossible de contacter le serveur
       * 🔹 Network error: cannot reach server
       * ---------------------------------------------------------------
       */
      Notify.create({
        type: 'negative',
        message: t('core.networkError'),
        position: 'top-right'
      })
    }

    return Promise.reject(error)
  }
)

/**
 * ---------------------------------------------------------------
 * ⚙️ Boot – Vue 全局注入 Axios
 * 🔹 Injection globale dans Vue
 * 🔹 Global Axios injection into Vue app
 * ---------------------------------------------------------------
 */
export default boot(({ app, router }) => {
  // 保存 router 实例供拦截器使用
  // 🔹 Sauvegarde de l’instance du routeur pour l’utiliser dans les intercepteurs
  // 🔹 Save router instance for use inside interceptors
  routerInstance = router

  // for use inside Vue files (Options API) through this.$axios and this.$api
  // 可在 Vue 文件中通过 this.$axios / this.$api 使用
  // Use inside Vue components as this.$axios / this.$api
  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

})

export { api }
