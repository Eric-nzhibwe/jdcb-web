import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!apiKey) {
  console.warn(
    'Firebase env vars are not set. Firebase will not be initialized. ' +
    'Set NEXT_PUBLIC_FIREBASE_* environment variables in your deployment environment.'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);
} else {
  // Stub values so imports don't crash during static generation.
  // Pages that use Firebase are protected by auth guards at runtime.
  app     = {} as FirebaseApp;
  auth    = {} as Auth;
  db      = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { auth, db, storage };
export default app;
