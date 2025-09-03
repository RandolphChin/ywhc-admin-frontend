import { api } from "src/boot/axios";

// 在线用户管理API
export const onlineUserApi = {
  // 获取在线用户列表
  getList: (params) => api.get("/monitor/online/list", { params }),

  // 获取在线用户总数
  getCount: () => api.get("/monitor/online/count"),

  // 强制用户下线
  forceLogout: (token) =>
    api.delete("/monitor/online/force-logout", {
      params: { token },
    }),

  // 强制用户所有会话下线
  forceLogoutByUserId: (userId) =>
    api.delete(`/monitor/online/force-logout-user/${userId}`),

  // 清理过期用户
  cleanExpired: () => api.delete("/monitor/online/clean-expired"),

  // 检查Token是否在黑名单
  checkBlacklist: (token) =>
    api.get("/monitor/online/check-blacklist", {
      params: { token },
    }),
};
