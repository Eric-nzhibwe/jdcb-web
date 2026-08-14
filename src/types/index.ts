export type UserRole = 'contractor' | 'client';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  company?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  pushToken?: string;
  notifyEmail: boolean;
  notifySms: boolean;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  contractorId: string;
  contractorName: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  location: string;
  budget?: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  status: 'ordered' | 'in_stock' | 'used' | 'depleted';
  usedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'materials'
  | 'labor'
  | 'equipment'
  | 'transport'
  | 'utilities'
  | 'other';

export interface Expense {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  receiptUrl?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressReport {
  id: string;
  projectId: string;
  title: string;
  description: string;
  progressPercent: number;
  images: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'task' | 'project' | 'expense' | 'report' | 'material' | 'general';
  referenceId?: string;
  read: boolean;
  sentVia: ('push' | 'email' | 'sms')[];
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  company?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
