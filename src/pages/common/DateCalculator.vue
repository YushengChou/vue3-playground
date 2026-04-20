<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-500 p-6 md:p-12 flex flex-col items-center">
    
    <BaseHeader title="Temporal System" />

    <main class="w-full max-w-5xl">
      <!-- Title -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">
          日期計算器 <span class="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent italic">DATE</span>
        </h1>
        <div class="w-12 h-1 bg-blue-500 mx-auto rounded-full opacity-20"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        <!-- 卡片 1: 日期差異 -->
        <section class="premium-card">
          <div class="flex items-center gap-4 mb-10">
            <div class="icon-box bg-blue-500/10 text-blue-500">
              <span class="text-xl">📅</span>
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-800 dark:text-white">計算日期差</h2>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Date Difference</p>
            </div>
          </div>

          <div class="space-y-6 mb-12">
            <div class="group">
              <label class="input-label">開始日期 Start Date</label>
              <input v-model="startDate" type="date" class="premium-input" />
            </div>
            <div class="flex justify-center -my-2 opacity-20 transform -rotate-90 lg:rotate-0">
              <span class="text-2xl">⚡</span>
            </div>
            <div class="group">
              <label class="input-label">結束日期 End Date</label>
              <input v-model="endDate" type="date" class="premium-input" />
            </div>
          </div>

          <div class="result-area bg-blue-500/5 border-blue-500/10">
            <div class="flex justify-between items-end mb-6">
              <div>
                <p class="text-[10px] font-black text-blue-500/60 uppercase tracking-widest">Total Days</p>
                <div class="flex items-baseline gap-2">
                  <span class="text-5xl font-black text-slate-800 dark:text-white tabular-nums">{{ diffDays }}</span>
                  <span class="text-sm font-bold text-slate-400">天</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-black text-blue-500/60 uppercase tracking-widest">Detailed</p>
                <p class="text-slate-500 dark:text-slate-400 font-bold text-sm">
                  {{ diffDetail.years }}年 {{ diffDetail.months }}月 {{ diffDetail.days }}天
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 卡片 2: 日期加減 -->
        <section class="premium-card">
          <div class="flex items-center gap-4 mb-10">
            <div class="icon-box bg-indigo-500/10 text-indigo-500">
              <span class="text-xl">🚀</span>
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-800 dark:text-white">日期加減運算</h2>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Date Math</p>
            </div>
          </div>

          <div class="space-y-8 mb-12">
            <div class="group">
              <label class="input-label">基準日期 Base Date</label>
              <input v-model="baseDate" type="date" class="premium-input" />
            </div>
            <div class="group">
              <label class="input-label">偏移天數 Offset (Days)</label>
              <div class="relative">
                <input
                  v-model.number="offsetDays"
                  type="number"
                  class="premium-input pr-16"
                  placeholder="正數為加，負數為減"
                />
                <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">DAYS</span>
              </div>
            </div>
          </div>

          <div class="result-area bg-indigo-500/5 border-indigo-500/10">
            <p class="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest mb-3">Calculation Result</p>
            <div class="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-1">
              {{ resultDate }}
            </div>
            <div class="text-sm font-bold text-indigo-500/70">
              {{ formatWeekDay(resultDate) }}
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import zhTw from 'dayjs/locale/zh-tw'
import BaseHeader from '@/components/BaseHeader.vue'

// 使用最高相容性的載入方式，解決 Vite pre-bundling 的 export 衝突
dayjs.locale((zhTw as any).default || zhTw)

const startDate = ref(dayjs().format('YYYY-MM-DD'))
const endDate = ref(dayjs().add(7, 'day').format('YYYY-MM-DD'))

const baseDate = ref(dayjs().format('YYYY-MM-DD'))
const offsetDays = ref(100)

// 天數差
const diffDays = computed(() => {
  return Math.abs(dayjs(endDate.value).diff(dayjs(startDate.value), 'day'))
})

// 詳細時距差
const diffDetail = computed(() => {
  const start = dayjs(startDate.value)
  const end = dayjs(endDate.value)
  const isReverse = end.isBefore(start)
  
  const dStart = isReverse ? end : start
  const dEnd = isReverse ? start : end

  const years = dEnd.diff(dStart, 'year')
  const afterYears = dStart.add(years, 'year')
  const months = dEnd.diff(afterYears, 'month')
  const days = dEnd.diff(afterYears.add(months, 'month'), 'day')

  return { years, months, days }
})

// 日期運算結果
const resultDate = computed(() => {
  return dayjs(baseDate.value)
    .add(Number(offsetDays.value) || 0, 'day')
    .format('YYYY-MM-DD')
})

const formatWeekDay = (dateStr: string) => {
  return dayjs(dateStr).format('dddd')
}
</script>

<style scoped lang="scss">
.premium-card {
  @apply bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800 flex flex-col;
}

.icon-box {
  @apply w-12 h-12 rounded-2xl flex items-center justify-center;
}

.input-label {
  @apply block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1;
}

.premium-input {
  @apply w-full px-8 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent 
         focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none 
         transition-all text-xl font-black dark:text-white;
}

.result-area {
  @apply mt-auto p-8 rounded-[2rem] border;
}

/* 讓日期選擇圖示漂亮一點 */
input[type="date"]::-webkit-calendar-picker-indicator {
  @apply cursor-pointer opacity-40 hover:opacity-100 transition-opacity;
  filter: invert(0.4);
}
.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>