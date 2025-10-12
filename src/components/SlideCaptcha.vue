<template>
  <div class="slide-captcha-container">
    <div class="captcha-wrapper">
      <!-- 🖼️ Conteneur de l’image d’arrière-plan -->
      <div class="captcha-bg" ref="captchaBg">
        <img 
          v-if="backgroundImage" 
          :src="backgroundImage" 
          :alt="t('captcha.title')"
          @load="onImageLoad"
          class="bg-image"
        />

        <!-- 🧩 Pièce de puzzle -->
        <div 
          class="puzzle-piece" 
          ref="puzzlePiece"
          :style="{ left: buttonLeft + 'px', top: puzzleTop + 'px' }"
          v-show="puzzleImage"
        >
          <img 
            v-if="puzzleImage" 
            :src="puzzleImage" 
            alt="Pièce du puzzle"
            class="puzzle-image"
          />
        </div>
      </div>
      
      <!-- 🎚️ Piste de glissement -->
      <div class="slide-track" ref="slideTrack">
        <div class="slide-track-bg">
          <span class="slide-text" :class="{ success: isSuccess, error: isError }">
            {{ slideText }}
          </span>
        </div>

        <!-- 🔘 Bouton de glissement -->
        <div 
          class="slide-button" 
          ref="slideButton"
          :class="{ 
            dragging: isDragging, 
            success: isSuccess, 
            error: isError 
          }"
          :style="{ left: buttonLeft + 'px' }"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <q-icon 
            :name="getButtonIcon" 
            :class="{ 'rotate-icon': isDragging && !isSuccess && !isError }"
          />
        </div>
      </div>

      <!-- 🔄 Bouton de rafraîchissement -->
      <div class="refresh-btn" @click="refreshCaptcha" :title="t('captcha.refresh')">
        <q-icon name="refresh" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { api } from 'src/boot/axios'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['success', 'error', 'refresh'])

// ⚙️ Correction du système de coordonnées
const VISUAL_ALIGNMENT_OFFSET = 3

// Données réactives
const captchaBg = ref<HTMLElement | null>(null)
const puzzlePiece = ref<HTMLElement | null>(null)
const slideTrack = ref<HTMLElement | null>(null)
const slideButton = ref<HTMLElement | null>(null)

const backgroundImage = ref('')
const puzzleImage = ref('')
const puzzleLeft = ref(0)
const puzzleTop = ref(0)
const buttonLeft = ref(0)
const isDragging = ref(false)
const isSuccess = ref(false)
const isError = ref(false)
const captchaId = ref('')
const trackWidth = ref(300)
const buttonWidth = ref(40)

// Données de glissement
const startX = ref(0)
const startButtonLeft = ref(0)
const dragTrack = ref<{x:number, y:number, time:number}[]>([])
const startTime = ref(0)

// Texte dynamique i18n
const slideText = computed(() => {
  if (isSuccess.value) return t('captcha.success')
  if (isError.value) return t('captcha.failed')
  return t('captcha.slide')
})

const getButtonIcon = computed(() => {
  if (isSuccess.value) return 'check'
  if (isError.value) return 'close'
  return 'arrow_forward_ios'
})

// Récupération du captcha
const getCaptcha = async () => {
  try {
    const response = await api.get('/captcha/slide/generate')
    const data = response.data.data || response.data
    
    backgroundImage.value = `data:image/png;base64,${data.backgroundImage}`
    puzzleImage.value = `data:image/png;base64,${data.puzzleImage}`
    puzzleLeft.value = data.puzzleX
    puzzleTop.value = data.puzzleY
    captchaId.value = data.captchaId
    
    resetState()
  } catch (error) {
    console.error('Erreur lors du chargement du captcha:', error)
    emit('error', t('captcha.load_error'))
  }
}

// Réinitialisation
const resetState = () => {
  buttonLeft.value = 0
  isDragging.value = false
  isSuccess.value = false
  isError.value = false
  dragTrack.value = []
}

