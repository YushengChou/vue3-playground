<template>
  <div class="relative inline-block transition-transform duration-200 ease-out" :style="wrapperStyle">
    <button
      :disabled="disabled"
      :class="[
        'px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 select-none cursor-pointer',
        disabled
          ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-90'
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95'
      ]"
      @mouseenter="handleMouseEnter"
      @click="handleClick"
    >
      <slot>{{ label }}</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    disabled?: boolean
    distance?: number
  }>(),
  {
    label: '按鈕',
    disabled: false,
    distance: 120
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const offsetX = ref(0)
const offsetY = ref(0)

watch(
  () => props.disabled,
  (newVal) => {
    if (!newVal) {
      resetPosition()
    }
  }
)

const wrapperStyle = computed(() => {
  return {
    transform: `translate(${offsetX.value}px, ${offsetY.value}px)`
  }
})

const handleMouseEnter = () => {
  if (!props.disabled) return

  // 隨機角度與距離移動
  const angle = Math.random() * Math.PI * 2
  const moveDist = props.distance + Math.random() * 50

  // 限制最大位移範圍，避免跑太遠消失
  const maxRange = 300
  let newX = offsetX.value + Math.cos(angle) * moveDist
  let newY = offsetY.value + Math.sin(angle) * moveDist

  if (Math.abs(newX) > maxRange) newX = (newX / Math.abs(newX)) * maxRange
  if (Math.abs(newY) > maxRange) newY = (newY / Math.abs(newY)) * maxRange

  offsetX.value = newX
  offsetY.value = newY
}

const handleClick = (e: MouseEvent) => {
  if (!props.disabled) {
    emit('click', e)
  }
}

const resetPosition = () => {
  offsetX.value = 0
  offsetY.value = 0
}

defineExpose({
  resetPosition
})
</script>
