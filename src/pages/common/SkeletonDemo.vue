<script setup lang="ts">
import { ref } from 'vue'
import Skeleton from '@/components/common/Skeleton.vue'
import BaseHeader from '@/components/BaseHeader.vue'

const loading = ref(true)

const toggleLoading = () => {
  loading.value = !loading.value
}
</script>

<template>
  <div class="min-h-screen p-6 md:p-12 bg-slate-100 dark:bg-slate-950 transition-colors flex flex-col items-center">
    <BaseHeader title="UI Skeleton UX" />
    
    <div class="max-w-4xl mx-auto w-full">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 class="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">骨架屏示範 <span class="text-blue-500 italic">SKELETON</span></h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">示範各種場景下的載入佔位效果</p>
        </div>
        <button 
          @click="toggleLoading"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg active:scale-95"
        >
          切換狀態: {{ loading ? '預覽結果' : '查看骨架' }}
        </button>
      </header>

      <div class="grid gap-8 md:grid-cols-2">
        <!-- 個人資料卡片 -->
        <section class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-6 dark:text-white">個人資料卡片</h3>
          <div v-if="loading" class="flex items-center space-x-4">
            <Skeleton variant="circle" width="64px" height="64px" />
            <div class="flex-1">
              <Skeleton width="40%" height="24px" class="mb-2" />
              <Skeleton width="70%" height="16px" />
            </div>
          </div>
          <div v-else class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">JD</div>
            <div>
              <h4 class="text-xl font-bold dark:text-white">John Doe</h4>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Fullstack Developer</p>
            </div>
          </div>
        </section>

        <!-- 文章內容 -->
        <section class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-6 dark:text-white">文章段落</h3>
          <div v-if="loading">
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <div v-else class="space-y-2">
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              Vue 3 引入了強大的 Composition API，讓我們能夠更好地組織邏輯代碼。配合 Vite 的閃電般速度，開發體驗得到了極大的提升。
            </p>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              UnoCSS 則是在 CSS 工具庫領域的一次革命，即時生成、無限靈活。
            </p>
          </div>
        </section>

        <!-- 圖片網格 -->
        <section class="md:col-span-2 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-6 dark:text-white">圖片與詳細清單</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div v-for="i in 2" :key="i" class="flex space-x-4">
              <Skeleton v-if="loading" width="100px" height="100px" class="shrink-0" />
              <div v-else class="w-[100px] h-[100px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                 <span class="text-2xl">🖼️</span>
              </div>
              <div class="flex-1 pt-1">
                <template v-if="loading">
                  <Skeleton width="60%" height="20px" class="mb-3" />
                  <Skeleton width="80%" height="12px" class="mb-2" />
                  <Skeleton width="40%" height="12px" />
                </template>
                <template v-else>
                  <h5 class="font-bold mb-1 dark:text-white">精美圖片項目 #{{ i }}</h5>
                  <p class="text-xs text-gray-500 dark:text-gray-400">這是一個關於項目的詳細描述，用來測試視覺平衡。</p>
                </template>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer class="mt-12 text-center text-gray-400 text-sm">
        基於 UnoCSS 脈衝動畫構建的骨架組件
      </footer>
    </div>
  </div>
</template>
