import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'ccm.db');

if (!fs.existsSync(dbPath)) {
  const schemaPath = path.join(process.cwd(), 'src/data/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const dbInit = new Database(dbPath);
    dbInit.exec(schema);
    dbInit.close();
  }
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

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

export function getUserByEmail(email: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT id, email, company_name, created_at FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(email: string, password: string, companyName?: string): User {
  const stmt = db.prepare('INSERT INTO users (email, password, company_name) VALUES (?, ?, ?)');
  const result = stmt.run(email, password, companyName || null);
  return getUserById(result.lastInsertRowid as number) as User;
}

export function getTransactionsByUserId(userId: number): Transaction[] {
  return db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC').all(userId) as Transaction[];
}

export function createTransaction(
  userId: number,
  amount: number,
  type: 'income' | 'expense',
  category: string,
  description: string,
  date: string,
  recurring?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null,
  recurringEnd?: string | null,
  parentId?: number | null
): Transaction {
  const stmt = db.prepare(
    'INSERT INTO transactions (user_id, amount, type, category, description, date, recurring, recurring_end, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(userId, amount, type, category, description, date, recurring || null, recurringEnd || null, parentId || null);
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid) as Transaction;
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

export function generateRecurringTransactions(userId: number): Transaction[] {
  const recurring = db.prepare(
    'SELECT * FROM transactions WHERE user_id = ? AND recurring IS NOT NULL AND (recurring_end IS NULL OR recurring_end >= date("now"))'
  ).all(userId) as Transaction[];
  
  const today = new Date().toISOString().split('T')[0];
  const newTransactions: Transaction[] = [];

  for (const t of recurring) {
    let nextDate = getNextDate(t.date, t.recurring as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly');
    
    while (nextDate <= today) {
      const existing = db.prepare(
        'SELECT id FROM transactions WHERE parent_id = ? AND date = ?'
      ).get(t.id, nextDate);
      
      if (!existing) {
        const newT = createTransaction(
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

export function updateTransaction(
  id: number,
  amount: number,
  type: 'income' | 'expense',
  category: string,
  description: string,
  date: string
): Transaction | undefined {
  db.prepare(
    'UPDATE transactions SET amount = ?, type = ?, category = ?, description = ?, date = ? WHERE id = ?'
  ).run(amount, type, category, description, date, id);
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction | undefined;
}

export function deleteTransaction(id: number): void {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
}

export function getSettingsByUserId(userId: number): Settings | undefined {
  return db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId) as Settings | undefined;
}

export function createSettings(userId: number): Settings {
  const defaultIncome = JSON.stringify(['Salary', 'Freelance', 'Investments', 'Other Income']);
  const defaultExpense = JSON.stringify(['Rent', 'Utilities', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other']);
  
  const stmt = db.prepare(
    'INSERT INTO settings (user_id, income_categories, expense_categories) VALUES (?, ?, ?)'
  );
  stmt.run(userId, defaultIncome, defaultExpense);
  return getSettingsByUserId(userId) as Settings;
}

export function updateSettings(
  userId: number,
  incomeCategories: string[],
  expenseCategories: string[],
  savingsTarget: number,
  warningThreshold: number,
  reinvestmentRules: { id: string; name: string; threshold: number; target: string; enabled: boolean }[],
  companyName?: string
): Settings | undefined {
  const existing = getSettingsByUserId(userId);
  
  if (existing) {
    db.prepare(`
      UPDATE settings 
      SET income_categories = ?, expense_categories = ?, savings_target = ?, warning_threshold = ?, reinvestment_rules = ?
      WHERE user_id = ?
    `).run(
      JSON.stringify(incomeCategories),
      JSON.stringify(expenseCategories),
      savingsTarget,
      warningThreshold,
      JSON.stringify(reinvestmentRules),
      userId
    );
  } else {
    createSettings(userId);
    db.prepare(`
      UPDATE settings 
      SET income_categories = ?, expense_categories = ?, savings_target = ?, warning_threshold = ?, reinvestment_rules = ?
      WHERE user_id = ?
    `).run(
      JSON.stringify(incomeCategories),
      JSON.stringify(expenseCategories),
      savingsTarget,
      warningThreshold,
      JSON.stringify(reinvestmentRules),
      userId
    );
  }

  if (companyName) {
    db.prepare('UPDATE users SET company_name = ? WHERE id = ?').run(companyName, userId);
  }

  return getSettingsByUserId(userId);
}

export function getBalance(userId: number): number {
  const income = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = ?').get(userId, 'income') as { total: number };
  const expense = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = ?').get(userId, 'expense') as { total: number };
  return income.total - expense.total;
}

export function getAllTimeHigh(userId: number): number {
  const result = db.prepare(`
    SELECT date, 
      (SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) 
       FROM transactions t2 
       WHERE t2.user_id = t1.user_id AND t2.date <= t1.date) as running_balance
    FROM transactions t1
    WHERE t1.user_id = ?
    ORDER BY running_balance DESC
    LIMIT 1
  `).get(userId) as { running_balance: number } | undefined;
  
  return result?.running_balance || 0;
}

export default db;