// Image chargée
const onImageLoad = async () => {
  await nextTick()
  if (slideTrack.value) {
    trackWidth.value = slideTrack.value.offsetWidth
    buttonWidth.value = slideButton.value?.offsetWidth || 40
  }
}

// Début du drag
const startDrag = (event: MouseEvent | TouchEvent) => {
  if (isSuccess.value || isError.value) return
  
  event.preventDefault()
  isDragging.value = true
  startTime.value = Date.now()
  
  const clientX = event.type === 'touchstart'
    ? (event as TouchEvent).touches[0].clientX
    : (event as MouseEvent).clientX
  
  startX.value = clientX
  startButtonLeft.value = buttonLeft.value
  dragTrack.value = [{ x: 0, y: 0, time: 0 }]
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

// Drag en cours
const onDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  event.preventDefault()
  
  const clientX = event.type === 'touchmove'
    ? (event as TouchEvent).touches[0].clientX
    : (event as MouseEvent).clientX
  
  const deltaX = clientX - startX.value
  const newLeft = Math.max(0, Math.min(startButtonLeft.value + deltaX, trackWidth.value - buttonWidth.value))
  buttonLeft.value = newLeft
  
  dragTrack.value.push({ x: newLeft, y: 0, time: Date.now() - startTime.value })
}

// Fin du drag
const stopDrag = async () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  await verifyCaptcha()
}

// Vérification du captcha
const verifyCaptcha = async () => {
  try {
    const correctedSlideX = buttonLeft.value + VISUAL_ALIGNMENT_OFFSET
    const response = await api.post('/captcha/slide/verify', {
      captchaId: captchaId.value,
      slideX: correctedSlideX,
      track: dragTrack.value
    })
    
    const verifyResult = response.data.data
    if (verifyResult?.success) {
      isSuccess.value = true
      emit('success', { captchaId: captchaId.value, token: verifyResult.token })
    } else {
      isError.value = true
      setTimeout(refreshCaptcha, 1000)
      emit('error', verifyResult?.message || t('captcha.failed'))
    }
  } catch (error) {
    console.error('Erreur de vérification:', error)
    isError.value = true
    setTimeout(refreshCaptcha, 1000)
    emit('error', t('captcha.verify_error'))
  }
}

// Rafraîchir le captcha
const refreshCaptcha = () => {
  resetState()
  getCaptcha()
  emit('refresh')
}

// Lifecycle
onMounted(() => getCaptcha())
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style lang="scss" scoped>
.slide-captcha-container {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.captcha-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

/* 🖼️ Zone d’image du captcha */
.captcha-bg {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: #f0f0f0;
  
  .bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

/* 🧩 Pièce du puzzle */
.puzzle-piece {
  position: absolute;
  z-index: 2;
  width: 50px;
  height: 50px;
  
  .puzzle-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

/* 🎚️ Piste de glissement */
.slide-track {
  position: relative;
  height: 40px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.slide-track-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #e9ecef 0%, #f8f9fa 100%);
}

/* 📝 Texte de la piste */
.slide-text {
  font-size: 14px;
  color: #6c757d;
  user-select: none;
  transition: color 0.3s ease;
  
  &.success {
    color: #28a745;
  }
  
  &.error {
    color: #dc3545;
  }
}

/* 🔘 Bouton de glissement */
.slide-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid #007bff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  z-index: 3;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.dragging {
    background: #007bff;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }
  
  &.success {
    background: #28a745;
    border-color: #28a745;
    color: white;
  }
  
  &.error {
    background: #dc3545;
    border-color: #dc3545;
    color: white;
  }
  
  .q-icon {
    font-size: 16px;
    transition: transform 0.3s ease;
  }
  
  .rotate-icon {
    animation: rotate 1s linear infinite;
  }
}

/* 🔄 Bouton de rafraîchissement */
.refresh-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
}

/* 🔁 Animation de rotation */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 📱 Responsive */
@media (max-width: 480px) {
  .slide-captcha-container {
    max-width: 280px;
  }
  
  .captcha-bg {
    height: 120px;
  }
  
  .slide-track {
    height: 36px;
  }
  
  .slide-button {
    width: 36px;
    height: 36px;
  }
}
</style>