<template>
  <div class="min-h-screen bg-stone-100 p-5 text-stone-900 dark:bg-slate-950 dark:text-white sm:p-8">
    <BaseHeader title="BANQI" />

    <main class="mx-auto w-full max-w-2xl">
      <section class="mb-6 text-center">
        <p class="mb-2 text-xs font-black tracking-[0.32em] text-amber-700 dark:text-amber-400">CHINESE DARK CHESS</p>
        <h1 class="text-4xl font-black tracking-tight sm:text-5xl">象棋暗棋</h1>
        <p class="mt-3 text-sm text-stone-500 dark:text-slate-400">雙人同機對戰・翻出第一枚棋子決定陣營</p>
      </section>

      <section class="mb-5 rounded-2xl bg-white p-5 shadow-lg shadow-stone-300/30 dark:bg-slate-900 dark:shadow-none">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-black tracking-[0.18em] text-amber-700 dark:text-amber-400">好友連線對戰</p>
            <p class="mt-1 text-sm font-bold">{{ roomId ? `房間 ${roomId}` : authUser ? `已匿名登入：${displayName}` : '登入後可建立或加入房間' }}</p>
          </div>
          <div v-if="roomId" class="flex shrink-0 gap-2">
            <button type="button" class="rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100" @click="copyRoomCode">{{ copied ? '已複製' : '複製房號' }}</button>
            <button type="button" class="rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600 dark:bg-slate-800 dark:text-slate-300" @click="leaveRoom">離開房間</button>
          </div>
        </div>
        <div v-if="!roomId" class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input v-model.trim="displayName" class="min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800" maxlength="16" placeholder="輸入暱稱" @keyup.enter="login" />
          <button type="button" class="rounded-xl bg-amber-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50" :disabled="busy" @click="createRoom">建立房間</button>
          <div class="flex gap-2"><input v-model.trim="roomCode" class="min-w-0 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm uppercase outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800" placeholder="房號" @keyup.enter="joinRoom" /><button type="button" class="shrink-0 rounded-xl bg-stone-800 px-4 py-3 text-sm font-black text-white dark:bg-slate-700 disabled:opacity-50" :disabled="busy" @click="joinRoom">加入</button></div>
        </div>
        <p v-else class="mt-3 text-xs text-stone-500 dark:text-slate-400">{{ roomStatus === 'waiting' ? '等待好友輸入房號加入…' : `正在與 ${opponentName} 對戰` }}</p>
        <p v-if="roomError" class="mt-3 text-xs font-bold text-red-600">{{ roomError }}</p>
      </section>

      <section class="mb-5 grid grid-cols-2 gap-3">
        <div class="rounded-2xl border-2 p-4 transition-colors" :class="playerCardClass(0)">
          <div class="flex items-center justify-between text-xs font-black tracking-widest"><span>玩家 1</span><span v-if="currentPlayer === 0">回合中</span></div>
          <p class="mt-1 text-lg font-black">{{ playerName(0) }}・{{ playerColorName(0) }}</p>
          <p class="mt-1 text-xs opacity-70">剩餘 {{ remainingForPlayer(0) }} 枚</p>
        </div>
        <div class="rounded-2xl border-2 p-4 transition-colors" :class="playerCardClass(1)">
          <div class="flex items-center justify-between text-xs font-black tracking-widest"><span>玩家 2</span><span v-if="currentPlayer === 1">回合中</span></div>
          <p class="mt-1 text-lg font-black">{{ playerName(1) }}・{{ playerColorName(1) }}</p>
          <p class="mt-1 text-xs opacity-70">剩餘 {{ remainingForPlayer(1) }} 枚</p>
        </div>
      </section>

      <section class="rounded-[1.75rem] bg-gradient-to-br from-amber-950 via-amber-900 to-stone-950 p-3 shadow-2xl shadow-amber-950/30 sm:p-5">
        <div class="grid grid-cols-4 overflow-hidden rounded-xl border border-amber-200/30 bg-amber-100/15">
          <button
            v-for="(tile, index) in board"
            :key="tile?.id ?? `empty-${index}`"
            type="button"
            class="aspect-square border border-amber-100/20 p-1 transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            :class="tileClass(tile, index)"
            :aria-label="tile ? (tile.revealed ? `${colorLabel(tile.color)}${tile.name}` : '覆蓋的棋子') : '空格'"
            @click="selectTile(index)"
          >
            <span v-if="tile?.revealed" class="tile-piece" :class="tile.color === 'red' ? 'piece-red' : 'piece-black'">{{ tile.symbol }}</span>
            <span v-else-if="tile" class="tile-back">象</span>
          </button>
        </div>
      </section>

      <section class="mt-5 rounded-2xl bg-white p-5 text-center shadow-lg shadow-stone-300/30 dark:bg-slate-900 dark:shadow-none">
        <p class="text-xs font-black tracking-[0.2em] text-amber-700 dark:text-amber-400">遊戲狀態</p>
        <p class="mt-2 text-base font-bold">{{ status }}</p>
        <button type="button" class="mt-4 rounded-xl bg-amber-700 px-6 py-3 text-sm font-black text-white shadow-lg shadow-amber-800/20 transition hover:bg-amber-800 active:scale-95 disabled:opacity-50" :disabled="!!roomId && roomStatus === 'waiting'" @click="newGame">重新開局</button>
      </section>

      <details class="mt-5 rounded-2xl bg-white px-5 py-4 text-sm text-stone-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
        <summary class="cursor-pointer font-black text-stone-800 dark:text-white">暗棋規則</summary>
        <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>翻出第一枚棋子的一方取得該顏色；每回合可翻一枚未翻棋，或移動／吃掉一枚自己的棋子。</li>
          <li>除了炮以外，棋子僅能上下左右走一格。炮可直線移動，吃子時需隔著剛好一枚棋子。</li>
          <li>大小為：將／帥、士、象、車、馬、卒／兵；兵卒可吃將／帥與兵卒，將／帥不能吃兵卒。</li>
        </ul>
      </details>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BaseHeader from '@/components/BaseHeader.vue'
