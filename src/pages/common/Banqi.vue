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
            <p v-if="authUser" class="mt-1 text-xs text-stone-500 dark:text-slate-400">名稱：{{ displayName }}<br>身分：{{ roleLabel }}</p>
          </div>
          <div v-if="roomId" class="flex shrink-0 gap-2">
            <button type="button" class="rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100" @click="copyRoomCode">{{ copied ? '已複製' : '複製房號' }}</button>
            <button type="button" class="rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600 dark:bg-slate-800 dark:text-slate-300" @click="confirmLeaveRoom">離開房間</button>
          </div>
        </div>
        <div v-if="!roomId" class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input v-model.trim="displayName" class="min-w-0 rounded-xl border border-stone-400 bg-white px-3 py-3 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" maxlength="16" placeholder="輸入暱稱" @keyup.enter="login" />
          <select v-model="desiredRole" class="rounded-xl border border-stone-400 bg-white px-3 py-3 text-sm font-bold text-stone-900 shadow-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"><option value="player1">玩家 1</option><option value="player2">玩家 2</option><option value="spectator">觀戰者</option></select>
          <button type="button" class="rounded-xl bg-amber-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50" :disabled="busy" @click="createRoom">建立房間</button>
          <div class="flex gap-2 sm:col-span-3"><input v-model.trim="roomCode" class="min-w-0 w-full rounded-xl border border-stone-400 bg-white px-3 py-3 text-sm uppercase text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" placeholder="輸入房號後，依上方身份加入" @keyup.enter="joinRoom" /><button type="button" class="shrink-0 rounded-xl bg-stone-800 px-4 py-3 text-sm font-black text-white dark:bg-slate-700 disabled:opacity-50" :disabled="busy" @click="joinRoom">加入</button></div>
        </div>
        <p v-else class="mt-3 text-xs text-stone-500 dark:text-slate-400">{{ !player1 || !player2 ? (!player1 && !player2 ? '等待玩家 1、玩家 2 加入…' : !player1 ? '等待玩家 1 加入…' : '等待玩家 2 加入…') : myRole === 'spectator' ? `觀戰中・${spectatorCount} 位觀戰者` : `正在與 ${opponentName} 對戰・${spectatorCount} 位觀戰者` }}</p>
        <p v-if="roomError" class="mt-3 text-xs font-bold text-red-600">{{ roomError }}</p>
      </section>

      <section class="mb-5 grid grid-cols-2 gap-3">
        <div class="rounded-2xl border-2 p-4 transition-colors" :class="playerCardClass(0)">
          <div class="flex items-center justify-between text-xs font-black tracking-widest"><span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full" :class="presenceClass(0)"></i>玩家 1</span><span v-if="roomStatus !== 'rolling' && currentPlayer === 0">回合中</span></div>
          <p class="mt-1 text-lg font-black">{{ playerName(0) }}・{{ playerColorName(0) }}</p>
          <p class="mt-1 text-xs opacity-70">剩餘 {{ remainingForPlayer(0) }} 枚</p>
        </div>
        <div class="rounded-2xl border-2 p-4 transition-colors" :class="playerCardClass(1)">
          <div class="flex items-center justify-between text-xs font-black tracking-widest"><span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full" :class="presenceClass(1)"></i>玩家 2</span><span v-if="roomStatus !== 'rolling' && currentPlayer === 1">回合中</span></div>
          <p class="mt-1 text-lg font-black">{{ playerName(1) }}・{{ playerColorName(1) }}</p>
          <p class="mt-1 text-xs opacity-70">剩餘 {{ remainingForPlayer(1) }} 枚</p>
        </div>
      </section>

      <section v-if="roomId && player1 && player2 && (roomStatus === 'rolling' || roomStatus === 'confirming')" class="mb-5 rounded-2xl bg-white p-5 text-center shadow-lg shadow-stone-300/30 dark:bg-slate-900 dark:shadow-none">
        <p class="text-xs font-black tracking-[0.2em] text-amber-700 dark:text-amber-400">決定先攻</p>
        <h2 class="mt-2 text-xl font-black">雙方擲骰子，點數大者先攻</h2>
        <div class="mt-4 grid grid-cols-2 gap-3 text-sm font-bold"><div class="rounded-xl bg-stone-100 p-4 dark:bg-slate-800">{{ playerName(0) }}<div class="die-scene mt-4"><div :ref="el => setDieRef('player1', el)" class="dice-cube"><div v-for="face in cubeFaces" :key="face" class="die-face" :class="face">{{ faceValue(face) }}</div></div></div></div><div class="rounded-xl bg-stone-100 p-4 dark:bg-slate-800">{{ playerName(1) }}<div class="die-scene mt-4"><div :ref="el => setDieRef('player2', el)" class="dice-cube"><div v-for="face in cubeFaces" :key="face" class="die-face" :class="face">{{ faceValue(face) }}</div></div></div></div></div>
        <button v-if="roomStatus === 'rolling' && (myRole === 'player1' || myRole === 'player2')" type="button" class="mt-5 rounded-xl bg-amber-700 px-7 py-3 font-black text-white disabled:opacity-50" :disabled="hasRolled" @click="rollForFirstTurn">{{ hasRolled ? '已擲骰，等待對手' : '擲骰決定先攻' }}</button>
        <p v-else class="mt-5 text-sm font-bold text-stone-500 dark:text-slate-400">觀戰者正在等待雙方決定先攻</p>
      </section>

      <div v-if="roomId && roomStatus === 'confirming' && showDiceResult" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-5 backdrop-blur-sm">
        <section class="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl dark:bg-slate-900"><div class="text-5xl">🎲</div><p class="mt-4 text-xs font-black tracking-[0.2em] text-amber-700">擲骰結果</p><div class="mt-4 grid grid-cols-2 gap-3"><div class="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40"><p class="text-xs font-bold">{{ playerName(0) }}</p><strong class="text-3xl text-amber-700 dark:text-amber-400">{{ rolls.player1 }}</strong></div><div class="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40"><p class="text-xs font-bold">{{ playerName(1) }}</p><strong class="text-3xl text-amber-700 dark:text-amber-400">{{ rolls.player2 }}</strong></div></div><h2 class="mt-5 text-2xl font-black">{{ playerName(currentPlayer) }}先攻！</h2><p class="mt-3 text-sm text-stone-500 dark:text-slate-400">雙方確認後開始對局</p><button v-if="myRole === 'player1' || myRole === 'player2'" type="button" class="mt-6 w-full rounded-xl bg-amber-700 py-3 font-black text-white disabled:opacity-50" :disabled="hasConfirmedDice" @click="confirmFirstTurn">{{ hasConfirmedDice ? '已確認，等待對手' : '確認開始' }}</button><p v-else class="mt-6 text-sm font-bold text-stone-500">等待雙方確認</p></section>
      </div>

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
        <div class="mt-4 flex justify-center gap-3">
          <button v-if="canControlGame && !gameEnded && (!roomId || roomStatus === 'playing')" type="button" class="rounded-xl border border-red-200 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30" @click="surrender">投降</button>
          <button v-if="canControlGame && canRestart" type="button" class="rounded-xl bg-amber-700 px-6 py-3 text-sm font-black text-white shadow-lg shadow-amber-800/20 transition hover:bg-amber-800 active:scale-95 disabled:opacity-50" :disabled="!!roomId && roomStatus === 'waiting'" @click="newGame">重新開局</button>
        </div>
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

    <div v-if="showResult" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-5 backdrop-blur-sm">
      <section class="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
        <div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-3xl dark:bg-amber-900/40">🏆</div>
        <p class="mt-5 text-xs font-black tracking-[0.2em] text-amber-700 dark:text-amber-400">GAME OVER</p>
        <h2 class="mt-2 text-3xl font-black">{{ winnerText }}勝利！</h2>
        <p class="mt-3 text-sm text-stone-500 dark:text-slate-400">本局對戰已結束</p>
        <button type="button" class="mt-7 w-full rounded-xl bg-amber-700 py-3 font-black text-white transition hover:bg-amber-800" @click="dismissResult">知道了</button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import BaseHeader from '@/components/BaseHeader.vue'
