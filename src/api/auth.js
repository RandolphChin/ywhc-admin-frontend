import { api } from "src/boot/axios";

// 认证相关API
export const authApi = {
  // 登录
  login: (data) => api.post("/auth/login", data),

  // 登出
  logout: () => api.post("/auth/logout"),

  // 获取用户信息
  getUserInfo: () => api.get("/auth/user-info"),

  // 刷新Token
  refreshToken: (data) => api.post("/auth/refresh", data),

  // 修改密码
  changePassword: (data) => api.put("/auth/change-password", data),

  // 更新个人信息
  updateProfile: (data) => api.put("/auth/profile", data),

  // 获取RSA公钥
  getPublicKey: () => api.get("/crypto/public-key"),
};
