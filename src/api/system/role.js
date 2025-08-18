import { api } from 'src/boot/axios'

// 角色管理API
export const roleApi = {
  // 获取角色列表
  getList: (params) => api.get('/system/role/list', { params }),
  
  // 获取所有角色
  getAll: () => api.get('/system/role/all'),
  
  // 获取角色详情
  getDetail: (id) => api.get(`/system/role/${id}`),
  
  // 创建角色
  create: (data) => api.post('/system/role', data),
  
  // 更新角色
  update: (id, data) => api.put(`/system/role/${id}`, data),
  
  // 删除角色
  delete: (id) => api.delete(`/system/role/${id}`),
  
  // 获取角色菜单权限
  getMenus: (id) => api.get(`/system/role/${id}/menus`),
  
  // 分配菜单权限
  assignMenus: (id, menuIds) => api.put(`/system/role/${id}/menus`, { menuIds }),
  
  // 检查角色编码是否存在
  checkCode: (code) => api.get('/system/role/check-code', { params: { code } })
}
