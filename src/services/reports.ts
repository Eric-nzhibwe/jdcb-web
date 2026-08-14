import {
  collection, doc, addDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { ProgressReport } from '@/types';

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === 'string') return v;
  return new Date().toISOString();
}

function mapReport(id: string, d: Record<string, unknown>): ProgressReport {
  return {
    id, projectId: d.projectId as string, title: d.title as string,
    description: d.description as string,
    progressPercent: d.progressPercent as number,
    images: (d.images as string[]) || [],
    createdBy: d.createdBy as string, createdByName: d.createdByName as string,
    createdAt: toISO(d.createdAt), updatedAt: toISO(d.updatedAt),
  };
}

export interface CreateReportData {
  projectId: string; title: string; description: string;
  progressPercent: number; images: string[];
  createdBy: string; createdByName: string;
}

export async function createProgressReport(data: CreateReportData): Promise<ProgressReport> {
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.progressReports), {
    ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return mapReport(ref.id, snap.data() as Record<string, unknown>);
}

export async function getReportsByProject(projectId: string): Promise<ProgressReport[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.progressReports), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => mapReport(d.id, d.data() as Record<string, unknown>));
}

export async function deleteProgressReport(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.progressReports, id));
}

export function subscribeToReportsByProject(projectId: string, onData: (r: ProgressReport[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.progressReports), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapReport(d.id, d.data() as Record<string, unknown>))), (e) => onError?.(e));
}
