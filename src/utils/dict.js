import { dictApi } from 'src/api'
import { ref, reactive, readonly } from 'vue'

// 字典缓存
const dictCache = reactive({})

// 字典加载状态
const dictLoadingStatus = reactive({})

/**
 * 字典数据管理工具
 */
export const useDictionary = () => {
  
  /**
   * 获取字典数据
   * @param {string} dictType 字典类型
   * @param {boolean} forceRefresh 是否强制刷新
   * @returns {Promise<Array>} 字典数据数组
   */
  const getDictData = async (dictType, forceRefresh = false) => {
    if (!dictType) {
      console.warn('字典类型不能为空')
      return []
    }

    // 如果缓存中存在且不强制刷新，直接返回缓存数据
    if (dictCache[dictType] && !forceRefresh) {
      return dictCache[dictType]
    }

    // 如果正在加载中，等待加载完成
    if (dictLoadingStatus[dictType]) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!dictLoadingStatus[dictType]) {
            resolve(dictCache[dictType] || [])
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
    }

    try {
      dictLoadingStatus[dictType] = true
      const response = await dictApi.getDictDataByType(dictType)
      const dictData = response.data.data || []
      
      // 缓存数据
      dictCache[dictType] = dictData
      
      return dictData
    } catch (error) {
      console.error(`获取字典数据失败 [${dictType}]:`, error)
      return []
    } finally {
      dictLoadingStatus[dictType] = false
    }
  }

  /**
   * 批量获取字典数据
   * @param {Array<string>} dictTypes 字典类型数组
   * @param {boolean} forceRefresh 是否强制刷新
   * @returns {Promise<Object>} 字典数据对象，key为字典类型，value为字典数据数组
   */
  const getBatchDictData = async (dictTypes, forceRefresh = false) => {
    if (!Array.isArray(dictTypes) || dictTypes.length === 0) {
      return {}
    }

    const promises = dictTypes.map(dictType => 
      getDictData(dictType, forceRefresh).then(data => ({ [dictType]: data }))
    )

    try {
      const results = await Promise.all(promises)
      return results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    } catch (error) {
      console.error('批量获取字典数据失败:', error)
      return {}
    }
  }

  /**
   * 根据字典类型和字典值获取字典标签
   * @param {string} dictType 字典类型
   * @param {string|number} dictValue 字典值
   * @returns {Promise<string>} 字典标签
   */
  const getDictLabel = async (dictType, dictValue) => {
    if (!dictType || (dictValue === null || dictValue === undefined || dictValue === '')) {
      return dictValue
    }

    try {
      const dictData = await getDictData(dictType)
      const item = dictData.find(item => item.dictValue == dictValue)
      return item ? item.dictLabel : dictValue
    } catch (error) {
      console.error(`获取字典标签失败 [${dictType}:${dictValue}]:`, error)
      return dictValue
    }
  }

  /**
   * 根据字典类型和字典标签获取字典值
   * @param {string} dictType 字典类型
   * @param {string} dictLabel 字典标签
   * @returns {Promise<string>} 字典值
   */
  const getDictValue = async (dictType, dictLabel) => {
    if (!dictType || !dictLabel) {
      return dictLabel
    }

    try {
      const dictData = await getDictData(dictType)
      const item = dictData.find(item => item.dictLabel === dictLabel)
      return item ? item.dictValue : dictLabel
    } catch (error) {
      console.error(`获取字典值失败 [${dictType}:${dictLabel}]:`, error)
      return dictLabel
    }
  }

  /**
   * 获取字典选项（用于下拉框等组件）
   * @param {string} dictType 字典类型
   * @param {Object} options 选项配置
   * @param {string} options.labelField 标签字段名，默认为 'label'
   * @param {string} options.valueField 值字段名，默认为 'value'
   * @param {boolean} options.includeAll 是否包含"全部"选项
   * @param {string} options.allLabel "全部"选项的标签
   * @param {string|number} options.allValue "全部"选项的值
   * @returns {Promise<Array>} 选项数组
   */
  const getDictOptions = async (dictType, options = {}) => {
    const {
      labelField = 'label',
      valueField = 'value',
      includeAll = false,
      allLabel = '全部',
      allValue = ''
    } = options

    try {
      const dictData = await getDictData(dictType)
      const optionsData = dictData.map(item => ({
        [labelField]: item.dictLabel,
        [valueField]: item.dictValue,
        ...item // 包含原始数据，方便扩展使用
      }))

      if (includeAll) {
        optionsData.unshift({
          [labelField]: allLabel,
          [valueField]: allValue
        })
      }

      return optionsData
    } catch (error) {
      console.error(`获取字典选项失败 [${dictType}]:`, error)
      return []
    }
  }

  /**
   * 清除字典缓存
   * @param {string} dictType 字典类型，不传则清除所有缓存
   */
  const clearDictCache = (dictType) => {
    if (dictType) {
      delete dictCache[dictType]
    } else {
      Object.keys(dictCache).forEach(key => {
        delete dictCache[key]
      })
    }
  }

  /**
   * 刷新字典缓存
   * @param {string} dictType 字典类型，不传则刷新所有已缓存的字典
   */
  const refreshDictCache = async (dictType) => {
    if (dictType) {
      await getDictData(dictType, true)
    } else {
      const dictTypes = Object.keys(dictCache)
      await Promise.all(dictTypes.map(type => getDictData(type, true)))
    }
  }

  return {
    getDictData,
    getBatchDictData,
    getDictLabel,
    getDictValue,
    getDictOptions,
    clearDictCache,
    refreshDictCache,
    dictCache: readonly(dictCache)
  }
}

/**
 * 字典标签转换过滤器
 * 用于在模板中直接转换字典值为标签
 */
export const dictLabelFilter = (dictType, dictValue) => {
  const { getDictLabel } = useDictionary()
  return getDictLabel(dictType, dictValue)
}

/**
 * 创建字典响应式数据
 * @param {string|Array<string>} dictTypes 字典类型或字典类型数组
 * @returns {Object} 响应式字典数据对象
 */
export const createDictData = (dictTypes) => {
  const { getDictData, getBatchDictData } = useDictionary()
  
  if (typeof dictTypes === 'string') {
    // 单个字典类型
    const dictData = ref([])
    getDictData(dictTypes).then(data => {
      dictData.value = data
    })
    return { [dictTypes]: dictData }
  } else if (Array.isArray(dictTypes)) {
    // 多个字典类型
    const dictDataMap = {}
    dictTypes.forEach(dictType => {
      dictDataMap[dictType] = ref([])
    })
    
    getBatchDictData(dictTypes).then(dataMap => {
      Object.keys(dataMap).forEach(dictType => {
        if (dictDataMap[dictType]) {
          dictDataMap[dictType].value = dataMap[dictType]
        }
      })
    })
    
    return dictDataMap
  }
  
  return {}
}

// 导出默认实例
export default useDictionary()
