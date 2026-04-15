<template>
  <div
    class="
      min-h-screen flex items-center justify-center p-5
      bg-gray-100 dark:bg-gray-700
    "
  >
  <div class="flex flex-col items-center justify-center p-6 bg-white/25 dark:bg-[rgba(30,41,59,0.4)] rounded-2xl shadow-lg w-80">
    <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">{{ formatTime(time) }}</h1>

    <div class="flex items-center gap-2 mb-6">
      <input
        type="number"
        v-model.number="inputTime"
        placeholder="秒數"
        class="w-30 p-4 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>

    <div class="flex gap-2">
      <button @click="start" class="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white">開始</button>
      <button @click="pause" class="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white">暫停</button>
      <button @click="reset" class="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white">重設</button>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
const { show } = useAlert()
const time = ref<number>(0)
const inputTime = ref<number>(60)
let timer: ReturnType<typeof setInterval> | null = null

// 開始倒數
const start = (): void => {
  if (timer) return
  if (time.value === 0) time.value = inputTime.value

  timer = setInterval(() => {
    if (time.value > 0) {
      time.value--
    } else {
      clearInterval(timer!)
      timer = null
      show('時間到！', 'warning')
    }
  }, 1000)
}

// 暫停
const pause = (): void => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 重設
const reset = (): void => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  time.value = inputTime.value
}

// 格式化秒數 → mm:ss
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 組件卸載清除 timer
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>