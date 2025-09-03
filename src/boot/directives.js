import { boot } from 'quasar/wrappers'
import { permission, role } from '../directives/permission'

export default boot(({ app }) => {
  // 注册全局权限指令
  app.directive('permission', permission)
  app.directive('role', role)
})
