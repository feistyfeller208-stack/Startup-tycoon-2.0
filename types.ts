
export type MarketCondition = 'Bull' | 'Bear' | 'Steady';
export type StartupType = 'SaaS' | 'Gaming' | 'FinTech' | 'E-commerce' | 'AI/ML';
export type StartingPath = 'Bootstrap' | 'Angel' | 'VC Pre-Seed' | 'Bank Loan' | 'Accelerator';

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  morale: number;
  loyalty: number;
  tenure: number;
  skill: number;
  experience: number;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  cost: number;
  remainingCost: number;
  capacity: number;
  revenuePerUser: number;
  userBonus: number;
  status: 'Locked' | 'Available' | 'Developing' | 'Live' | 'NeedsScale';
  prerequisites: string[];
  wasScaling?: boolean;
}

export interface MarketingChannel {
  id: string;
  name: string;
  cost: number;
  effectiveness: number;
  fatigue: number;
  unlocked: boolean;
}

export interface HiringRequest {
  id: string;
  name: string;
  role: string;
  salary: number;
  daysRemaining: number;
}

export interface GameState {
  day: number;
  cash: number;
  users: number;
  team: Employee[];
  features: Feature[];
  marketingChannels: MarketingChannel[];
  companyName: string;
  startupType: StartupType;
  startingPath: StartingPath;
  equity: number;
  debtAmount: number;
  officeRented: boolean;
  marketCondition: MarketCondition;
  isGameOver: boolean;
  quarterlyGrowth: number[];
  hiringQueue: HiringRequest[];
}

export interface Notification {
  msg: string;
  type: 'success' | 'error' | 'info';
}
