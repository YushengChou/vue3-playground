<script setup lang="ts">
import dayjs from 'dayjs'

const startDate = ref(dayjs().format('YYYY-MM-DD'))
const endDate = ref(dayjs().add(7, 'day').format('YYYY-MM-DD'))

const baseDate = ref(dayjs().format('YYYY-MM-DD'))
const offsetDays = ref(0)

// 天數差
const diffDays = computed(() => {
  return dayjs(endDate.value).diff(dayjs(startDate.value), 'day')
})

// 年月日差
const diffDetail = computed(() => {
  const start = dayjs(startDate.value)
  const end = dayjs(endDate.value)

  const years = end.diff(start, 'year')
  const months = end.subtract(years, 'year').diff(start, 'month')
  const days = end
    .subtract(years, 'year')
    .subtract(months, 'month')
    .diff(start, 'day')

  return { years, months, days }
})

// 加減日期
const resultDate = computed(() => {
  return dayjs(baseDate.value)
    .add(Number(offsetDays.value) || 0, 'day')
    .format('YYYY-MM-DD')
})
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-10 
              bg-gradient-to-br 
              from-gray-100 to-gray-200
              dark:from-gray-900 dark:to-gray-950
              transition-colors duration-300"
  >

    <div class="max-w-5xl mx-auto space-y-6">

      <!-- Title -->
      <h1 class="text-2xl sm:text-3xl font-bold text-center 
                 text-gray-800 dark:text-gray-100">
        📅 日期計算器
      </h1>

      <!-- Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 日期差卡片 -->
        <div class="card">
          <h2 class="card-title">日期差</h2>

          <!-- 輸入 -->
          <div class="flex flex-col sm:flex-row gap-3">
            <input v-model="startDate" type="date" class="input flex-1" />
            <div class="text-center self-center opacity-60">→</div>
            <input v-model="endDate" type="date" class="input flex-1" />
          </div>

          <!-- 結果 -->
          <div class="mt-4 space-y-2">
            <div class="text-xl text-gray-700 dark:text-gray-200">
              相差 
              <span class="highlight-blue">
                {{ diffDays }}
              </span>
              天
            </div>

            <div class="text-sm opacity-70 text-gray-700 dark:text-gray-200">
              {{ diffDetail.years }} 年 
              {{ diffDetail.months }} 月 
              {{ diffDetail.days }} 天
            </div>

          </div>
        </div>

        <!-- 日期加減 -->
        <div class="card">
          <h2 class="card-title">日期加減</h2>

          <div class="flex flex-col sm:flex-row gap-3 items-center">
            <input v-model="baseDate" type="date" class="input flex-1" />

            <div class="flex items-center gap-2">
              <input
                v-model.number="offsetDays"
                type="number"
                class="input w-24 text-center"
              />
              <span class="text-gray-700 dark:text-gray-200">天</span>
            </div>
          </div>

          <div class="mt-6 text-xl text-gray-700 dark:text-gray-200">
            結果：
            <span class="highlight-green">
              {{ resultDate }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 卡片 */
.card {
  @apply rounded-3xl p-6 backdrop-blur-lg
         bg-white/70 dark:bg-gray-800/70
         shadow-lg hover:shadow-xl
         transition-all duration-300;
}

/* 標題 */
.card-title {
  @apply text-lg font-semibold mb-4
         text-gray-700 dark:text-gray-200;
}

/* input */
.input {
  @apply px-4 py-2 rounded-xl border
         border-gray-300 dark:border-gray-600
         bg-white/80 dark:bg-gray-700/80
         text-gray-800 dark:text-gray-100
         focus:outline-none
         focus:ring-2 focus:ring-blue-400
         transition;
}

/* highlight */
.highlight-blue {
  @apply font-bold text-blue-500 text-2xl;
}

.highlight-green {
  @apply font-bold text-green-500;
}
</style>