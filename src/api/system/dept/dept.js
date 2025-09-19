import { api } from "src/boot/axios";

// 部门管理API
export const deptApi = {
  // 获取部门树形列表
  getDeptTree: (params) => api.get("/system/dept/tree", { params }),

  // 获取部门下拉树选择项
  getDeptTreeSelect: () => api.get("/system/dept/tree-select"),

  // 根据ID获取部门详情
  getDeptById: (deptId) => api.get(`/system/dept/${deptId}`),

  // 新增部门
  saveDept: (data) => api.post("/system/dept", data),

  // 修改部门
  updateDept: (data) => api.put("/system/dept", data),

  // 删除部门
  deleteDept: (deptId) => api.delete(`/system/dept/${deptId}`),

  // 批量删除部门
  deleteDeptByIds: (deptIds) => api.delete("/system/dept/batch", { data: deptIds }),

  // 校验部门名称是否唯一
  checkDeptNameUnique: (data) => api.post("/system/dept/check-name", data),

  // 校验部门编码是否唯一
  checkDeptCodeUnique: (data) => api.post("/system/dept/check-code", data),
};
