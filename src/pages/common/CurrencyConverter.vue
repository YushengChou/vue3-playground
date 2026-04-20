<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Skeleton from '@/components/common/Skeleton.vue'
import BaseHeader from '@/components/BaseHeader.vue'

const amount = ref<number>(1)
const fromCurrency = ref('USD')
const toCurrency = ref('TWD')
const rates = ref<Record<string, number>>({})

const loading = ref(true)
const lastUpdated = ref('')


// 由於 Frankfurter 不支援 TWD，我改用另外一個常見的開放 API: exchangerate-api
const fetchRatesV2 = async () => {
  loading.value = true
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency.value}`)
    const data = await res.json()
    rates.value = data.rates
    lastUpdated.value = new Date(data.time_last_update_unix * 1000).toLocaleString()
  } catch (error) {
    console.error('Failed to fetch rates:', error)
  } finally {
    loading.value = false
  }
}

const convertedAmount = computed(() => {
  if (!rates.value[toCurrency.value]) return 0
  return amount.value * rates.value[toCurrency.value]
})

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  fetchRatesV2()
}

onMounted(() => {
  fetchRatesV2()
})

watch(fromCurrency, () => {
  fetchRatesV2()
})

const commonCurrencies = [
  { code: 'USD', name: '美元', flag: '🇺🇸' },
  { code: 'TWD', name: '新台幣', flag: '🇹🇼' },
  { code: 'JPY', name: '日圓', flag: '🇯🇵' },
  { code: 'EUR', name: '歐元', flag: '🇪🇺' },
  { code: 'GBP', name: '英鎊', flag: '🇬🇧' },
  { code: 'HKD', name: '港幣', flag: '🇭🇰' },
  { code: 'CNY', name: '人民幣', flag: '🇨🇳' },
  { code: 'KRW', name: '韓元', flag: '🇰🇷' },
  { code: 'AUD', name: '澳幣', flag: '🇦🇺' },
  { code: 'SGD', name: '新加坡幣', flag: '🇸🇬' },
]

</script>

<template>
  <div class="min-h-screen p-6 bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col items-center">
    <BaseHeader title="Real-time FX" />
    
    <div class="w-full max-w-lg">
      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100 dark:border-slate-800">
        
        <header class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
            <span class="text-3xl">💱</span>
          </div>
          <h1 class="text-3xl font-black text-slate-800 dark:text-white mb-2">匯率轉換</h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm">即時匯率更新 數據源自 Open-API</p>
        </header>

        <div class="space-y-6">
          <!-- 金額輸入 -->
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">數量 Amount</label>
            <input 
              v-model.number="amount"
              type="number"
              class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-xl font-bold dark:text-white"
              placeholder="請輸入金額"
            />
          </div>

          <!-- 貨幣選擇區 -->
          <div class="flex flex-col md:flex-row items-center gap-4 relative">
            <div class="flex-1 w-full">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">從 From</label>
              <select 
                v-model="fromCurrency"
                class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none appearance-none font-bold dark:text-white"
              >
                <option v-for="c in commonCurrencies" :key="c.code" :value="c.code">
                  {{ c.flag }} {{ c.code }} - {{ c.name }}
                </option>
              </select>
            </div>

            <!-- 交換按鈕 -->
            <button 
              @click="swapCurrencies"
              class="mt-6 w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none hover:rotate-180 transition-transform duration-500 flex items-center justify-center shrink-0"
            >
              <span class="text-xl">↔️</span>
            </button>

            <div class="flex-1 w-full">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">至 To</label>
              <select 
                v-model="toCurrency"
                class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none appearance-none font-bold dark:text-white"
              >
                <option v-for="c in commonCurrencies" :key="c.code" :value="c.code">
                  {{ c.flag }} {{ c.code }} - {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 結果顯示區 -->
          <div class="mt-10 p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
            <template v-if="loading">
              <Skeleton width="40%" height="16px" class="mb-4" />
              <Skeleton width="100%" height="48px" />
            </template>
            <template v-else>
              <div class="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                {{ amount }} {{ fromCurrency }} 等於
              </div>
              <div class="text-4xl font-black text-slate-800 dark:text-white break-all">
                {{ convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}
                <span class="text-2xl ml-1 font-bold opacity-60">{{ toCurrency }}</span>
              </div>
            </template>
          </div>
        </div>

        <footer class="mt-8 text-center">
          <p class="text-[10px] text-slate-400 uppercase tracking-tighter">
            最後更新時間：{{ lastUpdated || '載入中...' }}
          </p>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 隱藏原生 select 的箭頭，自定義更美觀的體驗 */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.5rem center;
  background-size: 1rem;
}
</style>
