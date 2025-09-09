<template>
  <div class="edit-form">
    <!-- 基本信息 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">操作用户：</span>
              <q-input
                v-model="formData.username"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              >
                <template v-if="isReadonly && formData.username" #append>
                  <q-btn 
                    flat 
                    round 
                    dense 
                    size="sm" 
                    icon="content_copy" 
                    @click="handleCopy(formData.username)"
                  />
                </template>
              </q-input>
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">操作描述：</span>
              <q-input
                v-model="formData.operationDesc"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">IP地址：</span>
              <q-input
                v-model="formData.ipAddress"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">操作时间：</span>
              <q-input
                v-model="formattedCreateTime"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">请求方法：</span>
              <q-input
                v-model="formData.requestMethod"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">响应状态：</span>
              <q-input
                v-model="formData.status"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12">
            <div class="edit-field-inline">
              <span class="field-label">请求URL：</span>
              <q-input
                v-model="formData.requestUrl"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              >
                <template v-if="isReadonly && formData.requestUrl" #append>
                  <q-btn 
                    flat 
                    round 
                    dense 
                    size="sm" 
                    icon="content_copy" 
                    @click="handleCopy(formData.requestUrl)"
                  />
                </template>
              </q-input>
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">执行时间：</span>
              <q-input
                v-model="formData.executionTime"
                suffix="ms"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">用户代理：</div>
              <q-input
                v-model="formData.userAgent"
                type="textarea"
                outlined
                dense
                rows="2"
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>

          <div v-if="formData.requestParams || !isReadonly" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">请求参数：</div>
              <q-input
                v-model="formattedParams"
                type="textarea"
                outlined
                dense
                rows="6"
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>

          <div v-if="formData.responseResult || !isReadonly" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">响应结果：</div>
              <q-input
                v-model="formattedResult"
                type="textarea"
                outlined
                dense
                rows="6"
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>
          
          <div v-if="formData.errorMsg || !isReadonly" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">错误信息：</div>
              <q-input
                v-model="formData.errorMsg"
                type="textarea"
                outlined
                dense
                rows="3"
                :readonly="isReadonly"
                color="negative"
                class="field-input"
              />
            </div>
          </div>

        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  isReadonly: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({
  id: null,
  userId: null,
  username: '',
  createBy: null,
  deptId: null,
  deptName: '',
  module: '',
  operationType: null,
  operationDesc: '',
  requestMethod: '',
  requestUrl: '',
  requestParams: '',
  responseResult: '',
  executionTime: null,
  status: null,
  errorMsg: '',
  ipAddress: '',
  userAgent: '',
  location: '',
  createTime: ''
})

const activeTab = ref('params')

// 计算属性
const hasDetailData = computed(() => {
  return formData.value.requestParams || formData.value.responseResult || formData.value.errorMsg
})

const formattedCreateTime = computed(() => {
  return formatDateTime(formData.value.createTime)
})

const formattedParams = computed({
  get: () => formatJson(formData.value.requestParams),
  set: (value) => {
    formData.value.requestParams = value
  }
})

const formattedResult = computed({
  get: () => formatJson(formData.value.responseResult),
  set: (value) => {
    formData.value.responseResult = value
  }
})

// 监听数据变化
watch(() => props.modelValue, (newData) => {
  if (newData) {
    Object.assign(formData.value, newData)
    // 设置默认激活的标签页
    if (newData.requestParams) {
      activeTab.value = 'params'
    } else if (newData.responseResult) {
      activeTab.value = 'result'
    } else if (newData.errorMsg) {
      activeTab.value = 'error'
    }
  }
}, { deep: true, immediate: true })

// 使用防抖来避免频繁更新
let updateTimeout = null
watch(formData, (newData) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  updateTimeout = setTimeout(() => {
    emit('update:modelValue', { ...newData })
  }, 0)
}, { deep: true })

// 复制到剪贴板
const handleCopy = async (text) => {
  try {
    await copyToClipboard(text)
    $q.notify({
      message: '已复制到剪贴板',
      color: 'positive',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      message: '复制失败',
      color: 'negative',
      position: 'top'
    })
  }
}

// 工具方法
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  try {
    return new Date(dateTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return dateTime
  }
}

const formatJson = (jsonStr) => {
  if (!jsonStr) return ''
  try {
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return jsonStr
  }
}

const getMethodColor = (method) => {
  const colors = {
    'GET': 'green',
    'POST': 'blue',
    'PUT': 'orange',
    'DELETE': 'red',
    'PATCH': 'purple'
  }
  return colors[method] || 'grey'
}

const getStatusColor = (status) => {
  if (!status) return 'grey'
  const statusCode = parseInt(status)
  if (statusCode >= 200 && statusCode < 300) return 'green'
  if (statusCode >= 300 && statusCode < 400) return 'blue'
  if (statusCode >= 400 && statusCode < 500) return 'orange'
  if (statusCode >= 500) return 'red'
  return 'grey'
}
</script>

<!-- 样式已移至全局 CSS: src/css/detail-edit-common.scss -->
