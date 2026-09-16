// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  // optional fields (add if you have them in .env)
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? undefined,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Helper for anonymous sign‑in (called once by composable)
export const anonymousLogin = async () => {
  await signInAnonymously(auth)
}
