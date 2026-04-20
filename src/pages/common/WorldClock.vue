<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseHeader from '@/components/BaseHeader.vue'

interface CityTime {
  name: string
  timezone: string
  id: string
  label: string
}

const cities: CityTime[] = [
  { id: '1', name: '台北', label: 'Taipei', timezone: 'Asia/Taipei' },
  { id: '2', name: '東京', label: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: '3', name: '倫敦', label: 'London', timezone: 'Europe/London' },
  { id: '4', name: '紐約', label: 'New York', timezone: 'America/New_York' },
  { id: '5', name: '巴黎', label: 'Paris', timezone: 'Europe/Paris' },
  { id: '6', name: '洛杉磯', label: 'Los Angeles', timezone: 'America/Los_Angeles' },
]

const currentTime = ref(new Date())
let timer: number | null = null

const updateClock = () => {
  currentTime.value = new Date()
}

onMounted(() => {
  timer = window.setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const timeFormatters = new Map<string, Intl.DateTimeFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

const getTimeFormatter = (timezone: string) => {
  if (!timeFormatters.has(timezone)) {
    timeFormatters.set(timezone, new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timezone
    }))
  }
  return timeFormatters.get(timezone)!
}

const getDateFormatter = (timezone: string) => {
  if (!dateFormatters.has(timezone)) {
    dateFormatters.set(timezone, new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: timezone
    }))
  }
  return dateFormatters.get(timezone)!
}

const formatTime = (timezone: string) => {
  return getTimeFormatter(timezone).format(currentTime.value)
}

const formatDate = (timezone: string) => {
  return getDateFormatter(timezone).format(currentTime.value)
}

/** 判斷是否為白天 (06:00 - 18:00) */
const isDaytime = (timezone: string) => {
  const hourStr = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone: timezone
  }).format(currentTime.value)
  const hour = parseInt(hourStr)
  return hour >= 6 && hour < 18
}

</script>

<template>
  <div class="min-h-screen p-6 bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col items-center">
    <BaseHeader title="Global Sync" />
    
    <div class="max-w-6xl mx-auto w-full">
      <header class="mb-12 text-center">
        <h1 class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
          世界時鐘 <span class="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent italic md:text-5xl ml-2 uppercase">World</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">精準同步全球主要城市的即時時間</p>
      </header>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="city in cities" 
          :key="city.id"
          class="relative overflow-hidden group p-6 rounded-3xl transition-all duration-500 
                 hover:shadow-2xl hover:-translate-y-2 border border-white/20"
          :class="[
            isDaytime(city.timezone) 
              ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-200 dark:shadow-none' 
              : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100 shadow-slate-300 dark:shadow-none'
          ]"
        >
          <!-- 裝飾背景圖示 -->
          <div class="absolute -right-4 -top-4 text-8xl opacity-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">
            {{ isDaytime(city.timezone) ? '☀️' : '🌙' }}
          </div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex justify-between items-start mb-8">
              <div>
                <h2 class="text-2xl font-bold mb-1">{{ city.name }}</h2>
                <p class="text-sm opacity-80 font-medium">{{ city.label }}</p>
              </div>
              <div class="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest">
                {{ city.timezone.split('/')[0] }}
              </div>
            </div>

            <div class="mt-auto">
              <div class="text-5xl font-mono font-bold mb-2 tabular-nums">
                {{ formatTime(city.timezone) }}
              </div>
              <div class="text-sm opacity-70 font-medium">
                {{ formatDate(city.timezone) }}
              </div>
            </div>
          </div>
          
          <!-- 底部發光條 -->
          <div 
            class="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-300 group-hover:w-full w-0"
          ></div>
        </div>
      </div>

      <footer class="mt-16 text-center text-slate-400 text-sm">
        最後更新：{{ currentTime.toLocaleString() }}
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap');

.font-mono {
  font-family: 'JetBrains+Mono', monospace;
}
</style>
