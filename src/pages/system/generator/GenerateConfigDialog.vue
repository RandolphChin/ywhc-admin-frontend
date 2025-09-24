<template>
  <q-dialog v-model="visible" persistent class="config-dialog">
    <q-card class="dialog-card" style="min-width: 900px; max-width: 1200px; max-height: 90vh">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-h6">代码生成配置</div>
          </div>
          <div class="flex items-center q-gutter-sm">
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

      <q-card-section class="dialog-content">
        <q-form ref="formRef" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- 基本信息 -->
            <div class="col-12">
              <div class="text-h6 q-mb-md">基本信息</div>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.tableName"
                label="表名"
                outlined
                dense
                readonly
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.functionName"
                label="功能名称"
                outlined
                dense
                :rules="[rules.required('功能名称')]"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.moduleName"
                label="模块名"
                outlined
                dense
                :rules="[rules.required('模块名')]"
                hint="如: system, monitor"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.businessName"
                label="业务名"
                outlined
                dense
                :rules="[rules.required('业务名')]"
                hint="如: user, role, menu"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.packageName"
                label="包名"
                outlined
                dense
                :rules="[rules.required('包名')]"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.author"
                label="作者"
                outlined
                dense
                :rules="[rules.required('作者')]"
              />
            </div>

            <!-- 生成选项 -->
            <div class="col-12">
              <div class="text-h6 q-mb-md q-mt-md">生成选项</div>
            </div>
            
            <div class="col-12">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-sm">后端代码</div>
                  <q-checkbox v-model="formData.generateOptions.generateController" label="Controller" />
                  <q-checkbox v-model="formData.generateOptions.generateService" label="Service" />
                  <q-checkbox v-model="formData.generateOptions.generateServiceImpl" label="ServiceImpl" />
                  <q-checkbox v-model="formData.generateOptions.generateMapper" label="Mapper" />
                  <q-checkbox v-model="formData.generateOptions.generateMapperXml" label="MapperXML" />
                  <q-checkbox v-model="formData.generateOptions.generateEntity" label="Entity" />
                  <q-checkbox v-model="formData.generateOptions.generateDto" label="DTO" />
                  <q-checkbox v-model="formData.generateOptions.generateVo" label="VO" />
                </div>
                
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-sm">前端代码</div>
                  <q-checkbox v-model="formData.generateOptions.generateVuePage" label="Vue页面" />
                  <q-checkbox v-model="formData.generateOptions.generateVueApi" label="Vue API" />
                  
                  <div class="text-subtitle2 q-mb-sm q-mt-md">SQL脚本</div>
                  <q-checkbox v-model="formData.generateOptions.generateMenuSql" label="菜单SQL" />
                  <q-checkbox v-model="formData.generateOptions.generatePermissionSql" label="权限SQL" />
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Footer Actions -->
      <q-card-actions class="dialog-footer q-pa-md bg-grey-1">
        <div class="flex items-center justify-end full-width">
          <div class="q-gutter-sm">
            <q-btn 
              flat 
              label="取消" 
              color="grey-7"
              @click="handleClose" 
              class="q-px-lg"
            />
            <q-btn 
              color="info" 
              label="预览代码" 
              @click="handlePreview"
              class="q-px-lg"
            />
            <q-btn 
              color="primary" 
              label="生成下载" 
              @click="handleGenerate"
              class="q-px-lg"
            />
          </div>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tableData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'generate', 'preview'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref({
  tableName: '',
  functionName: '',
  moduleName: 'system',
  businessName: '',
  packageName: 'com.ywhc.admin',
  author: 'YWHC Team',
  generateOptions: {
    generateController: true,
    generateService: true,
    generateServiceImpl: true,
    generateMapper: true,
    generateMapperXml: true,
    generateEntity: true,
    generateDto: true,
    generateVo: true,
    generateVuePage: true,
    generateVueApi: true,
    generateMenuSql: true,
    generatePermissionSql: true
  }
})

const rules = {
  required: (fieldName) => (val) => !!val || `${fieldName}不能为空`
}

watch(() => props.tableData, (newData) => {
  if (newData) {
    formData.value.tableName = newData.tableName
    formData.value.functionName = newData.tableComment || newData.tableName
    
    // 自动生成业务名（去掉表前缀）
    let businessName = newData.tableName
    if (businessName.startsWith('sys_')) {
      businessName = businessName.substring(4)
    } else if (businessName.startsWith('t_')) {
      businessName = businessName.substring(2)
    }
    formData.value.businessName = businessName
  }
}, { deep: true, immediate: true })

const formRef = ref(null)

const handlePreview = () => {
  formRef.value.validate().then((success) => {
    if (success) {
      emit('preview', formData.value)
    }
  })
}

const handleGenerate = () => {
  formRef.value.validate().then((success) => {
    if (success) {
      emit('generate', formData.value)
    }
  })
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.config-dialog {
  .dialog-card {
    .dialog-header {
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .dialog-footer {
      border-top: 1px solid #e0e0e0;
    }
  }
}

.q-checkbox {
  display: block;
  margin-bottom: 8px;
}
</style>