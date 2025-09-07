<template>
  <div :class="isReadonly ? 'detail-form' : 'edit-form'">
    <!-- 基本信息 -->
    <q-card v-if="isReadonly" class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="info" class="q-mr-sm text-primary" />
          基本信息
        </div>
        <q-separator class="q-mb-md" />
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="detail-field-inline">
              <span class="field-label">操作用户：</span>
              <span class="field-value">{{ formData.username || '-' }}</span>
              <q-btn 
                v-if="formData.username" 
                flat 
                round 
                dense 
                size="sm" 
                icon="content_copy" 
                class="q-ml-xs" 
                @click="handleCopy(formData.username)"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="detail-field-inline">
              <span class="field-label">操作类型：</span>
              <q-badge 
                v-if="formData.operation" 
                color="primary" 
                :label="formData.operation"
                class="field-value"
              />
              <span v-else class="field-value">-</span>
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="detail-field-inline">
              <span class="field-label">IP地址：</span>
              <span class="field-value">{{ formData.ip || '-' }}</span>
              <q-btn 
                v-if="formData.ip" 
                flat 
                round 
                dense 
                size="sm" 
                icon="content_copy" 
                class="q-ml-xs" 
                @click="handleCopy(formData.ip)"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="detail-field-inline">
              <span class="field-label">操作时间：</span>
              <span class="field-value">{{ formatDateTime(formData.createTime) }}</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <q-card v-else class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="info" class="q-mr-sm text-primary" />
          基本信息
        </div>
        <q-separator class="q-mb-md" />
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">操作用户：</span>
              <q-input
                v-model="formData.username"
                outlined
                dense
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">操作类型：</span>
              <q-input
                v-model="formData.operation"
                outlined
                dense
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">IP地址：</span>
              <q-input
                v-model="formData.ip"
                outlined
                dense
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
                class="field-input"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 请求信息 -->
    <q-card v-if="isReadonly" class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="http" class="q-mr-sm text-primary" />
          请求信息
        </div>
        <q-separator class="q-mb-md" />
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="detail-field-inline">
              <span class="field-label">请求方法：</span>
              <q-badge 
                v-if="formData.method"
                :color="getMethodColor(formData.method)" 
                :label="formData.method"
                class="field-value"
              />
              <span v-else class="field-value">-</span>
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="detail-field-inline">
              <span class="field-label">响应状态：</span>
              <q-badge 
                v-if="formData.status"
                :color="getStatusColor(formData.status)" 
                :label="formData.status"
                class="field-value"
              />
              <span v-else class="field-value">-</span>
            </div>
          </div>
          
          <div class="col-12">
            <div class="detail-field-inline">
              <span class="field-label">请求URI：</span>
              <span class="field-value">{{ formData.uri || '-' }}</span>
              <q-btn 
                v-if="formData.uri" 
                flat 
                round 
                dense 
                size="sm" 
                icon="content_copy" 
                class="q-ml-xs" 
                @click="handleCopy(formData.uri)"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="detail-field-inline">
              <span class="field-label">执行时间：</span>
              <span class="field-value">{{ formData.time ? `${formData.time}ms` : '-' }}</span>
            </div>
          </div>
          
          <div class="col-12">
            <div class="detail-field-block">
              <div class="field-label q-mb-xs">用户代理：</div>
              <div class="field-value text-caption">{{ formData.userAgent || '-' }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <q-card v-else class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="http" class="q-mr-sm text-primary" />
          请求信息
        </div>
        <q-separator class="q-mb-md" />
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">请求方法：</span>
              <q-input
                v-model="formData.method"
                outlined
                dense
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
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12">
            <div class="edit-field-inline">
              <span class="field-label">请求URI：</span>
              <q-input
                v-model="formData.uri"
                outlined
                dense
                class="field-input"
              />
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">执行时间：</span>
              <q-input
                v-model="formData.time"
                suffix="ms"
                outlined
                dense
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
                class="field-input"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 详细数据 -->
    <q-card v-if="hasDetailData && isReadonly" class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="data_object" class="q-mr-sm text-primary" />
          详细数据
        </div>
        <q-separator class="q-mb-md" />
        
        <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
          <q-tab v-if="formData.params" name="params" label="请求参数" />
          <q-tab v-if="formData.result" name="result" label="响应结果" />
          <q-tab v-if="formData.errorMsg" name="error" label="错误信息" />
        </q-tabs>
        
        <q-separator />
        
        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel v-if="formData.params" name="params" class="q-pa-md">
            <div class="flex justify-between items-center q-mb-sm">
              <div class="text-subtitle2">请求参数</div>
              <q-btn 
                flat 
                round 
                dense 
                size="sm" 
                icon="content_copy" 
                @click="handleCopy(formatJson(formData.params))"
              />
            </div>
            <pre class="code-block">{{ formatJson(formData.params) }}</pre>
          </q-tab-panel>
          
          <q-tab-panel v-if="formData.result" name="result" class="q-pa-md">
            <div class="flex justify-between items-center q-mb-sm">
              <div class="text-subtitle2">响应结果</div>
              <q-btn 
                flat 
                round 
                dense 
                size="sm" 
                icon="content_copy" 
                @click="handleCopy(formatJson(formData.result))"
              />
            </div>
            <pre class="code-block">{{ formatJson(formData.result) }}</pre>
          </q-tab-panel>
          
          <q-tab-panel v-if="formData.errorMsg" name="error" class="q-pa-md">
            <div class="flex justify-between items-center q-mb-sm">
              <div class="text-subtitle2 text-negative">错误信息</div>
              <q-btn 
                flat 
                round 
                dense 
                size="sm" 
                icon="content_copy" 
                @click="handleCopy(formData.errorMsg)"
              />
            </div>
            <div class="error-block">{{ formData.errorMsg }}</div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
    
    <q-card v-else-if="hasDetailData" class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="data_object" class="q-mr-sm text-primary" />
          详细数据
        </div>
        <q-separator class="q-mb-md" />
        
        <div class="row q-col-gutter-md">
          <div v-if="formData.params" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">请求参数：</div>
              <q-input
                v-model="formattedParams"
                type="textarea"
                outlined
                dense
                rows="6"
                class="field-input"
              />
            </div>
          </div>
          
          <div v-if="formData.result" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">响应结果：</div>
              <q-input
                v-model="formattedResult"
                type="textarea"
                outlined
                dense
                rows="6"
                class="field-input"
              />
            </div>
          </div>
          
          <div v-if="formData.errorMsg" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">错误信息：</div>
              <q-input
                v-model="formData.errorMsg"
                type="textarea"
                outlined
                dense
                rows="3"
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
  username: '',
  operation: '',
  method: '',
  uri: '',
  ip: '',
  userAgent: '',
  status: '',
  time: '',
  createTime: '',
  params: '',
  result: '',
  errorMsg: ''
})

const activeTab = ref('params')

// 计算属性
const hasDetailData = computed(() => {
  return formData.value.params || formData.value.result || formData.value.errorMsg
})

const formattedCreateTime = computed(() => {
  return formatDateTime(formData.value.createTime)
})

const formattedParams = computed({
  get: () => formatJson(formData.value.params),
  set: (value) => {
    formData.value.params = value
  }
})

const formattedResult = computed({
  get: () => formatJson(formData.value.result),
  set: (value) => {
    formData.value.result = value
  }
})

// 监听数据变化
watch(() => props.modelValue, (newData) => {
  if (newData) {
    formData.value = { ...newData }
    // 设置默认激活的标签页
    if (newData.params) {
      activeTab.value = 'params'
    } else if (newData.result) {
      activeTab.value = 'result'
    } else if (newData.errorMsg) {
      activeTab.value = 'error'
    }
  }
}, { deep: true, immediate: true })

watch(formData, (newData) => {
  emit('update:modelValue', newData)
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
