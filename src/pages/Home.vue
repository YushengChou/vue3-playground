<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-500 p-6 md:p-12">
    
    <!-- 手機選單遮罩 -->
    <transition name="fade">
      <div v-show="menuOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] md:hidden" @click="menuOpen = false"></div>
    </transition>

    <!-- 手機選單 -->
    <transition name="slide">
      <div 
        v-show="menuOpen" 
        class="fixed top-0 right-0 h-full w-64 bg-white dark:bg-slate-900 shadow-2xl z-[50] p-8 md:hidden"
      >
        <div class="flex flex-col h-full">
          <div class="flex justify-between items-center mb-10">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest">選單 Menu</h3>
            <button 
              @click="menuOpen = false" 
              class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
            >
              <span class="text-xl leading-none">✕</span>
            </button>
          </div>
          
          <div class="space-y-4">
             <button
              @click="toggleTheme"
              class="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold flex items-center justify-between"
            >
              <span>{{ theme === 'light' ? '深色模式' : '淺色模式' }}</span>
              <span>{{ theme === 'light' ? '🌙' : '☀️' }}</span>
            </button>
          </div>
          
          <div class="mt-auto py-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p class="text-xs text-slate-400 font-medium">Vue3 Playground v1.0</p>
          </div>
        </div>
      </div>
    </transition>

    <header class="max-w-7xl mx-auto flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          功能選單 <span class="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent italic">Tools</span>
        </h1>
        <p class="text-slate-400 dark:text-slate-500 mt-2 font-medium">各類實用工具</p>
      </div>

      <div class="hidden md:block">
        <button
          @click="toggleTheme"
          class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-xl"
        >
          {{ theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>

      <button 
        @click="menuOpen = true" 
        class="md:hidden w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl text-slate-600 dark:text-slate-300 shadow-sm active:scale-95 transition-all"
      >
        <span>☰</span>
      </button>
    </header>

    <!-- 功能列表 -->
    <main class="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <router-link
        v-for="feature in features"
        :key="feature.path"
        :to="feature.path"
        class="group relative p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
      >
        <div class="absolute -right-4 -bottom-4 text-9xl opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 select-none">
          {{ feature.emoji }}
        </div>

        <div class="relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
            {{ feature.emoji }}
          </div>
          <h2 class="text-2xl font-black mb-3 text-slate-800 dark:text-white tracking-tight">{{ feature.name }}</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{{ feature.desc }}</p>
        </div>
        
        <div class="mt-8 flex items-center text-indigo-500 font-bold text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
          立即使用 <span class="ml-2">→</span>
        </div>
      </router-link>
    </main>
  </div>
</template>

<script setup lang="ts">
const { theme, toggleTheme } = useTheme()
const menuOpen = ref(false)

interface Feature {
  name: string
  path: string
  desc: string
  emoji: string
}

const features: Feature[] = [
  { name: '計算機', path: '/calculator', desc: '流暢的擬態設計與鍵盤支援', emoji: '🧮' },
  { name: '倒數計時', path: '/countdown', desc: '精準的時效管理工具', emoji: '⌛' },
  { name: '擲骰子', path: '/dice', desc: '隨機率與物理效果模擬', emoji: '🎲' },
  { name: '日期計算', path: '/datecalculator', desc: '快速計算天數差異與區間', emoji: '📅' },
  { name: '大轉盤', path: '/wheel', desc: '趣味決策與隨機選擇', emoji: '🎡' },
  { name: '品質審查', path: '/skeleton', desc: 'Skeleton 載入與 SkeletonUX 示範', emoji: '🦴' },
  { name: '世界時鐘', path: '/worldclock', desc: '全球主要城市即時同步', emoji: '🌏' },
  { name: '匯率轉換', path: '/currency', desc: '即時全球匯率換算與 API 連接', emoji: '💱' },
  { name: 'QR Code 產生', path: '/qrcode', desc: '高畫質即時二維碼生成', emoji: '📱' },
]
</script>

<style scoped lang="scss">
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>