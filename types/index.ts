export type TaskCategory = 'groceries' | 'queue' | 'delivery' | 'research' | 'pickup' | 'other';

export type TaskStatus = 'open' | 'active' | 'completed' | 'cancelled';

export type BidType = 'max' | 'fixed';

export interface Runner {
  id: string;
  name: string | null;
  rating: number;
  completedTasks: number;
  profilePhoto?: string | null;
  verified: boolean;
  email?: string | null;
  phone?: string | null;
}

export interface Bid {
  id: string;
  taskId: string;
  runnerId: string;
  amount: number;
  message?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | string;
  runner?: Runner | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory | string;
  location: string;
  timeframe: string;
  status: TaskStatus | string;
  bidType: BidType | string;
  maxBudget?: number;
  fixedPrice?: number;
  bids: Bid[];
  createdBy: string;
  assignedRunnerId?: string | null;
  assignedRunner?: Runner | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  iconBg: string;
}
