import type { TaskCategory } from '@/types';

export const CATEGORIES: {
  id: TaskCategory;
  label: string;
  color: string;
}[] = [
  { id: 'groceries', label: 'Groceries', color: '#10B981' },
  { id: 'queue', label: 'Queue Standing', color: '#EF4444' },
  { id: 'delivery', label: 'Delivery', color: '#F59E0B' },
  { id: 'research', label: 'Research', color: '#3B82F6' },
  { id: 'pickup', label: 'Pickup', color: '#8B5CF6' },
  { id: 'other', label: 'Other', color: '#6B7280' },
];

export const getCategoryColor = (category: TaskCategory): string => {
  const cat = CATEGORIES.find((c) => c.id === category);
  return cat?.color || '#6B7280';
};

export const getCategoryLabel = (category: TaskCategory): string => {
  const cat = CATEGORIES.find((c) => c.id === category);
  return cat?.label || 'Other';
};
