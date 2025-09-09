import { api } from 'boot/axios'

export const dictApi = {
  // 字典类型相关接口
  getDictTypeList: (params) => api.get('/system/dict/type/page', { params }),
  getAllDictTypes: () => api.get('/system/dict/type/all'),
  getDictTypeById: (id) => api.get(`/system/dict/type/${id}`),
  createDictType: (data) => api.post('/system/dict/type', data),
  updateDictType: (data) => api.put('/system/dict/type', data),
  deleteDictType: (id) => api.delete(`/system/dict/type/${id}`),
  deleteDictTypes: (ids) => api.delete('/system/dict/type/batch', { data: ids }),
  checkDictType: (dictType) => api.get('/system/dict/type/check-dict-type', { params: { dictType } }),
  refreshDictCache: () => api.post('/system/dict/type/refresh-cache'),

  // 字典数据相关接口
  getDictDataList: (params) => api.get('/system/dict/data/page', { params }),
  getDictDataByType: (dictType) => api.get(`/system/dict/data/type/${dictType}`),
  getDictLabel: (dictType, dictValue) => api.get('/system/dict/data/label', { params: { dictType, dictValue } }),
  getDictDataById: (id) => api.get(`/system/dict/data/${id}`),
  createDictData: (data) => api.post('/system/dict/data', data),
  updateDictData: (data) => api.put('/system/dict/data', data),
  deleteDictData: (id) => api.delete(`/system/dict/data/${id}`),
  deleteDictDataBatch: (ids) => api.delete('/system/dict/data/batch', { data: ids }),
  checkDictValue: (dictType, dictValue) => api.get('/system/dict/data/check-dict-value', { params: { dictType, dictValue } })
}
