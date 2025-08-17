import { api } from 'src/boot/axios'

// 认证相关API
export const authApi = {
  // 登录
  login: (data) => api.post('/auth/login', data),
  
  // 登出
  logout: () => api.post('/auth/logout'),
  
  // 获取用户信息
  getUserInfo: () => api.get('/auth/user-info'),
  
  // 刷新Token
  refreshToken: (data) => api.post('/auth/refresh', data),
  
  // 修改密码
  changePassword: (data) => api.put('/auth/change-password', data),
  
  // 更新个人信息
  updateProfile: (data) => api.put('/auth/profile', data)
}

// 用户管理API
export const userApi = {
  // 获取用户列表
  getList: (params) => api.get('/system/user/list', { params }),
  
  // 获取用户详情
  getDetail: (id) => api.get(`/system/user/${id}`),
  
  // 创建用户
  create: (data) => api.post('/system/user', data),
  
  // 更新用户
  update: (id, data) => api.put(`/system/user/${id}`, data),
  
  // 删除用户
  delete: (id) => api.delete(`/system/user/${id}`),
  
  // 重置密码
  resetPassword: (id) => api.put(`/system/user/${id}/reset-password`),
  
  // 更新用户状态
  updateStatus: (id, status) => api.put(`/system/user/${id}/status`, { status }),
  
  // 分配角色
  assignRoles: (id, roleIds) => api.put(`/system/user/${id}/roles`, { roleIds }),
  
  // 检查用户名是否存在
  checkUsername: (username) => api.get('/system/user/check-username', { params: { username } }),
  
  // 检查邮箱是否存在
  checkEmail: (email) => api.get('/system/user/check-email', { params: { email } })
}

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

// 菜单管理API
export const menuApi = {
  // 获取菜单树
  getTree: () => api.get('/system/menu/tree'),
  
  // 获取用户菜单
  getUserMenus: () => api.get('/system/menu/user-menus'),
  
  // 获取用户路由
  getUserRouters: () => api.get('/system/menu/user-routers'),
  
  // 获取菜单详情
  getDetail: (id) => api.get(`/system/menu/${id}`),
  
  // 创建菜单
  create: (data) => api.post('/system/menu', data),
  
  // 更新菜单
  update: (id, data) => api.put(`/system/menu/${id}`, data),
  
  // 删除菜单
  delete: (id) => api.delete(`/system/menu/${id}`)
}

// 日志管理API
export const logApi = {
  // 获取日志列表
  getList: (params) => api.get('/system/log/list', { params }),
  
  // 清空日志
  clear: () => api.delete('/system/log/clear')
}

// 统计API
export const statsApi = {
  // 获取仪表盘统计数据
  getDashboard: () => api.get('/system/stats/dashboard')
}
