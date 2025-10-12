<template>
  <div class="edit-form">
    <!-- 🧩 Informations de base -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Utilisateur -->
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('common.username') }}：</span>
              <q-input
                v-model="formData.username"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              >
                <!-- Copier si lecture seule -->
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
          
          <!-- Description de l’opération -->
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('system.log.operationDesc') }}：</span>
              <q-input
                v-model="formData.operationDesc"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>
          
          <!-- Adresse IP -->
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('common.ipAddress') }}：</span>
              <q-input
                v-model="formData.ipAddress"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>
          
          <!-- Date d’opération -->
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('common.createTime') }}：</span>
              <q-input
                v-model="formData.createTime"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>

          <!-- Méthode HTTP -->
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('common.requestMethod') }}：</span>
              <q-input
                v-model="formData.requestMethod"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
              />
            </div>
          </div>

          <!-- Statut -->
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('common.status') }}：</span>
              <q-select
                v-model="formData.status"
                :options="statusOptions.length ? statusOptions : defaultStatusOptions"
                outlined
                dense
                :readonly="isReadonly"
                class="field-input"
                emit-value
                map-options
                clearable
              />
            </div>
          </div>
          
          <!-- URL de la requête -->
          <div class="col-12">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('common.requestUrl') }}：</span>
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
          
          <!-- Durée d’exécution -->
          <div class="col-12 col-md-6">
            <div class="edit-field-inline">
              <span class="field-label">{{ t('common.executionTime') }}：</span>
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
          
          <!-- Agent utilisateur -->
          <div class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">{{ t('common.userAgent') }}：</div>
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

          <!-- Paramètres de la requête -->
          <div v-if="formData.requestParams || !isReadonly" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">{{ t('common.requestParams') }}：</div>
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

          <!-- Résultat de la réponse -->
          <div v-if="formData.responseResult || !isReadonly" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">{{ t('common.responseResult') }}：</div>
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
          
          <!-- Message d’erreur -->
          <div v-if="formData.errorMsg || !isReadonly" class="col-12">
            <div class="edit-field-block">
              <div class="field-label q-mb-xs">{{ t('common.errorMsg') }}：</div>
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
import { useI18n } from 'vue-i18n'
import { useQuasar, copyToClipboard } from 'quasar'
import { formatJson } from 'src/utils/index'

const { t } = useI18n()
const $q = useQuasar()

const defaultStatusOptions = [
  { label: t('common.success'), value: 1 },
  { label: t('common.fail'), value: 0 }
]

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  isReadonly: { type: Boolean, default: true },
  statusOptions: {
    type: Array,
    default: () => [ ]
  }
})

const emit = defineEmits(['update:modelValue'])

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
  createTime: ''
})

// JSON formaté
const formattedParams = computed({
  get: () => formatJson(formData.value.requestParams),
  set: (v) => (formData.value.requestParams = v)
})

const formattedResult = computed({
  get: () => formatJson(formData.value.responseResult),
  set: (v) => (formData.value.responseResult = v)
})

// Synchronisation avec v-model
watch(() => props.modelValue, (newData) => {
  if (newData) Object.assign(formData.value, newData)
}, { deep: true, immediate: true })

let updateTimeout = null
watch(formData, (newData) => {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => emit('update:modelValue', { ...newData }), 0)
}, { deep: true })

// Copier dans le presse-papiers
const handleCopy = async (text) => {
  try {
    await copyToClipboard(text)
    $q.notify({ message: t('common.copySuccess'), color: 'positive', position: 'top' })
  } catch {
    $q.notify({ message: t('common.copyFail'), color: 'negative', position: 'top' })
  }
}
</script>

<!-- 💅 Styles globaux : src/css/detail-edit-common.scss -->
