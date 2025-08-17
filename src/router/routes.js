const routes = [
  // 登录页面
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },

  // 主布局
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      // 仪表盘
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      },

      // 系统管理
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'settings' },
        children: [
          // 用户管理
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('pages/system/UserPage.vue'),
            meta: { title: '用户管理', icon: 'people', permission: 'system:user:list' }
          },
          // 角色管理
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('pages/system/RolePage.vue'),
            meta: { title: '角色管理', icon: 'assignment_ind', permission: 'system:role:list' }
          },
          // 菜单管理
          {
            path: 'menu',
            name: 'SystemMenu',
            component: () => import('pages/system/MenuPage.vue'),
            meta: { title: '菜单管理', icon: 'menu', permission: 'system:menu:list' }
          },
          // 日志管理
          {
            path: 'log',
            name: 'SystemLog',
            component: () => import('pages/system/LogPage.vue'),
            meta: { title: '日志管理', icon: 'description', permission: 'system:log:list' }
          }
        ]
      },

      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { title: '个人中心', icon: 'account_circle' }
      }
    ]
  },

  // 404页面
  {
    path: '/404',
    component: () => import('pages/ErrorNotFound.vue')
  },

  // 总是将此项保持在最后!!!
  // 如果没有匹配到任何路由，则重定向到404页面
  {
    path: '/:catchAll(.*)*',
    redirect: '/404'
  }
]

export default routes
