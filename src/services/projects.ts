import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { Project, ProjectStatus } from '@/types';

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === 'string') return v;
  return new Date().toISOString();
}

function mapProject(id: string, d: Record<string, unknown>): Project {
  return {
    id,
    name: d.name as string,
    description: d.description as string,
    clientId: d.clientId as string,
    clientName: d.clientName as string,
    contractorId: d.contractorId as string,
    contractorName: d.contractorName as string,
    status: d.status as ProjectStatus,
    startDate: toISO(d.startDate),
    endDate: d.endDate ? toISO(d.endDate) : undefined,
    location: d.location as string,
    budget: d.budget as number | undefined,
    progress: (d.progress as number) || 0,
    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}

export interface CreateProjectData {
  name: string; description: string;
  clientId: string; clientName: string;
  contractorId: string; contractorName: string;
  startDate: string; endDate?: string;
  location: string; budget?: number;
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.projects), {
    ...data, status: 'planning', progress: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return mapProject(ref.id, snap.data()!);
}

export async function getProjectsByContractor(contractorId: string): Promise<Project[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.projects), where('contractorId', '==', contractorId), orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => mapProject(d.id, d.data()));
}

export async function getProjectsByClient(clientId: string): Promise<Project[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.projects), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => mapProject(d.id, d.data()));
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.projects, id));
  if (!snap.exists()) return null;
  return mapProject(snap.id, snap.data());
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _ca, ...rest } = updates as Project;
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.projects, id), { ...rest, updatedAt: serverTimestamp() });
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.projects, id));
}

export async function getAllClients(): Promise<{ id: string; displayName: string; email: string }[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.users), where('role', '==', 'client'));
  return (await getDocs(q)).docs.map((d) => ({ id: d.id, displayName: d.data().displayName, email: d.data().email }));
}

export async function getAllContractors(): Promise<{ id: string; displayName: string; email: string; phone?: string; company?: string }[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.users), where('role', '==', 'contractor'));
  return (await getDocs(q)).docs.map((d) => ({
    id: d.id, displayName: d.data().displayName, email: d.data().email,
    phone: d.data().phone ?? '', company: d.data().company ?? '',
  }));
}

export function subscribeToProjectsByClient(clientId: string, onData: (p: Project[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.projects), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapProject(d.id, d.data()))), (e) => onError?.(e));
}

export function subscribeToProjectsByContractor(contractorId: string, onData: (p: Project[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.projects), where('contractorId', '==', contractorId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapProject(d.id, d.data()))), (e) => onError?.(e));
}

export function subscribeToProject(id: string, onData: (p: Project | null) => void, onError?: (e: Error) => void): Unsubscribe {
  return onSnapshot(doc(db, FIRESTORE_COLLECTIONS.projects, id), (snap) => onData(snap.exists() ? mapProject(snap.id, snap.data()) : null), (e) => onError?.(e));
}
