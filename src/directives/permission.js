import { useAuthStore } from '../stores/auth'

/**
 * 权限指令
 * 用法: v-permission="'user:add'" 或 v-permission="['user:add', 'user:edit']"
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const permissions = authStore.permissions || []

    let hasPermission = false

    if (Array.isArray(value)) {
      // 数组形式，需要满足其中任意一个权限
      hasPermission = value.some(permission => permissions.includes(permission))
    } else if (typeof value === 'string') {
      // 字符串形式，检查单个权限
      hasPermission = permissions.includes(value)
    }

    if (!hasPermission) {
      // 没有权限则移除元素
      el.parentNode && el.parentNode.removeChild(el)
    }
  },

  updated(el, binding) {
    // 权限更新时重新检查
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const permissions = authStore.permissions || []

    let hasPermission = false

    if (Array.isArray(value)) {
      hasPermission = value.some(permission => permissions.includes(permission))
    } else if (typeof value === 'string') {
      hasPermission = permissions.includes(value)
    }

    if (!hasPermission) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

// 角色权限指令
export const role = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const roles = authStore.roles || []

    let hasRole = false

    if (Array.isArray(value)) {
      hasRole = value.some(role => roles.includes(role))
    } else if (typeof value === 'string') {
      hasRole = roles.includes(value)
    }

    if (!hasRole) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  },

  updated(el, binding) {
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const roles = authStore.roles || []

    let hasRole = false

    if (Array.isArray(value)) {
      hasRole = value.some(role => roles.includes(role))
    } else if (typeof value === 'string') {
      hasRole = roles.includes(value)
    }

    if (!hasRole) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

export default {
  permission,
  role
}
