import { api } from "src/boot/axios";

// 菜单管理API
export const menuApi = {
  // 获取菜单树
  getTree: () => api.get("/system/menu/tree"),

  // 获取用户菜单
  getUserMenus: () => api.get("/system/menu/user-tree"),

  // 获取用户路由
  getUserRouters: () => api.get("/system/menu/routers"),

  // 获取组件映射配置
  getComponentMapping: () => api.get("/system/menu/component-mapping"),

  // 获取菜单详情
  getDetail: (id) => api.get(`/system/menu/${id}`),

  // 创建菜单
  create: (data) => api.post("/system/menu", data),

  // 更新菜单
  update: (data) => api.put('/system/menu', data),

  // 删除菜单
  delete: (id) => api.delete(`/system/menu/${id}`),
};
