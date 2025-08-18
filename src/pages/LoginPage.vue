<template>
  <div class="fullscreen bg-blue-1 text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        <q-icon name="admin_panel_settings" />
      </div>

      <div class="text-h2" style="opacity:.4">
        YWHC 后台管理系统
      </div>

      <q-card class="q-mt-xl" style="width: 400px">
        <q-card-section class="bg-primary text-white text-center">
          <div class="text-h6">用户登录</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleLogin" class="q-gutter-md">
            <q-input
              v-model="loginForm.username"
              label="用户名"
              :rules="[val => !!val || '请输入用户名']"
              outlined
              dense
              prefix-icon="person"
            />

            <q-input
              v-model="loginForm.password"
              type="password"
              label="密码"
              :rules="[val => !!val || '请输入密码']"
              outlined
              dense
              prefix-icon="lock"
            />

            <div class="row items-center">
              <q-checkbox
                v-model="loginForm.rememberMe"
                label="记住我"
                color="primary"
              />
            </div>

            <q-btn
              type="submit"
              color="primary"
              class="full-width"
              label="登录"
              :loading="loading"
              size="md"
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

<style lang="sass" scoped>
.fullscreen
  min-height: 100vh
</style>
