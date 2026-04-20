<template>
  <header class="w-full max-w-5xl flex justify-between items-center mb-12">
    <router-link to="/" class="group text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-2 font-bold text-sm">
      <span class="group-hover:-translate-x-1 transition-transform">←</span> 返回首頁
    </router-link>
    <div v-if="title" class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none opacity-50">
      {{ title }}
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
