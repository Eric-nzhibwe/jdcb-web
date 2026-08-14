import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import type { Expense, ExpenseCategory } from '@/types';

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === 'string') return v;
  return new Date().toISOString();
}

function mapExpense(id: string, d: Record<string, unknown>): Expense {
  return {
    id, projectId: d.projectId as string, title: d.title as string,
    description: d.description as string | undefined,
    amount: d.amount as number, category: d.category as ExpenseCategory,
    date: toISO(d.date), receiptUrl: d.receiptUrl as string | undefined,
    createdBy: d.createdBy as string, createdByName: d.createdByName as string,
    createdAt: toISO(d.createdAt), updatedAt: toISO(d.updatedAt),
  };
}

export interface CreateExpenseData {
  projectId: string; title: string; description?: string; amount: number;
  category: ExpenseCategory; date: string; receiptUrl?: string;
  createdBy: string; createdByName: string;
}

export async function createExpense(data: CreateExpenseData): Promise<Expense> {
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.expenses), {
    ...data, date: Timestamp.fromDate(new Date(data.date)),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return mapExpense(ref.id, snap.data()!);
}

export async function getExpensesByProject(projectId: string): Promise<Expense[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.expenses), where('projectId', '==', projectId), orderBy('date', 'desc'));
  return (await getDocs(q)).docs.map((d) => mapExpense(d.id, d.data()));
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.expenses, id));
}

export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function subscribeToExpensesByProject(projectId: string, onData: (e: Expense[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.expenses), where('projectId', '==', projectId), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapExpense(d.id, d.data()))), (e) => onError?.(e));
}
