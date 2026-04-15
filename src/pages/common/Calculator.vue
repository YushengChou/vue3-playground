<script setup lang="ts">

const display = ref('0')
const previous = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForNew = ref(false)
const lastValue = ref<number | null>(null)

/* ====== 數字輸入 ====== */
const inputNumber = (num: string) => {
  if (waitingForNew.value) {
    display.value = num === '.' ? '0.' : num
    waitingForNew.value = false
  } else {
    if (num === '.' && display.value.includes('.')) return
    display.value =
      display.value === '0' && num !== '.'
        ? num
        : display.value + num
  }
}

/* ====== 計算核心 ====== */
const operate = (a: number, b: number, op: string) => {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
    default: return b
  }
}

/* ====== 選擇運算子 ====== */
const chooseOperator = (op: string) => {
  if (display.value === 'Error') clearAll()

  const current = Number(display.value)

  if (operator.value && previous.value !== null && !waitingForNew.value) {
    const result = operate(previous.value, current, operator.value)
    if (isNaN(Number(result))) {
      clearAll()
      display.value = 'Error'
      waitingForNew.value = true
      return
    }
    display.value = String(result)
    previous.value = Number(result)
  } else {
    previous.value = current
  }

  operator.value = op
  waitingForNew.value = true
  lastValue.value = null
}

/* ====== 等於 ====== */
const calculate = () => {
  if (!operator.value || display.value === 'Error') return

  const current = Number(display.value)

  if (previous.value !== null && !waitingForNew.value) {
    const result = operate(previous.value, current, operator.value)
    if (isNaN(Number(result))) {
      clearAll()
      display.value = 'Error'
      waitingForNew.value = true
      return
    }
    display.value = String(result)
    lastValue.value = current
    previous.value = Number(result)
  } else if (lastValue.value !== null) {
    const result = operate(Number(display.value), lastValue.value, operator.value)
    display.value = isNaN(Number(result)) ? 'Error' : String(result)
  }

  waitingForNew.value = true
}

/* ====== 開根號 ====== */
const squareRoot = () => {
  const current = Number(display.value)
  if (current < 0) {
    display.value = 'Error'
  } else {
    display.value = String(Math.sqrt(current))
  }
  waitingForNew.value = true
}

/* ====== 清除 ====== */
const clearAll = () => {
  display.value = '0'
  previous.value = null
  operator.value = null
  lastValue.value = null
  waitingForNew.value = false
}

/* ====== 刪除 ====== */
const deleteOne = () => {
  if (waitingForNew.value) return
  if (display.value === 'Error') {
    clearAll()
    return
  }

  display.value =
    display.value.length === 1
      ? '0'
      : display.value.slice(0, -1)
}

/* ====== 鍵盤支援 ====== */
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
onBeforeUnmount(() =>
  window.removeEventListener('keydown', handleKey)
)
</script>

<template>
  <div
    class="
      min-h-screen flex items-center justify-center p-5
      bg-gray-100 dark:bg-gray-700
    "
  >
    <div
      class="
        w-full max-w-[380px] p-[30px] rounded-[24px]
        backdrop-blur-[20px]
        bg-white/25 dark:bg-[rgba(30,41,59,0.4)]
        border border-white/30 dark:border-white/10
        shadow-[0_20px_40px_rgba(0,0,0,0.15)]
      "
    >
      <!-- 顯示區 -->
      <div
        class="
          text-right text-[42px] font-bold mb-5
          text-[#111] dark:text-white
        "
      >
        {{ display }}
      </div>

      <!-- 按鈕 -->
      <div class="grid grid-cols-4 gap-3">

        <button @click="clearAll" class="btn wide">AC</button>
        <button @click="deleteOne" class="btn">DEL</button>
        <button @click="squareRoot" class="btn sqrt">√</button>
        <button @click="chooseOperator('÷')" class="btn op">÷</button>

        <button @click="inputNumber('7')" class="btn">7</button>
        <button @click="inputNumber('8')" class="btn">8</button>
        <button @click="inputNumber('9')" class="btn">9</button>
        <button @click="chooseOperator('×')" class="btn op">×</button>

        <button @click="inputNumber('4')" class="btn">4</button>
        <button @click="inputNumber('5')" class="btn">5</button>
        <button @click="inputNumber('6')" class="btn">6</button>
        <button @click="chooseOperator('-')" class="btn op">-</button>

        <button @click="inputNumber('1')" class="btn">1</button>
        <button @click="inputNumber('2')" class="btn">2</button>
        <button @click="inputNumber('3')" class="btn">3</button>
        <button @click="chooseOperator('+')" class="btn op">+</button>

        <button @click="inputNumber('0')" class="btn">0</button>
        <button @click="inputNumber('.')" class="btn">.</button>
        <button @click="calculate" class="btn equal">=</button>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.btn {
  @apply p-[16px] rounded-[14px] text-[18px] font-semibold
         border-none cursor-pointer
         bg-white/40 dark:bg-white/10 dark:text-#fff
         backdrop-blur-[10px]
         transition-all duration-150 ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.op {
  @apply text-white;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.equal {
  @apply text-white;
  background: linear-gradient(135deg, #22c55e, #4ade80);
}

.wide {
  @apply col-span-2;
}

.sqrt {
  @apply text-white;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}
</style>