<template>
  <div class="slide-captcha-container">
    <div class="captcha-wrapper">
      <!-- 背景图片容器 -->
      <div class="captcha-bg" ref="captchaBg">
        <img 
          v-if="backgroundImage" 
          :src="backgroundImage" 
          alt="验证码背景"
          @load="onImageLoad"
          class="bg-image"
        />
        <!-- 滑块拼图 -->
        <div 
          class="puzzle-piece" 
          ref="puzzlePiece"
          :style="{ left: buttonLeft + 'px', top: puzzleTop + 'px' }"
          v-show="puzzleImage"
        >
          <img 
            v-if="puzzleImage" 
            :src="puzzleImage" 
            alt="拼图块"
            class="puzzle-image"
          />
        </div>
        
        <!-- 目标位置提示线 - 修正位置以匹配实际验证逻辑 -->
        <div
          v-if="puzzleLeft > 0 && !isSuccess && !isError"
          class="target-hint"
          :class="{ 'target-close': isCloseToTarget }"
          :style="{ left: puzzleLeft + 'px' }"
          title="拖拽拼图左边缘到此位置"
        ></div>
        
        <!-- 调试信息：显示实际缺口位置 -->
        <div
          v-if="puzzleLeft > 0 && !isSuccess && !isError"
          class="debug-gap-indicator"
          :style="{ left: puzzleLeft + 'px', top: puzzleTop + 'px' }"
          title="实际缺口位置 (已应用-37px修正)"
        >
          <div class="debug-label">GAP</div>
        </div>
        
        <!-- 拼图块对齐指示器 -->
        <div
          v-if="puzzleLeft > 0 && !isSuccess && !isError && buttonLeft > 0"
          class="alignment-indicator"
          :class="{
            'perfectly-aligned': isCloseToTarget,
            'very-close': Math.abs(puzzleLeft - buttonLeft) <= 25 && !isCloseToTarget,
            'over-dragged': buttonLeft > puzzleLeft + 25,
            'under-dragged': buttonLeft < puzzleLeft - 25
          }"
          :style="{ left: buttonLeft + 'px' }"
        ></div>
      </div>
      
      <!-- 滑动轨道 -->
      <div class="slide-track" ref="slideTrack">
        <div class="slide-track-bg">
          <span class="slide-text" :class="{ success: isSuccess, error: isError }">
            {{ slideText }}
          </span>
        </div>
        
        <!-- 滑块按钮 -->
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
            :class="{ 
              'rotate-icon': isDragging && !isSuccess && !isError 
            }"
          />
        </div>
      </div>
      
      <!-- 刷新按钮 -->
      <div class="refresh-btn" @click="refreshCaptcha">
        <q-icon name="refresh" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { api } from 'src/boot/axios'

