import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '@/pages/Home.vue'
import Calculator from '@/pages/common/Calculator.vue'
import Countdown from '@/pages/common/Countdown.vue'
import Dice from '@/pages/common/Dice.vue'
import DateCalculator from '@/pages/common/DateCalculator.vue'
import Wheel from '@/pages/common/Wheel.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/calculator', component: Calculator },
  { path: '/countdown', component: Countdown },
  { path: '/dice', component: Dice },
  { path: '/datecalculator', component: DateCalculator },
  { path: '/wheel', component: Wheel },

]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})