<template>
  <div class="min-h-screen p-6 bg-slate-100 dark:bg-slate-950 transition-colors duration-500 flex flex-col items-center">
    
    <BaseHeader title="3D Physics Active" />

    <main class="w-full max-w-4xl flex flex-col items-center">
      <!-- 標題 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          3D 擲骰子 <span class="text-indigo-500 italic">Lucky Dice</span>
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium">點擊按鈕或在螢幕上滑動擲出骰子</p>
      </div>

      <!-- 控制面板 -->
      <div class="p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[2rem] shadow-xl mb-8 flex gap-2">
        <button 
          v-for="n in 5" :key="n"
          @click="diceCount = n"
          class="px-6 py-3 rounded-2xl font-bold transition-all duration-300"
          :class="diceCount === n 
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          {{ n }} 顆
        </button>
      </div>

      <!-- 骰子舞台 -->
      <div 
        class="relative w-full min-h-[200px] flex flex-wrap justify-center items-center gap-12 mb-8"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
      >
        <div
          v-for="index in diceCount"
          :key="index"
          class="scene relative w-24 h-24 sm:w-32 sm:h-32 perspective-1000"
        >
          <div
            class="dice w-full h-full relative preserve-3d will-change-transform"
            :ref="el => diceRefs[index-1] = el"
          >
            <!-- 骰子六面 -->
            <div class="face front"><span class="dot d-center"></span></div>
            <div class="face back">
              <span class="dot d-tl"></span><span class="dot d-tr"></span>
              <span class="dot d-ml"></span><span class="dot d-mr"></span>
              <span class="dot d-bl"></span><span class="dot d-br"></span>
            </div>
            <div class="face right">
              <span class="dot d-tl"></span><span class="dot d-center"></span><span class="dot d-br"></span>
            </div>
            <div class="face left">
              <span class="dot d-tl"></span><span class="dot d-tr"></span>
              <span class="dot d-bl"></span><span class="dot d-br"></span>
            </div>
            <div class="face top">
              <span class="dot d-tl"></span><span class="dot d-tr"></span>
              <span class="dot d-center"></span>
              <span class="dot d-bl"></span><span class="dot d-br"></span>
            </div>
            <div class="face bottom">
              <span class="dot d-tl"></span><span class="dot d-br"></span>
            </div>
          </div>
          <!-- 骰子陰影 -->
          <div class="dice-shadow"></div>
        </div>
      </div>

      <!-- 互動按鈕 -->
      <div class="flex flex-col items-center gap-8">
        <button
          @click="rollDice"
          :disabled="isRolling"
          class="group relative px-12 py-5 rounded-[2rem] bg-indigo-500 text-white font-black text-xl shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 overflow-hidden"
        >
          <span class="relative z-10 flex items-center gap-3">
             <span class="text-2xl">🎲</span> {{ isRolling ? '正在旋轉...' : '擲骰子 ROLL' }}
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <!-- 結果顯示 -->
        <transition name="fade">
          <div v-if="diceResults.length > 0" class="flex flex-col items-center bg-white dark:bg-slate-900 px-10 py-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
             <div class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">總和 Total Result</div>
             <div class="text-6xl font-black text-slate-800 dark:text-white">{{ total }}</div>
             <div class="flex gap-3 mt-4">
                <span 
                  v-for="(val, idx) in diceResults" :key="idx"
                  class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm"
                >
                  {{ val }}
                </span>
             </div>
          </div>
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseHeader from '@/components/BaseHeader.vue'
import { gsap } from "gsap";

const diceCount = ref(2);
const diceRefs = ref<any[]>([]);
const diceResults = ref<number[]>([]);
const isRolling = ref(false);

const faces: any = {
  1: { x: 0, y: 0 },       // Front
  2: { x: 90, y: 0 },      // Bottom
  3: { x: 0, y: -90 },     // Right
  4: { x: 0, y: 90 },      // Left
  5: { x: -90, y: 0 },     // Top
  6: { x: 0, y: 180 }      // Back
};

const total = computed(() => diceResults.value.reduce((a, b) => a + b, 0));

