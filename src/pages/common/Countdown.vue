<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-6 flex flex-col items-center justify-center">
    
    <BaseHeader title="Focus Mode" />

    <main class="w-full max-w-lg">
      <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 md:p-14 border border-slate-100 dark:border-slate-800 flex flex-col items-center">
        
        <!-- 環形進度條 -->
        <div class="relative w-64 h-64 mb-12 flex items-center justify-center">
          <svg class="w-full h-full -rotate-90 transform">
            <circle
              cx="128" cy="128" r="120"
              class="stroke-slate-100 dark:stroke-slate-800 fill-none"
              stroke-width="8"
            />
            <circle
              cx="128" cy="128" r="120"
              class="stroke-indigo-500 fill-none transition-all duration-1000 ease-linear"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="754"
              :stroke-dashoffset="754 - (754 * progress) / 100"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-6xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight">
              {{ formatTime(time) }}
            </span>
            <span class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Remaining</span>
          </div>
        </div>

        <!-- 快速設定按鈕 -->
        <div class="flex gap-3 mb-10 overflow-x-auto w-full justify-center no-scrollbar">
          <button 
            v-for="preset in presets" :key="preset.val"
            @click="setPreset(preset.val)"
            class="px-5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold border border-transparent hover:border-indigo-500/50 transition-all shrink-0"
          >
            {{ preset.label }}
          </button>
        </div>

        <!-- 自定義輸入區 -->
        <div class="w-full space-y-8">
          <div class="group relative">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">設定秒數 Timer Duration</label>
            <div class="relative">
              <input
                type="number"
                v-model.number="inputTime"
                class="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-xl font-bold dark:text-white"
                placeholder="輸入秒數..."
              />
              <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Sec</span>
            </div>
          </div>

          <!-- 控制按鈕 -->
          <div class="flex gap-4">
            <button 
              v-if="!timer"
              @click="start" 
              class="flex-1 py-5 rounded-3xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-lg shadow-xl shadow-indigo-500/30 active:scale-95 transition-all"
            >
              開始記錄
            </button>
            <button 
              v-else
              @click="pause" 
              class="flex-1 py-5 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
            >
              暫停
            </button>
            <button 
              @click="reset" 
              class="px-8 py-5 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all border border-slate-200 dark:border-slate-700"
            >
              重置
            </button>
          </div>
        </div>
      </div>
      
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import BaseHeader from '@/components/BaseHeader.vue'
const { show } = useAlert()
const time = ref<number>(0)
const inputTime = ref<number>(60)
const initialTime = ref<number>(60)
let timer: ReturnType<typeof setInterval> | null = null

const presets = [
  { label: '1 分鐘', val: 60 },
  { label: '5 分鐘', val: 300 },
  { label: '15 分鐘', val: 900 },
  { label: '25 分鐘', val: 1500 },
]

const progress = computed(() => {
  if (initialTime.value === 0) return 100
  return (time.value / initialTime.value) * 100
})

const setPreset = (val: number) => {
  reset()
  inputTime.value = val
  time.value = val
  initialTime.value = val
}

const start = (): void => {
  if (timer) return
  if (time.value <= 0) {
    time.value = inputTime.value
    initialTime.value = inputTime.value
  }

  timer = setInterval(() => {
    if (time.value > 0) {
      time.value--
    } else {
      stopTimer()
      show('時間到！', 'warning')
    }
  }, 1000)
}

const pause = (): void => {
  stopTimer()
}

const reset = (): void => {
  stopTimer()
  time.value = inputTime.value
  initialTime.value = inputTime.value
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 監聽輸入秒數，當計時器未執行時同步更新顯示時間
watch(inputTime, (newVal) => {
  if (!timer) {
    time.value = newVal
    initialTime.value = newVal
  }
})

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>