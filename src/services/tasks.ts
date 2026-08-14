import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { Task, TaskStatus, TaskPriority } from '@/types';

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === 'string') return v;
  return new Date().toISOString();
}

function mapTask(id: string, d: Record<string, unknown>): Task {
  return {
    id, projectId: d.projectId as string,
    title: d.title as string, description: d.description as string,
    status: d.status as TaskStatus, priority: d.priority as TaskPriority,
    assignedTo: d.assignedTo as string | undefined,
    assignedToName: d.assignedToName as string | undefined,
    dueDate: d.dueDate ? toISO(d.dueDate) : undefined,
    completedAt: d.completedAt ? toISO(d.completedAt) : undefined,
    createdAt: toISO(d.createdAt), updatedAt: toISO(d.updatedAt),
  };
}

export interface CreateTaskData {
  projectId: string; title: string; description: string;
  priority: TaskPriority; assignedTo?: string; assignedToName?: string; dueDate?: string;
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.tasks), {
    ...data, status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return mapTask(ref.id, snap.data()!);
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.tasks), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => mapTask(d.id, d.data()));
}

export async function getTasksByAssignee(userId: string): Promise<Task[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.tasks), where('assignedTo', '==', userId), orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => mapTask(d.id, d.data()));
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _ca, ...rest } = updates as Task;
  const payload: Record<string, unknown> = { ...rest, updatedAt: serverTimestamp() };
  if (updates.status === 'completed') payload.completedAt = serverTimestamp();
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.tasks, id), payload);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.tasks, id));
}

export function subscribeToTasksByProject(projectId: string, onData: (t: Task[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.tasks), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapTask(d.id, d.data()))), (e) => onError?.(e));
}

export function subscribeToTasksByAssignee(userId: string, onData: (t: Task[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.tasks), where('assignedTo', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapTask(d.id, d.data()))), (e) => onError?.(e));
}
