/**
 * 通用工具函数
 */

// 格式化时间
export const formatTime = (time, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return ''
  
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 防抖函数
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 生成UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 树形数据处理
export const listToTree = (list, parentId = null, idKey = 'id', parentKey = 'parentId', childrenKey = 'children') => {
  const tree = []
  
  list.forEach(item => {
    if (item[parentKey] === parentId) {
      const children = listToTree(list, item[idKey], idKey, parentKey, childrenKey)
      if (children.length > 0) {
        item[childrenKey] = children
      }
      tree.push(item)
    }
  })
  
  return tree
}

// 树形数据扁平化
export const treeToList = (tree, childrenKey = 'children') => {
  const list = []
  
  const traverse = (nodes) => {
    nodes.forEach(node => {
      const { [childrenKey]: children, ...rest } = node
      list.push(rest)
      if (children && children.length > 0) {
        traverse(children)
      }
    })
  }
  
  traverse(tree)
  return list
}

// 获取树形数据中的所有叶子节点
export const getTreeLeaves = (tree, childrenKey = 'children', idKey = 'id') => {
  const leaves = []
  
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (!node[childrenKey] || node[childrenKey].length === 0) {
        leaves.push(node[idKey])
      } else {
        traverse(node[childrenKey])
      }
    })
  }
  
  traverse(tree)
  return leaves
}

// 验证邮箱格式
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// 验证手机号格式
export const validatePhone = (phone) => {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

// 验证身份证号格式
export const validateIdCard = (idCard) => {
  const re = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return re.test(idCard)
}

// 获取文件扩展名
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// 下载文件
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 复制到剪贴板
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // 降级处理
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch (err) {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

// 获取浏览器信息
export const getBrowserInfo = () => {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  
  if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome'
  } else if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox'
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari'
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge'
  } else if (ua.indexOf('Opera') > -1) {
    browser = 'Opera'
  }
  
  return {
    browser,
    userAgent: ua,
    platform: navigator.platform,
    language: navigator.language
  }
}

// URL参数序列化相关工具函数

/**
 * 检查参数名是否需要特殊的数组序列化处理
 * @param {string} paramName - 参数名
 * @returns {boolean} - 是否需要特殊处理
 */
export const shouldSerializeArrayParam = (paramName) => {
  const patterns = [
    /TimeBetween$/i,     // createTimeBetween, updateTimeBetween
    /Range$/i,           // dateRange, timeRange
    /Between$/i,         // valueBetween, priceBetween
    /TimeRange$/i        // createTimeRange, modifyTimeRange
  ]
  
  return patterns.some(pattern => pattern.test(paramName))
}

/**
 * 自定义数组参数序列化函数
 * @param {Object} params - 参数对象
 * @returns {string} - 序列化后的查询字符串
 */
export const serializeParams = (params) => {
  const searchParams = new URLSearchParams()
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue // 跳过空值
    }
    
    if (Array.isArray(value)) {
      if (shouldSerializeArrayParam(key)) {
        // 对匹配模式的参数使用重复参数名（无括号）
        value.forEach(item => {
          if (item !== undefined && item !== null && item !== '') {
            searchParams.append(key, item)
          }
        })
      } else {
        // 对其他数组参数使用默认行为（带括号）
        value.forEach(item => {
          if (item !== undefined && item !== null && item !== '') {
            searchParams.append(`${key}[]`, item)
          }
        })
      }
    } else {
      searchParams.append(key, value)
    }
  }
  
  return searchParams.toString()
}

// 格式化JSON字符串
export const formatJson = (jsonStr) => {
  if (!jsonStr) return ''
  try {
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return jsonStr
  }
}
