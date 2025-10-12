<template>
  <q-dialog v-model="visible" maximized class="preview-dialog">
    <q-card class="dialog-card">
      <!-- 🧩 Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-h6">{{ t('system.generator.code_preview') }}</div>
            <q-chip 
              v-if="generatedCode" 
              color="primary" 
              text-color="white" 
              :label="t('system.generator.total_files', { count: Object.keys(generatedCode.files || {}).length })"
              class="q-ml-md"
            />
          </div>
          <div class="flex items-center q-gutter-sm">
            <q-btn 
              color="primary" 
              icon="download" 
              :label="t('action.download_code')"
              @click="handleDownload"
            />
            <q-btn 
              flat 
              round 
              icon="close" 
              color="grey-7"
              @click="handleClose"
            >
              <q-tooltip>{{ t('action.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- 🧾 Content -->
      <q-card-section class="dialog-content q-pa-none">
        <div class="row no-wrap" style="height: calc(100vh - 120px);">
          
          <!-- 📂 File Tree -->
          <div class="col-3 bg-grey-1 q-pa-md" style="border-right: 1px solid #e0e0e0;">
            <div class="text-subtitle2 q-mb-md">{{ t('system.generator.file_list') }}</div>
            <q-tree
              :nodes="fileTree"
              node-key="path"
              selected-color="primary"
              v-model:selected="selectedFile"
              @update:selected="onFileSelect"
            />
            
            <!-- 🧱 SQL Scripts -->
            <div v-if="generatedCode?.menuSql || generatedCode?.permissionSql" class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">{{ t('system.generator.sql_scripts') }}</div>
              <q-list dense>
                <q-item 
                  v-if="generatedCode.menuSql"
                  clickable 
                  @click="showSqlContent('menu', generatedCode.menuSql)"
                  :class="{ 'bg-primary text-white': selectedFile === 'sql/menu.sql' }"
                >
                  <q-item-section avatar>
                    <q-icon name="description" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('system.generator.menu_sql') }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item 
                  v-if="generatedCode.permissionSql"
                  clickable 
                  @click="showSqlContent('permission', generatedCode.permissionSql)"
                  :class="{ 'bg-primary text-white': selectedFile === 'sql/permission.sql' }"
                >
                  <q-item-section avatar>
                    <q-icon name="description" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('system.generator.permission_sql') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
          
          <!-- 💻 File Content -->
          <div class="col-9">
            <div v-if="currentFileContent" class="full-height">
              <div class="bg-grey-2 q-pa-sm text-caption border-bottom">
                {{ selectedFile }}
              </div>
              <pre class="code-content q-pa-md"><code>{{ currentFileContent }}</code></pre>
            </div>
            <div v-else class="flex flex-center full-height text-grey-6">
              <div class="text-center">
                <q-icon name="code" size="4rem" class="q-mb-md" />
                <div>{{ t('system.generator.select_file_prompt') }}</div>
              </div>
            </div>
          </div>

        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  generatedCode: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'download'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const selectedFile = ref('')
const currentFileContent = ref('')

// --- 构建文件树 / Build file tree ---
const fileTree = computed(() => {
  if (!props.generatedCode?.files) return []
  const tree = []
  const files = props.generatedCode.files

  Object.keys(files).forEach(filePath => {
    const parts = filePath.split('/')
    let currentLevel = tree
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (index === parts.length - 1) {
        currentLevel.push({
          label: part,
          path: filePath,
          icon: getFileIcon(part),
          selectable: true
        })
      } else {
        let existingDir = currentLevel.find(i => i.label === part && i.children)
        if (!existingDir) {
          existingDir = {
            label: part,
            path: currentPath,
            icon: 'folder',
            children: [],
            expandable: true,
            expanded: true
          }
          currentLevel.push(existingDir)
        }
        currentLevel = existingDir.children
      }
    })
  })
  return tree
})

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'java': return 'code'
    case 'vue': return 'web'
    case 'js': return 'javascript'
    case 'xml': return 'description'
    case 'sql': return 'storage'
    default: return 'insert_drive_file'
  }
}

const onFileSelect = (path) => {
  if (props.generatedCode?.files?.[path]) {
    currentFileContent.value = props.generatedCode.files[path]
  }
}

const showSqlContent = (type, content) => {
  selectedFile.value = `sql/${type}.sql`
  currentFileContent.value = content
}

const handleDownload = () => emit('download')
const handleClose = () => { visible.value = false }

watch(() => props.generatedCode, (newData) => {
  if (newData?.files) {
    const firstFile = Object.keys(newData.files)[0]
    if (firstFile) {
      selectedFile.value = firstFile
      currentFileContent.value = newData.files[firstFile]
    }
  }
}, { deep: true, immediate: true })
</script>

<style lang="scss" scoped>
.preview-dialog {
  .dialog-card {
    .dialog-header {
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
  }
}

.code-content {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  background: #f8f9fa;
  border: none;
  margin: 0;
  overflow: auto;
  height: calc(100% - 40px);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
</style>
