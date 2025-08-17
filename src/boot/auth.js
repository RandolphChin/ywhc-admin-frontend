import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  // 权限指令
  app.directive('permission', {
    mounted(el, binding) {
      const { value } = binding
      const authStore = useAuthStore()
      
      if (value && !authStore.hasPermission(value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    },
    updated(el, binding) {
      const { value } = binding
      const authStore = useAuthStore()
      
      if (value && !authStore.hasPermission(value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  })

  // 角色指令
  app.directive('role', {
    mounted(el, binding) {
      const { value } = binding
      const authStore = useAuthStore()
      
      if (value && !authStore.hasRole(value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    },
    updated(el, binding) {
      const { value } = binding
      const authStore = useAuthStore()
      
      if (value && !authStore.hasRole(value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  })
})
