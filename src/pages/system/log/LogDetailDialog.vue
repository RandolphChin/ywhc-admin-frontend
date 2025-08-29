<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section>
        <div class="text-h6">日志详情</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list v-if="logData" dense>
          <q-item>
            <q-item-section>
              <q-item-label>操作用户</q-item-label>
              <q-item-label caption>{{ logData.username }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>操作类型</q-item-label>
              <q-item-label caption>{{ logData.operation }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>请求方法</q-item-label>
              <q-item-label caption>{{ logData.method }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>请求URI</q-item-label>
              <q-item-label caption>{{ logData.uri }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>IP地址</q-item-label>
              <q-item-label caption>{{ logData.ip }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>用户代理</q-item-label>
              <q-item-label caption>{{ logData.userAgent }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>响应状态</q-item-label>
              <q-item-label caption>{{ logData.status }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>执行时间</q-item-label>
              <q-item-label caption>{{ logData.time }}ms</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label>操作时间</q-item-label>
              <q-item-label caption>{{ new Date(logData.createTime).toLocaleString() }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item v-if="logData.params">
            <q-item-section>
              <q-item-label>请求参数</q-item-label>
              <q-item-label caption>
                <pre class="text-caption">{{ formatJson(logData.params) }}</pre>
              </q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item v-if="logData.result">
            <q-item-section>
              <q-item-label>响应结果</q-item-label>
              <q-item-label caption>
                <pre class="text-caption">{{ formatJson(logData.result) }}</pre>
              </q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item v-if="logData.errorMsg">
            <q-item-section>
              <q-item-label>错误信息</q-item-label>
              <q-item-label caption class="text-negative">{{ logData.errorMsg }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="row justify-end">
          <q-btn flat label="关闭" @click="handleClose" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  logData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatJson = (jsonStr) => {
  try {
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return jsonStr
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
//用于显示预格式化文本（如代码、日志、JSON数据等）
pre {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
