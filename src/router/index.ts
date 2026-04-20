import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '@/pages/Home.vue'
import Calculator from '@/pages/common/Calculator.vue'
import Countdown from '@/pages/common/Countdown.vue'
import Dice from '@/pages/common/Dice.vue'
import DateCalculator from '@/pages/common/DateCalculator.vue'
import Wheel from '@/pages/common/Wheel.vue'
import SkeletonDemo from '@/pages/common/SkeletonDemo.vue'
import WorldClock from '@/pages/common/WorldClock.vue'
import CurrencyConverter from '@/pages/common/CurrencyConverter.vue'
import QRCodeGenerator from '@/pages/common/QRCodeGenerator.vue'

const routes = [
  { path: '/', component: Home, meta: { title: '首頁 | 常用功能' } },
  { path: '/calculator', component: Calculator, meta: { title: '計算機' } },
  { path: '/countdown', component: Countdown, meta: { title: '倒數計時' } },
  { path: '/dice', component: Dice, meta: { title: '擲骰子' } },
  { path: '/datecalculator', component: DateCalculator, meta: { title: '日期計算' } },
  { path: '/wheel', component: Wheel, meta: { title: '大轉盤' } },
  { path: '/skeleton', component: SkeletonDemo, meta: { title: '骨架屏示範' } },
  { path: '/worldclock', component: WorldClock, meta: { title: '世界時鐘' } },
  { path: '/currency', component: CurrencyConverter, meta: { title: '匯率轉換' } },
  { path: '/qrcode', component: QRCodeGenerator, meta: { title: 'QR Code 產生器' } },
  // Catch-all route to redirect back to home
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - Vue3 Playground`
  } else {
    document.title = 'Vue3 Playground'
  }
})