function rollDice() {
  if (isRolling.value) return;
  isRolling.value = true;
  diceResults.value = [];
  
  const currentRefs = diceRefs.value.slice(0, diceCount.value);
  
  currentRefs.forEach((dice, index) => {
    const result = Math.floor(Math.random() * 6) + 1;
    diceResults.value.push(result);

    const targetPos = faces[result];
    const randomRotX = (Math.floor(Math.random() * 5) + 5) * 360; 
    const randomRotY = (Math.floor(Math.random() * 5) + 5) * 360;

    // 動畫序列
    const tl = gsap.timeline({
      onComplete: () => {
        if (index === currentRefs.length - 1) isRolling.value = false;
      }
    });

    tl.to(dice, {
      y: -120 - Math.random() * 50,
      rotationX: randomRotX + targetPos.x,
      rotationY: randomRotY + targetPos.y,
      duration: 0.8 + Math.random() * 0.4,
      ease: "power2.out"
    })
    .to(dice, {
      y: 0,
      duration: 0.6,
      ease: "bounce.out"
    });

    // 陰影動畫
    const shadow = dice.parentElement.querySelector('.dice-shadow');
    gsap.timeline()
      .to(shadow, { scale: 0.5, opacity: 0.1, duration: 0.6, ease: "power2.out" })
      .to(shadow, { scale: 1, opacity: 0.2, duration: 0.6, ease: "bounce.out" });
  });
}

// 支援滑動拋擲
let startX = 0;
let startY = 0;
function onPointerDown(e: PointerEvent) {
  startX = e.clientX;
  startY = e.clientY;
}
function onPointerUp(e: PointerEvent) {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (Math.sqrt(dx * dx + dy * dy) > 80) rollDice();
}

onMounted(() => {
  diceResults.value = [];
})
</script>

<style scoped lang="scss">
.preserve-3d { transform-style: preserve-3d; }

.scene {
  --dice-size: 96px;
  @screen sm { --dice-size: 128px; }
}

.dice-shadow {
  @apply absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-slate-900/20 dark:bg-black/40 rounded-full blur-xl -z-10 transition-opacity;
  opacity: 0.2;
}

.face {
  @apply absolute w-full h-full border border-slate-200 dark:border-slate-800 rounded-2xl;
  background: linear-gradient(145deg, #ffffff, #f1f5f9);
  box-shadow: inset 0 0 15px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.1);
  backface-visibility: hidden;
  
  .dark & {
    background: linear-gradient(145deg, #1e293b, #0f172a);
    box-shadow: inset 0 0 15px rgba(255,255,255,0.02), 0 5px 20px rgba(0,0,0,0.5);
  }
}

.front  { transform: rotateY(0deg) translateZ(calc(var(--dice-size) / 2)); }
.back   { transform: rotateY(180deg) translateZ(calc(var(--dice-size) / 2)); }
.right  { transform: rotateY(90deg) translateZ(calc(var(--dice-size) / 2)); }
.left   { transform: rotateY(-90deg) translateZ(calc(var(--dice-size) / 2)); }
.top    { transform: rotateX(90deg) translateZ(calc(var(--dice-size) / 2)); }
.bottom { transform: rotateX(-90deg) translateZ(calc(var(--dice-size) / 2)); }

.dot {
  @apply absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full -translate-x-1/2 -translate-y-1/2;
  background: radial-gradient(circle at 30% 30%, #4f46e5, #312e81);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
  
  .dark & {
    background: radial-gradient(circle at 30% 30%, #818cf8, #4338ca);
  }
}

/* 點位置精確對齊 (使用 25% 和 75% 確保對稱) */
.d-center { @apply top-1/2 left-1/2; }
.d-tl { @apply top-[25%] left-[25%]; }
.d-tr { @apply top-[25%] left-[75%]; }
.d-bl { @apply top-[75%] left-[25%]; }
.d-br { @apply top-[75%] left-[75%]; }
.d-ml { @apply top-1/2 left-[25%]; }
.d-mr { @apply top-1/2 left-[75%]; }

.fade-enter-active, .fade-leave-active { transition: all 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>