import { auth, anonymousLogin, db } from '@/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { gsap } from 'gsap'

const { showConfirm } = useAlert()

type Color = 'red' | 'black'
type Rank = 'king' | 'guard' | 'elephant' | 'rook' | 'horse' | 'cannon' | 'pawn'
interface Tile { id: string; color: Color; rank: Rank; name: string; symbol: string; revealed: boolean }
type RoomStatus = 'waiting' | 'rolling' | 'confirming' | 'playing' | 'finished'
type RoomRole = 'player1' | 'player2' | 'spectator'
interface Participant { uid: string; name: string }
interface Presence { state: 'online' | 'away'; lastSeen?: { toMillis?: () => number; seconds?: number } }
interface RoomData { player1?: Participant | null; player2?: Participant | null; spectators?: Participant[]; presence?: { player1?: Presence; player2?: Presence }; rolls?: { player1?: number; player2?: number }; diceConfirmed?: { player1?: boolean; player2?: boolean }; hostUid?: string; hostName?: string; guestUid?: string | null; guestName?: string | null; status: RoomStatus; board: Array<Tile | null>; currentPlayer: number; playerColors: Color[]; winner: Color | null; winnerPlayer?: number | null }

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
const winnerPlayer = ref<number | null>(null)
const showResult = ref(false)
const dismissedResultKey = ref('')
const currentResultKey = ref('')
const suppressPastResult = ref(false)
const authUser = ref<User | null>(null)
const displayName = ref(localStorage.getItem('banqi_display_name') || '')
const roomCode = ref('')
const roomId = ref('')
const roomStatus = ref<RoomStatus>('waiting')
const player1 = ref<Participant | null>(null)
const player2 = ref<Participant | null>(null)
const spectators = ref<Participant[]>([])
const desiredRole = ref<RoomRole>('player1')
const presence = ref<{ player1?: Presence; player2?: Presence }>({})
const presenceClock = ref(Date.now())
const rolls = ref<{ player1?: number; player2?: number }>({})
const diceConfirmed = ref<{ player1?: boolean; player2?: boolean }>({})
const previousRolls = ref<{ player1?: number; player2?: number }>({})
const showDiceResult = ref(false)
let diceResultTimer: number | undefined
let diceResultKey = ''
const dieRefs = ref<Record<'player1' | 'player2', HTMLElement | null>>({ player1: null, player2: null })
const cubeFaces = ['front', 'back', 'right', 'left', 'top', 'bottom']
const busy = ref(false)
const roomError = ref('')
const copied = ref(false)
const maxSpectators = 5
const disconnectForfeitMs = 30000
let stopRoomListener: (() => void) | undefined
let stopAuthListener: (() => void) | undefined
let presenceTimer: number | undefined
let presenceRoomId = ''
let disconnectTimer: number | undefined
const latestRoomData = ref<RoomData | null>(null)
const isOnline = computed(() => !!roomId.value)
const myRole = computed<RoomRole | null>(() => authUser.value?.uid === player1.value?.uid ? 'player1' : authUser.value?.uid === player2.value?.uid ? 'player2' : spectators.value.some(person => person.uid === authUser.value?.uid) ? 'spectator' : null)
const canControlGame = computed(() => !isOnline.value || myRole.value === 'player1' || myRole.value === 'player2')
const isMyTurn = computed(() => !isOnline.value || (roomStatus.value === 'playing' && (currentPlayer.value === 0 ? player1.value?.uid : player2.value?.uid) === authUser.value?.uid))
const opponentName = computed(() => myRole.value === 'player1' ? (player2.value?.name || '玩家 2') : myRole.value === 'player2' ? (player1.value?.name || '玩家 1') : '玩家對戰')
const spectatorCount = computed(() => spectators.value.length)
const roleLabel = computed(() => myRole.value === 'player1' ? '玩家 1' : myRole.value === 'player2' ? '玩家 2' : myRole.value === 'spectator' ? '觀戰者' : '尚未加入房間')
const hasRolled = computed(() => myRole.value === 'player1' ? rolls.value.player1 !== undefined : myRole.value === 'player2' ? rolls.value.player2 !== undefined : false)
const hasConfirmedDice = computed(() => myRole.value === 'player1' ? !!diceConfirmed.value.player1 : myRole.value === 'player2' ? !!diceConfirmed.value.player2 : false)
const canRollDice = computed(() => !!player1.value && !!player2.value && roomStatus.value === 'rolling')
const canRestart = computed(() => gameEnded.value || (isOnline.value ? roomStatus.value !== 'playing' : !playerColors.value.length))
const gameEnded = computed(() => winner.value !== null || winnerPlayer.value !== null)
const winnerText = computed(() => winnerPlayer.value !== null ? playerName(winnerPlayer.value) : winner.value ? `${colorLabel(winner.value)}方` : '')
const status = computed(() => {
  if (isOnline.value && (!player1.value || !player2.value)) {
    if (!player1.value && !player2.value) return '等待玩家 1、玩家 2 加入'
    return !player1.value ? '等待玩家 1 加入' : '等待玩家 2 加入'
  }
  if (gameEnded.value) return `${winnerText.value}勝利！`
  if (isOnline.value && roomStatus.value === 'waiting') return '等待好友加入房間'
  if (isOnline.value && roomStatus.value === 'rolling') return '雙方正在擲骰決定先攻'
  if (isOnline.value && myRole.value === 'spectator') return '觀戰中'
  if (isOnline.value && !isMyTurn.value) return '等待對手走棋'
  if (!playerColors.value.length) return `玩家 ${currentPlayer.value + 1}，請翻開第一枚棋子` 
  return selected.value === null ? `玩家 ${currentPlayer.value + 1}（${colorLabel(playerColors.value[currentPlayer.value])}）請翻棋或選擇棋子` : '請選擇合法的移動或吃子位置'
})

