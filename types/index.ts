export type TaskCategory = 'groceries' | 'queue' | 'delivery' | 'research' | 'pickup' | 'other';

export type TaskStatus = 'open' | 'active' | 'completed' | 'cancelled';

export type BidType = 'max' | 'fixed';

export interface Runner {
  id: string;
  name: string;
  rating: number;
  completedTasks: number;
  avatar?: string;
  verified: boolean;
}

export interface Bid {
  id: string;
  runner: Runner;
  amount: number;
  message?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  timeframe: string;
  status: TaskStatus;
  bidType: BidType;
  maxBudget?: number;
  fixedPrice?: number;
  bids: Bid[];
  createdBy?: string;
  assignedRunner?: Runner;
  createdAt: Date;
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
