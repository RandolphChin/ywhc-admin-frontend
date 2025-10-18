import { api } from 'src/boot/axios'
import cryptoUtil from 'src/utils/crypto'
import { Notify } from 'quasar'
import { i18n } from 'boot/i18n'

const t = i18n.global.t // ✅ raccourci pour alléger le code

/**
 * ---------------------------------------------------------------
 * 🔐 Service de chiffrement RSA / Encryption Service
 * ---------------------------------------------------------------
 * 🇨🇳 加密服务
 * 🇫🇷 Gestion unifiée de la récupération et du chiffrement RSA
 * 🇬🇧 Unified management of RSA public key retrieval and encryption
 * ---------------------------------------------------------------
 */
class EncryptionService {
  constructor() {
    this.encryptionEnabled = true
    this.publicKeyLoaded = false
    this.loadingPromise = null
  }

  async loadPublicKey() {
    if (!this.encryptionEnabled) return false
    if (this.loadingPromise) return this.loadingPromise
    if (this.publicKeyLoaded && cryptoUtil.hasPublicKey()) return true

    this.loadingPromise = this._doLoadPublicKey()
    const result = await this.loadingPromise
    this.loadingPromise = null
    return result
  }

  async _doLoadPublicKey() {
    try {
      console.log('🔑', t('encryptionService.fetchingPublicKey'))

      const response = await api.get('/crypto/public-key')
      if (response.data.data && response.data.data.publicKey) {
        const publicKeyPem = cryptoUtil.formatPublicKey(response.data.data.publicKey)
        cryptoUtil.setPublicKey(publicKeyPem)
        this.publicKeyLoaded = true
        console.log('✅', t('encryptionService.publicKeyLoaded'))
        return true
      } else {
        throw new Error(t('encryptionService.publicKeyFormatError'))
      }
    } catch (error) {
      console.error('❌', t('encryptionService.publicKeyFailed'), error)
      this.publicKeyLoaded = false
      this.encryptionEnabled = false

      Notify.create({
        type: 'warning',
        message: t('encryptionService.publicKeyWarning'),
        position: 'top-right'
      })
      return false
    }
  }

  async encryptData(data, encryptFields = ['password']) {
    const keyLoaded = await this.loadPublicKey()
    if (!keyLoaded || !this.encryptionEnabled) return { ...data, encrypted: false }

    const encryptedData = { ...data }
    let hasEncryptedFields = false

    for (const field of encryptFields) {
      if (data[field]) {
        try {
          encryptedData[field] = cryptoUtil.encryptPassword(data[field])
          hasEncryptedFields = true
          console.log(`🔐 ${field} →`, t('encryptionService.fieldEncryptSuccess'))
        } catch (error) {
          console.error(`❌ ${field} →`, t('encryptionService.fieldEncryptFailed'), error)
          return { ...data, encrypted: false }
        }
      }
    }

    encryptedData.encrypted = hasEncryptedFields
    console.log(
      hasEncryptedFields
        ? '✅ ' + t('encryptionService.dataEncryptSuccess')
        : 'ℹ️ ' + t('encryptionService.noFieldsToEncrypt')
    )
    return encryptedData
  }

  reset() {
    this.publicKeyLoaded = false
    this.encryptionEnabled = true
    this.loadingPromise = null
    cryptoUtil.clearPublicKey()
  }

  isEncryptionEnabled() {
    return this.encryptionEnabled
  }

  isPublicKeyLoaded() {
    return this.publicKeyLoaded
  }
}

const encryptionService = new EncryptionService()
export default encryptionService
