<template>
  <q-page>
    <div class="row q-gutter-md">
      <!-- 🧍 Carte d’informations personnelles -->
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
                    <q-item-label>{{ userInfo?.email || t('user.not_set') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="phone" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ userInfo?.mobile || t('user.not_set') }}</q-item-label>
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
                    <q-item-label caption>{{ t('user.register_time') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 🧾 Formulaire de modification -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ t('user.edit_info') }}</div>

            <q-form @submit="updateProfile" class="q-gutter-md">
              <div class="row q-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profileForm.nickname"
                    :label="t('user.nickname')"
                    :rules="[val => !!val || t('user.rules.nickname_required')]"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profileForm.email"
                    :label="t('user.email')"
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
                    :label="t('user.mobile')"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="profileForm.gender"
                    :options="genderOptions"
                    :label="t('user.gender')"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <q-input
                v-model="profileForm.remark"
                :label="t('user.remark')"
                type="textarea"
                outlined
                dense
                rows="4"
              />

              <div class="row justify-end q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="t('action.save')"
                  :loading="updating"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- 🔒 Changement de mot de passe -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ t('user.change_password') }}</div>

            <q-form @submit="changePassword" class="q-gutter-md">
              <q-input
                v-model="passwordForm.oldPassword"
                type="password"
                :label="t('user.old_password')"
                :rules="[val => !!val || t('user.rules.old_required')]"
                outlined
                dense
              />

              <q-input
                v-model="passwordForm.newPassword"
                type="password"
                :label="t('user.new_password')"
                :rules="[
                  val => !!val || t('user.rules.new_required'),
                  val => val.length >= 6 || t('user.rules.password_length')
                ]"
                outlined
                dense
              />

              <q-input
                v-model="passwordForm.confirmPassword"
                type="password"
                :label="t('user.confirm_password')"
                :rules="[
                  val => !!val || t('user.rules.confirm_required'),
                  val => val === passwordForm.newPassword || t('user.rules.password_mismatch')
                ]"
                outlined
                dense
              />

              <!-- 🔐 Indicateur de chiffrement -->
              <div class="encryption-status" v-if="encryptionEnabled">
                <q-icon
                  :name="publicKeyLoaded ? 'lock' : 'lock_open'"
                  :color="publicKeyLoaded ? 'positive' : 'warning'"
                  size="xs"
                />
                <span class="status-text">
                  {{ publicKeyLoaded ? t('auth.encryption_enabled') : t('auth.encryption_loading') }}
                </span>
              </div>

              <div class="row justify-end q-gutter-sm">
                <q-btn
                  type="submit"
                  color="warning"
                  :label="t('user.change_password')"
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { formatTime } from 'src/utils/index'
import { useI18n } from 'vue-i18n'
import { useEncryption } from 'src/api/useEncryption'

const { t } = useI18n()
const $q = useQuasar()
const authStore = useAuthStore()

const updating = ref(false)
const changingPassword = ref(false)
const { encryptionEnabled, publicKeyLoaded } = useEncryption()

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
  { label: t('user.gender_unknown'), value: 0 },
  { label: t('user.gender_male'), value: 1 },
  { label: t('user.gender_female'), value: 2 }
]

const getGenderText = (gender: number) => {
  const genderMap: Record<number, string> = {
    0: t('user.gender_unknown'),
    1: t('user.gender_male'),
    2: t('user.gender_female')
  }
  return genderMap[gender] || t('user.gender_unknown')
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
    await authStore.getUserInfo()
    $q.notify({ type: 'positive', message: t('user.update_success') })
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('user.update_failed') })
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  changingPassword.value = true
  try {
    const changePasswordData = {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    }
    await authStore.changePassword(changePasswordData)
    $q.notify({ type: 'positive', message: t('user.password_success') })
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('user.password_failed') })
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => loadUserInfo())
</script>

<style lang="scss" scoped>
/* 🔐 Indicateur de chiffrement */
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
</style>
