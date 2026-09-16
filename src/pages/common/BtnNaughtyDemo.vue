<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-12 transition-colors duration-500 flex flex-col items-center justify-center">
    
    <BaseHeader title="Btn Naughty Demo" />

    <main class="max-w-5xl mx-auto space-y-8">
      <!-- 互動展示卡片 -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6">
        <h2 class="text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-4">控制台與互動測試</h2>
        
        <!-- 開關選項 -->
        <div class="flex flex-wrap items-center gap-6">
          <label class="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="isDisabled"
              class="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
            />
            <span class="font-medium text-sm">觸發「停用」狀態 (啟用調皮逃跑)</span>
          </label>

          <button
            @click="resetBtn"
            class="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
          >
            重置按鈕位置 🎯
          </button>
        </div>

        <!-- 舞台展示區 -->
        <div class="h-64 rounded-2xl bg-slate-100/70 dark:bg-slate-950/70 border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
          <div class="text-center">
            <BtnNaughty
              ref="naughtyBtnRef"
              :disabled="isDisabled"
              @click="handleSuccessClick"
            >
              {{ isDisabled ? '抓不到我吧 😜' : '點擊我！' }}
            </BtnNaughty>
          </div>
        </div>

        <!-- 訊息提示 -->
        <div v-if="clickMessage" class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          {{ clickMessage }}
        </div>
      </div>

      <!-- 多樣範例與情境示範 -->
      <div class="grid gap-6 md:grid-cols-2">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-4">
          <h3 class="font-bold text-lg">情境 1：表單未填寫完成</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">當使用者還沒勾選同意條款時，送出按鈕會偷跑逃開。</p>
          
          <div class="space-y-3 pt-2">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" v-model="isAgreed" class="accent-indigo-500" />
              <span>我已閱讀並同意服務條款</span>
            </label>
            
            <div class="py-6 flex justify-center">
              <BtnNaughty :disabled="!isAgreed" @click="handleFormSubmit">
                {{ isAgreed ? '送出表單 🚀' : '請先勾選同意 🐾' }}
              </BtnNaughty>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-4">
          <h3 class="font-bold text-lg">情境 2：自訂逃跑距離</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">調整逃逃的靈敏度與位移幅度。</p>

          <div class="space-y-4 pt-2">
            <div class="py-6 flex justify-center">
              <BtnNaughty :disabled="true" :distance="200">
                超猛極速逃跑 (Distance: 200px) ⚡
              </BtnNaughty>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BtnNaughty from '@/components/BtnNaughty.vue'
import BaseHeader from '@/components/BaseHeader.vue'

const isDisabled = ref(true)
const isAgreed = ref(false)
const clickMessage = ref('')
const naughtyBtnRef = ref<InstanceType<typeof BtnNaughty> | null>(null)

const handleSuccessClick = () => {
  clickMessage.value = '🎉 成功點擊按鈕了！'
  setTimeout(() => {
    clickMessage.value = ''
  }, 3000)
}

const handleFormSubmit = () => {
  alert('表單成功送出！')
}

const resetBtn = () => {
  if (naughtyBtnRef.value) {
    naughtyBtnRef.value.resetPosition()
  }
}
</script>
