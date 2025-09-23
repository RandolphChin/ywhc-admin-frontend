import { api } from 'src/boot/axios'

// 用户管理API
export const userApi = {
  // 获取用户列表
  getList: (params) => api.get('/system/user/page', { params }),
  
  // 获取用户详情
  getDetail: (id) => api.get(`/system/user/${id}`),
  
  // 创建用户
  create: (data) => api.post('/system/user', data),
  
  // 更新用户
  update: (data) => api.put('/system/user', data),
  
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
