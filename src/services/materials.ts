import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { Material } from '@/types';

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === 'string') return v;
  return new Date().toISOString();
}

function mapMaterial(id: string, d: Record<string, unknown>): Material {
  return {
    id, projectId: d.projectId as string, name: d.name as string,
    description: d.description as string | undefined,
    quantity: d.quantity as number, unit: d.unit as string,
    costPerUnit: d.costPerUnit as number,
    supplier: d.supplier as string | undefined,
    status: d.status as Material['status'],
    usedQuantity: (d.usedQuantity as number) || 0,
    createdAt: toISO(d.createdAt), updatedAt: toISO(d.updatedAt),
  };
}

export interface CreateMaterialData {
  projectId: string; name: string; description?: string;
  quantity: number; unit: string; costPerUnit: number; supplier?: string;
}

export async function createMaterial(data: CreateMaterialData): Promise<Material> {
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.materials), {
    ...data, status: 'ordered', usedQuantity: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return mapMaterial(ref.id, snap.data()!);
}

export async function getMaterialsByProject(projectId: string): Promise<Material[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.materials), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => mapMaterial(d.id, d.data()));
}

export async function deleteMaterial(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.materials, id));
}

export function subscribeToMaterialsByProject(projectId: string, onData: (m: Material[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.materials), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapMaterial(d.id, d.data()))), (e) => onError?.(e));
}
