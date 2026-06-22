import { initializeApp } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

// Some mobile carrier networks let Firestore's WebSocket-style stream open but then silently
// break it without an error, so listeners go quiet forever. Long-polling avoids depending on
// that persistent connection — the standard mitigation for realtime updates dying on mobile data.
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
export const auth = getAuth(app)
