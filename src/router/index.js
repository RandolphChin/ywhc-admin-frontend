import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createWebHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // 路由守卫
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // 白名单路由，不需要登录验证
    const whiteList = ['/login', '/register', '/404']
    
    if (whiteList.includes(to.path)) {
      next()
      return
    }

    // 检查是否已登录
    if (!authStore.token) {
      next('/login')
      return
    }

    // 检查用户信息是否存在
    if (!authStore.userInfo) {
      try {
        await authStore.getUserInfo()
        next()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        authStore.logout()
        next('/login')
      }
      return
    }

    next()
  })

  return Router
})
