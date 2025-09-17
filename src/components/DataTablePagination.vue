<template>
  <div class="row items-center justify-start full-width" v-if="pagination.rowsNumber > 0">
    <div class="q-mr-md">
      共 {{ pagination.rowsNumber }} 条记录
    </div>
    <div class="row items-center">
      <div class="row items-center q-gutter-sm">
        <span>每页显示</span>
        <q-select
          :model-value="pagination.rowsPerPage"
          :options="rowsPerPageOptions"
          dense
          outlined
          class="ultra-compact-select"
          @update:model-value="handleRowsPerPageChange"
        />
        <span>条</span>
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
// import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && 
             typeof value.page === 'number' &&
             typeof value.rowsPerPage === 'number' &&
             (typeof value.rowsNumber === 'number' || 
              (typeof value.rowsNumber === 'string' && !isNaN(Number(value.rowsNumber))))
    }
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 20, 50, 100]
  }
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

</style>
