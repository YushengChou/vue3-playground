<template>
  <transition name="fade-scale">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩層 -->
      <div
        class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        @click="close"
      ></div>

      <!-- 中間 alert -->
      <div
        :class="[
          'relative pointer-events-auto max-w-sm w-full px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border flex justify-between items-center',
          typeClass
        ]"
      >
        <span class="text-sm font-medium">{{ message }}</span>
        <button
          @click="close"
          class="
            ml-4 w-6 h-6 flex items-center justify-center 
            rounded-full 
            bg-white/20 dark:bg-gray-700/30 
            text-gray-800 dark:text-white 
            hover:bg-white/40 dark:hover:bg-gray-600 
            shadow-sm
            transition-all duration-200
          "
        >
          ×
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
}>()

const visible = ref(true)

const typeClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-white/80 dark:bg-green-700/80 border-green-400 text-green-800 dark:text-white'
    case 'error':
      return 'bg-white/80 dark:bg-red-700/80 border-red-400 text-red-800 dark:text-white'
    case 'warning':
      return 'bg-white/80 dark:bg-yellow-600/80 border-yellow-400 text-yellow-800 dark:text-black'
    default:
      return 'bg-white/80 dark:bg-blue-700/80 border-blue-400 text-blue-800 dark:text-white'
  }
})

const close = () => {
  visible.value = false
  // 等待 0.3s 退場動畫結束後，通知外部完全銷毀組件
  setTimeout(() => {
    if (props.onClose) props.onClose()
  }, 300)
}

if (props.duration) {
  setTimeout(() => {
    close()
  }, props.duration)
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>