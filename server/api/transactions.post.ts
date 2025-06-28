import { getDatabase } from './database'

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event)
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  const db = getDatabase()
  
  try {
    const { fromAccountId, toAccountId, amount, note, scheduledDate } = body
    
    type Account = {
      id: number
      balance: number
      currency: string
    }

    const fromAccount = db.prepare('SELECT * FROM accounts WHERE id = ?').get(fromAccountId) as Account | undefined
    const toAccount = db.prepare('SELECT * FROM accounts WHERE id = ?').get(toAccountId) as Account | undefined
    
    if (!fromAccount || !toAccount) {
      throw new Error('Account not found')
    }
    
    let exchangeRate = 1
    let convertedAmount = amount
    
    if (fromAccount.currency !== toAccount.currency) {
      const rate = db.prepare(`
        SELECT rate FROM exchange_rates 
        WHERE from_currency = ? AND to_currency = ?
      `).get(fromAccount.currency, toAccount.currency) as { rate: number } | undefined;
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${fromAccount.currency} to ${toAccount.currency}`)
      }
      
      exchangeRate = rate.rate
      convertedAmount = amount * exchangeRate
    }

    const isScheduled = scheduledDate && new Date(scheduledDate) > new Date()
    const processedDate = isScheduled ? null : new Date().toISOString()
    const status = isScheduled ? 'scheduled' : 'completed'
    
    const transaction = db.transaction(() => {
      if (fromAccount.balance < amount) {
        throw new Error('Insufficient balance')
      }
      
      const insertTransaction = db.prepare(`
        INSERT INTO transactions (
          from_account_id, to_account_id, amount, original_amount, 
          from_currency, to_currency, exchange_rate, note, 
          status, scheduled_date, processed_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      const result = insertTransaction.run(
        fromAccountId, toAccountId, convertedAmount, amount,
        fromAccount.currency, toAccount.currency, exchangeRate, note,
        status, scheduledDate || null, processedDate
      )
      
      const transactionId = result.lastInsertRowid
      
      const insertLog = db.prepare(`
        INSERT INTO transaction_logs (
          account_id, transaction_id, action, amount, currency,
          balance_before, balance_after, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      if (!isScheduled) {
        try {
          db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?')
            .run(amount, fromAccountId)
          
          db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
            .run(convertedAmount, toAccountId)
          
          insertLog.run(
            fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
            fromAccount.balance, fromAccount.balance - amount, 'completed'
          )
          
          insertLog.run(
            toAccountId, transactionId, 'credit', convertedAmount, toAccount.currency,
            toAccount.balance, toAccount.balance + convertedAmount, 'completed'
          )
          
        } catch (error) {
          db.prepare('UPDATE transactions SET status = ? WHERE id = ?')
            .run('failed', transactionId)
          
          insertLog.run(
            fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
            fromAccount.balance, fromAccount.balance, 'failed', (error instanceof Error ? error.message : String(error))
          )
          
          throw error
        }
      } else {
        insertLog.run(
          fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
          fromAccount.balance, fromAccount.balance, 'scheduled'
        )
      }
      
      return transactionId
    })
    
    const transactionId = transaction()
    
    return {
      success: true,
      data: { 
        id: transactionId, 
        status,
        exchangeRate: exchangeRate !== 1 ? exchangeRate : undefined,
        convertedAmount: exchangeRate !== 1 ? convertedAmount : undefined
      }
    }
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw createError({
      statusCode: 400,
      statusMessage: message
    })
  }
})