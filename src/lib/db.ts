import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface User {
  id: number;
  email: string;
  password: string;
  company_name: string | null;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  date: string;
  recurring: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null;
  recurring_end: string | null;
  parent_id: number | null;
  created_at: string;
}

export interface Settings {
  id: number;
  user_id: number;
  income_categories: string;
  expense_categories: string;
  savings_target: number;
  warning_threshold: number;
  reinvestment_rules: string;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] as User | undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const result = await pool.query('SELECT id, email, company_name, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] as User | undefined;
}

export async function createUser(email: string, password: string, companyName?: string): Promise<User> {
  const result = await pool.query(
    'INSERT INTO users (email, password, company_name) VALUES ($1, $2, $3) RETURNING *',
    [email, password, companyName || null]
  );
  return result.rows[0] as User;
}

export async function getTransactionsByUserId(userId: number): Promise<Transaction[]> {
  const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
  return result.rows as Transaction[];
}

export async function createTransaction(
  userId: number,
  amount: number,
  type: 'income' | 'expense',
  category: string,
  description: string,
  date: string,
  recurring?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null,
  recurringEnd?: string | null,
  parentId?: number | null
): Promise<Transaction> {
  const result = await pool.query(
    'INSERT INTO transactions (user_id, amount, type, category, description, date, recurring, recurring_end, parent_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [userId, amount, type, category, description, date, recurring || null, recurringEnd || null, parentId || null]
  );
  return result.rows[0] as Transaction;
}

function getNextDate(currentDate: string, recurring: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'): string {
  const date = new Date(currentDate);
  switch (recurring) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

export async function generateRecurringTransactions(userId: number): Promise<Transaction[]> {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE user_id = $1 AND recurring IS NOT NULL AND (recurring_end IS NULL OR recurring_end >= CURRENT_DATE)',
    [userId]
  );
  const recurring = result.rows as Transaction[];
  
  const today = new Date().toISOString().split('T')[0];
  const newTransactions: Transaction[] = [];

  for (const t of recurring) {
    let nextDate = getNextDate(t.date, t.recurring as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly');
    
    while (nextDate <= today) {
      const existing = await pool.query(
        'SELECT id FROM transactions WHERE parent_id = $1 AND date = $2',
        [t.id, nextDate]
      );
      
      if (existing.rows.length === 0) {
        const newT = await createTransaction(
          userId,
          t.amount,
          t.type,
          t.category,
          t.description || '',
          nextDate,
          null,
          null,
          t.id
        );
        newTransactions.push(newT);
      }
      
      nextDate = getNextDate(nextDate, t.recurring as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly');
    }
  }

  return newTransactions;
}

export async function updateTransaction(
  id: number,
  amount: number,
  type: 'income' | 'expense',
  category: string,
  description: string,
  date: string
): Promise<Transaction | undefined> {
  await pool.query(
    'UPDATE transactions SET amount = $1, type = $2, category = $3, description = $4, date = $5 WHERE id = $6',
    [amount, type, category, description, date, id]
  );
  const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
  return result.rows[0] as Transaction | undefined;
}

export async function deleteTransaction(id: number): Promise<void> {
  await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
}

export async function getSettingsByUserId(userId: number): Promise<Settings | undefined> {
  const result = await pool.query('SELECT * FROM settings WHERE user_id = $1', [userId]);
  return result.rows[0] as Settings | undefined;
}

export async function createSettings(userId: number): Promise<Settings> {
  const defaultIncome = JSON.stringify(['Salary', 'Freelance', 'Investments', 'Other Income']);
  const defaultExpense = JSON.stringify(['Rent', 'Utilities', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other']);
  
  const result = await pool.query(
    'INSERT INTO settings (user_id, income_categories, expense_categories) VALUES ($1, $2, $3) RETURNING *',
    [userId, defaultIncome, defaultExpense]
  );
  return result.rows[0] as Settings;
}

export async function updateSettings(
  userId: number,
  incomeCategories: string[],
  expenseCategories: string[],
  savingsTarget: number,
  warningThreshold: number,
  reinvestmentRules: { id: string; name: string; threshold: number; target: string; enabled: boolean }[],
  companyName?: string
): Promise<Settings | undefined> {
  const existing = await getSettingsByUserId(userId);
  
  if (existing) {
    await pool.query(`
      UPDATE settings 
      SET income_categories = $1, expense_categories = $2, savings_target = $3, warning_threshold = $4, reinvestment_rules = $5
      WHERE user_id = $6
    `,
      [
        JSON.stringify(incomeCategories),
        JSON.stringify(expenseCategories),
        savingsTarget,
        warningThreshold,
        JSON.stringify(reinvestmentRules),
        userId
      ]
    );
  } else {
    await createSettings(userId);
    await pool.query(`
      UPDATE settings 
      SET income_categories = $1, expense_categories = $2, savings_target = $3, warning_threshold = $4, reinvestment_rules = $5
      WHERE user_id = $6
    `,
      [
        JSON.stringify(incomeCategories),
        JSON.stringify(expenseCategories),
        savingsTarget,
        warningThreshold,
        JSON.stringify(reinvestmentRules),
        userId
      ]
    );
  }

  if (companyName) {
    await pool.query('UPDATE users SET company_name = $1 WHERE id = $2', [companyName, userId]);
  }

  return getSettingsByUserId(userId);
}

export async function getBalance(userId: number): Promise<number> {
  const income = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = $2', [userId, 'income']);
  const expense = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = $2', [userId, 'expense']);
  return (income.rows[0].total as number) - (expense.rows[0].total as number);
}

export async function getAllTimeHigh(userId: number): Promise<number> {
  const result = await pool.query(`
    SELECT date, 
      (SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) 
       FROM transactions t2 
       WHERE t2.user_id = t1.user_id AND t2.date <= t1.date) as running_balance
    FROM transactions t1
    WHERE t1.user_id = $1
    ORDER BY running_balance DESC
    LIMIT 1
  `, [userId]);
  
  return result.rows[0]?.running_balance || 0;
}

export default pool;