function colorLabel(color: Color) { return color === 'red' ? '紅' : '黑' }
function playerColorName(player: number) { return playerColors.value[player] ? `${colorLabel(playerColors.value[player])}方` : '尚未決定' }
function playerName(player: number) { return isOnline.value ? (player === 0 ? (player1.value?.name || '等待加入') : (player2.value?.name || '等待加入')) : `玩家 ${player + 1}` }
function remainingForPlayer(player: number) { const color = playerColors.value[player]; return color ? board.value.filter(tile => tile?.color === color).length : 16 }
function nextTurn() { selected.value = null; currentPlayer.value = currentPlayer.value === 0 ? 1 : 0 }
function newGame() { board.value = createBoard(); currentPlayer.value = 0; playerColors.value = []; selected.value = null; winner.value = null; winnerPlayer.value = null; showResult.value = false; dismissedResultKey.value = ''; currentResultKey.value = ''; if (isOnline.value) { rolls.value = {}; diceConfirmed.value = {}; roomStatus.value = 'rolling' }; void syncGame() }

function selectTile(index: number) {
  if (gameEnded.value || !canControlGame.value || !isMyTurn.value) return
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
  if (!board.value.some(piece => piece?.color === defeatedColor)) { winner.value = moving.color; winnerPlayer.value = currentPlayer.value; selected.value = null; showResult.value = true; void syncGame(); return }
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
        const me = { uid: authUser.value!.uid, name: displayName.value }
        const initialPresence = desiredRole.value === 'player1' ? { player1: { state: 'online', lastSeen: serverTimestamp() } } : desiredRole.value === 'player2' ? { player2: { state: 'online', lastSeen: serverTimestamp() } } : {}
        transaction.set(room, { player1: desiredRole.value === 'player1' ? me : null, player2: desiredRole.value === 'player2' ? me : null, spectators: desiredRole.value === 'spectator' ? [me] : [], presence: initialPresence, rolls: {}, diceConfirmed: {}, status: 'waiting', board: board.value, currentPlayer: 0, playerColors: [], winner: null, winnerPlayer: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
        return true
      })
      if (created) { id = candidate; break }
    }
    if (!id) throw new Error('房號產生失敗，請再試一次')
    listenRoom(id)
  } catch (error) { roomError.value = `建立房間失敗：${error instanceof Error ? error.message : '請檢查 Firebase 設定'}` } finally { busy.value = false }
}

