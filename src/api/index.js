// 导出所有API模块
export { authApi } from "./auth";
export { statsApi } from "./stats";

// 系统管理模块
export { userApi } from "./system/user/user";
export { roleApi } from "./system/role/role";
export { menuApi } from "./system/menu/menu";
export { logApi } from "./system/log/log";
export { dictApi } from "./dict";
export { deptApi } from "./system/dept/dept";

// 监控管理模块
export { onlineUserApi } from "./monitor/online/online";

// 代码生成模块
export { generatorApi } from "./system/generator/generator";
