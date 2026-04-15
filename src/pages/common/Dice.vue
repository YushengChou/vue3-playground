<template>
  <div
    class="h-screen flex flex-col items-center justify-center 
          bg-gray-100 dark:bg-gray-700"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
  >
    <!-- 控制 -->
    <div class="mb-10 text-white text-sm sm:text-base">
      <label v-for="n in 3" :key="n" class="mr-4 text-base cursor-pointer text-gray-900 dark:text-gray-100">
        <input type="radio" :value="n" v-model="diceCount" /> {{ n }} 顆
      </label>
    </div>

    <!-- 骰子區 -->
    <div class="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-12 mb-10">
      <div
        v-for="index in diceCount"
        :key="index"
        class="scene relative 
         w-20 h-20 
         sm:w-26 sm:h-26 
         md:w-30 md:h-30 
         perspective-900"
      >
        <div
          class="dice w-full h-full relative preserve-3d will-change-transform"
          :ref="el => diceRefs[index-1] = el"
        >
          <!-- faces -->
          <div class="face front"><span class="dot center"></span></div>

          <div class="face back">
            <span class="dot tl"></span>
            <span class="dot tr"></span>
            <span class="dot ml"></span>
            <span class="dot mr"></span>
            <span class="dot bl"></span>
            <span class="dot br"></span>
          </div>

          <div class="face right">
            <span class="dot tl"></span>
            <span class="dot center"></span>
            <span class="dot br"></span>
          </div>

          <div class="face left">
            <span class="dot tl"></span>
            <span class="dot tr"></span>
            <span class="dot bl"></span>
            <span class="dot br"></span>
          </div>

          <div class="face top">
            <span class="dot tl"></span>
            <span class="dot tr"></span>
            <span class="dot bl"></span>
            <span class="dot br"></span>
            <span class="dot center"></span>
          </div>

          <div class="face bottom">
            <span class="dot tl"></span>
            <span class="dot br"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 按鈕 -->
    <button
      class="px-6 py-3 text-lg sm:text-xl 
        rounded-xl bg-blue-500 text-white 
        active:scale-95 hover:bg-blue-600 transition"
      @click="rollDice"
    >
      🎲 Roll Dice
    </button>

    <!-- 結果 -->
    <div class="text-gray-900 dark:text-gray-100 text-lg mt-10">
      <div>骰子點數：{{ diceResults.join(', ') || 0 }}</div>
      <div>總和：{{ total }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from "gsap";

// 可動態控制骰子數量
const diceCount = ref(3);
const diceRefs = ref<any[]>([]);
const diceResults = ref<number[]>([]);

// 修正：點數對應朝上的旋轉角度 (front朝上=1, top朝上=5等)
const faces: any = {
  1: { x: 0, y: 0 },     // front 朝上
  2: { x: 90, y: 0 },    // bottom 朝上
  3: { x: 0, y: -90 },    // right 朝上
  4: { x: 0, y: 90 },   // left 朝上
  5: { x: -90, y: 0 },   // top 朝上
  6: { x: 0, y: 180 }    // back 朝上
};

// 計算總和
const total = computed(() => diceResults.value.reduce((a, b) => a + b, 0));

// 擲骰子
function rollDice() {
  diceResults.value = [];
  
  diceRefs.value.slice(0, diceCount.value).forEach((dice) => {
    const result = Math.floor(Math.random() * 6) + 1;
    diceResults.value.push(result);

    const target = faces[result];

    // 每次重置
    gsap.set(dice, { rotationX: 0, rotationY: 0 });

    const spinX = target.x + 360 * 3;
    const spinY = target.y + 360 * 3;

    gsap.timeline()
      .to(dice, { y: -80, duration: 0.25 })
      .to(dice, {
        rotationX: spinX,
        rotationY: spinY,
        duration: 1,
        ease: "power3.out"
      }, "<")
      .to(dice, { y: 0, duration: 0.35, ease: "bounce.out" }, "<");
  });
}

// 滑鼠拖擲
let startX = 0;
let startY = 0;
function onPointerDown(e: PointerEvent) {
  startX = e.clientX;
  startY = e.clientY;
}
function onPointerUp(e: PointerEvent) {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (Math.sqrt(dx * dx + dy * dy) > 60) rollDice();
}
</script>

<style scoped lang="scss">
.scene {
  --dice-size: 80px;

  @screen sm {
    --dice-size: 104px;
  }

  @screen md {
    --dice-size: 120px;
  }
}
.scene::after {
  content: "";
  @apply absolute w-20 h-5 bg-black/50 rounded-full left-1/2 -translate-x-1/2 blur-md;
  bottom: -15px;
}

/* 骰子面 */
.face {
  @apply absolute w-[104%] h-[104%] left-[-2%] top-[-2%]
         rounded-[14px]
         bg-[linear-gradient(145deg,#ffffff,#e8e8e8)]
         shadow-[inset_0_0_0_2px_#d8d8d8,0_6px_10px_rgba(0,0,0,0.25)];
  backface-visibility: hidden;
}

/* 六面位置（保留原生） */
.front { transform: rotateY(0deg) translateZ(calc(var(--dice-size) / 2)); }
.back { transform: rotateY(180deg) translateZ(calc(var(--dice-size) / 2)); }
.right { transform: rotateY(90deg) translateZ(calc(var(--dice-size) / 2)); }
.left { transform: rotateY(-90deg) translateZ(calc(var(--dice-size) / 2)); }
.top { transform: rotateX(90deg) translateZ(calc(var(--dice-size) / 2)); }
.bottom { transform: rotateX(-90deg) translateZ(calc(var(--dice-size) / 2)); }

/* 點 */
.dot {
  @apply w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full absolute;
  background: radial-gradient(circle at 30% 30%, #444, #000);
}

/* 點位置 */
.center { @apply top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2; }
.tl { @apply top-[20%] left-[20%]; }
.tr { @apply top-[20%] right-[20%]; }
.bl { @apply bottom-[20%] left-[20%]; }
.br { @apply bottom-[20%] right-[20%]; }
.ml { @apply top-1/2 left-[1%] sm:left-[5%] md:left-[7%] -translate-y-1/2; }
.mr { @apply top-1/2 right-[1%] sm:right-[5%] md:right-[7%] -translate-y-1/2; }
</style>
