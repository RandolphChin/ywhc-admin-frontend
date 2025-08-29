import { api } from 'src/boot/axios'

// 日志管理API
export const logApi = {
  // 获取日志列表
  getList: (params) => api.get('/system/log/page', { params }),
  
  // 清空日志
  clear: () => api.delete('/system/log/clear')
}
