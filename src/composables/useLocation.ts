// src/composables/useLocation.ts
import { ref, computed, onUnmounted } from 'vue'
import { db, anonymousLogin } from '@/firebase'
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth } from '@/firebase'

export interface UserLocation {
  displayName: string
  lat: number
  lng: number
  updatedAt: any // Firestore timestamp
}

const STORAGE_KEY = 'location_user_name'

export function useLocation() {
  const userName = ref<string>(localStorage.getItem(STORAGE_KEY) || '')
  const watchId = ref<number | null>(null)
  const intervalId = ref<number | null>(null)
  const otherLocations = ref<UserLocation[]>([])
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const updatedAt = ref<string>('')
  const geoError = ref<string | null>(null)

  // ---------- 確保匿名認證 ----------
  const ensureAuth = async () => {
    console.log('[ensureAuth] currentUser:', auth.currentUser)
    if (!auth.currentUser) {
      console.log('[ensureAuth] calling anonymousLogin...')
      const result = await anonymousLogin()
      console.log('[ensureAuth] anonymousLogin result:', result)
    }
  }

  // ---------- 位置寫入 ----------
  const writeLocation = async (latVal: number, lngVal: number) => {
    if (!userName.value) return
    const userDoc = doc(db, 'users', userName.value)
    await setDoc(userDoc, {
      lat: latVal,
      lng: lngVal,
      updatedAt: serverTimestamp(),
      displayName: userName.value,
    }, { merge: true }).catch(err => console.warn('writeLocation error:', err))
  }

  // ---------- 登入（只處理 auth + Firestore，不做 GPS）----------
  const login = async (name: string) => {
    console.log('[login] A: start')
    userName.value = name
    localStorage.setItem(STORAGE_KEY, name)
    console.log('[login] B: before ensureAuth')
    await ensureAuth()
    console.log('[login] C: after ensureAuth, before setDoc')
    const userDoc = doc(db, 'users', name)
    const setDocPromise = setDoc(userDoc, { displayName: name }, { merge: true })
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('setDoc timeout after 8s')), 8000))
    await Promise.race([setDocPromise, timeout])
    console.log('[login] D: done')
  }

  // ---------- 取得現在位置（Promise 版，登入後呼叫）----------
  const fetchCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
      })
    })
  }

  // ---------- 開始追蹤（登入後呼叫）----------
  const startTracking = async () => {
    if (!navigator.geolocation) {
      geoError.value = '此瀏覽器不支援定位功能'
      return
    }
    geoError.value = null
    // 等登入後才抓第一次位置（以 Promise 方式 await，確保拿到值才繼續）
    try {
      const pos = await fetchCurrentPosition()
      lat.value = pos.coords.latitude
      lng.value = pos.coords.longitude
      updatedAt.value = new Date().toLocaleTimeString()
      writeLocation(pos.coords.latitude, pos.coords.longitude)
    } catch (err: any) {
      // err.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
      const codeMap: Record<number, string> = {
        1: '定位權限被拒絕，請在瀏覽器設定中允許位置存取',
        2: '無法取得位置資訊（信號不佳）',
        3: '取得位置逾時，請稍後重試',
      }
      geoError.value = codeMap[err.code] ?? `定位錯誤：${err.message}`
      console.warn('[useLocation] getCurrentPosition error:', err.code, err.message)
    }

    // 持續監聽位置變化（用於即時移動）
    watchId.value = navigator.geolocation.watchPosition(pos => {
      geoError.value = null
      lat.value = pos.coords.latitude
      lng.value = pos.coords.longitude
      updatedAt.value = new Date().toLocaleTimeString()
      writeLocation(pos.coords.latitude, pos.coords.longitude)
    }, err => {
      console.warn('[useLocation] watchPosition error:', err.code, err.message)
    })

    // 每分鐘強制寫入一次
    intervalId.value = setInterval(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        lat.value = pos.coords.latitude
        lng.value = pos.coords.longitude
        updatedAt.value = new Date().toLocaleTimeString()
        writeLocation(pos.coords.latitude, pos.coords.longitude)
      }, err => console.warn('interval error:', err))
    }, 60000) as unknown as number
  }

  // ---------- 停止追蹤 ----------
  const stopTracking = () => {
    if (watchId.value !== null) {
      navigator.geolocation.clearWatch(watchId.value)
      watchId.value = null
    }
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  // 回傳清除函式（供元件在 unmount 時呼叫）
  const watchPosition = () => {
    return () => {
      stopTracking()
    }
  }

  // ---------- 登出 & 刪除文件 ----------
  const logout = async () => {
    stopTracking()
    const nameToDelete = userName.value
    userName.value = ''
    localStorage.removeItem(STORAGE_KEY)
    if (nameToDelete) {
      try {
        await deleteDoc(doc(db, 'users', nameToDelete))
      } catch (err) {
        console.warn('刪除使用者文件失敗或權限不足：', err)
      }
    }
  }

  // ---------- 訂閱其他使用者位置 ----------
  const subscribeOthers = () => {
    const usersCol = collection(db, 'users')
    return onSnapshot(usersCol, snap => {
      const list: UserLocation[] = []
      snap.forEach(docSnap => {
        if (docSnap.id !== userName.value) {
          const data = docSnap.data() as UserLocation
          // 只有当 lat / lng 都存在时才加入列表
          if (typeof data.lat === 'number' && typeof data.lng === 'number') {
            list.push({ ...data, displayName: data.displayName })
          }
        }
      })
      otherLocations.value = list
    })
  }

  // ---------- 生命週期 ----------
  onUnmounted(() => {
    stopTracking()
  })

  const isLoggedIn = computed(() => !!userName.value)

  return {
    userName,
    isLoggedIn,
    login,
    startTracking,
    stopTracking,
    logout,
    otherLocations: computed(() => otherLocations.value),
    subscribeOthers,
    writeLocation,
    watchPosition,
    lat,
    lng,
    updatedAt,
    geoError,
  }
}
