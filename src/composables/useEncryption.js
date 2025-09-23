import { ref, onMounted } from 'vue'
import encryptionService from 'src/api/encryptionService'

/**
 * 加密相关的 composable
 * 提供统一的加密状态管理和公钥加载逻辑
 */
export function useEncryption() {
  const encryptionEnabled = ref(encryptionService.isEncryptionEnabled())
  const publicKeyLoaded = ref(encryptionService.isPublicKeyLoaded())
  const loading = ref(false)

  /**
   * 加载RSA公钥
   */
  const loadPublicKey = async () => {
    if (!encryptionEnabled.value) {
      return
    }

    loading.value = true
    try {
      const success = await encryptionService.loadPublicKey()
      publicKeyLoaded.value = success
      encryptionEnabled.value = encryptionService.isEncryptionEnabled()
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置加密状态
   */
  const resetEncryption = () => {
    encryptionService.reset()
    encryptionEnabled.value = true
    publicKeyLoaded.value = false
  }

  // 组件挂载时自动加载公钥
  onMounted(() => {
    loadPublicKey()
  })

  return {
    encryptionEnabled,
    publicKeyLoaded,
    loading,
    loadPublicKey,
    resetEncryption
  }
}