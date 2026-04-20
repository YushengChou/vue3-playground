<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, type ComponentPublicInstance } from 'vue'
import gsap from 'gsap'
import BaseHeader from '@/components/BaseHeader.vue'

const inputText = ref('1,two,選項三,四,？？？？')
const items = ref<string[]>([])
const wheelRef = ref<HTMLDivElement | null>(null)
const result = ref('')
const rotating = ref(false)
const labelRefs = ref<Record<number, HTMLDivElement>>({})

const setLabelRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el instanceof HTMLDivElement) {
    labelRefs.value[index] = el
  }
}

/** ✅ 累加旋轉角度（關鍵🔥） */
const currentRotation = ref(0)
const finished = ref(false)

/** 解析輸入 */
const parseItems = () => {
  items.value = inputText.value
    .split(',')
    .map(i => i.trim())
    .filter(Boolean)
}

watch(inputText, parseItems, { immediate: true })

watch(items, () => {
  labelRefs.value = {}
})

/** 每一塊角度 */
const anglePerItem = computed(() => {
  return 360 / (items.value.length || 1)
})

/** 轉盤樣式 */
const wheelStyle = computed(() => {
  // 🎨 高級活潑的色彩配置
  const colors = [
    '#FF4B4B', '#FF8F3D', '#FFC837', '#45C58A', '#2D9CDB',
    '#9B51E0', '#FF758C', '#00C3FF', '#F1C40F', '#E67E22'
  ]

  const segments = items.value.map((_, i) => {
    const start = i * anglePerItem.value
    const end = start + anglePerItem.value
    const color = colors[i % colors.length]
    return `${color} ${start}deg ${end}deg`
  })

  return {
    background: `conic-gradient(${segments.join(',')})`
  }
})

/** 🎯 旋轉（加入頂級特效） */
const spin = async () => {
  if (rotating.value || items.value.length === 0 || finished.value) return

  rotating.value = true
  result.value = ''

  const count = items.value.length
  const index = Math.floor(Math.random() * count)

  /** 轉盤旋轉角度 */
  const target = 360 * 7 + (360 - index * anglePerItem.value - anglePerItem.value / 2)

  await nextTick()

  // ✨ 轉盤開始蓄力縮小
  gsap.to(wheelRef.value, { scale: 0.95, duration: 0.4, ease: 'power2.out' })

  /** ✅ 用 GSAP 累加旋轉與自然指針連動 */
  gsap.to(wheelRef.value, {
    rotate: `+=${target}`,
    duration: 5.5,
    ease: 'circ.out', 
    onUpdate: function () {
      const p = this.progress()
      if (!wheelRef.value) return
      const currentRot = gsap.getProperty(wheelRef.value, 'rotate') as number

      const power = Math.pow(1 - p, 1.5)
      const phase = (currentRot / anglePerItem.value) * Math.PI * 2
      gsap.set('.pointer', { rotate: Math.sin(phase) * (22 * power) })
    },
    onComplete: () => {
      gsap.to('.pointer', { rotate: 0, duration: 0.6, ease: 'back.out(2)' })
      gsap.to(wheelRef.value, { scale: 1, duration: 0.6, ease: 'back.out(2)' })

      result.value = items.value[index]
      finished.value = true 

      const selectedEl = labelRefs.value[index]
      if (selectedEl) {
        gsap.fromTo(
          selectedEl,
          { scale: 1, filter: 'drop-shadow(0 0 0 rgba(255,255,255,0))' },
          {
            scale: 1.4,
            filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))',
            duration: 0.4,
            yoyo: true,
            repeat: 5,
            ease: 'power1.inOut',
            transformOrigin: 'center center'
          }
        )
      }
      rotating.value = false
    }
  })

  currentRotation.value += target
  if (currentRotation.value > 100000) {
    currentRotation.value %= 360
    gsap.set(wheelRef.value, { rotate: currentRotation.value })
  }
}

/** 重置功能 */
const resetWheel = () => {
  if (!wheelRef.value) return
  gsap.set(wheelRef.value, { rotate: 0 })
  currentRotation.value = 0
  result.value = ''
  rotating.value = false
  finished.value = false 
  Object.values(labelRefs.value).forEach(el => {
    if (el) {
      gsap.set(el, { scale: 1 })
    }
  })
}

const wheelSize = ref(300) 

let ro: ResizeObserver | null = null

onMounted(() => {
  if (wheelRef.value) {
    ro = new ResizeObserver(() => {
      if (wheelRef.value) {
        wheelSize.value = wheelRef.value.offsetWidth
      }
    })
    ro.observe(wheelRef.value)
  }
})

onUnmounted(() => {
  ro?.disconnect()
})

