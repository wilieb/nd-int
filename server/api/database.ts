import Database from 'better-sqlite3'
import { join } from 'path'

let db: Database.Database

function getDatabase() {
  if (!db) {
    const dbPath = join(process.cwd(), 'treasury.db')
    db = new Database(dbPath)
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        currency TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_account_id INTEGER,
        to_account_id INTEGER,
        amount REAL NOT NULL,
        original_amount REAL,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        exchange_rate REAL DEFAULT 1,
        note TEXT,
        status TEXT DEFAULT 'completed',
        scheduled_date DATETIME,
        processed_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_account_id) REFERENCES accounts (id),
        FOREIGN KEY (to_account_id) REFERENCES accounts (id)
      );

      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        rate REAL NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transaction_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER,
        transaction_id INTEGER,
        action TEXT NOT NULL,
        amount REAL,
        currency TEXT,
        balance_before REAL,
        balance_after REAL,
        status TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id),
        FOREIGN KEY (transaction_id) REFERENCES transactions (id)
      );
    `)

    const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number }
    
    if (accountCount.count === 0) {
      const insertAccount = db.prepare('INSERT INTO accounts (name, currency, balance) VALUES (?, ?, ?)')
      const accounts = [
        ['Mpesa_KES_1', 'KES', 250000.50],
        ['Mpesa_KES_2', 'KES', 180000.00],
        ['Bank_KES_1', 'KES', 500000.75],
        ['Bank_USD_1', 'USD', 15000.25],
        ['Bank_USD_2', 'USD', 32000.00],
        ['Bank_USD_3', 'USD', 8750.50],
        ['Paystack_NGN_1', 'NGN', 2500000.00],
        ['Paystack_NGN_2', 'NGN', 1800000.25],
        ['Bank_NGN_1', 'NGN', 5000000.50],
        ['Bank_NGN_2', 'NGN', 3200000.75]
      ]
      
      accounts.forEach(account => insertAccount.run(...account))

      const insertRate = db.prepare('INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES (?, ?, ?)')
      const rates = [
        ['USD', 'KES', 150.00],
        ['KES', 'USD', 0.0067],
        ['USD', 'NGN', 800.00],
        ['NGN', 'USD', 0.00125],
        ['KES', 'NGN', 5.33],
        ['NGN', 'KES', 0.1875]
      ]
      
      rates.forEach(rate => insertRate.run(...rate))
    }
  }
  
  return db
}

export { getDatabase }