async function joinRoom() {
  const code = roomCode.value.trim().toUpperCase()
  if (!code) { roomError.value = '請輸入房號'; return }
  busy.value = true
  try {
    if (!await login() || !authUser.value) return
    const room = doc(db, 'banqiRooms', code)
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(room)
      if (!snapshot.exists()) throw new Error('找不到這個房間')
      const data = snapshot.data() as RoomData
      const seats = readSeats(data)
      const me = { uid: authUser.value!.uid, name: displayName.value }
      const existingRole: RoomRole | null = seats.player1?.uid === me.uid ? 'player1' : seats.player2?.uid === me.uid ? 'player2' : seats.spectators.some(person => person.uid === me.uid) ? 'spectator' : null
      if (existingRole && existingRole !== desiredRole.value) throw new Error(`你已經以${roleName(existingRole)}加入此房間`)
      if (!existingRole && [seats.player1, seats.player2, ...seats.spectators].some(person => person && person.name.trim().toLocaleLowerCase() === me.name.trim().toLocaleLowerCase())) {
        throw new Error('房間內已有相同名稱，請換一個暱稱')
      }
      const alreadyJoined = existingRole !== null
      if (!alreadyJoined) {
        if (desiredRole.value === 'player1') {
          if (seats.player1) throw new Error('玩家 1 已有人')
          seats.player1 = me
        } else if (desiredRole.value === 'player2') {
          if (seats.player2) throw new Error('玩家 2 已有人')
          seats.player2 = me
        } else {
          if (seats.spectators.length >= maxSpectators) throw new Error(`觀戰席已滿（最多 ${maxSpectators} 人）`)
          seats.spectators.push(me)
        }
      }
      const rolePresence = desiredRole.value === 'spectator' ? {} : { [`presence.${desiredRole.value}`]: { state: 'online', lastSeen: serverTimestamp() } }
      const startingNewGame = desiredRole.value !== 'spectator' && !!seats.player1 && !!seats.player2 && (!alreadyJoined || data.status === 'finished')
      transaction.update(room, {
        player1: seats.player1,
        player2: seats.player2,
        spectators: seats.spectators,
        status: startingNewGame ? 'rolling' : data.status,
        rolls: startingNewGame ? {} : data.rolls || {},
        diceConfirmed: startingNewGame ? {} : data.diceConfirmed || {},
        ...(startingNewGame ? { board: createBoard(), currentPlayer: 0, playerColors: [], winner: null, winnerPlayer: null } : {}),
        updatedAt: serverTimestamp(),
        ...rolePresence
      })
    })
    listenRoom(code, true)
  } catch (error) { roomError.value = `加入失敗：${error instanceof Error ? error.message : '請檢查房號'}` } finally { busy.value = false }
}