/** 🎯 文字置中（極座標） */
const getLabelStyle = (i: number) => {
  const angle = anglePerItem.value * i
  const mid = anglePerItem.value / 2

  const size = wheelSize.value
  const radius = size * 0.35

  return {
    transform: `
      translate(-50%, -50%)
      rotate(${angle + mid}deg)
      translateY(-${radius}px)
    `
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-500 p-6 md:p-12 flex flex-col items-center overflow-x-hidden">
    <BaseHeader title="Physical Fortune" />
    
    <main class="w-full max-w-5xl flex flex-col items-center">
      <!-- Title -->
      <div class="text-center mb-12 w-full">
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">
          大轉盤 <span class="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent italic">WHEEL</span>
        </h1>
        <div class="w-12 h-1 bg-pink-500 mx-auto rounded-full opacity-20"></div>
      </div>
      
      <div class="w-full flex flex-col items-center gap-12 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100 dark:border-slate-800">
      <!-- 輸入 -->
      <div class="w-full flex justify-center">
        <div class="w-full max-w-md">
           <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">轉盤選項 Wheel Options</label>
           <textarea
             v-model="inputText"
             class="w-full h-32 px-6 py-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-lg font-medium dark:text-white resize-none"
             placeholder="輸入選項，用逗號分隔..."
           ></textarea>
        </div>
      </div>

      <!-- 轉盤 -->
      <div class="relative flex justify-center items-center py-10">
        <!-- 高質感 3D 寶石指針 -->
        <div class="pointer z-20">
          <svg viewBox="0 0 100 150" class="w-full h-full">
            <defs>
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFE066" />
                <stop offset="50%" stop-color="#F5AF19" />
                <stop offset="100%" stop-color="#E65C00" />
              </linearGradient>
              <linearGradient id="ruby" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FF004D" />
                <stop offset="100%" stop-color="#8B0029" />
              </linearGradient>
              <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
                <stop offset="50%" stop-color="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path d="M 15 24 L 85 24 L 50 145 Z" fill="url(#gold)" />
            <path d="M 26 30 L 74 30 L 50 130 Z" fill="url(#ruby)" />
            <path d="M 26 30 L 50 30 L 50 130 Z" fill="url(#glass)" />
            <circle cx="50" cy="24" r="24" fill="url(#gold)" />
            <circle cx="50" cy="24" r="14" fill="#2d3748" />
            <circle cx="50" cy="24" r="8" fill="#1a202c" />
          </svg>
        </div>

        <div
          ref="wheelRef"
          class="wheel relative overflow-hidden rounded-full border-[10px] border-white dark:border-slate-800 shadow-2xl"
          :style="wheelStyle"
        >
          <div
            v-for="(item, i) in items"
            :key="i"
            class="label absolute top-1/2 left-1/2 origin-center text-white text-sm md:text-base font-extrabold"
            :style="getLabelStyle(i)"
          >
            <div
              class="label-inner inline-block"
              :ref="el => setLabelRef(el, i)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>

      <!-- 按鈕群 -->
      <div class="flex gap-4">
        <button
          @click="spin"
          :disabled="rotating || finished"
          class="relative overflow-hidden group px-12 py-5 rounded-[2rem] bg-pink-500 text-white font-black text-xl shadow-2xl shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          <span class="relative z-10 flex items-center gap-3 tracking-widest">
            <span class="text-2xl">🎪</span> 立即旋轉
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <button
          @click="resetWheel"
          :disabled="rotating"
          class="px-8 py-5 rounded-[2rem] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50 transition-all text-lg border border-slate-200 dark:border-slate-700 uppercase tracking-widest"
        >
          重置
        </button>
      </div>

      <!-- 結果 -->
      <div class="h-32 w-full max-w-sm flex items-center justify-center">
        <transition name="pop" mode="out-in">
          <div v-if="result" class="w-full py-6 px-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700/50 rounded-3xl shadow-xl shadow-amber-500/10 flex flex-col items-center justify-center gap-1">
            <div class="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-1">Result</div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-xl text-center tracking-tighter">
              🎉 {{ result }} 🎉
            </div>
          </div>
        </transition>
      </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.wheel {
  @apply w-[300px] h-[300px] md:w-[450px] md:h-[450px];
  box-shadow:
    0 0 0 8px rgba(255,255,255,0.7),
    0 30px 60px -12px rgba(0,0,0,0.4),
    inset 0 0 40px rgba(0,0,0,0.5);

  .dark & {
    box-shadow:
      0 0 0 8px rgba(15, 23, 42, 0.8),
      0 30px 60px -12px rgba(0,0,0,0.8),
      inset 0 0 40px rgba(0,0,0,0.8);
  }

  &::before {
    @apply content-empty absolute inset-0 rounded-full pointer-events-none;
    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), transparent 60%);
  }

  &::after {
    @apply content-empty absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white dark:border-slate-800;
    @apply w-[30px] h-[30px] md:w-[45px] md:h-[45px];
    background: radial-gradient(circle at 30% 30%, #ffffff 0%, #e0e0e0 40%, #9e9e9e 100%);
    box-shadow: 0 10px 20px rgba(0,0,0,0.6), inset 0 -3px 8px rgba(0,0,0,0.3);
  }
}

.label {
  text-shadow: 0 2px 6px rgba(0,0,0,0.7);
}

.pointer {
  @apply absolute left-1/2 z-20 origin-[50%_16%];
  @apply w-[40px] h-[60px] top-[10px] ml-[-20px];
  @apply md:w-[60px] md:h-[90px] md:top-[0px] md:ml-[-30px];
  filter: drop-shadow(0 20px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 5px 10px rgba(255, 215, 0, 0.5));
}

.pop-enter-active {
  animation: pop-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-out 0.3s ease;
}

@keyframes pop-in {
  0% { transform: scale(0.3); opacity: 0; filter: blur(10px); }
  100% { transform: scale(1); opacity: 1; filter: blur(0); }
}
@keyframes pop-out {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.5); opacity: 0; }
}
</style>