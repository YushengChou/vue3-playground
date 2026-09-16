<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-12 transition-colors duration-500 flex flex-col items-center">
    <BaseHeader title="Location Demo" />

    <!-- 登入區 -->
    <div v-if="!isLoggedIn" class="w-full max-w-md mb-8">
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-800/60">
        <h2 class="text-xl font-bold mb-4">輸入名稱登入</h2>
        <input
          v-model="nameInput"
          type="text"
          placeholder="自訂名稱"
          @keyup.enter="handleLogin"
          class="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
        <button
          @click="handleLogin"
          :disabled="isLoggingIn"
          class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors cursor-pointer"
        >{{ isLoggingIn ? '登入中...' : '登入' }}</button>
      </div>
    </div>

    <!-- 地圖區 -->
    <div v-else class="w-full max-w-4xl flex flex-col items-center">
      <!-- 資訊卡 -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-4 mb-4 shadow border border-slate-200/60 dark:border-slate-800/60 flex justify-between w-full">
        <div>
          <p class="font-medium">使用者：{{ currentName }}</p>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            座標：{{ lat != null ? lat.toFixed(5) : '取得中...' }}, {{ lng != null ? lng.toFixed(5) : '取得中...' }}
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-400">最後更新：{{ updatedAt || '取得中...' }}</p>
          <p v-if="geoError" class="text-sm text-red-500 mt-1">⚠️ {{ geoError }}</p>
        </div>
        <button @click="handleLogout" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer transition-colors">登出 & 刪除</button>
      </div>

      <!-- Leaflet 地圖 -->
      <l-map
        :zoom="13"
        :center="[lat || 0, lng || 0]"
        style="height: 500px; width: 100%;"
        @ready="onMapReady"
        class="rounded-xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-800/60"
      >
        <l-tile-layer
          :url="tileUrl"
          :attribution="tileAttribution"
        />
        <!-- 自己的標記 -->
        <l-marker v-if="lat != null && lng != null" :lat-lng="[lat, lng]">
          <l-popup>{{ currentName }} (你)</l-popup>
        </l-marker>
        <!-- 其他使用者標記 -->
        <l-marker
          v-for="loc in otherLocations"
          :key="loc.displayName"
          :lat-lng="[loc.lat, loc.lng]"
        >
          <l-popup>{{ loc.displayName }}</l-popup>
        </l-marker>
      </l-map>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import BaseHeader from '@/components/BaseHeader.vue'
import { useLocation } from '@/composables/useLocation'

const { login, startTracking, stopTracking, logout, userName, isLoggedIn, otherLocations, subscribeOthers, watchPosition, lat, lng, updatedAt, geoError } = useLocation()

const nameInput = ref('')
const isLoggingIn = ref(false)
const currentName = computed(() => userName.value)
let unsubscribeOthers: (() => void) | null = null
let clearWatchFn: (() => void) | null = null

// 登入處理：登入成功後才抓位置
const handleLogin = async () => {
  if (!nameInput.value.trim() || isLoggingIn.value) return
  isLoggingIn.value = true
  console.log('[handleLogin] STEP 1: start')
  try {
    console.log('[handleLogin] STEP 2: calling login()')
    await login(nameInput.value.trim())
    console.log('[handleLogin] STEP 3: login done, calling startTracking()')
    await startTracking()
    console.log('[handleLogin] STEP 4: startTracking done')
    clearWatchFn = watchPosition()
    unsubscribeOthers = subscribeOthers()
    console.log('[handleLogin] STEP 5: all done')
  } catch (err) {
    console.error('[handleLogin] FAILED at step:', err)
  } finally {
    isLoggingIn.value = false
  }
}

// 登出處理
const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('登出發生錯誤：', err)
  } finally {
    stopTracking()
    if (unsubscribeOthers) {
      unsubscribeOthers()
      unsubscribeOthers = null
    }
    if (clearWatchFn) {
      clearWatchFn()
      clearWatchFn = null
    }
    lat.value = null
    lng.value = null
    updatedAt.value = ''
  }
}

onBeforeUnmount(() => {
  if (clearWatchFn) clearWatchFn()
  if (unsubscribeOthers) unsubscribeOthers()
})

// Leaflet tile
const tileUrl = computed(() => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
const tileAttribution = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'

const onMapReady = () => {}
</script>

<style scoped>
.l-map {
  height: 500px;
  width: 100%;
}
</style>