function listenRoom(id: string, suppressExistingResult = false) {
  stopRoomListener?.()
  roomError.value = ''
  suppressPastResult.value = suppressExistingResult
  roomId.value = id
  roomCode.value = id
  stopRoomListener = onSnapshot(doc(db, 'banqiRooms', id), snapshot => {
    if (!snapshot.exists()) { leaveRoom(false); roomError.value = '房間已不存在'; return }
    const data = snapshot.data() as RoomData
    latestRoomData.value = data
    board.value = data.board
    currentPlayer.value = data.currentPlayer
    playerColors.value = data.playerColors || []
    updateDiceRolls(data.rolls || {})
    diceConfirmed.value = data.diceConfirmed || {}
    winner.value = data.winner || null
    winnerPlayer.value = data.winnerPlayer ?? null
    const seats = readSeats(data)
    player1.value = seats.player1; player2.value = seats.player2; spectators.value = seats.spectators; roomStatus.value = data.status
    scheduleDiceResult(data)
    presence.value = data.presence || {}
    selected.value = null
    startPresence()
    startDisconnectWatch()
    if (data.winner || data.winnerPlayer !== null && data.winnerPlayer !== undefined) {
      currentResultKey.value = `${id}-${data.winnerPlayer ?? 'color'}-${data.winner ?? ''}`
      if (!suppressPastResult.value && dismissedResultKey.value !== currentResultKey.value) showResult.value = true
    } else {
      currentResultKey.value = ''
      dismissedResultKey.value = ''
      showResult.value = false
      suppressPastResult.value = false
    }
  }, error => { roomError.value = `連線中斷：${error.message}` })
}

async function syncGame() {
  if (!roomId.value) return
  try { await updateDoc(doc(db, 'banqiRooms', roomId.value), { board: board.value, currentPlayer: currentPlayer.value, playerColors: playerColors.value, rolls: rolls.value, diceConfirmed: diceConfirmed.value, winner: winner.value, winnerPlayer: winnerPlayer.value, status: gameEnded.value ? 'finished' : roomStatus.value, updatedAt: serverTimestamp() }) } catch (error) { roomError.value = `同步棋局失敗：${error instanceof Error ? error.message : ''}` }
}

