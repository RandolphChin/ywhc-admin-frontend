<template>
  <q-dialog v-model="visible" persistent class="edit-dialog">
    <q-card class="dialog-card" style="min-width: 800px; max-width: 1200px; max-height: 90vh">
      <!-- 🧩 En-tête -->
      <q-card-section class="dialog-header">
        <div class="flex items-center justify-between">
          <div class="text-h6">
            {{ isEdit ? t('system.menu.editMenu') : t('system.menu.addMenu') }}
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
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- 🧾 Formulaire -->
      <q-card-section class="dialog-content">
        <div class="edit-form">
          <q-form ref="formRef" @submit="handleSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">

              <!-- Menu parent -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('system.menu.parentMenu') }} :</span>
                  <q-select
                    v-model="formData.parentId"
                    :options="parentMenuOptions"
                    :placeholder="t('system.menu.parentMenu')"
                    outlined
                    dense
                    emit-value
                    map-options
                    :rules="[rules.required(t('system.menu.parentMenu'))]"
                    clearable
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Type -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('system.menu.type') }} :</span>
                  <q-select
                    v-model="formData.menuType"
                    :options="typeOptions"
                    :placeholder="t('system.menu.type')"
                    outlined
                    dense
                    emit-value
                    map-options
                    @update:model-value="onTypeChange"
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Nom -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('system.menu.name') }} :</span>
                  <q-input
                    v-model="formData.menuName"
                    :placeholder="t('system.menu.name')"
                    :rules="[rules.required(t('system.menu.name'))]"
                    outlined
                    dense
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Chemin -->
              <div v-if="formData.menuType !== 2" class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('common.path') }} :</span>
                  <q-input
                    v-model="formData.path"
                    :placeholder="t('common.path')"
                    :rules="[rules.required(t('common.path'))]"
                    outlined
                    dense
                    class="field-input"
                    :hint="t('system.menu.pathHint')"
                  />
                </div>
              </div>

              <!-- Composant -->
              <div v-if="formData.menuType === 1" class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('common.component') }} :</span>
                  <q-input
                    v-model="formData.component"
                    :placeholder="t('common.component')"
                    :rules="[rules.required(t('common.component'))]"
                    outlined
                    dense
                    class="field-input"
                    :hint="t('system.menu.componentHint')"
                  />
                </div>
              </div>

              <!-- Permission -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('common.permission') }} :</span>
                  <q-input
                    v-model="formData.permission"
                    :placeholder="t('common.permission')"
                    :rules="[rules.required(t('common.permission'))]"
                    outlined
                    dense
                    class="field-input"
                    :hint="t('system.menu.permissionHint')"
                  />
                </div>
              </div>

              <!-- Icône -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.icon') }} :</span>
                  <IconSelector v-model="formData.icon" class="field-input" />
                </div>
              </div>

              <!-- Ordre -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label required">{{ t('common.sortOrder') }} :</span>
                  <q-input
                    v-model.number="formData.sortOrder"
                    :placeholder="t('common.sortOrder')"
                    type="number"
                    :rules="[rules.required(t('common.sortOrder')), rules.sortOrder]"
                    outlined
                    dense
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Statut -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.status') }} :</span>
                  <q-select
                    v-model="formData.status"
                    :options="statusOptions"
                    :placeholder="t('common.status')"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Visibilité -->
              <div class="col-12 col-md-6">
                <div class="edit-field-inline">
                  <span class="field-label">{{ t('common.visibility') }} :</span>
                  <q-select
                    v-model="formData.isVisible"
                    :options="visibleOptions"
                    :placeholder="t('common.visibility')"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Remarques -->
              <div class="col-12">
                <div class="edit-field-block">
                  <div class="field-label q-mb-xs">{{ t('common.remark') }} :</div>
                  <q-input
                    v-model="formData.remark"
                    :placeholder="t('common.remark')"
                    type="textarea"
                    outlined
                    dense
                    rows="3"
                    class="field-input"
                  />
                </div>
              </div>

            </div>
          </q-form>
        </div>
      </q-card-section>

      <q-separator />

      <!-- 🧭 Pied de dialogue -->
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
import { useI18n } from 'vue-i18n'
import IconSelector from '@/components/IconSelector.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  menuData: { type: Object, default: () => ({}) },
  isEdit: Boolean,
  parentMenuOptions: { type: Array, default: () => [] },
  isReadonly: Boolean
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const submitting = ref(false)

const formData = ref({
  id: null,
  parentId: null,
  menuType: 0,
  menuName: '',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sortOrder: 0,
  status: 1,
  isVisible: 1,
  remark: ''
})

const rules = {
  required: (fieldName) => (val) => !!val || t('validation.required', { field: fieldName }),
  sortOrder: (val) => /^(0|[1-9]\\d*)$/.test(val) || t('validation.sortOrder')
}

const typeOptions = [
  { label: t('system.menu.dir'), value: 0 },
  { label: t('system.menu.menu'), value: 1 },
  { label: t('system.menu.button'), value: 2 }
]

const statusOptions = [
  { label: t('common.enabled'), value: 1 },
  { label: t('common.disabled'), value: 0 }
]

const visibleOptions = [
  { label: t('common.visible'), value: 1 },
  { label: t('common.hidden'), value: 0 }
]

watch(() => props.menuData, (newData) => {
  if (newData) formData.value = { ...newData }
}, { deep: true, immediate: true })

const onTypeChange = (menuType) => {
  if (menuType === 2) {
    formData.value.path = ''
    formData.value.component = ''
    formData.value.isVisible = 1
  } else {
    formData.value.permission = ''
  }
}

const formRef = ref(null)

const handleSubmit = () => {
  formRef.value.validate().then((success) => {
    if (success) emit('submit', formData.value)
  })
}

const handleClose = () => {
  visible.value = false
}
</script>
