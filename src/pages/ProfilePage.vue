<template>
  <q-page>
    <div class="row q-gutter-md">
      <!-- 个人信息卡片 -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="text-center">
            <q-avatar size="100px" class="q-mb-md">
              <img v-if="userInfo?.avatar" :src="userInfo.avatar" />
              <q-icon v-else name="person" size="60px" />
            </q-avatar>
            
            <div class="text-h6">{{ userInfo?.nickname }}</div>
            <div class="text-caption text-grey-6">{{ userInfo?.username }}</div>
            
            <q-separator class="q-my-md" />
            
            <div class="text-left">
              <q-list dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="email" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ userInfo?.email || '未设置' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="phone" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ userInfo?.mobile || '未设置' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="wc" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ getGenderText(userInfo?.gender) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="access_time" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ formatTime(userInfo?.createTime, 'YYYY-MM-DD HH:mm:ss') }}</q-item-label>
                    <q-item-label caption>注册时间</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 编辑信息表单 -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">编辑个人信息</div>
            
            <q-form @submit="updateProfile" class="q-gutter-md">
              <div class="row q-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profileForm.nickname"
                    label="昵称"
                    :rules="[val => !!val || '请输入昵称']"
                    outlined
                    dense
                  />
                </div>
                
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profileForm.email"
                    label="邮箱"
                    type="email"
                    outlined
                    dense
                  />
                </div>
              </div>

              <div class="row q-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profileForm.mobile"
                    label="手机号"
                    outlined
                    dense
                  />
                </div>
                
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="profileForm.gender"
                    :options="genderOptions"
                    label="性别"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <q-input
                v-model="profileForm.remark"
                label="个人简介"
                type="textarea"
                outlined
                dense
                rows="4"
              />

              <div class="row justify-end q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  label="保存修改"
                  :loading="updating"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- 修改密码卡片 -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">修改密码</div>
            
            <q-form @submit="changePassword" class="q-gutter-md">
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
                <q-btn
                  type="submit"
                  color="warning"
                  label="修改密码"
                  :loading="changingPassword"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { formatTime } from 'src/utils/index'

const $q = useQuasar()
const authStore = useAuthStore()

const updating = ref(false)
const changingPassword = ref(false)

const profileForm = ref({
  nickname: '',
  email: '',
  mobile: '',
  gender: 0,
  remark: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const userInfo = computed(() => authStore.userInfo)

const genderOptions = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

const getGenderText = (gender) => {
  const genderMap = { 0: '未知', 1: '男', 2: '女' }
  return genderMap[gender] || '未知'
}

const loadUserInfo = () => {
  if (userInfo.value) {
    profileForm.value = {
      nickname: userInfo.value.nickname || '',
      email: userInfo.value.email || '',
      mobile: userInfo.value.mobile || '',
      gender: userInfo.value.gender || 0,
      remark: userInfo.value.remark || ''
    }
  }
}

const updateProfile = async () => {
  updating.value = true
  
  try {
    await api.put('/auth/profile', profileForm.value)
    
    // 更新本地用户信息
    await authStore.getUserInfo()
    
    $q.notify({
      type: 'positive',
      message: '个人信息更新成功'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '更新失败'
    })
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  changingPassword.value = true
  
  try {
    await authStore.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    $q.notify({
      type: 'positive',
      message: '密码修改成功'
    })
    
    // 清空表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '密码修改失败'
    })
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>