async function rollForFirstTurn() {
  const role = myRole.value
  if (!roomId.value || !canRollDice.value || (role !== 'player1' && role !== 'player2') || hasRolled.value) return
  try {
    await runTransaction(db, async transaction => {
      const room = doc(db, 'banqiRooms', roomId.value)
      const snapshot = await transaction.get(room)
      if (!snapshot.exists()) throw new Error('房間已不存在')
      const data = snapshot.data() as RoomData
      if (data.status !== 'rolling') return
      const seats = readSeats(data)
      if (!seats.player1 || !seats.player2) throw new Error('需等待兩位玩家都加入後才能擲骰')
      const latestRolls = data.rolls || {}
      if (latestRolls[role] !== undefined) return
      latestRolls[role] = Math.floor(Math.random() * 6) + 1
      if (latestRolls.player1 !== undefined && latestRolls.player2 !== undefined) {
        if (latestRolls.player1 === latestRolls.player2) transaction.update(room, { rolls: {}, diceConfirmed: {}, status: 'rolling', updatedAt: serverTimestamp() })
        else transaction.update(room, { rolls: latestRolls, diceConfirmed: {}, currentPlayer: latestRolls.player1 > latestRolls.player2 ? 0 : 1, status: 'confirming', updatedAt: serverTimestamp() })
      } else transaction.update(room, { rolls: latestRolls, updatedAt: serverTimestamp() })
    })
  } catch (error) { roomError.value = `擲骰失敗：${error instanceof Error ? error.message : ''}` }
}

async function confirmFirstTurn() {
  const role = myRole.value
  if (!roomId.value || (role !== 'player1' && role !== 'player2') || hasConfirmedDice.value) return
  try {
    await runTransaction(db, async transaction => {
      const room = doc(db, 'banqiRooms', roomId.value)
      const snapshot = await transaction.get(room)
      if (!snapshot.exists()) throw new Error('房間已不存在')
      const data = snapshot.data() as RoomData
      if (data.status !== 'confirming') return
      const confirmed = { ...(data.diceConfirmed || {}), [role]: true }
      transaction.update(room, { diceConfirmed: confirmed, status: confirmed.player1 && confirmed.player2 ? 'playing' : 'confirming', updatedAt: serverTimestamp() })
    })
  } catch (error) { roomError.value = `確認失敗：${error instanceof Error ? error.message : ''}` }
}

function setDieRef(role: 'player1' | 'player2', element: any) { dieRefs.value[role] = element as HTMLElement | null }
function faceValue(face: string) { return { front: '1', back: '6', right: '3', left: '4', top: '5', bottom: '2' }[face] || '' }
function updateDiceRolls(next: { player1?: number; player2?: number }) {
  if (next.player1 === undefined && next.player2 === undefined && (previousRolls.value.player1 !== undefined || previousRolls.value.player2 !== undefined)) resetDiceVisuals()
  ;(['player1', 'player2'] as const).forEach(role => {
    if (next[role] !== undefined && next[role] !== previousRolls.value[role]) {
      void nextTick(() => animateDie(role, next[role]!))
    }
  })
  previousRolls.value = { ...next }
  rolls.value = { ...next }
}

function resetDiceVisuals() {
  ;(['player1', 'player2'] as const).forEach(role => { if (dieRefs.value[role]) gsap.set(dieRefs.value[role], { rotationX: 0, rotationY: 0, y: 0 }) })
}

function scheduleDiceResult(data: RoomData) {
  if (data.status !== 'confirming') { showDiceResult.value = false; return }
  const key = `${roomId.value}-${data.rolls?.player1}-${data.rolls?.player2}`
  if (diceResultKey === key) return
  diceResultKey = key
  showDiceResult.value = false
  if (diceResultTimer !== undefined) window.clearTimeout(diceResultTimer)
  diceResultTimer = window.setTimeout(() => { showDiceResult.value = true }, 3000)
}

function animateDie(role: 'player1' | 'player2', result: number) {
  const die = dieRefs.value[role]
  if (!die) return
  const faces: Record<number, { x: number; y: number }> = { 1: { x: 0, y: 0 }, 2: { x: 90, y: 0 }, 3: { x: 0, y: -90 }, 4: { x: 0, y: 90 }, 5: { x: -90, y: 0 }, 6: { x: 0, y: 180 } }
  const target = faces[result]
  gsap.killTweensOf(die)
  gsap.fromTo(die, { rotationX: 0, rotationY: 0, y: 0 }, { rotationX: (Math.floor(Math.random() * 3) + 4) * 360 + target.x, rotationY: (Math.floor(Math.random() * 3) + 4) * 360 + target.y, y: -16, duration: 0.75, ease: 'power2.out', onComplete: () => { gsap.to(die, { y: 0, duration: 0.45, ease: 'bounce.out' }) } })
}

