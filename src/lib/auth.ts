import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase'

let pendingSignIn: Promise<User> | null = null

/**
 * Resolves with the current Firebase Auth user, signing in anonymously first
 * if nobody is signed in yet. Anonymous auth gives hosts and participants a
 * stable `uid` — used by security rules and for automatic reconnection.
 *
 * Caches the in-flight sign-in attempt: React 18 StrictMode (and any other
 * concurrent callers) invoke this twice on mount, and two parallel
 * `signInAnonymously` calls would otherwise create two distinct anonymous
 * accounts — leaving `auth.currentUser` mismatched with whichever uid the
 * first caller already resolved with.
 */
export function ensureSignedIn(): Promise<User> {
  if (auth.currentUser) {
    return tokenReady(auth.currentUser)
  }
  if (!pendingSignIn) {
    pendingSignIn = new Promise<User>((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsubscribe()
            tokenReady(user).then(resolve, reject)
          } else {
            signInAnonymously(auth).catch((err) => {
              unsubscribe()
              reject(err)
            })
          }
        },
        (err) => {
          unsubscribe()
          reject(err)
        },
      )
    }).finally(() => {
      pendingSignIn = null
    })
  }
  return pendingSignIn
}

// Force the ID token to be fetched before resolving — right after a fresh
// anonymous sign-in, Firestore can issue its first request before the token
// has propagated, causing a spurious permission-denied error.
function tokenReady(user: User): Promise<User> {
  return user.getIdToken().then(() => user)
}
