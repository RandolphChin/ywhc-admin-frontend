import { api } from 'src/boot/axios'

// 统计API
export const statsApi = {
  // 获取仪表盘统计数据
  getDashboard: () => api.get('/system/stats/dashboard')
}