async function surrender() {
  if (!await showConfirm('確定要投降嗎？此局將立刻結束。', '確定投降')) return
  const surrenderingPlayer = isOnline.value ? (myRole.value === 'player1' ? 0 : 1) : currentPlayer.value
  winnerPlayer.value = surrenderingPlayer === 0 ? 1 : 0
  winner.value = playerColors.value[winnerPlayer.value] ?? null
  selected.value = null
  showResult.value = true
  void syncGame()
}

function dismissResult() {
  dismissedResultKey.value = currentResultKey.value || `local-${winnerPlayer.value ?? winner.value ?? ''}`
  showResult.value = false
}

async function leaveRoom(removeMembership = true) {
  const leavingRoomId = roomId.value
  const leavingRole = myRole.value
  const leavingUid = authUser.value?.uid
  void writePresence('away')
  stopPresence()
  stopRoomListener?.()
  stopRoomListener = undefined

  if (removeMembership && leavingRoomId && leavingRole && leavingUid) {
    try {
      await runTransaction(db, async transaction => {
        const room = doc(db, 'banqiRooms', leavingRoomId)
        const snapshot = await transaction.get(room)
        if (!snapshot.exists()) return
        const data = snapshot.data() as RoomData
        const seats = readSeats(data)
        if (leavingRole === 'player1' && seats.player1?.uid === leavingUid) seats.player1 = null
        if (leavingRole === 'player2' && seats.player2?.uid === leavingUid) seats.player2 = null
        if (leavingRole === 'spectator') seats.spectators = seats.spectators.filter(person => person.uid !== leavingUid)
        const opponent = leavingRole === 'player1' ? 1 : 0
        const isActivePlayerLeaving = (leavingRole === 'player1' || leavingRole === 'player2') && data.status === 'playing'
        const nextStatus: RoomStatus = isActivePlayerLeaving ? 'finished' : data.status === 'finished' ? 'finished' : seats.player1 && seats.player2 ? 'playing' : 'waiting'
        const presenceUpdate = leavingRole === 'spectator' ? {} : { [`presence.${leavingRole}`]: { state: 'away', lastSeen: serverTimestamp() } }
        transaction.update(room, { player1: seats.player1, player2: seats.player2, spectators: seats.spectators, status: nextStatus, winnerPlayer: isActivePlayerLeaving ? opponent : data.winnerPlayer ?? null, winner: isActivePlayerLeaving ? data.playerColors?.[opponent] ?? null : data.winner ?? null, updatedAt: serverTimestamp(), ...presenceUpdate })
      })
    } catch (error) { roomError.value = `離開房間同步失敗：${error instanceof Error ? error.message : ''}` }
  }

  stopDisconnectWatch()
  latestRoomData.value = null
  roomId.value = ''; roomCode.value = ''; roomStatus.value = 'waiting'; selected.value = null; copied.value = false; showResult.value = false; player1.value = null; player2.value = null; spectators.value = []; presence.value = {}; rolls.value = {}; diceConfirmed.value = {}; previousRolls.value = {}; board.value = createBoard(); currentPlayer.value = 0; playerColors.value = []; winner.value = null; winnerPlayer.value = null
}

async function confirmLeaveRoom() {
  if (!await showConfirm('確定要離開房間嗎？離開對局將判定對手獲勝。', '確定離開')) return
  await leaveRoom()
}

function presenceClass(player: number) {
  const key = player === 0 ? 'player1' : 'player2'
  const state = presence.value[key]
  const lastSeen = state?.lastSeen?.toMillis?.() ?? (state?.lastSeen?.seconds ? state.lastSeen.seconds * 1000 : 0)
  return state?.state === 'online' && presenceClock.value - lastSeen < 20000 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,.8)]' : 'bg-red-500'
}

function startPresence() {
  if (!roomId.value || myRole.value === 'spectator' || presenceRoomId === roomId.value) return
  presenceRoomId = roomId.value
  void writePresence(document.visibilityState === 'visible' ? 'online' : 'away')
  presenceTimer = window.setInterval(() => {
    presenceClock.value = Date.now()
    void writePresence(document.visibilityState === 'visible' ? 'online' : 'away')
  }, 10000)
}

function stopPresence() { if (presenceTimer !== undefined) window.clearInterval(presenceTimer); presenceTimer = undefined; presenceRoomId = '' }