import { auth, anonymousLogin, db } from '@/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

type Color = 'red' | 'black'
type Rank = 'king' | 'guard' | 'elephant' | 'rook' | 'horse' | 'cannon' | 'pawn'
interface Tile { id: string; color: Color; rank: Rank; name: string; symbol: string; revealed: boolean }
type RoomStatus = 'waiting' | 'playing' | 'finished'
interface RoomData { hostUid: string; hostName: string; guestUid: string | null; guestName: string | null; status: RoomStatus; board: Array<Tile | null>; currentPlayer: number; playerColors: Color[]; winner: Color | null }

const definitions: Record<Color, Record<Rank, { name: string; symbol: string; count: number; strength: number }>> = {
  red: { king: { name: '帥', symbol: '帥', count: 1, strength: 6 }, guard: { name: '仕', symbol: '仕', count: 2, strength: 5 }, elephant: { name: '相', symbol: '相', count: 2, strength: 4 }, rook: { name: '俥', symbol: '俥', count: 2, strength: 3 }, horse: { name: '傌', symbol: '傌', count: 2, strength: 2 }, cannon: { name: '炮', symbol: '炮', count: 2, strength: 0 }, pawn: { name: '兵', symbol: '兵', count: 5, strength: 1 } },
  black: { king: { name: '將', symbol: '將', count: 1, strength: 6 }, guard: { name: '士', symbol: '士', count: 2, strength: 5 }, elephant: { name: '象', symbol: '象', count: 2, strength: 4 }, rook: { name: '車', symbol: '車', count: 2, strength: 3 }, horse: { name: '馬', symbol: '馬', count: 2, strength: 2 }, cannon: { name: '包', symbol: '包', count: 2, strength: 0 }, pawn: { name: '卒', symbol: '卒', count: 5, strength: 1 } },
}

function createBoard() {
  const pieces: Tile[] = []
  ;(['red', 'black'] as Color[]).forEach(color => {
    ;(Object.keys(definitions[color]) as Rank[]).forEach(rank => {
      const data = definitions[color][rank]
      for (let number = 0; number < data.count; number++) pieces.push({ id: `${color}-${rank}-${number}`, color, rank, name: data.name, symbol: data.symbol, revealed: false })
    })
  })
  for (let index = pieces.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[pieces[index], pieces[other]] = [pieces[other], pieces[index]]
  }
  return pieces
}

const board = ref<Array<Tile | null>>(createBoard())
const currentPlayer = ref(0)
const playerColors = ref<Color[]>([])
const selected = ref<number | null>(null)
const winner = ref<Color | null>(null)
const authUser = ref<User | null>(null)
const displayName = ref(localStorage.getItem('banqi_display_name') || '')
const roomCode = ref('')
const roomId = ref('')
const roomStatus = ref<RoomStatus>('waiting')
const hostUid = ref('')
const guestUid = ref<string | null>(null)
const hostName = ref('玩家 1')
const guestName = ref('玩家 2')
const busy = ref(false)
const roomError = ref('')
const copied = ref(false)
let stopRoomListener: (() => void) | undefined
let stopAuthListener: (() => void) | undefined
const isOnline = computed(() => !!roomId.value)
const isMyTurn = computed(() => !isOnline.value || (roomStatus.value === 'playing' && (currentPlayer.value === 0 ? hostUid.value : guestUid.value) === authUser.value?.uid))
const opponentName = computed(() => authUser.value?.uid === hostUid.value ? guestName.value : hostName.value)
const status = computed(() => {
  if (winner.value) return `${colorLabel(winner.value)}方獲勝！`
  if (isOnline.value && roomStatus.value === 'waiting') return '等待好友加入房間'
  if (isOnline.value && !isMyTurn.value) return '等待對手走棋'
  if (!playerColors.value.length) return `玩家 ${currentPlayer.value + 1}，請翻開第一枚棋子` 
  return selected.value === null ? `玩家 ${currentPlayer.value + 1}（${colorLabel(playerColors.value[currentPlayer.value])}）請翻棋或選擇棋子` : '請選擇合法的移動或吃子位置'
})

