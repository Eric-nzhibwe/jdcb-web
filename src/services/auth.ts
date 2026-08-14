import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { User, RegisterData, LoginData } from '@/types';

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    email: d.email,
    displayName: d.displayName,
    role: d.role,
    phone: d.phone,
    company: d.company,
    photoURL: d.photoURL,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? d.updatedAt,
    notifyEmail: d.notifyEmail ?? true,
    notifySms: d.notifySms ?? false,
  };
}

export async function registerUser(data: RegisterData): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
  await updateProfile(credential.user, { displayName: data.displayName });

  const userData: User = {
    id: credential.user.uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    phone: data.phone || '',
    company: data.company || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notifyEmail: true,
    notifySms: false,
  };

  await setDoc(doc(db, FIRESTORE_COLLECTIONS.users, credential.user.uid), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userData;
}

export async function loginUser(data: LoginData): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
  const user = await getUserById(credential.user.uid);
  if (!user) throw new Error('User profile not found');
  return user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _ca, ...rest } = updates as User;
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.users, uid), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
    if (!fbUser) { callback(null); return; }

    const attemptFetch = (left: number, delay: number) => {
      getUserById(fbUser.uid)
        .then(async (user) => {
          if (user) { callback(user); return; }
          if (left > 0) {
            setTimeout(() => attemptFetch(left - 1, delay * 1.5), delay);
            return;
          }
          const fallback: User = {
            id: fbUser.uid,
            email: fbUser.email ?? '',
            displayName: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
            role: 'contractor',
            phone: '', company: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notifyEmail: true, notifySms: false,
          };
          await setDoc(
            doc(db, FIRESTORE_COLLECTIONS.users, fbUser.uid),
            { ...fallback, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
            { merge: true }
          ).catch(console.warn);
          callback(fallback);
        })
        .catch(() => callback(null));
    };
    attemptFetch(5, 800);
  });
}
