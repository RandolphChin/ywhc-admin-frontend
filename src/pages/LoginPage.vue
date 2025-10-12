<template>
  <div class="login-container">
    <div class="background-animation">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="login-content">
      <q-card class="login-card glass-effect">
        <q-card-section class="login-header">
          <div class="login-title">YWHC Admin System</div>
          <div class="login-subtitle">{{ t('auth.subtitle') }}</div>
        </q-card-section>

        <q-card-section class="login-form-section">
          <q-form @submit="handleLogin" class="q-gutter-md">
            <div class="input-group">
              <q-input
                v-model="loginForm.username"
                :placeholder="t('auth.username')"
                :rules="[val => !!val || t('auth.username') + ' ' + t('error.required_field')]"
                outlined
                class="modern-input"
              >
                <template #prepend>
                  <q-icon name="person" class="input-icon" />
                </template>
              </q-input>
            </div>

            <div class="input-group">
              <q-input
                v-model="loginForm.password"
                type="password"
                :placeholder="t('auth.password')"
                :rules="[val => !!val || t('auth.password') + ' ' + t('error.required_field')]"
                outlined
                class="modern-input"
              >
                <template #prepend>
                  <q-icon name="lock" class="input-icon" />
                </template>
              </q-input>
            </div>

            <div class="input-group captcha-group">
              <q-btn
                v-if="!captchaVerified"
                @click="showCaptchaDialog = true"
                class="captcha-btn full-width"
                color="primary"
                :label="t('auth.verifying')"
                icon="security"
                size="md"
                no-caps
              />
              <div v-else class="captcha-success">
                <q-icon name="check_circle" color="positive" size="sm" />
                <span>{{ t('auth.verified') }}</span>
              </div>
            </div>

            <div class="input-group">
              <q-btn
                type="submit"
                class="login-btn full-width"
                :label="t('auth.login')"
                :loading="loading"
                size="lg"
                no-caps
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showCaptchaDialog" persistent>
      <q-card class="captcha-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ t('auth.captcha_title') }}</div>
          <q-btn flat round dense icon="close" @click="closeCaptchaDialog" />
        </q-card-section>
        <q-card-section class="dialog-content">
          <SlideCaptcha @success="onCaptchaSuccess" @error="onCaptchaError" @refresh="onCaptchaRefresh" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import { initDynamicRoutes } from 'src/router/dynamicRoutes'
import SlideCaptcha from 'src/components/SlideCaptcha.vue'
import { useEncryption } from 'src/api/useEncryption'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const captchaVerified = ref(false)
const captchaToken = ref('')
const showCaptchaDialog = ref(false)

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
})

const { encryptionEnabled, publicKeyLoaded } = useEncryption()

const handleLogin = async () => {
  if (!captchaVerified.value) {
    $q.notify({ type: 'warning', message: t('auth.verify_first'), position: 'top-right' })
    return
  }

  loading.value = true
  try {
    const loginData = { ...loginForm.value, captchaToken: captchaToken.value }
    await authStore.login(loginData)
    $q.notify({ type: 'positive', message: t('auth.success'), position: 'top-right' })

    const redirectUrl = authStore.getAndClearRedirectUrl()
    if (redirectUrl) {
      const routeSuccess = await initDynamicRoutes(router, false)
      if (routeSuccess) router.push(redirectUrl)
      else router.push('/')
    } else router.push('/')
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('auth.failed'),
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

const onCaptchaSuccess = (data: any) => {
  captchaVerified.value = true
  captchaToken.value = data.token
  setTimeout(() => {
    showCaptchaDialog.value = false
    $q.notify({ type: 'positive', message: t('auth.verified'), position: 'top-right' })
  }, 1000)
}

const onCaptchaError = () => {
  captchaVerified.value = false
  captchaToken.value = ''
}

const onCaptchaRefresh = () => {
  captchaVerified.value = false
  captchaToken.value = ''
}

const closeCaptchaDialog = () => {
  showCaptchaDialog.value = false
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 🔁 Animation d’arrière-plan dynamique */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 20s infinite linear;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 70%;
  right: 10%;
  animation-delay: -5s;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 20%;
  animation-delay: -10s;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
}

.shape-4 {
  width: 120px;
  height: 120px;
  bottom: 20%;
  left: 20%;
  animation-delay: -15s;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(30px) rotate(240deg);
  }
}

/* 📦 Zone principale de contenu */
.login-content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

/* 🔖 Zone du logo */
.logo-section {
  margin-bottom: 40px;
  color: white;
}

.logo-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.9;

  .q-icon {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
}

.system-title {
  font-size: 2.2rem;
  font-weight: 300;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.system-subtitle {
  font-size: 1rem;
  opacity: 0.8;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* 🪪 Carte de connexion */
.login-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* 🧢 En-tête de connexion */
.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  // padding: 30px 20px 25px;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 300;
}

/* 📝 Zone du formulaire */
.login-form-section {
  // padding: 40px 30px;
}

.input-group {
  margin-bottom: 20px;
}

.captcha-group {
  margin-bottom: 24px;

  :deep(.slide-captcha-container) {
    max-width: 100%;
  }
}

/* ✨ Champs de saisie modernes */
.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: rgba(247, 250, 252, 0.8);
    border: 1px solid rgba(226, 232, 240, 0.8);
    transition: all 0.3s ease;

    &:hover {
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.9);
    }
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  :deep(.q-field__label) {
    color: #64748b;
    font-weight: 500;
  }

  :deep(.q-field--focused .q-field__label) {
    color: #667eea;
  }
}

.input-icon {
  color: #94a3b8;
  transition: color 0.3s ease;
}

.modern-input:focus-within .input-icon {
  color: #667eea;
}

/* ✅ « Se souvenir de moi » & « Mot de passe oublié » */
.remember-me {
  :deep(.q-checkbox__label) {
    color: #64748b;
    font-size: 0.9rem;
  }
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
}

/* 🔘 Bouton de connexion */
.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  padding: 7px 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  :deep(.q-btn__content) {
    color: white;
  }
}

/* 🔐 Indicateur d’état de chiffrement */
.encryption-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(247, 250, 252, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.8);

  .status-text {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
  }
}

/* 🧩 Bouton de vérification (CAPTCHA) */
.captcha-btn {
  border-radius: 12px;
  font-weight: 500;
  padding: 12px 0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.captcha-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(40, 167, 69, 0.1);
  border: 2px solid rgba(40, 167, 69, 0.3);
  border-radius: 12px;
  color: #28a745;
  font-weight: 500;
}

/* 🪟 Fenêtre modale du CAPTCHA */
.captcha-dialog {
  min-width: 350px;
  max-width: 400px;
  width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.dialog-content {
  padding: 20px;
}

/* 📱 Design responsive */
@media (max-width: 600px) {
  .login-content {
    padding: 15px;
    max-width: 100%;
  }

  .logo-icon {
    font-size: 60px;
  }

  .system-title {
    font-size: 1.8rem;
  }

  .login-form-section {
    padding: 30px 20px;
  }
}
</style>
