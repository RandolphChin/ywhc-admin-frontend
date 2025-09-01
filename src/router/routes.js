const routes = [
  // 登录页面
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },

  // 主布局
  {
    path: "/",
    name: "MainLayout",
    component: () => import("layouts/MainLayout.vue"),
    redirect: "/dashboard",
    children: [
      // 仪表盘
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("pages/DashboardPage.vue"),
        meta: { title: "仪表盘", icon: "dashboard" },
      },

      // 个人中心
      {
        path: "profile",
        name: "Profile",
        component: () => import("pages/ProfilePage.vue"),
        meta: { title: "个人中心", icon: "account_circle" },
      },
    ],
  },

  // 404页面
  {
    path: "/404",
    component: () => import("pages/ErrorNotFound.vue"),
  },

  // 总是将此项保持在最后!!!
  // 如果没有匹配到任何路由，则重定向到404页面
  {
    path: "/:catchAll(.*)*",
    redirect: "/404",
  },
];

export default routes;
