<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          YWHC 后台管理系统
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- 全屏切换 -->
          <q-btn
            flat
            dense
            round
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="$q.fullscreen.toggle()"
          />

          <!-- 用户菜单 -->
          <q-btn-dropdown
            flat
            dense
            no-caps
            :label="userInfo?.nickname || '用户'"
            icon="account_circle"
          >
            <q-list>
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>个人中心</q-item-section>
              </q-item>
              
              <q-item clickable v-close-popup @click="changePassword">
                <q-item-section avatar>
                  <q-icon name="lock" />
                </q-item-section>
                <q-item-section>修改密码</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>退出登录</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header>
          导航菜单
        </q-item-label>

        <!-- 动态菜单 -->
        <template v-for="menu in menuList" :key="menu.id">
          <q-expansion-item
            v-if="menu.children && menu.children.length > 0"
            :icon="menu.icon"
            :label="menu.title"
            :default-opened="isMenuActive(menu)"
          >
            <q-item
              v-for="child in menu.children"
              :key="child.id"
              clickable
              v-ripple
              :active="$route.path === child.path"
              @click="navigateTo(child.path)"
              class="q-ml-md"
            >
              <q-item-section avatar>
                <q-icon :name="child.icon" />
              </q-item-section>
              <q-item-section>
                {{ child.title }}
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item
            v-else
            clickable
            v-ripple
            :active="$route.path === menu.path"
            @click="navigateTo(menu.path)"
          >
            <q-item-section avatar>
              <q-icon :name="menu.icon" />
            </q-item-section>
            <q-item-section>
              {{ menu.title }}
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- 修改密码对话框 -->
    <q-dialog v-model="passwordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">修改密码</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitPasswordChange" class="q-gutter-md">
            <q-input
              v-model="passwordForm.oldPassword"
              type="password"
              label="原密码"
              :rules="[val => !!val || '请输入原密码']"
              outlined
              dense
            />
            
            <q-input
              v-model="passwordForm.newPassword"
              type="password"
              label="新密码"
              :rules="[
                val => !!val || '请输入新密码',
                val => val.length >= 6 || '密码长度至少6位'
              ]"
              outlined
              dense
            />
            
            <q-input
              v-model="passwordForm.confirmPassword"
              type="password"
              label="确认密码"
              :rules="[
                val => !!val || '请确认密码',
                val => val === passwordForm.newPassword || '两次密码输入不一致'
              ]"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="取消" @click="passwordDialog = false" />
              <q-btn type="submit" color="primary" label="确定" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const leftDrawerOpen = ref(false)
    const passwordDialog = ref(false)
    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 计算属性
    const userInfo = computed(() => authStore.userInfo)
    
    // 菜单列表 - 这里可以从后端动态获取
    const menuList = ref([
      {
        id: 1,
        title: '仪表盘',
        icon: 'dashboard',
        path: '/dashboard'
      },
      {
        id: 2,
        title: '系统管理',
        icon: 'settings',
        children: [
          {
            id: 21,
            title: '用户管理',
            icon: 'people',
            path: '/system/user'
          },
          {
            id: 22,
            title: '角色管理',
            icon: 'assignment_ind',
            path: '/system/role'
          },
          {
            id: 23,
            title: '菜单管理',
            icon: 'menu',
            path: '/system/menu'
          },
          {
            id: 24,
            title: '日志管理',
            icon: 'description',
            path: '/system/log'
          }
        ]
      }
    ])

    // 方法
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const goToProfile = () => {
      router.push('/profile')
    }

    const changePassword = () => {
      passwordDialog.value = true
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }

    const submitPasswordChange = async () => {
      try {
        await authStore.changePassword({
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword
        })
        
        $q.notify({
          type: 'positive',
          message: '密码修改成功'
        })
        
        passwordDialog.value = false
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || '密码修改失败'
        })
      }
    }

    const logout = async () => {
      $q.dialog({
        title: '确认',
        message: '确定要退出登录吗？',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await authStore.logout()
          router.push('/login')
        } catch (error) {
          console.error('退出登录失败:', error)
          router.push('/login')
        }
      })
    }

    const isMenuActive = (menu) => {
      if (menu.children) {
        return menu.children.some(child => route.path.startsWith(child.path))
      }
      return route.path === menu.path
    }

    onMounted(() => {
      // 组件挂载后的逻辑
    })

    return {
      leftDrawerOpen,
      passwordDialog,
      passwordForm,
      userInfo,
      menuList,
      toggleLeftDrawer,
      navigateTo,
      goToProfile,
      changePassword,
      submitPasswordChange,
      logout,
      isMenuActive
    }
  }
})
</script>

<style lang="sass" scoped>
.q-toolbar__title
  font-size: 1.2rem
  font-weight: 500
</style>
