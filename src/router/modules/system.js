export default [
  {
    path: '/system',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dept',
        name: 'SystemDept',
        component: () => import('pages/system/dept/DeptPage.vue'),
        meta: {
          title: '部门管理',
          icon: 'account_tree',
          permission: 'system:dept:list'
        }
      }
    ]
  }
]
