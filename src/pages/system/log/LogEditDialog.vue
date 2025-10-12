<template>
  <q-dialog v-model="visible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 800px; max-width: 1200px; max-height: 90vh">
      
      <!-- 🧩 En-tête -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-h6">{{ getHeaderTitle }}</div>
          </div>
          <div class="flex items-center q-gutter-sm">
            <q-btn 
              v-if="isReadonly"
              flat 
              round 
              icon="refresh" 
              color="primary"
              @click="handleRefresh"
              class="q-mr-sm"
            >
              <q-tooltip>{{ t('action.refresh') }}</q-tooltip>
            </q-btn>
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

      <!-- 🧾 Contenu du formulaire -->
      <q-card-section class="dialog-content">
        <q-form ref="formRef" @submit="handleSubmit" class="full-height">
          <div v-if="loading" class="q-pa-md">
            <q-skeleton height="200px" class="q-mb-md" />
            <q-skeleton height="150px" class="q-mb-md" />
            <q-skeleton height="100px" />
          </div>
          <LogForm 
            v-else
            v-model="formData" 
            :is-readonly="isReadonly"
          />
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- 🧠 Actions pied de page -->
      <q-card-actions class="dialog-footer q-pa-md bg-grey-1">
        <div class="flex items-center justify-end full-width">
          <div class="q-gutter-sm">
            <q-btn 
              v-if="!isReadonly"
              flat 
              :label="t('action.reset')" 
              color="grey-7"
              @click="handleReset"
              :disable="submitting"
              class="q-px-lg"
            />
            <q-btn 
              flat 
              :label="t('action.cancel')" 
              color="grey-7"
              @click="handleClose" 
              :disable="submitting"
              class="q-px-lg"
            />
            <q-btn 
              v-if="!isReadonly"
              color="primary" 
              :label="t('action.save')" 
              @click="handleSubmit"
              :loading="submitting"
              :disable="submitting"
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
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import LogForm from './LogForm.vue'

const { t } = useI18n()
const $q = useQuasar()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  logData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  isReadonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'refresh'])

const formRef = ref()
const loading = ref(false)
const submitting = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const formData = ref({
  id: null,
  username: '',
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
  createTime: '',
})

/** 🧭 Titre dynamique du header */
const getHeaderTitle = computed(() => {
  if (props.isReadonly) return t('system.log.detailTitle')
  return props.isEdit ? t('system.log.editTitle') : t('system.log.addTitle')
})

/** 🧩 Synchronisation avec logData */
watch(() => props.logData, (newData) => {
  if (newData) formData.value = { ...newData }
}, { deep: true, immediate: true })

/** 💾 Soumission du formulaire */
const handleSubmit = async () => {
  if (!formRef.value || props.isReadonly) return
  try {
    submitting.value = true
    const isValid = await formRef.value.validate()
    if (!isValid) {
      $q.notify({
        message: t('common.formInvalid') ?? 'Veuillez vérifier le formulaire',
        color: 'negative',
        position: 'top'
      })
      return
    }

    await emit('submit', formData.value)
    $q.notify({
      message: props.isEdit ? t('action.editSuccess') : t('action.addSuccess'),
      color: 'positive',
      position: 'top'
    })
    visible.value = false
  } catch (error) {
    $q.notify({
      message: error.message || t('common.operationFail'),
      color: 'negative',
      position: 'top'
    })
  } finally {
    submitting.value = false
  }
}

/** ❌ Fermer la boîte de dialogue */
const handleClose = () => { visible.value = false }

/** 🔄 Réinitialiser le formulaire */
const handleReset = () => {
  if (props.isReadonly) return
  $q.dialog({
    title: t('action.confirmResetTitle'),
    message: t('action.confirmResetMessage'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    formData.value = { ...props.logData }
    $q.notify({
      message: t('action.resetSuccess'),
      color: 'info',
      position: 'top'
    })
  })
}

/** 🔁 Rafraîchir les données */
const handleRefresh = () => emit('refresh')
</script>

<!-- 💅 Styles globaux : src/css/detail-edit-common.scss -->
