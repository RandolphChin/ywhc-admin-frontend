import JSEncrypt from 'jsencrypt'

/**
 * RSA加密工具类
 * 用于登录密码加密传输
 */
class CryptoUtil {
  constructor() {
    this.jsencrypt = new JSEncrypt()
    this.publicKey = null
  }

  /**
   * 设置RSA公钥
   * @param {string} publicKey - RSA公钥（PEM格式）
   */
  setPublicKey(publicKey) {
    this.publicKey = publicKey
    this.jsencrypt.setPublicKey(publicKey)
  }

  /**
   * 加密密码
   * @param {string} password - 原始密码
   * @returns {string} 加密后的密码（Base64编码）
   */
  encryptPassword(password) {
    if (!this.publicKey) {
      throw new Error('RSA公钥未设置')
    }

    // 添加时间戳防重放攻击
    const timestamp = Date.now()
    const dataToEncrypt = `${password}|${timestamp}`

    // 使用RSA公钥加密
    const encrypted = this.jsencrypt.encrypt(dataToEncrypt)
    if (!encrypted) {
      throw new Error('密码加密失败')
    }

    return encrypted
  }

  /**
   * 检查是否已设置公钥
   * @returns {boolean}
   */
  hasPublicKey() {
    return !!this.publicKey
  }

  /**
   * 清除公钥
   */
  clearPublicKey() {
    this.publicKey = null
    this.jsencrypt = new JSEncrypt()
  }

  /**
   * 格式化公钥为PEM格式
   * @param {string} publicKeyBase64 - Base64编码的公钥
   * @returns {string} PEM格式的公钥
   */
  formatPublicKey(publicKeyBase64) {
    return `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`
  }
}

// 创建单例实例
const cryptoUtil = new CryptoUtil()

export default cryptoUtil