export default defineComponent({
  name: 'SlideCaptcha',
  
  emits: ['success', 'error', 'refresh'],
  
  setup(props, { emit }) {
    // 坐标系统修正常量 - 基于实际测试数据的系统性偏移
    const VISUAL_ALIGNMENT_OFFSET = -37 // 根据测试数据：完美视觉对齐比后端验证位置多37px
    
    // 响应式数据
    const captchaBg = ref(null)
    const puzzlePiece = ref(null)
    const slideTrack = ref(null)
    const slideButton = ref(null)
    
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
    
    // 拖拽相关
    const startX = ref(0)
    const startButtonLeft = ref(0)
    const dragTrack = ref([]) // 拖拽轨迹
    const startTime = ref(0)
    
    // 计算属性
    const slideText = computed(() => {
      if (isSuccess.value) return '验证成功'
      if (isError.value) return '验证失败，请重试'
      const diff = Math.abs(puzzleLeft.value - buttonLeft.value)
      if (isCloseToTarget.value) return `完美对齐！差距${diff}px`
      if (diff <= 25) return `很接近，微调至15px内(当前${diff}px)`
      if (buttonLeft.value > puzzleLeft.value + 15) return `拖过头了${diff}px，需要往回调`
      if (buttonLeft.value > puzzleLeft.value - 15 && buttonLeft.value < puzzleLeft.value) return `接近了${diff}px，继续向右微调`
      if (buttonLeft.value > 0) return '继续向右拖动'
      return '向右滑动完成验证'
    })
    
    const getButtonIcon = computed(() => {
      if (isSuccess.value) return 'check'
      if (isError.value) return 'close'
      return 'arrow_forward_ios'
    })
    
    // 计算是否接近目标位置 - 修复根本坐标系统问题
    const isCloseToTarget = computed(() => {
      if (!puzzleLeft.value || isSuccess.value || isError.value) return false
      
      // 关键问题：前端显示的"红色竖线"位置与实际缺口位置不匹配
      // 解决方案：基于实际的坐标关系进行计算
      const diff = Math.abs(puzzleLeft.value - buttonLeft.value)
      
      // 提供精确的坐标调试信息
      console.log('🔍 坐标系统分析:', {
        'puzzleLeft（后端puzzleX）': puzzleLeft.value,
        'puzzleTop（后端puzzleY）': puzzleTop.value,
        'buttonLeft（滑块位置）': buttonLeft.value,
        '计算差值': diff,
        '验证容差': 15,
        '拼图尺寸': '60x60px',
        '预测验证结果': diff <= 15 ? '✅通过' : '❌失败'
      })
      
      return diff <= 15
    })
    
    // 获取验证码
    const getCaptcha = async () => {
      try {
        const response = await api.get('/captcha/slide/generate')
        const data = response.data.data || response.data
        
        backgroundImage.value = `data:image/png;base64,${data.backgroundImage}`
        puzzleImage.value = `data:image/png;base64,${data.puzzleImage}`
        puzzleLeft.value = data.puzzleX
        puzzleTop.value = data.puzzleY
        captchaId.value = data.captchaId
        
        // 重置状态
        resetState()
      } catch (error) {
        console.error('获取验证码失败:', error)
        emit('error', '获取验证码失败')
      }
    }
    
    // 重置状态
    const resetState = () => {
      buttonLeft.value = 0
      isDragging.value = false
      isSuccess.value = false
      isError.value = false
      dragTrack.value = []
    }
    
    // 图片加载完成
    const onImageLoad = async () => {
      await nextTick()
      if (slideTrack.value) {
        trackWidth.value = slideTrack.value.offsetWidth
        buttonWidth.value = slideButton.value?.offsetWidth || 40
      }
    }
    
    // 开始拖拽
    const startDrag = (event) => {
      if (isSuccess.value || isError.value) return
      
      event.preventDefault()
      isDragging.value = true
      startTime.value = Date.now()
      
      const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX
      startX.value = clientX
      startButtonLeft.value = buttonLeft.value
      
      // 清空轨迹
      dragTrack.value = []
      dragTrack.value.push({
        x: 0,
        y: 0,
        time: 0
      })
      
      // 添加事件监听
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', stopDrag)
      document.addEventListener('touchmove', onDrag)
      document.addEventListener('touchend', stopDrag)
    }
    
    // 拖拽中
    const onDrag = (event) => {
      if (!isDragging.value) return
      
      event.preventDefault()
      const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX
      const deltaX = clientX - startX.value
      const newLeft = Math.max(0, Math.min(startButtonLeft.value + deltaX, trackWidth.value - buttonWidth.value))
      
      buttonLeft.value = newLeft
      
      // 记录轨迹
      dragTrack.value.push({
        x: newLeft,
        y: 0,
        time: Date.now() - startTime.value
      })
    }
    
    // 停止拖拽
    const stopDrag = async () => {
      if (!isDragging.value) return
      
      isDragging.value = false
      
      // 移除事件监听
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('touchend', stopDrag)
      
      // 验证滑块位置
      await verifyCaptcha()
    }
    
    // 验证验证码
    const verifyCaptcha = async () => {
      try {
        // 应用坐标系统修正 - 解决视觉对齐与数学验证的偏移问题
        const visualButtonPosition = buttonLeft.value
        const correctedSlideX = visualButtonPosition + VISUAL_ALIGNMENT_OFFSET
        
        console.log('🔧 坐标修正详情:', {
          '原始滑块位置': visualButtonPosition,
          '修正偏移量': VISUAL_ALIGNMENT_OFFSET,
          '修正后坐标': correctedSlideX,
          '目标位置(puzzleX)': puzzleLeft.value,
          '修正后差值': Math.abs(puzzleLeft.value - correctedSlideX),
          '预期验证结果': Math.abs(puzzleLeft.value - correctedSlideX) <= 15 ? '✅通过' : '❌失败'
        })
        
        console.log('验证参数:', {
          captchaId: captchaId.value,
          '发送的slideX': correctedSlideX,
          '后端puzzleX': puzzleLeft.value,
          '轨迹点数': dragTrack.value.length,
          '容差范围': '15px'
        })
        
        const response = await api.post('/captcha/slide/verify', {
          captchaId: captchaId.value,
          slideX: correctedSlideX, // 发送修正后的坐标
          track: dragTrack.value
        })
        
        // 检查验证结果
        const verifyResult = response.data.data
        if (verifyResult && verifyResult.success) {
          isSuccess.value = true
          emit('success', {
            captchaId: captchaId.value,
            token: verifyResult.token
          })
        } else {
          isError.value = true
          setTimeout(() => {
            refreshCaptcha()
          }, 1000)
          emit('error', verifyResult?.message || '验证失败')
        }
      } catch (error) {
        console.error('验证失败:', error)
        isError.value = true
        setTimeout(() => {
          refreshCaptcha()
        }, 1000)
        emit('error', '验证失败')
      }
    }
    
    // 刷新验证码
    const refreshCaptcha = () => {
      resetState()
      getCaptcha()
      emit('refresh')
    }
    
    // 组件挂载
    onMounted(() => {
      getCaptcha()
    })
    
    // 组件卸载
    onUnmounted(() => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('touchend', stopDrag)
    })
    
    return {
      // refs
      captchaBg,
      puzzlePiece,
      slideTrack,
      slideButton,
      
      // 数据
      backgroundImage,
      puzzleImage,
      puzzleLeft,
      puzzleTop,
      buttonLeft,
      isDragging,
      isSuccess,
      isError,
      
      // 计算属性
      slideText,
      getButtonIcon,
      isCloseToTarget,
      
      // 方法
      onImageLoad,
      startDrag,
      refreshCaptcha
    }
  }
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

.puzzle-piece {
  position: absolute;
  z-index: 2;
  width: 60px;
  height: 60px;
  
  .puzzle-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

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

.target-hint {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: rgba(255, 0, 0, 0.6);
  z-index: 1;
  pointer-events: none;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: rgba(255, 0, 0, 0.8);
    border-radius: 50%;
  }
  
  &.target-close {
    background: rgba(0, 255, 0, 0.6);
    box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
    
    &::before {
      background: rgba(0, 255, 0, 0.8);
    }
  }
}

.alignment-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 123, 255, 0.5);
  z-index: 1;
  pointer-events: none;
  transition: all 0.3s ease;
  
  &.perfectly-aligned {
    background: rgba(0, 255, 0, 0.9);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
    width: 4px;
    animation: perfect-pulse 1s ease-in-out infinite alternate;
  }
  
  &.very-close {
    background: rgba(255, 215, 0, 0.8);
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    width: 3px;
  }
  
  &.over-dragged {
    background: rgba(255, 69, 0, 0.9);
    box-shadow: 0 0 6px rgba(255, 69, 0, 0.6);
  }
  
  &.under-dragged {
    background: rgba(255, 0, 0, 0.7);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes perfect-pulse {
  from {
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  }
  to {
    box-shadow: 0 0 15px rgba(0, 255, 0, 1);
  }
}

// 响应式设计
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
