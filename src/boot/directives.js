import { boot } from 'quasar/wrappers'
import { permission, role } from '../directives/permission'
import { i18n } from 'boot/i18n' // ← accès à ta configuration i18n

export default boot(({ app }) => {
  const registered = app._context?.directives || {}
  const t = i18n.global?.t || ((x) => x)

  // 🌍 Fonction utilitaire pour les logs trilingues
  const log = {
    info: (msg) => console.info(`✅ ${msg}`),
    warn: (msg) => console.warn(`⚠️ ${msg}`)
  }

  // --- v-permission --------------------------------------------------
  app.directive('permission', permission)
  // if (!registered.permission) {
  //   app.directive('permission', permission)
  //   log.info(t('system.directiveRegistered', { name: 'permission' }))
  // } else {
  //   log.warn(t('system.directiveAlreadyRegistered', { name: 'permission' }))
  // }

  // --- v-role --------------------------------------------------------
  app.directive('role', role)
  // if (!registered.role) {
  //   app.directive('role', role)
  //   log.info(t('system.directiveRegistered', { name: 'role' }))
  // } else {
  //   log.warn(t('system.directiveAlreadyRegistered', { name: 'role' }))
  // }

})