function colorLabel(color: Color) { return color === 'red' ? '紅' : '黑' }
function playerColorName(player: number) { return playerColors.value[player] ? `${colorLabel(playerColors.value[player])}方` : '尚未決定' }
function playerName(player: number) { return isOnline.value ? (player === 0 ? hostName.value : guestName.value) : `玩家 ${player + 1}` }
function remainingForPlayer(player: number) { const color = playerColors.value[player]; return color ? board.value.filter(tile => tile?.color === color).length : 16 }
function nextTurn() { selected.value = null; currentPlayer.value = currentPlayer.value === 0 ? 1 : 0 }
function newGame() { board.value = createBoard(); currentPlayer.value = 0; playerColors.value = []; selected.value = null; winner.value = null; void syncGame() }

function selectTile(index: number) {
  if (winner.value || !isMyTurn.value) return
  const tile = board.value[index]
  if (!tile) {
    if (selected.value !== null && isLegalMove(selected.value, index)) moveSelected(index)
    return
  }
  if (!tile.revealed) {
    tile.revealed = true
    if (!playerColors.value.length) playerColors.value = [tile.color, tile.color === 'red' ? 'black' : 'red']
    nextTurn()
    void syncGame()
    return
  }
  const activeColor = playerColors.value[currentPlayer.value]
  if (selected.value === null) {
    if (tile.color === activeColor) selected.value = index
    return
  }
  if (selected.value === index) { selected.value = null; return }
  if (tile.color === activeColor) { selected.value = index; return }
  if (!isLegalMove(selected.value, index)) return
  moveSelected(index)
}

function moveSelected(index: number) {
  const from = selected.value
  if (from === null) return
  const moving = board.value[from]
  if (!moving) return
  board.value[index] = moving
  board.value[from] = null
  const defeatedColor = moving.color === 'red' ? 'black' : 'red'
  if (!board.value.some(piece => piece?.color === defeatedColor)) { winner.value = moving.color; selected.value = null; void syncGame(); return }
  nextTurn()
  void syncGame()
}

async function login() {
  const nickname = displayName.value.trim()
  if (!nickname) { roomError.value = '請先輸入暱稱'; return false }
  roomError.value = ''
  await anonymousLogin()
  authUser.value = auth.currentUser
  if (!authUser.value) { roomError.value = '匿名登入失敗，請稍後再試'; return false }
  localStorage.setItem('banqi_display_name', nickname)
  await setDoc(doc(db, 'banqiUsers', authUser.value.uid), { nickname, updatedAt: serverTimestamp() }, { merge: true })
  return true
}

async function createRoom() {
  busy.value = true
  try {
    if (!await login() || !authUser.value) return
    let id = ''
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = generateRoomCode()
      const room = doc(db, 'banqiRooms', candidate)
      const created = await runTransaction(db, async transaction => {
        if ((await transaction.get(room)).exists()) return false
        transaction.set(room, { hostUid: authUser.value!.uid, hostName: displayName.value, guestUid: null, guestName: null, status: 'waiting', board: board.value, currentPlayer: 0, playerColors: [], winner: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
        return true
      })
      if (created) { id = candidate; break }
    }
    if (!id) throw new Error('房號產生失敗，請再試一次')
    listenRoom(id)
  } catch (error) { roomError.value = `建立房間失敗：${error instanceof Error ? error.message : '請檢查 Firebase 設定'}` } finally { busy.value = false }
}

async function joinRoom() {
  const code = roomCode.value.trim()
  if (!code) { roomError.value = '請輸入房號'; return }
  busy.value = true
  try {
    if (!await login() || !authUser.value) return
    const room = doc(db, 'banqiRooms', code)
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(room)
      if (!snapshot.exists()) throw new Error('找不到這個房間')
      const data = snapshot.data() as RoomData
      if (data.hostUid !== authUser.value!.uid && data.guestUid && data.guestUid !== authUser.value!.uid) throw new Error('房間已滿')
      if (data.hostUid !== authUser.value!.uid && !data.guestUid) transaction.update(room, { guestUid: authUser.value!.uid, guestName: displayName.value, status: 'playing', updatedAt: serverTimestamp() })
    })
    listenRoom(code)
  } catch (error) { roomError.value = `加入失敗：${error instanceof Error ? error.message : '請檢查房號'}` } finally { busy.value = false }
}

