import { ensureDatabaseInitialized } from './database'

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event)
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  const db = await ensureDatabaseInitialized(event)

  try {
    const { fromAccountId, toAccountId, amount, note, scheduledDate } = body

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      throw new Error('Missing or invalid transaction data')
    }

    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer to the same account')
    }

    const { rows: [fromAccount] } = await db.execute({
      sql: 'SELECT * FROM accounts WHERE id = ?',
      args: [fromAccountId],
    })

    const { rows: [toAccount] } = await db.execute({
      sql: 'SELECT * FROM accounts WHERE id = ?',
      args: [toAccountId],
    })

    if (!fromAccount || !toAccount) {
      throw new Error('Account not found')
    }

    if ((fromAccount.balance ?? 0) < amount) {
      throw new Error('Insufficient balance')
    }

    let exchangeRate = 1
    let convertedAmount = amount

    if (fromAccount.currency !== toAccount.currency) {
      const { rows: [rate] } = await db.execute({
        sql: `SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ?`,
        args: [fromAccount.currency, toAccount.currency],
      })

      if (!rate || typeof rate.rate !== 'number') {
        throw new Error(`Exchange rate not found or invalid`)
      }

      exchangeRate = rate.rate
      convertedAmount = amount * exchangeRate
    }

    const isScheduled = scheduledDate && new Date(scheduledDate) > new Date()
    const processedDate = isScheduled ? null : new Date().toISOString()
    const status = isScheduled ? 'scheduled' : 'completed'

    let transactionId: number | undefined

    const tx = await db.transaction();
    try {
      const result = await tx.execute({
        sql: `
          INSERT INTO transactions (
            from_account_id, to_account_id, amount, original_amount,
            from_currency, to_currency, exchange_rate, note,
            status, scheduled_date, processed_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          fromAccountId, toAccountId, convertedAmount, amount,
          fromAccount.currency, toAccount.currency, exchangeRate, note,
          status, scheduledDate || null, processedDate,
        ]
      })

      transactionId = typeof result.lastInsertRowid === 'bigint'
        ? Number(result.lastInsertRowid)
        : result.lastInsertRowid

      if (!isScheduled) {
        await tx.execute({
          sql: 'UPDATE accounts SET balance = balance - ? WHERE id = ?',
          args: [amount, fromAccountId]
        })

        await tx.execute({
          sql: 'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          args: [convertedAmount, toAccountId]
        })

        await tx.execute({
          sql: `INSERT INTO transaction_logs (
            account_id, transaction_id, action, amount, currency,
            balance_before, balance_after, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
            Number(fromAccount.balance), Number(fromAccount.balance) - amount, 'completed']
        })

        await tx.execute({
          sql: `INSERT INTO transaction_logs (
            account_id, transaction_id, action, amount, currency,
            balance_before, balance_after, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [toAccountId, transactionId, 'credit', convertedAmount, toAccount.currency,
            toAccount.balance, toAccount.balance + convertedAmount, 'completed']
        })

      } else {
        await tx.execute({
          sql: `INSERT INTO transaction_logs (
            account_id, transaction_id, action, amount, currency,
            balance_before, balance_after, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
            fromAccount.balance, fromAccount.balance, 'scheduled']
        })
      }
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    return {
      success: true,
      data: {
        id: transactionId,
        status,
        exchangeRate: exchangeRate !== 1 ? exchangeRate : undefined,
        convertedAmount: exchangeRate !== 1 ? convertedAmount : undefined,
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
