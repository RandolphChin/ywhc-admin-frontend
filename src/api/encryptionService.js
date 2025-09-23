import { api } from 'src/boot/axios'
import cryptoUtil from 'src/utils/crypto'
import { Notify } from 'quasar'

/**
 * 加密服务
 * 统一管理RSA公钥获取和数据加密
 */
class EncryptionService {
  constructor() {
    this.encryptionEnabled = true
    this.publicKeyLoaded = false
    this.loadingPromise = null
  }

  /**
   * 获取RSA公钥
   * @returns {Promise<boolean>} 是否成功加载公钥
   */
  async loadPublicKey() {
    if (!this.encryptionEnabled) {
      return false
    }

    // 如果正在加载，返回现有的Promise
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // 如果已经加载过，直接返回
    if (this.publicKeyLoaded && cryptoUtil.hasPublicKey()) {
      return true
    }

    this.loadingPromise = this._doLoadPublicKey()
    const result = await this.loadingPromise
    this.loadingPromise = null
    return result
  }

  /**
   * 实际执行公钥加载
   * @private
   */
  async _doLoadPublicKey() {
    try {
      console.log('🔑 正在获取RSA公钥...')
      // 直接使用 api 实例，避免循环依赖
      const response = await api.get('/crypto/public-key')
      
      if (response.data.data && response.data.data.publicKey) {
        const publicKeyPem = cryptoUtil.formatPublicKey(response.data.data.publicKey)
        cryptoUtil.setPublicKey(publicKeyPem)
        this.publicKeyLoaded = true
        console.log('✅ RSA公钥加载成功')
        return true
      } else {
        throw new Error('公钥数据格式错误')
      }
    } catch (error) {
      console.error('❌ 获取RSA公钥失败:', error)
      this.publicKeyLoaded = false
      this.encryptionEnabled = false
      
      Notify.create({
        type: 'warning',
        message: '获取加密公钥失败，将使用明文传输',
        position: 'top-right'
      })
      return false
    }
  }

  /**
   * 加密数据
   * @param {Object} data - 需要加密的数据对象
   * @param {Array<string>} encryptFields - 需要加密的字段名数组
   * @returns {Promise<Object>} 加密后的数据对象
   */
  async encryptData(data, encryptFields = ['password']) {
    // 确保公钥已加载
    const keyLoaded = await this.loadPublicKey()
    
    if (!keyLoaded || !this.encryptionEnabled) {
      // 如果加密不可用，返回原始数据，标记为未加密
      return { ...data, encrypted: false }
    }

    const encryptedData = { ...data }
    let hasEncryptedFields = false
    
    for (const field of encryptFields) {
      if (data[field]) {
        try {
          encryptedData[field] = cryptoUtil.encryptPassword(data[field])
          hasEncryptedFields = true
          console.log(`🔐 字段 ${field} 加密成功`)
        } catch (error) {
          console.error(`❌ 加密字段 ${field} 失败:`, error)
          // 加密失败时返回原始数据，标记为未加密
          return { ...data, encrypted: false }
        }
      }
    }

    // 添加加密标识
    encryptedData.encrypted = hasEncryptedFields
    
    if (hasEncryptedFields) {
      console.log('✅ 数据加密完成，encrypted: true')
    } else {
      console.log('ℹ️ 没有需要加密的字段，encrypted: false')
    }

    return encryptedData
  }

  /**
   * 重置加密状态
   */
  reset() {
    this.publicKeyLoaded = false
    this.encryptionEnabled = true
    this.loadingPromise = null
    cryptoUtil.clearPublicKey()
  }

  /**
   * 检查是否启用加密
   */
  isEncryptionEnabled() {
    return this.encryptionEnabled
  }

  /**
   * 检查公钥是否已加载
   */
  isPublicKeyLoaded() {
    return this.publicKeyLoaded
  }
}

// 创建单例实例
const encryptionService = new EncryptionService()

export default encryptionService