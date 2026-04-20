<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-500 p-6 flex flex-col items-center justify-center">
    
    <BaseHeader title="Scientific Base" />

    <main class="w-full max-w-[380px]">
      <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
        
        <!-- 顯示與記錄區 -->
        <div class="mb-8 p-6 rounded-3xl bg-slate-100 dark:bg-slate-950/50 flex flex-col items-end overflow-hidden">
          <div class="text-slate-400 dark:text-slate-500 text-sm font-bold h-6 mb-1 overflow-hidden whitespace-nowrap text-ellipsis">
            {{ historyDisplay }}
          </div>
          <div class="text-5xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter truncate w-full text-right">
            {{ display }}
          </div>
        </div>

        <!-- 按鈕區 -->
        <div class="grid grid-cols-4 gap-3">
          <!-- Row 1 -->
          <button @click="clearAll" class="btn-tool col-span-2">AC</button>
          <button @click="deleteOne" class="btn-tool">DEL</button>
          <button @click="chooseOperator('÷')" class="btn-op">÷</button>

          <!-- Row 2 -->
          <button @click="inputNumber('7')" class="btn-num">7</button>
          <button @click="inputNumber('8')" class="btn-num">8</button>
          <button @click="inputNumber('9')" class="btn-num">9</button>
          <button @click="chooseOperator('×')" class="btn-op">×</button>

          <!-- Row 3 -->
          <button @click="inputNumber('4')" class="btn-num">4</button>
          <button @click="inputNumber('5')" class="btn-num">5</button>
          <button @click="inputNumber('6')" class="btn-num">6</button>
          <button @click="chooseOperator('-')" class="btn-op">-</button>

          <!-- Row 4 -->
          <button @click="inputNumber('1')" class="btn-num">1</button>
          <button @click="inputNumber('2')" class="btn-num">2</button>
          <button @click="inputNumber('3')" class="btn-num">3</button>
          <button @click="chooseOperator('+')" class="btn-op">+</button>

          <!-- Row 5 -->
          <button @click="toggleSign" class="btn-num">+/-</button>
          <button @click="inputNumber('0')" class="btn-num">0</button>
          <button @click="inputNumber('.')" class="btn-num">.</button>
          <button @click="calculate" class="btn-equal">=</button>

          <!-- Special Row (Optional tools) -->
          <button @click="squareRoot" class="btn-extra col-span-2">√ Square Root</button>
          <button @click="percentage" class="btn-extra col-span-2">% Percentage</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import BaseHeader from '@/components/BaseHeader.vue'

const display = ref('0')
const previous = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForNew = ref(false)
const lastValue = ref<number | null>(null)
const historyDisplay = ref('')

const MAX_LENGTH = 11

const formatResult = (num: number): string => {
  if (isNaN(num)) return 'Error'
  const str = String(num)
  if (str.length <= MAX_LENGTH) return str
  if (str.includes('e')) return num.toExponential(4)

  if (str.includes('.')) {
    const intLength = str.split('.')[0].length
    if (intLength > MAX_LENGTH) return num.toExponential(4)
    const allowedDecimals = MAX_LENGTH - intLength - 1
    return allowedDecimals >= 0 ? String(Number(num.toFixed(allowedDecimals))) : str.slice(0, MAX_LENGTH)
  }
  return num.toExponential(4)
}

const inputNumber = (num: string) => {
  if (waitingForNew.value) {
    display.value = num === '.' ? '0.' : num
    waitingForNew.value = false
  } else {
    if (display.value.length >= MAX_LENGTH) return
    if (num === '.' && display.value.includes('.')) return
    display.value = display.value === '0' && num !== '.' ? num : display.value + num
  }
}

const operate = (a: number, b: number, op: string) => {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
    default: return b
  }
}

const chooseOperator = (op: string) => {
  if (display.value === 'Error') clearAll()
  const current = Number(display.value)

  if (operator.value && previous.value !== null && !waitingForNew.value) {
    const result = operate(previous.value, current, operator.value)
    if (isNaN(Number(result))) {
      display.value = 'Error'
      waitingForNew.value = true
      return
    }
    const formatted = formatResult(Number(result))
    historyDisplay.value = `${previous.value} ${operator.value} ${current} =`
    display.value = formatted
    previous.value = Number(result)
  } else {
    previous.value = current
    historyDisplay.value = `${current} ${op}`
  }

  operator.value = op
  waitingForNew.value = true
  lastValue.value = null
}

const calculate = () => {
  if (!operator.value || display.value === 'Error') return
  const current = Number(display.value)

  if (previous.value !== null && !waitingForNew.value) {
    const result = operate(previous.value, current, operator.value)
    if (isNaN(Number(result))) {
      display.value = 'Error'
    } else {
      historyDisplay.value = `${previous.value} ${operator.value} ${current} =`
      display.value = formatResult(Number(result))
      previous.value = Number(result)
      lastValue.value = current
    }
  } else if (lastValue.value !== null) {
    const result = operate(Number(display.value), lastValue.value, operator.value)
    historyDisplay.value = `${display.value} ${operator.value} ${lastValue.value} =`
    display.value = isNaN(Number(result)) ? 'Error' : formatResult(Number(result))
  }
  waitingForNew.value = true
}

const squareRoot = () => {
  const current = Number(display.value)
  if (current < 0) {
    display.value = 'Error'
  } else {
    historyDisplay.value = `√(${current}) =`
    display.value = formatResult(Math.sqrt(current))
  }
  waitingForNew.value = true
}

const percentage = () => {
  const current = Number(display.value)
  historyDisplay.value = `${current}% =`
  display.value = formatResult(current / 100)
  waitingForNew.value = true
}

const toggleSign = () => {
  if (display.value === '0' || display.value === 'Error') return
  display.value = display.value.startsWith('-') ? display.value.slice(1) : '-' + display.value
}

const clearAll = () => {
  display.value = '0'
  previous.value = null
  operator.value = null
  lastValue.value = null
  waitingForNew.value = false
  historyDisplay.value = ''
}

const deleteOne = () => {
  if (waitingForNew.value) return
  if (display.value === 'Error') return clearAll()
  display.value = display.value.length === 1 ? '0' : display.value.slice(0, -1)
}

const handleKey = (e: KeyboardEvent) => {
  if (!isNaN(Number(e.key))) inputNumber(e.key)
  if (e.key === '.') inputNumber('.')
  if (e.key === '+') chooseOperator('+')
  if (e.key === '-') chooseOperator('-')
  if (e.key === '*') chooseOperator('×')
  if (e.key === '/') chooseOperator('÷')
  if (e.key === 'Enter' || e.key === '=') calculate()
  if (e.key === 'Backspace') deleteOne()
  if (e.key === 'Escape') clearAll()
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))
</script>

<style scoped lang="scss">
.btn-base {
  @apply aspect-square rounded-3xl flex items-center justify-center text-xl font-bold transition-all duration-200 active:scale-90 hover:scale-105;
}

.btn-num {
  @extend .btn-base;
  @apply bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700;
}

.btn-tool {
  @extend .btn-base;
  @apply bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 aspect-auto rounded-[1.5rem];
}

.btn-op {
  @extend .btn-base;
  @apply bg-orange-500 text-white shadow-lg shadow-orange-500/30;
}

.btn-equal {
  @extend .btn-base;
  @apply bg-indigo-500 text-white shadow-lg shadow-indigo-500/30;
}

.btn-extra {
  @apply mt-2 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-500 transition-all active:scale-95 border border-slate-200 dark:border-slate-700;
}
</style>