function startDisconnectWatch() {
  if (disconnectTimer !== undefined) return
  disconnectTimer = window.setInterval(() => { void checkDisconnectedPlayer() }, 5000)
}

function stopDisconnectWatch() { if (disconnectTimer !== undefined) window.clearInterval(disconnectTimer); disconnectTimer = undefined }

function lastSeenMs(state?: Presence) { return state?.lastSeen?.toMillis?.() ?? (state?.lastSeen?.seconds ? state.lastSeen.seconds * 1000 : 0) }

async function checkDisconnectedPlayer() {
  const data = latestRoomData.value
  if (!roomId.value || !data || data.status !== 'playing') return
  const now = Date.now()
  const player1Gone = now - lastSeenMs(data.presence?.player1) > disconnectForfeitMs
  const player2Gone = now - lastSeenMs(data.presence?.player2) > disconnectForfeitMs
  if (player1Gone === player2Gone) return
  const winnerIndex = player1Gone ? 1 : 0
  try {
    await runTransaction(db, async transaction => {
      const room = doc(db, 'banqiRooms', roomId.value)
      const snapshot = await transaction.get(room)
      if (!snapshot.exists()) return
      const latest = snapshot.data() as RoomData
      if (latest.status !== 'playing') return
      const stale = winnerIndex === 0 ? Date.now() - lastSeenMs(latest.presence?.player2) > disconnectForfeitMs : Date.now() - lastSeenMs(latest.presence?.player1) > disconnectForfeitMs
      if (!stale) return
      transaction.update(room, { status: 'finished', winnerPlayer: winnerIndex, winner: latest.playerColors?.[winnerIndex] ?? null, updatedAt: serverTimestamp() })
    })
  } catch { /* 網路暫時中斷時下一次心跳再檢查 */ }
}

async function writePresence(state: 'online' | 'away') {
  if (!roomId.value || (myRole.value !== 'player1' && myRole.value !== 'player2')) return
  try { await updateDoc(doc(db, 'banqiRooms', roomId.value), { [`presence.${myRole.value}.state`]: state, [`presence.${myRole.value}.lastSeen`]: serverTimestamp() }) } catch { /* 離開頁面時寫入可能被瀏覽器中止 */ }
}

function handleVisibility() { void writePresence(document.visibilityState === 'visible' ? 'online' : 'away') }
function handlePageHide() { void writePresence('away') }

function readSeats(data: RoomData) {
  return {
    player1: data.player1 ?? (data.hostUid ? { uid: data.hostUid, name: data.hostName || '玩家 1' } : null),
    player2: data.player2 ?? (data.guestUid ? { uid: data.guestUid, name: data.guestName || '玩家 2' } : null),
    spectators: data.spectators ?? [],
  }
}

function roleName(role: RoomRole) { return role === 'player1' ? '玩家 1' : role === 'player2' ? '玩家 2' : '觀戰者' }

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

onMounted(() => { stopAuthListener = onAuthStateChanged(auth, user => { authUser.value = user }); document.addEventListener('visibilitychange', handleVisibility); window.addEventListener('pagehide', handlePageHide) })
onUnmounted(() => { void writePresence('away'); stopPresence(); stopDisconnectWatch(); stopRoomListener?.(); stopAuthListener?.(); document.removeEventListener('visibilitychange', handleVisibility); window.removeEventListener('pagehide', handlePageHide) })

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
.die-scene { height: 72px; perspective: 600px; }
.dice-cube { width: 64px; height: 64px; margin: 0 auto; position: relative; transform-style: preserve-3d; }
.die-face { position: absolute; display: grid; width: 64px; height: 64px; place-items: center; border: 1px solid #d6bf8b; border-radius: 12px; background: linear-gradient(145deg, #fffdf5, #ead8b0); box-shadow: inset 0 2px 5px rgb(255 255 255 / .9), 0 4px 8px rgb(71 40 5 / .18); color: #b45309; font-size: 2rem; line-height: 1; backface-visibility: hidden; }
.front { transform: rotateY(0deg) translateZ(32px); }.back { transform: rotateY(180deg) translateZ(32px); }.right { transform: rotateY(90deg) translateZ(32px); }.left { transform: rotateY(-90deg) translateZ(32px); }.top { transform: rotateX(90deg) translateZ(32px); }.bottom { transform: rotateX(-90deg) translateZ(32px); }
</style>
