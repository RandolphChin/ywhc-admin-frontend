<template>
  <q-dialog v-model="visible" persistent class="config-dialog">
    <q-card class="dialog-card" style="min-width: 900px; max-width: 1200px; max-height: 90vh">
      <!-- 🧩 En-tête / Header -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="text-h6">{{ t('system.generator.dialog_generate_config') }}</div>
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
      </q-card-section>

      <q-separator />

      <!-- 🧾 Formulaire principal / Main form -->
      <q-card-section class="dialog-content">
        <q-form ref="formRef" class="q-gutter-md">
          <div class="row q-col-gutter-md">

            <!-- 📘 Informations de base -->
            <div class="col-12">
              <div class="text-h6 q-mb-md">{{ t('system.generator.basic_info') }}</div>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.tableName"
                :label="t('system.generator.table_name')"
                outlined
                dense
                readonly
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.functionName"
                :label="t('system.generator.function_name')"
                outlined
                dense
                :rules="[rules.required(t('system.generator.function_name'))]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.moduleName"
                :label="t('system.generator.module_name')"
                outlined
                dense
                :rules="[rules.required(t('system.generator.module_name'))]"
                :hint="t('system.generator.module_hint')"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.businessName"
                :label="t('system.generator.business_name')"
                outlined
                dense
                :rules="[rules.required(t('system.generator.business_name'))]"
                :hint="t('system.generator.business_hint')"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.packageName"
                :label="t('system.generator.package_name')"
                outlined
                dense
                :rules="[rules.required(t('system.generator.package_name'))]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.author"
                :label="t('system.generator.author')"
                outlined
                dense
                :rules="[rules.required(t('system.generator.author'))]"
              />
            </div>

            <!-- ⚙️ Options de génération -->
            <div class="col-12">
              <div class="text-h6 q-mb-md q-mt-md">{{ t('system.generator.generate_options') }}</div>
            </div>

            <div class="col-12">
              <div class="row q-col-gutter-md">

                <!-- 后端代码 / Code backend -->
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-sm">{{ t('system.generator.backend_code') }}</div>
                  <q-checkbox v-model="formData.generateOptions.generateController" label="Controller" />
                  <q-checkbox v-model="formData.generateOptions.generateService" label="Service" />
                  <q-checkbox v-model="formData.generateOptions.generateServiceImpl" label="ServiceImpl" />
                  <q-checkbox v-model="formData.generateOptions.generateMapper" label="Mapper" />
                  <q-checkbox v-model="formData.generateOptions.generateMapperXml" label="MapperXML" />
                  <q-checkbox v-model="formData.generateOptions.generateEntity" label="Entity" />
                  <q-checkbox v-model="formData.generateOptions.generateDto" label="DTO" />
                  <q-checkbox v-model="formData.generateOptions.generateVo" label="VO" />
                </div>

                <!-- 前端代码 / Code frontend -->
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-sm">{{ t('system.generator.frontend_code') }}</div>
                  <q-checkbox v-model="formData.generateOptions.generateVuePage" :label="t('system.generator.vue_page')" />
                  <q-checkbox v-model="formData.generateOptions.generateVueApi" :label="t('system.generator.vue_api')" />

                  <div class="text-subtitle2 q-mb-sm q-mt-md">{{ t('system.generator.sql_scripts') }}</div>
                  <q-checkbox v-model="formData.generateOptions.generateMenuSql" :label="t('system.generator.menu_sql')" />
                  <q-checkbox v-model="formData.generateOptions.generatePermissionSql" :label="t('system.generator.permission_sql')" />
                </div>

              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- 🧮 Pied de page -->
      <q-card-actions class="dialog-footer q-pa-md bg-grey-1">
        <div class="flex items-center justify-end full-width q-gutter-sm">
          <q-btn 
            flat 
            :label="t('action.cancel')" 
            color="grey-7"
            @click="handleClose" 
            class="q-px-lg"
          />
          <q-btn 
            color="info" 
            :label="t('action.preview')" 
            @click="handlePreview"
            class="q-px-lg"
          />
          <q-btn 
            color="primary" 
            :label="t('action.generate')" 
            @click="handleGenerate"
            class="q-px-lg"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  tableData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'generate', 'preview'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
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

// ✅ Corrigé : utilisation de validation.required (plus de référence à common)
const rules = {
  required: (fieldName) => (val) => !!val || t('validation.required', { field: fieldName })
}

watch(
  () => props.tableData,
  (newData) => {
    if (newData) {
      formData.value.tableName = newData.tableName
      formData.value.functionName = newData.tableComment || newData.tableName

      let businessName = newData.tableName
      if (businessName.startsWith('sys_')) businessName = businessName.slice(4)
      else if (businessName.startsWith('t_')) businessName = businessName.slice(2)

      formData.value.businessName = businessName
    }
  },
  { deep: true, immediate: true }
)

const formRef = ref(null)

const handlePreview = async () => {
  const success = await formRef.value.validate()
  if (success) emit('preview', formData.value)
}

const handleGenerate = async () => {
  const success = await formRef.value.validate()
  if (success) emit('generate', formData.value)
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
