<template>
  <header class="mb-8 flex w-full max-w-5xl items-center justify-between">
    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{{ title }}</span>
    <button type="button" class="grid h-11 w-11 place-items-center rounded-2xl border border-slate-300 bg-white text-xl shadow-sm transition active:scale-95 dark:border-slate-700 dark:bg-slate-900" :aria-label="isDark ? '切換為亮色模式' : '切換為暗色模式'" @click="toggleTheme">{{ isDark ? '☀️' : '🌙' }}</button>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{ title?: string }>()
const isDark = ref(false)
const themeKey = 'banqi_vue_theme'

function applyTheme() { document.documentElement.classList.toggle('dark', isDark.value) }
function toggleTheme() { isDark.value = !isDark.value; localStorage.setItem(themeKey, isDark.value ? 'dark' : 'light'); applyTheme() }
onMounted(() => {
  const saved = localStorage.getItem(themeKey)
  isDark.value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme()
})
</script>
