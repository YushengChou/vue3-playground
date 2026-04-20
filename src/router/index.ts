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
  { path: '/', component: Home },
  { path: '/calculator', component: Calculator },
  { path: '/countdown', component: Countdown },
  { path: '/dice', component: Dice },
  { path: '/datecalculator', component: DateCalculator },
  { path: '/wheel', component: Wheel },
  { path: '/skeleton', component: SkeletonDemo },
  { path: '/worldclock', component: WorldClock },
  { path: '/currency', component: CurrencyConverter },
  { path: '/qrcode', component: QRCodeGenerator },

]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})