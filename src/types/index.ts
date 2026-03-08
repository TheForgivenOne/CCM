export interface User {
  id: number;
  email: string;
  company_name?: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  recurring?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null;
  recurring_end?: string | null;
  parent_id?: number | null;
  created_at: string;
}

export interface Settings {
  id: number;
  user_id: number;
  income_categories: string[];
  expense_categories: string[];
  savings_target: number;
  warning_threshold: number;
  reinvestment_rules: ReinvestmentRule[];
}

export interface ReinvestmentRule {
  id: string;
  name: string;
  threshold: number;
  target: string;
  enabled: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface AIInsight {
  type: 'bad_habit' | 'passive_income' | 'investable_cash' | 'strategy';
  title: string;
  description: string;
  severity?: 'warning' | 'info' | 'success';
  action?: string;
}

export interface DashboardStats {
  balance: number;
  allTimeHigh: number;
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  isNewRecord: boolean;
}
