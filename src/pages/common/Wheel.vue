<script setup lang="ts">
import gsap from 'gsap'

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
    ease: 'circ.out', // 使用 circ 可以讓最後停止的滑行感更明顯
    onUpdate: function () {
      const p = this.progress()
      if (!wheelRef.value) return
      const currentRot = gsap.getProperty(wheelRef.value, 'rotate') as number

      // 動能參數：隨著轉盤進度越接近結尾，抖動幅度越來越小（用 1.5 次方做平滑衰減曲線）
      const power = Math.pow(1 - p, 1.5)
      
      // 頻率參數：用目前的轉盤角度除以每塊的角度，讓指針真正對應到格子邊緣的「打擊感」
      const phase = (currentRot / anglePerItem.value) * Math.PI * 2
      
      // 振幅：最大抖動 22 度
      gsap.set('.pointer', { rotate: Math.sin(phase) * (22 * power) })
    },
    onComplete: () => {
      // 🌟 指針回正、轉盤完美回彈
      gsap.to('.pointer', { rotate: 0, duration: 0.6, ease: 'back.out(2)' })
      gsap.to(wheelRef.value, { scale: 1, duration: 0.6, ease: 'back.out(2)' })

      result.value = items.value[index]
      finished.value = true 

      // ✅ 選中扇形發光閃爍動畫
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

  /** 👉 防止數值爆掉（長時間使用） */
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
  finished.value = false // 🔓 解鎖
  // 重置文字縮放、光暈
  Object.values(labelRefs.value).forEach(el => {
    if (el) {
      gsap.set(el, { scale: 1 })
    }
  })
}

const wheelSize = ref(300) // 用於 rwd

let ro: ResizeObserver | null = null

/** 監控 wheel 尺寸 */
onMounted(() => {
  if (wheelRef.value) {
    ro = new ResizeObserver(() => {
      // 此"!"在TypeScript為非空斷言（Non-Null Assertion Operator）表示此時不是 null 或 undefined
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
  <div class="p-4 flex flex-col items-center gap-6
    bg-gradient-to-br min-h-screen
    from-gray-100 to-gray-200
    dark:from-[#020617] dark:to-[#0f172a]
    transition-colors"
  >
    <!-- 輸入 -->
    <textarea
      v-model="inputText"
      class="w-full max-w-md p-3 rounded-lg border dark:bg-gray-800 dark:text-white"
      rows="3"
      placeholder="輸入選項，用逗號分隔"
    />

    <!-- 轉盤 -->
    <div class="relative flex justify-center items-center">
      <!-- 高質感 3D 寶石指針 -->
      <div class="pointer">
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
          
          <!-- 外框金底 -->
          <path d="M 15 24 L 85 24 L 50 145 Z" fill="url(#gold)" />
          <!-- 裡面紅寶石主體 -->
          <path d="M 26 30 L 74 30 L 50 130 Z" fill="url(#ruby)" />
          <!-- 左側高光增加寶石切割度 -->
          <path d="M 26 30 L 50 30 L 50 130 Z" fill="url(#glass)" />
          <!-- 頂部樞紐固定環 -->
          <circle cx="50" cy="24" r="24" fill="url(#gold)" />
          <circle cx="50" cy="24" r="14" fill="#2d3748" />
          <circle cx="50" cy="24" r="8" fill="#1a202c" />
        </svg>
      </div>

      <!-- 圓盤 -->
      <div
        ref="wheelRef"
        class="wheel"
        :style="wheelStyle"
      >
        <!-- 文字 -->
        <div
          v-for="(item, i) in items"
          :key="i"
          class="label"
          :style="getLabelStyle(i)"
        >
          <div
            class="label-inner"
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
        class="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition"
      >
        旋轉
      </button>

      <button
        @click="resetWheel"
        :disabled="rotating"
        class="px-6 py-2 rounded-full bg-gray-400 dark:bg-gray-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition"
      >
        重置
      </button>
    </div>

    <!-- 結果 -->
    <div class="h-16">
      <transition name="pop" mode="out-in">
        <div v-if="result" class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-xl text-center">
          🎉 {{ result }} 🎉
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wheel {
  @apply w-[280px] h-[280px] md:w-[400px] md:h-[400px]
         rounded-full relative overflow-hidden
         border-[10px] border-white dark:border-gray-800;

  box-shadow:
    0 0 0 6px rgba(255,255,255,0.3),
    0 30px 60px -12px rgba(0,0,0,0.6),
    inset 0 0 40px rgba(0,0,0,0.5);

  /** ✨ 上層高光 */
  &::before {
    @apply content-empty absolute inset-0 rounded-full pointer-events-none;
    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), transparent 50%);
  }
}

/** 🏷️ 文字 */
.label {
  @apply absolute top-1/2 left-1/2 origin-center
         text-white text-sm md:text-base font-extrabold tracking-[1px];

  /** ✨ 提升可讀性與深度 */
  text-shadow: 0 2px 5px rgba(0,0,0,0.6);

  .label-inner {
    @apply inline-block;
  }
}

/** 🔺 高規精工指針（搭配 SVG） */
.pointer {
  @apply absolute top-[-30px] left-1/2 ml-[-30px] z-20 
         w-[60px] h-[90px] origin-[50%_16%];
  
  /* 立體光影效果無法用一般 util 所以保留 */
  filter: drop-shadow(0 15px 12px rgba(0, 0, 0, 0.6)) 
          drop-shadow(0 2px 5px rgba(255, 215, 0, 0.4));
}

/** 🧊 中心轉軸 金屬鈕扣 */
.wheel::after {
  @apply content-empty absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
         w-[45px] h-[45px] rounded-full border-4 border-white;

  background: radial-gradient(circle at 30% 30%, #ffffff 0%, #e0e0e0 40%, #9e9e9e 100%);

  box-shadow:
    0 10px 20px rgba(0,0,0,0.6),
    inset 0 -3px 8px rgba(0,0,0,0.3);
}

/* 🎇 結果跳出特效 */
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