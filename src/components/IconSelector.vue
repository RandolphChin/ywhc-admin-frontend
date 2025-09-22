<template>
  <div class="icon-selector">
    <q-input
      :model-value="modelValue"
      placeholder="选择图标"
      outlined
      dense
      readonly
      @click="showDialog = true"
    >
      <template v-slot:prepend>
        <q-icon 
          v-if="modelValue" 
          :name="modelValue" 
          size="sm"
        />
      </template>
      <template v-slot:append>
        <q-btn 
          flat 
          round 
          dense 
          icon="search"
          @click="showDialog = true"
        />
      </template>
    </q-input>

    <q-dialog v-model="showDialog" class="icon-dialog">
      <q-card style="min-width: 600px; max-width: 800px; max-height: 80vh">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">选择图标</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="searchText"
            placeholder="搜索图标..."
            outlined
            dense
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="icon-grid-container">
          <div class="icon-grid">
            <div
              v-for="icon in filteredIcons"
              :key="icon"
              class="icon-item"
              :class="{ active: modelValue === icon }"
              @click="selectIcon(icon)"
            >
              <q-icon :name="icon" size="24px" />
              <div class="icon-name">{{ icon }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="清除" @click="clearIcon" />
          <q-btn flat label="取消" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const showDialog = ref(false)
const searchText = ref('')

// 常用的 Material Icons
const commonIcons = [
  'home', 'dashboard', 'menu', 'settings', 'person', 'group', 'admin_panel_settings',
  'security', 'lock', 'key', 'visibility', 'visibility_off', 'edit', 'delete',
  'add', 'remove', 'save', 'cancel', 'check', 'close', 'search', 'filter_list',
  'sort', 'refresh', 'sync', 'download', 'upload', 'file_copy', 'folder',
  'folder_open', 'description', 'article', 'note', 'bookmark', 'star',
  'favorite', 'thumb_up', 'thumb_down', 'share', 'print', 'email', 'phone',
  'location_on', 'event', 'schedule', 'today', 'date_range', 'access_time',
  'alarm', 'notifications', 'message', 'chat', 'comment', 'help', 'info',
  'warning', 'error', 'check_circle', 'cancel', 'block', 'report', 'flag',
  'shopping_cart', 'store', 'payment', 'credit_card', 'account_balance',
  'trending_up', 'trending_down', 'bar_chart', 'pie_chart', 'show_chart',
  'table_chart', 'assessment', 'analytics', 'insights', 'speed', 'build',
  'construction', 'handyman', 'engineering', 'science', 'psychology',
  'school', 'library_books', 'quiz', 'assignment', 'grade', 'workspace_premium',
  'verified', 'new_releases', 'update', 'history', 'restore', 'backup',
  'cloud', 'cloud_upload', 'cloud_download', 'wifi', 'signal_wifi_off',
  'bluetooth', 'devices', 'computer', 'phone_android', 'tablet', 'watch',
  'tv', 'speaker', 'headphones', 'camera', 'photo_camera', 'videocam',
  'mic', 'volume_up', 'volume_off', 'play_arrow', 'pause', 'stop',
  'skip_next', 'skip_previous', 'fast_forward', 'fast_rewind', 'repeat',
  'shuffle', 'playlist_play', 'queue_music', 'library_music', 'album',
  'radio', 'podcasts', 'sports_esports', 'casino', 'celebration', 'cake',
  'local_dining', 'restaurant', 'local_cafe', 'local_bar', 'wine_bar',
  'local_pizza', 'fastfood', 'icecream', 'local_grocery_store', 'shopping_bag',
  'local_shipping', 'local_taxi', 'directions_car', 'directions_bus',
  'train', 'flight', 'hotel', 'place', 'map', 'explore', 'compass_calibration',
  'gps_fixed', 'my_location', 'near_me', 'directions', 'navigation',
  'zoom_in', 'zoom_out', 'fullscreen', 'fullscreen_exit', 'aspect_ratio',
  'crop', 'rotate_left', 'rotate_right', 'flip', 'tune', 'palette',
  'color_lens', 'brush', 'format_paint', 'text_fields', 'title', 'format_bold',
  'format_italic', 'format_underlined', 'format_size', 'format_color_text',
  'format_align_left', 'format_align_center', 'format_align_right', 'format_list_bulleted',
  'format_list_numbered', 'format_quote', 'link', 'insert_link', 'image',
  'insert_photo', 'video_library', 'movie', 'slideshow', 'view_list',
  'view_module', 'view_quilt', 'view_stream', 'view_carousel', 'grid_view',
  'apps', 'widgets', 'extension', 'puzzle', 'category', 'label', 'local_offer',
  'sell', 'loyalty', 'card_giftcard', 'redeem', 'monetization_on', 'attach_money',
  'euro', 'currency_yen', 'currency_pound', 'account_balance_wallet', 'savings',
  'request_quote', 'receipt', 'point_of_sale', 'inventory', 'warehouse'
]

const filteredIcons = computed(() => {
  if (!searchText.value) {
    return commonIcons
  }
  return commonIcons.filter(icon => 
    icon.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const selectIcon = (icon) => {
  emit('update:modelValue', icon)
  showDialog.value = false
}

const clearIcon = () => {
  emit('update:modelValue', '')
  showDialog.value = false
}
</script>

<style scoped>
.icon-grid-container {
  max-height: 400px;
  overflow-y: auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  padding: 8px 0;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 70px;
}

.icon-item:hover {
  background-color: #f5f5f5;
  border-color: #1976d2;
}

.icon-item.active {
  background-color: #e3f2fd;
  border-color: #1976d2;
  color: #1976d2;
}

.icon-name {
  font-size: 10px;
  text-align: center;
  margin-top: 4px;
  word-break: break-all;
  line-height: 1.2;
}
</style>