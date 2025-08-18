import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default boot(({ app, store }) => {
  // 权限指令
  app.directive('permission', {
    mounted(el, binding) {
      const { value } = binding
      
      // 延迟获取store，确保在组件挂载时才调用
      try {
        const authStore = useAuthStore(store)
        if (value && !authStore.hasPermission(value)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      } catch (error) {
        console.warn('Permission directive: Store not available yet')
      }
    },
    updated(el, binding) {
      const { value } = binding
      
      try {
        const authStore = useAuthStore(store)
        if (value && !authStore.hasPermission(value)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      } catch (error) {
        console.warn('Permission directive: Store not available yet')
      }
    }
  })

  // 角色指令
  app.directive('role', {
    mounted(el, binding) {
      const { value } = binding
      
      try {
        const authStore = useAuthStore(store)
        if (value && !authStore.hasRole(value)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      } catch (error) {
        console.warn('Role directive: Store not available yet')
      }
    },
    updated(el, binding) {
      const { value } = binding
      
      try {
        const authStore = useAuthStore(store)
        if (value && !authStore.hasRole(value)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      } catch (error) {
        console.warn('Role directive: Store not available yet')
      }
    }
  })
})
