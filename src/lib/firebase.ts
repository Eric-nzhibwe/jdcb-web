import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Whether Firebase was successfully initialised with real credentials */
export const firebaseReady = Boolean(apiKey);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (firebaseReady) {
  app     = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);
} else {
  if (typeof window !== 'undefined') {
    // Only warn in the browser — not during static generation
    console.warn(
      '[JDCB] Firebase env vars are missing. ' +
      'Set NEXT_PUBLIC_FIREBASE_* in your Render environment and redeploy.'
    );
  }
  // Safe no-op stubs — nothing that calls onAuthStateChanged etc. will run
  // because AuthContext checks `firebaseReady` before subscribing.
  app     = {} as FirebaseApp;
  auth    = {} as Auth;
  db      = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { auth, db, storage };
export default app;
