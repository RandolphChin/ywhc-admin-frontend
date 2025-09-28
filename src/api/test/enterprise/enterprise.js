import { api } from "src/boot/axios";

/**
 * 测试企业API
 */
export const enterpriseApi = {
  /**
   * 分页查询测试企业列表
   */
  getList(params) {
    return api.get('/test/enterprise/page', { params })
  },

  /**
   * 查询所有测试企业列表
   */
  getAllList(params) {
    return api.get('/test/enterprise/list', { params })
  },

  /**
   * 根据ID查询测试企业详情
   */
  getById(id) {
    return api.get(`/test/enterprise/${id}`)
  },

  /**
   * 新增测试企业
   */
  create(data) {
    return api.post('/test/enterprise', data)
  },

  /**
   * 修改测试企业
   */
  update(data) {
    return api.put('/test/enterprise', data)
  },

  /**
   * 删除测试企业
   */
  delete(id) {
    return api.delete(`/test/enterprise/${id}`)
  },

  /**
   * 批量删除测试企业
   */
  batchDelete(ids) {
    return api.delete('/test/enterprise/batch', { data: ids })
  },

  /**
   * 导出测试企业
   */
  export(params) {
    return api.post('/test/enterprise/export', params, {
      responseType: 'blob'
    })
  }
}
