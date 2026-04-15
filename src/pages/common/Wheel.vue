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
  const count = items.value.length

  const segments = items.value.map((_, i) => {
    const start = i * anglePerItem.value
    const end = start + anglePerItem.value

    // 🎨 HSL 平均分布（關鍵🔥）
    const hue = Math.round((i / count) * 360)

    return `hsl(${hue}, 70%, 60%) ${start}deg ${end}deg`
  })

  return {
    background: `conic-gradient(${segments.join(',')})`
  }
})

/** 🎯 旋轉（已修正多次旋轉 bug） */
const spin = async () => {
  if (rotating.value || items.value.length === 0 || finished.value) return

  rotating.value = true
  result.value = ''

  const count = items.value.length
  const index = Math.floor(Math.random() * count)

  /** 轉盤旋轉角度 */
  const target =
    360 * 5 +
    (360 - index * anglePerItem.value - anglePerItem.value / 2)

  await nextTick()

  /** ✅ 用 GSAP 累加（最穩🔥） */
  gsap.to(wheelRef.value, {
    rotate: `+=${target}`,
    duration: 3.5,
    ease: 'power4.out',
    onComplete: () => {
      result.value = items.value[index]
      finished.value = true // 🔒 鎖住
      // ✅ 選中扇形動畫
      const selectedEl = labelRefs.value[index]

      if (selectedEl) {
        gsap.fromTo(
          selectedEl,
          { scale: 1 },
          {
            scale: 1.3,
            duration: 0.3,
            yoyo: true,
            repeat: 3,
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
      <!-- 指針 -->
      <div class="pointer"></div>

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
    <div v-if="result" class="text-xl font-bold dark:text-white">
      🎉 結果：{{ result }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.wheel {
  @apply w-[280px] h-[280px] md:w-[400px] md:h-[400px]
         rounded-full relative overflow-hidden;

  /** 🌞 Light */
  background: linear-gradient(145deg, #ffffffcc, #e5e7ebcc);

  /** 🌙 Dark（關鍵🔥） */
  @apply dark:bg-gradient-to-br dark:from-[#0f172a] dark:to-[#1e293b];

  backdrop-filter: blur(30px);

  border: 1px solid rgba(255,255,255,0.4);
  @apply dark:border-white/10;

  box-shadow:
    0 20px 50px rgba(0,0,0,0.25),
    inset 0 2px 10px rgba(255,255,255,0.4);

  // transform: rotateX(15deg);

  /** ✨ 上層高光 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.6), transparent 60%);
    pointer-events: none;
  }
}

/** 🏷️ 文字（這版會乾淨很多） */
.label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;

  @apply text-gray-800 dark:text-white
         text-xs md:text-sm font-semibold;

  letter-spacing: 1px;

  /** ✨ 提升可讀性 */
  text-shadow:
    0 1px 2px rgba(0,0,0,0.2);

  @apply dark:text-shadow-[0_2px_4px_rgba(0,0,0,0.8)];
  .label-inner {
    display: inline-block;
  }
}

/** 🔺 指針（升級重點🔥） */
.pointer {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  z-index: 1;
  width: 0;
  height: 0;

  border-left: 16px solid transparent;
  border-right: 16px solid transparent;

  border-bottom: 26px solid #ef4444;

  filter: drop-shadow(0 6px 10px rgba(0,0,0,0.4));
}

/** 🧊 中心（做焦點🔥🔥） */
.wheel::after {
  content: '';
  position: absolute;

  width: 30px;
  height: 30px;

  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: radial-gradient(circle, #ffffff, #d1d5db);

  @apply dark:bg-gradient-to-br dark:from-gray-200 dark:to-gray-500;

  box-shadow:
    0 6px 15px rgba(0,0,0,0.4),
    inset 0 3px 8px rgba(255,255,255,0.6);
}
</style>