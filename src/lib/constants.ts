export const PROJECT_STATUSES = [
  { value: 'planning',   label: 'Planning',   color: '#2980b9' },
  { value: 'active',     label: 'Active',     color: '#27ae60' },
  { value: 'on_hold',    label: 'On Hold',    color: '#f39c12' },
  { value: 'completed',  label: 'Completed',  color: '#1b3a2d' },
  { value: 'cancelled',  label: 'Cancelled',  color: '#e74c3c' },
] as const;

export const TASK_STATUSES = [
  { value: 'pending',     label: 'Pending',     color: '#f39c12' },
  { value: 'in_progress', label: 'In Progress', color: '#2980b9' },
  { value: 'completed',   label: 'Completed',   color: '#27ae60' },
  { value: 'blocked',     label: 'Blocked',     color: '#e74c3c' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low',    label: 'Low',    color: '#2980b9' },
  { value: 'medium', label: 'Medium', color: '#f39c12' },
  { value: 'high',   label: 'High',   color: '#2d9e5f' },
  { value: 'urgent', label: 'Urgent', color: '#e74c3c' },
] as const;

export const MATERIAL_STATUSES = [
  { value: 'ordered',  label: 'Ordered',        color: '#2980b9' },
  { value: 'in_stock', label: 'In Stock',        color: '#27ae60' },
  { value: 'used',     label: 'Partially Used',  color: '#f39c12' },
  { value: 'depleted', label: 'Depleted',        color: '#e74c3c' },
] as const;

export const MATERIAL_UNITS = ['pcs', 'kg', 'lbs', 'ft', 'm', 'sq ft', 'sq m', 'gal', 'L', 'box'] as const;

export const EXPENSE_CATEGORIES = [
  { value: 'materials',  label: 'Materials' },
  { value: 'labor',      label: 'Labor' },
  { value: 'equipment',  label: 'Equipment' },
  { value: 'transport',  label: 'Transport' },
  { value: 'utilities',  label: 'Utilities' },
  { value: 'other',      label: 'Other' },
] as const;

export const USER_ROLES = [
  { value: 'contractor', label: 'Contractor' },
  { value: 'client',     label: 'Client' },
] as const;

export const FIRESTORE_COLLECTIONS = {
  users:           'users',
  projects:        'projects',
  tasks:           'tasks',
  materials:       'materials',
  expenses:        'expenses',
  progressReports: 'progressReports',
  notifications:   'notifications',
} as const;
