<template>
  <div
    class="row items-center justify-start full-width"
    v-if="pagination.rowsNumber > 0"
  >
    <!-- Nombre total d’enregistrements -->
    <div class="q-mr-md">
      {{ t('common.totalRecords', { count: pagination.rowsNumber }) }}
    </div>

    <!-- Pagination -->
    <div class="row items-center">
      <div class="row items-center q-gutter-sm">
        <span>{{ t('common.perPagePrefix') }}</span>
        <q-select
          :model-value="pagination.rowsPerPage"
          :options="rowsPerPageOptions"
          dense
          outlined
          class="ultra-compact-select"
          @update:model-value="handleRowsPerPageChange"
        />
        <span>{{ t('common.perPageSuffix') }}</span>
      </div>

      <q-pagination
        :model-value="pagination.page"
        :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
        @update:model-value="handlePageChange"
        direction-links
        boundary-links
        :max-pages="5"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value &&
        typeof value.page === 'number' &&
        typeof value.rowsPerPage === 'number' &&
        (typeof value.rowsNumber === 'number' ||
          (typeof value.rowsNumber === 'string' &&
            !isNaN(Number(value.rowsNumber))))
      )
    },
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 20, 50, 100],
  },
})

const emit = defineEmits(['rows-per-page-change', 'page-change'])

const handleRowsPerPageChange = (newRowsPerPage) => {
  emit('rows-per-page-change', newRowsPerPage)
}

const handlePageChange = (newPage) => {
  emit('page-change', newPage)
}
</script>

<style lang="scss" scoped>
.ultra-compact-select {
  width: 80px;
}
</style>
