<template>
  <!-- 🧩 Dialogue d’édition ou d’ajout d’un utilisateur -->
  <!-- 用户编辑或添加对话框 -->
  <q-dialog v-model="visible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 500px; max-width: 1200px; max-height: 90vh">

      <!-- 🧱 En-tête du dialogue -->
      <!-- 对话框头部 -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="text-h6">
            {{ isEdit ? t('user.editUser') : t('user.addUser') }}
          </div>
          <div class="flex items-center q-gutter-sm">
            <q-btn 
              flat 
              round 
              icon="close" 
              color="grey-7"
              @click="handleClose"
            >
              <q-tooltip>{{ t('action.close') }}</q-tooltip>
              <!-- 关闭 -->
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- 📋 Formulaire d’édition -->
      <!-- 编辑表单 -->
      <q-card-section class="dialog-content">
        <div class="edit-form">
          <q-form ref="formRef" @submit="handleSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">

              <!-- 🧑 Nom d’utilisateur -->
              <!-- 用户名 -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('common.username') }}：</span>
                  <q-input
                    v-model="formData.username"
                    :label="t('common.username')"
                    :rules="[rules.required(t('common.username'))]"
                    outlined
                    dense
                    :readonly="isEdit"
                    class="field-input readonly-field"
                  />
                </div>
              </div>

              <!-- 🪪 Surnom -->
              <!-- 昵称 -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.nickname') }}：</span>
                  <q-input
                    v-model="formData.nickname"
                    :label="t('common.nickname')"
                    :rules="[rules.required(t('common.nickname'))]"
                    outlined
                    dense
                  />
                </div>
              </div>

              <!-- ✉️ Adresse e-mail -->
              <!-- 邮箱 -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.email') }}：</span>
                  <q-input
                    v-model="formData.email"
                    :label="t('common.email')"
                    type="email"
                    outlined
                    dense
                  />
                </div>
              </div>

              <!-- 📱 Téléphone -->
              <!-- 手机号 -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.mobile') }}：</span>
                  <q-input
                    v-model="formData.mobile"
                    :label="t('common.mobile')"
                    outlined
                    dense
                  />
                </div>
              </div>

              <!-- ⚧ Sexe -->
              <!-- 性别 -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.gender') }}：</span>
                  <q-select
                    v-model="formData.gender"
                    :options="genderOptions"
                    :label="t('common.gender')"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <!-- 🔘 Statut -->
              <!-- 状态 -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.status') }}：</span>
                  <q-select
                    v-model="formData.status"
                    :options="statusOptions"
                    :label="t('common.status')"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <!-- 🧩 Rôles associés -->
              <!-- 角色 -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('common.roles') }}：</span>
                  <q-select
                    v-model="formData.roleIds"
                    :options="roleOptions"
                    :label="t('common.roles')"
                    outlined
                    dense
                    multiple
                    emit-value
                    map-options
                    use-chips
                    :rules="[rules.required(t('common.roles'))]"
                  />
                </div>
              </div>

              <!-- 📝 Remarques -->
              <!-- 备注 -->
              <div class="col-12">
                <div class="edit-field-block">
                  <span class="field-label">{{ t('common.remark') }}：</span>
                  <q-input
                    v-model="formData.remark"
                    :label="t('common.remark')"
                    type="textarea"
                    outlined
                    dense
                    rows="3"
                  />
                </div>
              </div>

            </div>
          </q-form>
        </div>
      </q-card-section>

      <q-separator />

      <!-- 🧭 Pied du dialogue -->
      <!-- 对话框底部操作按钮 -->
      <q-card-actions class="dialog-footer q-pa-md bg-grey-1">
        <div class="flex items-center justify-end full-width">
          <div class="q-gutter-sm">
            <q-btn 
              flat 
              :label="t('action.cancel')" 
              color="grey-7"
              @click="handleClose" 
              :disable="submitting"
              class="q-px-lg"
            />
            <q-btn 
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
// ------------------------------------------------------------
// 🎯 Dialogue d’édition / création d’utilisateur (i18n intégré)
// 用户编辑 / 新建对话框（集成国际化）
// ------------------------------------------------------------
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 🌐 Initialisation de la traduction
const { t } = useI18n()

// 🧩 Propriétés
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  roleOptions: { type: Array, default: () => [] }
})

// 📡 Événements
const emit = defineEmits(['update:modelValue', 'submit'])
const submitting = ref(false)

// 🎛️ Contrôle du dialogue
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 🧱 Données du formulaire
const formData = ref({
  id: null,
  username: '',
  nickname: '',
  email: '',
  mobile: '',
  gender: 0,
  status: 1,
  roleIds: [],
  remark: ''
})

// ✅ Règles de validation
const rules = {
  required: (fieldName) => (val) => !!val || t('validation.requiredField', { field: fieldName })
}

// 🟢 Statuts possibles
const statusOptions = [
  { label: t('common.enabled'), value: 1 },
  { label: t('common.disabled'), value: 0 }
]

// ⚧ Genres possibles
const genderOptions = [
  { label: t('user.gender_male'), value: 1 },
  { label: t('user.gender_female'), value: 2 },
  { label: t('user.gender_unknown'), value: 0 }
]

// 🔁 Synchronisation des données du parent
watch(
  () => props.userData,
  (newData) => {
    if (newData) formData.value = { ...newData }
  },
  { deep: true, immediate: true }
)

const formRef = ref(null)

// 💾 Soumission du formulaire
const handleSubmit = () => {
  formRef.value.validate().then((success) => {
    if (success) emit('submit', formData.value)
  })
}

// ❌ Fermeture du dialogue
const handleClose = () => {
  visible.value = false
}
</script>
