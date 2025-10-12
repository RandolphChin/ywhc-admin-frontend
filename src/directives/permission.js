import { useAuthStore } from '../stores/auth'

/**
 * ------------------------------------------------------------------
 * 🛡️ Directive : v-permission
 * 🎯 Rôle : Contrôle l’affichage d’un élément selon les permissions
 * ------------------------------------------------------------------
 * ✅ Usage :
 *    v-permission="'user:add'"                  → Vérifie une permission unique
 *    v-permission="['user:add', 'user:edit']"   → Vérifie plusieurs permissions
 * ------------------------------------------------------------------
 * 权限指令
 * 功能：根据用户权限动态控制元素显示
 * 用法示例：
 *    v-permission="'user:add'"                  → 检查单个权限
 *    v-permission="['user:add', 'user:edit']"   → 检查多个权限（任意一个满足即可）
 * ------------------------------------------------------------------
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const permissions = authStore.permissions || []

    let hasPermission = false

    if (Array.isArray(value)) {
      // ✅ Si tableau → l’utilisateur doit posséder au moins une des permissions
      // 如果是数组 → 用户只需拥有其中任意一个权限
      hasPermission = value.some(permission => permissions.includes(permission))
    } else if (typeof value === 'string') {
      // ✅ Si chaîne simple → vérifie cette permission unique
      // 如果是字符串 → 检查单个权限
      hasPermission = permissions.includes(value)
    }

    if (!hasPermission) {
      // 🚫 Aucune permission → retire complètement l’élément du DOM
      // 没有权限 → 从 DOM 中移除元素
      el.parentNode && el.parentNode.removeChild(el)
    }
  },

  updated(el, binding) {
    // 🔁 Vérifie à nouveau si les permissions changent dynamiquement
    // 当权限动态更新时重新检查
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

    // ✅ Si pas de permission → masquer
    // 🚫 否则显示元素
    el.style.display = hasPermission ? '' : 'none'
  }
}

/**
 * ------------------------------------------------------------------
 * 👑 Directive : v-role
 * 🎯 Rôle : Contrôle l’affichage selon les rôles de l’utilisateur
 * ------------------------------------------------------------------
 * ✅ Usage :
 *    v-role="'admin'"             → Affiche uniquement pour les admins
 *    v-role="['admin', 'editor']" → Affiche pour les rôles spécifiés
 * ------------------------------------------------------------------
 * 角色权限指令
 * 功能：根据用户角色控制显示
 * 用法：
 *    v-role="'admin'"             → 仅管理员可见
 *    v-role="['admin', 'editor']" → 管理员或编辑可见
 * ------------------------------------------------------------------
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const roles = authStore.roles || []

    let hasRole = false

    if (Array.isArray(value)) {
      // ✅ Au moins un des rôles requis
      // 至少拥有一个角色
      hasRole = value.some(role => roles.includes(role))
    } else if (typeof value === 'string') {
      hasRole = roles.includes(value)
    }

    if (!hasRole) {
      // 🚫 Retirer si non autorisé
      // 没有角色权限 → 删除元素
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

    el.style.display = hasRole ? '' : 'none'
  }
}

/**
 * ------------------------------------------------------------------
 * 🧩 Export global (facilite l’enregistrement des directives)
 * ------------------------------------------------------------------
 * 全局导出，用于 Vue App 注册所有自定义指令
 * ------------------------------------------------------------------
 */
export default {
  permission,
  role
}
