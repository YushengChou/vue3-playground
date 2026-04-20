<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Skeleton from '@/components/common/Skeleton.vue'
import BaseHeader from '@/components/BaseHeader.vue'

const text = ref('https://yushengchou.github.io/vue3-playground')
const size = ref(300)
const loading = ref(false)
const qrUrl = ref('')
const hasLoaded = ref(false)

const generateQR = () => {
  if (!text.value.trim()) return
  loading.value = true
  
  // 使用 qrserver API
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/'
  const params = new URLSearchParams({
    size: `${size.value}x${size.value}`,
    data: text.value,
    margin: '10'
  })
  
  qrUrl.value = `${baseUrl}?${params.toString()}`
}

// 當圖片載入完成後停止 loading
const onImageLoad = () => {
  loading.value = false
  hasLoaded.value = true
}

const downloadQR = async () => {
  if (!qrUrl.value) return
  
  try {
    const response = await fetch(qrUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Download failed:', err)
  }
}

// 監聽文字變化自動更新 (加上 debounce 避免過於頻繁請求)
let debounceTimer: number | null = null
watch(text, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    generateQR()
  }, 500)
})

onMounted(() => {
  generateQR()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 p-6 md:p-12 flex flex-col items-center">
    
    <BaseHeader title="Instant Gen" />

    <main class="w-full max-w-4xl flex flex-col items-center">
      <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100 dark:border-slate-800">
        
        <header class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
            <span class="text-3xl">📱</span>
          </div>
          <h1 class="text-3xl font-black text-slate-800 dark:text-white mb-2">QR Code 產生器</h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm">輸入任何文字或網址，即時轉換為二維碼</p>
        </header>

        <div class="flex flex-col md:flex-row gap-10">
          <!-- 左側：輸入區 -->
          <div class="flex-1 space-y-6">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">輸入內容 Content</label>
              <textarea 
                v-model="text"
                class="w-full h-48 px-6 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-lg font-medium dark:text-white resize-none"
                placeholder="在此輸入網址或訊息..."
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">尺寸 Size: {{ size }}px</label>
              <input 
                v-model="size" 
                type="range" min="150" max="600" step="50"
                @touchmove.stop
                class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 touch-none"
              />
            </div>
          </div>

          <!-- 右側：預覽區 -->
          <div class="w-full md:w-64 flex flex-col items-center">
             <label class="w-full block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 text-center md:text-left">預覽 Preview</label>
             
             <div class="relative w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                <Skeleton v-if="loading && !hasLoaded" width="80%" height="80%" />
                
                <!-- 預覽圖 -->
                <img 
                  v-show="qrUrl"
                  :src="qrUrl" 
                  alt="QR Code"
                  @load="onImageLoad"
                  class="max-w-[85%] max-h-[85%] transition-opacity duration-300"
                  :class="loading ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'"
                />
                
                <!-- 載入中覆蓋層 -->
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                   <div class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
             </div>

             <button 
                @click="downloadQR"
                :disabled="!qrUrl || loading"
                class="mt-6 w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                <span>💾</span> 下載圖片
             </button>
          </div>
        </div>

        <footer class="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p class="text-xs text-slate-400 italic">
              「請確保內容長度適中，以維持 QR Code 的解析度與掃描成功率。」
            </p>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 自定義 Range Input 樣式補充 */
input[type='range'] {
  &::-webkit-slider-thumb {
    @apply appearance-none w-5 h-5 bg-amber-500 rounded-full cursor-pointer border-4 border-white shadow-md;
  }
  &::-moz-range-thumb {
    @apply appearance-none w-5 h-5 bg-amber-500 rounded-full cursor-pointer border-4 border-white shadow-md;
  }
}
</style>
