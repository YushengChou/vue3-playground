<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-700 transition-colors duration-300 relative">

    <!-- 遮罩層 -->
    <transition name="fade">
      <div
        v-show="menuOpen"
        class="fixed inset-0 bg-black/20 z-[21] md:hidden"
        @click="menuOpen = false"
      ></div>
    </transition>

    <!-- 手機選單本體 -->
    <transition name="fade">
      <div
        v-show="menuOpen"
        @click.stop
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48
               bg-white dark:bg-gray-800 transition-colors duration-300
               shadow-lg rounded-b-xl p-4 flex flex-col space-y-2 z-[22] md:hidden pointer-events-auto"
      >
        <button
          @click.stop="toggleTheme"
          class="px-4 py-2 border rounded text-black dark:text-white
                 border-black dark:border-white bg-gray-300 dark:bg-gray-900
                 transition-colors duration-300"
        >
          {{ theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>
    </transition>

    <!-- Header -->
    <header class="flex justify-between items-center p-6 relative z-20">
      <h1 class="text-4xl font-bold text-black dark:text-white">
        常用功能
      </h1>

      <!-- 桌面直接顯示按鈕 -->
      <div class="hidden md:flex items-center space-x-4">
        <button
          @click="toggleTheme"
          class="px-4 py-2 border rounded text-black dark:text-white
                 border-black dark:border-white bg-gray-100 dark:bg-gray-900
                 transition-colors duration-300"
        >
          {{ theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>

      <!-- 手機漢堡選單 -->
      <div class="md:hidden">
        <button
          @click="menuOpen = !menuOpen"
          class="p-2 border rounded text-black dark:text-white
                 border-black dark:border-white bg-gray-100 dark:bg-gray-900
                 transition-colors duration-300 relative z-30"
        >
          <!-- 用 v-show 避免閃白 -->
          <span v-show="!menuOpen" class="transition-opacity duration-200">&#9776;</span>
          <span v-show="menuOpen" class="transition-opacity duration-200">&#10005;</span>
        </button>
      </div>
    </header>

    <!-- 功能列表 -->
    <div class="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <router-link
        v-for="feature in features"
        :key="feature.path"
        :to="feature.path"
        class="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow
               hover:shadow-lg transition transform hover:-translate-y-1"
      >
        <h2 class="text-xl font-semibold mb-2 text-black dark:text-white">{{ feature.name }}</h2>
        <p class="text-gray-500 dark:text-gray-300 text-sm">{{ feature.desc }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">

const { theme, toggleTheme } = useTheme()
const menuOpen = ref(false)

interface Feature {
  name: string
  path: string
  desc: string
}

const features: Feature[] = [
  { name: '計算機', path: '/calculator', desc: '簡單計算功能' },
  { name: '倒數計時', path: '/countdown', desc: '倒數計時器' },
  { name: '擲骰子', path: '/dice', desc: '擲骰子' },
  { name: '日期計算', path: '/datecalculator', desc: '計算日期差異' },
  { name: '大轉盤', path: '/wheel', desc: '大轉盤' },
]
</script>

<style scoped lang="scss">
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>