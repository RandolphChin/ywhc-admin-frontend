import { api } from "src/boot/axios";

/**
 * 部门管理API
 */
export default {
  // 获取部门树形列表
  getDeptTree(params) {
    return api.get("/system/dept/tree", { params });
  },

  // 获取部门下拉树选择项
  getDeptTreeSelect() {
    return api.get("/system/dept/tree-select");
  },

  // 根据ID获取部门详情
  getDeptById(deptId) {
    return api.get(`/system/dept/${deptId}`);
  },

  // 新增部门
  saveDept(data) {
    return api.post("/system/dept", data);
  },

  // 修改部门
  updateDept(data) {
    return api.put("/system/dept", data);
  },

  // 删除部门
  deleteDept(deptId) {
    return api.delete(`/system/dept/${deptId}`);
  },

  // 批量删除部门
  deleteDeptByIds(deptIds) {
    return api.delete("/system/dept/batch", { data: deptIds });
  },

  // 校验部门名称是否唯一
  checkDeptNameUnique(data) {
    return api.post("/system/dept/check-name", data);
  },

  // 校验部门编码是否唯一
  checkDeptCodeUnique(data) {
    return api.post("/system/dept/check-code", data);
  },
};
