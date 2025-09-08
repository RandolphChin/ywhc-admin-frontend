<template>
  <q-dialog v-model="visible" persistent class="detail-dialog">
    <q-card class="dialog-card" style="min-width: 800px; max-width: 1200px; max-height: 90vh">
      <!-- Header with actions -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
          <!--   <q-icon name="article" class="q-mr-sm text-primary" size="24px" /> -->
            <div>
              <div class="text-h6">日志详情</div>
              <!-- <div class="text-caption text-grey-6" v-if="logData">
                ID: {{ logData.id }} | {{ formatDateTime(logData.createTime) }}
              </div> -->
            </div>
          </div>
          <div class="flex items-center q-gutter-sm">
            <q-btn 
              flat 
              round 
              icon="refresh" 
              color="primary"
              @click="handleRefresh"
              class="q-mr-sm"
            >
              <q-tooltip>刷新</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              round 
              icon="close" 
              color="grey-7"
              @click="handleClose"
            >
              <q-tooltip>关闭</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Content with skeleton loading -->
      <q-card-section class="dialog-content">
        <LogForm 
          v-if="logData" 
          :model-value="logData" 
          :is-readonly="true"
        />
      </q-card-section>

      <!-- Footer -->
      <q-separator />
      <q-card-actions align="right" class="dialog-footer">
        <q-btn 
          flat 
          label="关闭" 
          color="grey-7"
          @click="handleClose" 
          class="q-px-lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import LogForm from './LogForm.vue'

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

const emit = defineEmits(['update:modelValue', 'refresh'])

const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  visible.value = false
}

const handleRefresh = () => {
  emit('refresh')
}

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
</script>

<!-- 样式已移至全局 CSS: src/css/detail-edit-common.scss -->
