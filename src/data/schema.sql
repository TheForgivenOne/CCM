CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  company_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  recurring TEXT DEFAULT NULL CHECK(recurring IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly', NULL)),
  recurring_end TEXT DEFAULT NULL,
  parent_id INTEGER DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  income_categories TEXT DEFAULT '["Salary","Freelance","Investments","Other Income"]',
  expense_categories TEXT DEFAULT '["Rent","Utilities","Food","Transport","Entertainment","Shopping","Health","Other"]',
  savings_target REAL DEFAULT 0,
  warning_threshold REAL DEFAULT 0,
  reinvestment_rules TEXT DEFAULT '[]',
  FOREIGN KEY (user_id) REFERENCES users(id)
);