function listenRoom(id: string) {
  stopRoomListener?.()
  roomError.value = ''
  roomId.value = id
  roomCode.value = id
  stopRoomListener = onSnapshot(doc(db, 'banqiRooms', id), snapshot => {
    if (!snapshot.exists()) { leaveRoom(); roomError.value = '房間已不存在'; return }
    const data = snapshot.data() as RoomData
    board.value = data.board
    currentPlayer.value = data.currentPlayer
    playerColors.value = data.playerColors || []
    winner.value = data.winner || null
    hostUid.value = data.hostUid; guestUid.value = data.guestUid; hostName.value = data.hostName; guestName.value = data.guestName || '等待加入'; roomStatus.value = data.status
    selected.value = null
  }, error => { roomError.value = `連線中斷：${error.message}` })
}

async function syncGame() {
  if (!roomId.value) return
  try { await updateDoc(doc(db, 'banqiRooms', roomId.value), { board: board.value, currentPlayer: currentPlayer.value, playerColors: playerColors.value, winner: winner.value, status: winner.value ? 'finished' : 'playing', updatedAt: serverTimestamp() }) } catch (error) { roomError.value = `同步棋局失敗：${error instanceof Error ? error.message : ''}` }
}

function leaveRoom() { stopRoomListener?.(); stopRoomListener = undefined; roomId.value = ''; roomCode.value = ''; roomStatus.value = 'waiting'; selected.value = null; copied.value = false; board.value = createBoard(); currentPlayer.value = 0; playerColors.value = []; winner.value = null }

function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

async function copyRoomCode() {
  try {
    await navigator.clipboard.writeText(roomId.value)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1800)
  } catch { roomError.value = '無法複製，請長按房號手動複製' }
}

onMounted(() => { stopAuthListener = onAuthStateChanged(auth, user => { authUser.value = user }) })
onUnmounted(() => { stopRoomListener?.(); stopAuthListener?.() })

function isLegalMove(from: number, to: number) {
  const attacker = board.value[from]
  const defender = board.value[to]
  if (!attacker) return false
  const fromRow = Math.floor(from / 4), fromCol = from % 4, toRow = Math.floor(to / 4), toCol = to % 4
  const sameLine = fromRow === toRow || fromCol === toCol
  const distance = Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol)
  if (attacker.rank === 'cannon') {
    if (!sameLine) return false
    const step = fromRow === toRow ? (to > from ? 1 : -1) : (to > from ? 4 : -4)
    const between = [] as number[]
    for (let position = from + step; position !== to; position += step) between.push(position)
    const screens = between.filter(position => board.value[position] !== null).length
    return defender ? screens === 1 : screens === 0
  }
  if (distance !== 1) return false
  if (!defender) return true
  if (attacker.rank === 'pawn') return defender.rank === 'king' || defender.rank === 'pawn'
  if (attacker.rank === 'king' && defender.rank === 'pawn') return false
  return definitions[attacker.color][attacker.rank].strength >= definitions[defender.color][defender.rank].strength
}

function tileClass(tile: Tile | null, index: number) {
  if (!tile) return 'bg-amber-950/30 hover:bg-amber-900/50'
  if (!tile.revealed) return 'bg-gradient-to-br from-amber-700 to-amber-900 hover:brightness-125 active:scale-95'
  if (selected.value === index) return 'bg-yellow-300 ring-4 ring-yellow-200 z-10 scale-105'
  return 'bg-amber-50 hover:bg-yellow-100 dark:bg-slate-100 active:scale-95'
}
function playerCardClass(player: number) { return currentPlayer.value === player ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-md dark:bg-amber-950/40 dark:text-amber-100' : 'border-transparent bg-white text-stone-500 dark:bg-slate-900 dark:text-slate-400' }
</script>

<style scoped>
.tile-piece, .tile-back { display: grid; height: 100%; width: 100%; place-items: center; border-radius: 9999px; font-family: "Noto Serif TC", "Songti TC", serif; font-weight: 900; line-height: 1; }
.tile-piece { border: 2px solid currentColor; background: linear-gradient(135deg, #fffdf5, #efe3c6); box-shadow: inset 0 1px 0 #fff, 0 2px 3px rgb(57 37 11 / .25); font-size: clamp(1.55rem, 8vw, 2.7rem); }
.piece-red { color: #bd2d2d; }
.piece-black { color: #263342; }
.tile-back { border: 2px solid rgb(253 230 138 / .65); color: #fef3c7; background: repeating-linear-gradient(45deg, rgb(120 53 15 / .22) 0 5px, transparent 5px 10px); font-size: clamp(1.3rem, 6vw, 2.2rem); }
</style>
