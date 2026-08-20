import {
  collection, addDoc, updateDoc, doc, query,
  where, orderBy, limit, onSnapshot, serverTimestamp, writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { Notification } from '@/types';

function mapNotification(id: string, d: Record<string, unknown>): Notification {
  return {
    id,
    userId:      d.userId      as string,
    title:       d.title       as string,
    body:        d.body        as string,
    type:        d.type        as Notification['type'],
    referenceId: d.referenceId as string | undefined,
    read:        (d.read       as boolean) ?? false,
    sentVia:     (d.sentVia    as Notification['sentVia']) ?? [],
    createdAt:   d.createdAt instanceof Object && 'toDate' in d.createdAt
                   ? (d.createdAt as { toDate: () => Date }).toDate().toISOString()
                   : (d.createdAt as string ?? new Date().toISOString()),
  };
}

export interface CreateNotificationData {
  userId:       string;
  title:        string;
  body:         string;
  type:         Notification['type'];
  referenceId?: string;
}

/** Write a notification document for a specific user. */
export async function createNotification(data: CreateNotificationData): Promise<void> {
  await addDoc(collection(db, FIRESTORE_COLLECTIONS.notifications), {
    ...data,
    read:      false,
    sentVia:   [],
    createdAt: serverTimestamp(),
  });
}

/** Mark a single notification as read. */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(
    doc(db, FIRESTORE_COLLECTIONS.notifications, notificationId),
    { read: true },
  );
}

/** Mark ALL unread notifications for a user as read in one batch. */
export async function markAllNotificationsRead(
  notifications: Notification[],
): Promise<void> {
  const unread = notifications.filter((n) => !n.read);
  if (unread.length === 0) return;
  const batch = writeBatch(db);
  unread.forEach((n) => {
    batch.update(doc(db, FIRESTORE_COLLECTIONS.notifications, n.id), { read: true });
  });
  await batch.commit();
}

/** Real-time subscription to the latest 30 notifications for a user. */
export function subscribeToNotifications(
  userId:  string,
  onData:  (notifications: Notification[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, FIRESTORE_COLLECTIONS.notifications),
    where('userId',    '==', userId),
    orderBy('createdAt', 'desc'),
    limit(30),
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => mapNotification(d.id, d.data() as Record<string, unknown>))),
    (e)    => onError?.(e),
  );
}
