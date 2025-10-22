import { useAuthStore } from '../stores/auth'

/**
 * ===============================================================
 * 🛡️ Directive : v-permission
 * ---------------------------------------------------------------
 * 🇫🇷 Rôle :
 *   Contrôle l’affichage d’un élément en fonction des permissions
 *   de l’utilisateur actuellement connecté.
 *
 * 🇬🇧 Role:
 *   Controls the visibility of an element based on the user's
 *   permissions in the current session.
 *
 * 🇨🇳 权限指令：
 *   根据当前用户的权限动态控制元素显示。
 * ---------------------------------------------------------------
 * ✅ Exemples / Examples / 示例：
 *   🇫🇷  v-permission="'user:add'"                → Vérifie une permission unique
 *   🇬🇧  v-permission="'user:add'"                → Checks a single permission
 *   🇨🇳  v-permission="'user:add'"                → 检查单个权限
 *
 *   🇫🇷  v-permission="['user:add', 'user:edit']" → Vérifie plusieurs permissions
 *   🇬🇧  v-permission="['user:add', 'user:edit']" → Checks multiple permissions (any match)
 *   🇨🇳  v-permission="['user:add', 'user:edit']" → 检查多个权限（任意一个满足即可）
 * ===============================================================
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const permissions = authStore.permissions || []

    let hasPermission = false

    if (Array.isArray(value)) {
      // 🇫🇷 Si tableau → l’utilisateur doit posséder au moins une des permissions
      // 🇬🇧 If array → user must have at least one of the listed permissions
      // 🇨🇳 如果是数组 → 用户只需拥有其中任意一个权限
      hasPermission = value.some(permission => permissions.includes(permission))
    } else if (typeof value === 'string') {
      // 🇫🇷 Si chaîne simple → vérifie cette permission unique
      // 🇬🇧 If string → check single permission
      // 🇨🇳 如果是字符串 → 检查单个权限
      hasPermission = permissions.includes(value)
    }

    if (!hasPermission) {
      // 🇫🇷 Pas de permission → retire complètement l’élément du DOM
      // 🇬🇧 No permission → remove the element from the DOM
      // 🇨🇳 没有权限 → 从 DOM 中移除元素
      el.parentNode && el.parentNode.removeChild(el)
    }
  },

  updated(el, binding) {
    // 🇫🇷 Vérifie à nouveau si les permissions changent dynamiquement
    // 🇬🇧 Re-checks when permissions are dynamically updated
    // 🇨🇳 当权限动态更新时重新检查
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

    // 🇫🇷 Si pas de permission → masquer l’élément
    // 🇬🇧 Hide element if user lacks permission
    // 🇨🇳 没有权限 → 隐藏元素
    el.style.display = hasPermission ? '' : 'none'
  }
}

/**
 * ===============================================================
 * 👑 Directive : v-role
 * ---------------------------------------------------------------
 * 🇫🇷 Rôle :
 *   Contrôle l’affichage d’un élément en fonction des rôles
 *   attribués à l’utilisateur.
 *
 * 🇬🇧 Role:
 *   Controls element visibility based on user roles.
 *
 * 🇨🇳 角色指令：
 *   根据用户角色控制元素显示。
 * ---------------------------------------------------------------
 * ✅ Exemples / Examples / 示例：
 *   🇫🇷  v-role="'admin'"             → Affiche uniquement pour les admins
 *   🇬🇧  v-role="'admin'"             → Visible only for admin users
 *   🇨🇳  v-role="'admin'"             → 仅管理员可见
 *
 *   🇫🇷  v-role="['admin', 'editor']" → Affiche pour les rôles spécifiés
 *   🇬🇧  v-role="['admin', 'editor']" → Visible for admin or editor roles
 *   🇨🇳  v-role="['admin', 'editor']" → 管理员或编辑可见
 * ===============================================================
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return

    const authStore = useAuthStore()
    const roles = authStore.roles || []

    let hasRole = false

    if (Array.isArray(value)) {
      // 🇫🇷 Doit posséder au moins un des rôles requis
      // 🇬🇧 Must have at least one of the required roles
      // 🇨🇳 至少拥有一个角色
      hasRole = value.some(role => roles.includes(role))
    } else if (typeof value === 'string') {
      hasRole = roles.includes(value)
    }

    if (!hasRole) {
      // 🇫🇷 Retire complètement l’élément du DOM si non autorisé
      // 🇬🇧 Remove the element if user lacks the required role
      // 🇨🇳 没有角色权限 → 删除元素
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

    // 🇫🇷 Affiche ou masque selon le rôle
    // 🇬🇧 Show or hide depending on role match
    // 🇨🇳 根据角色显示或隐藏元素
    el.style.display = hasRole ? '' : 'none'
  }
}

/**
 * ===============================================================
 * 🧩 Export global (facilite l’enregistrement des directives)
 * ---------------------------------------------------------------
 * 🇫🇷 Permet d’importer facilement toutes les directives dans un boot file.
 * 🇬🇧 Simplifies global registration of all directives in the app.
 * 🇨🇳 全局导出，用于 Vue 应用注册所有自定义指令。
 * ===============================================================
 */
export default {
  permission,
  role
}
