<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
    
    <!-- 主要内容 -->
    <div class="login-content">
      <!-- 登录卡片 -->
      <q-card class="login-card glass-effect">
        <q-card-section class="login-header">
          <div class="login-title">
            YWHC 后台管理系统
          </div>
          <div class="login-subtitle">欢迎回来，请登录您的账户</div>
        </q-card-section>

        <q-card-section class="login-form-section">
          <q-form @submit="handleLogin" class="q-gutter-md">
            <div class="input-group">
              <q-input
                v-model="loginForm.username"
                placeholder="用户名"
                dense
                :rules="[val => !!val || '请输入用户名']"
                outlined
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person" class="input-icon" />
                </template>
              </q-input>
            </div>

            <div class="input-group">
              <q-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                :rules="[val => !!val || '请输入密码']"
                outlined
                dense
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" class="input-icon" />
                </template>
              </q-input>
            </div>

            <div class="row items-center justify-between q-mt-md">
              <q-checkbox
                v-model="loginForm.rememberMe"
                label="记住我"
                color="primary"
                class="remember-me"
              />
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>

            <q-btn
              type="submit"
              class="login-btn full-width q-mt-sm"
              label="登录"
              :loading="loading"
              size="lg"
              no-caps
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const authStore = useAuthStore()

    const loading = ref(false)
    const loginForm = ref({
      username: 'admin',
      password: 'admin123',
      rememberMe: false
    })

    const handleLogin = async () => {
      loading.value = true
      
      try {
        await authStore.login(loginForm.value)
        
        $q.notify({
          type: 'positive',
          message: '登录成功',
          position: 'top-right'
        })
        
        // 跳转到首页
        router.push('/')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || '登录失败',
          position: 'top-right'
        })
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      loginForm,
      handleLogin
    }
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  overflow: hidden;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 100% 100%; }
  75% { background-position: 0% 100%; }
}

// 动态背景动画
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

// 主要内容区域
.login-content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

// Logo区域
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

// 登录卡片
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

// 登录头部
.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 30px 20px 25px;
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

// 表单区域
.login-form-section {
  padding: 40px 30px;
}

.input-group {
  margin-bottom: 20px;
}

// 现代化输入框
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

// 记住我和忘记密码
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

// 登录按钮
.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  padding: 16px 0;
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

// 响应式设计
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
