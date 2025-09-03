<template>
  <q-dialog v-model="dialogVisible" persistent max-width="800px">
    <q-card style="min-width: 700px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">在线用户详情</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="userData">
        <div class="row q-gutter-md">
          <!-- 左侧：用户基本信息 -->
          <div class="col-5">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">用户信息</div>

                <div class="q-mb-md text-center">
                  <q-avatar size="80px">
                    <img v-if="userData.avatar" :src="userData.avatar" />
                    <q-icon v-else name="person" size="40px" />
                  </q-avatar>
                </div>

                <q-list separator>
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">用户ID</q-item-label>
                      <q-item-label caption>{{ userData.userId }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">用户名</q-item-label>
                      <q-item-label caption>{{ userData.username }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">昵称</q-item-label>
                      <q-item-label caption>{{ userData.nickname || '未设置' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">状态</q-item-label>
                      <q-item-label caption>
                        <q-badge
                          :color="userData.status == 1 ? 'positive' : 'negative'"
                          :label="userData.statusDesc"
                        />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- 右侧：会话详细信息 -->
          <div class="col-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">会话信息</div>

                <q-list separator>
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">访问Token</q-item-label>
                      <q-item-label caption class="text-mono">
                        {{ userData.accessToken }}
                        <q-btn
                          flat
                          dense
                          size="sm"
                          icon="content_copy"
                          @click="copyToClipboard(userData.accessToken)"
                        />
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">IP地址</q-item-label>
                      <q-item-label caption>{{ userData.ipAddress }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">登录地点</q-item-label>
                      <q-item-label caption>{{ userData.location || '未知' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">浏览器</q-item-label>
                      <q-item-label caption>{{ userData.browser || '未知' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">操作系统</q-item-label>
                      <q-item-label caption>{{ userData.os || '未知' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">设备类型</q-item-label>
                      <q-item-label caption>
                        <q-badge
                          :color="userData.deviceType == 1 ? 'blue' : 'green'"
                          :label="userData.deviceTypeDesc"
                          :icon="userData.deviceType == 1 ? 'computer' : 'phone_android'"
                        />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 时间信息 -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">时间信息</div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">登录时间</q-item-label>
                    <q-item-label caption>
                      {{ formatDateTime(userData.loginTime) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>

              <div class="col">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">最后活动时间</q-item-label>
                    <q-item-label caption>
                      {{ formatDateTime(userData.lastAccessTime) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>

              <div class="col">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">Token过期时间</q-item-label>
                    <q-item-label caption>
                      {{ formatDateTime(userData.expireTime) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>

              <div class="col">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">在线时长</q-item-label>
                    <q-item-label caption>
                      <q-badge
                        :color="getDurationColor(userData.onlineDuration)"
                        :label="formatDuration(userData.onlineDuration)"
                      />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 备注信息 -->
        <q-card flat bordered class="q-mt-md" v-if="userData.remark">
          <q-card-section>
            <div class="text-h6 q-mb-md">备注信息</div>
            <div class="text-body2">{{ userData.remark }}</div>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          color="negative"
          outline
          icon="logout"
          label="强制下线"
          @click="forceLogout"
          v-permission="'monitor:online:forceLogout'"
        />
        <q-btn
          color="warning"
          outline
          icon="block"
          label="下线所有会话"
          @click="forceLogoutAllSessions"
          v-permission="'monitor:online:forceLogout'"
        />
        <q-btn
          color="info"
          outline
          icon="security"
          label="检查黑名单"
          @click="checkBlacklist"
        />
        <q-btn color="primary" label="关闭" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { onlineUserApi } from 'src/api'

defineOptions({
  name: 'OnlineUserDetailDialog'
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'force-logout', 'refresh'])

const $q = useQuasar()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formatDateTime = (dateTime) => {
  if (!dateTime) return '未知'
  return new Date(dateTime).toLocaleString()
}

const formatDuration = (minutes) => {
  if (!minutes) return '0分钟'
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
}

const getDurationColor = (duration) => {
  if (!duration) return 'grey'
  if (duration < 30) return 'info'
  if (duration < 120) return 'positive'
  if (duration < 300) return 'warning'
  return 'deep-orange'
}

const forceLogout = () => {
  if (!props.userData) return

  $q.dialog({
    title: '确认强制下线',
    message: `确定要强制用户 "${props.userData.username}" 下线吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await onlineUserApi.forceLogout(props.userData.accessToken)
      $q.notify({
        type: 'positive',
        message: '用户已强制下线'
      })
      emit('force-logout')
      emit('refresh')
      dialogVisible.value = false
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '强制下线失败'
      })
    }
  })
}

const forceLogoutAllSessions = () => {
  if (!props.userData) return

  $q.dialog({
    title: '确认下线所有会话',
    message: `确定要强制用户 "${props.userData.username}" 的所有会话下线吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await onlineUserApi.forceLogoutByUserId(props.userData.userId)
      $q.notify({
        type: 'positive',
        message: '用户所有会话已强制下线'
      })
      emit('force-logout')
      emit('refresh')
      dialogVisible.value = false
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || '强制下线失败'
      })
    }
  })
}

const checkBlacklist = async () => {
  if (!props.userData) return

  try {
    const response = await onlineUserApi.checkBlacklist(props.userData.accessToken)
    const isBlacklisted = response.data.data

    $q.notify({
      type: isBlacklisted ? 'warning' : 'positive',
      message: isBlacklisted ? 'Token已在黑名单中' : 'Token未在黑名单中'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '检查失败'
    })
  }
}
</script>

<style lang="scss" scoped>
.text-mono {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
