<template>
  <q-select
    v-model="modelValue"
    :options="dictOptions"
    :label="label"
    :outlined="outlined"
    :dense="dense"
    :clearable="clearable"
    :loading="loading"
    :disable="disable"
    emit-value
    map-options
    v-bind="$attrs"
    @update:model-value="handleUpdate"
  >
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </q-select>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDictionary } from 'src/utils/dict'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  dictType: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  outlined: {
    type: Boolean,
    default: true
  },
  dense: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disable: {
    type: Boolean,
    default: false
  },
  includeAll: {
    type: Boolean,
    default: false
  },
  allLabel: {
    type: String,
    default: '全部'
  },
  allValue: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const { getDictOptions } = useDictionary()

const loading = ref(false)
const dictOptions = ref([])

const loadDictOptions = async () => {
  if (!props.dictType) return
  
  loading.value = true
  try {
    const options = await getDictOptions(props.dictType, {
      includeAll: props.includeAll,
      allLabel: props.allLabel,
      allValue: props.allValue
    })
    dictOptions.value = options
  } catch (error) {
    console.error('加载字典选项失败:', error)
  } finally {
    loading.value = false
  }
}

const handleUpdate = (value) => {
  emit('update:modelValue', value)
}

watch(() => props.dictType, loadDictOptions, { immediate: true })

onMounted(() => {
  loadDictOptions()
})
</script>

<style lang="scss" scoped>
</style>
