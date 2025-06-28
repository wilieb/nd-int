import { getDatabase } from './database'

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event)
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  const db = getDatabase()

  try {
    const { fromAccountId, toAccountId, amount, note, scheduledDate } = body

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

    let exchangeRate = 1
    let convertedAmount = amount

    if (fromAccount.currency !== toAccount.currency) {
      const { rows: [rate] } = await db.execute({
        sql: `SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ?`,
        args: [fromAccount.currency, toAccount.currency],
      })

      if (!rate) {
        throw new Error(`Exchange rate not found for ${fromAccount.currency} to ${toAccount.currency}`)
      }

      if (typeof rate.rate !== 'number' || rate.rate === null) {
        throw new Error(`Invalid exchange rate value for ${fromAccount.currency} to ${toAccount.currency}`)
      }
      exchangeRate = rate.rate
      convertedAmount = amount * exchangeRate
    }

    const isScheduled = scheduledDate && new Date(scheduledDate) > new Date()
    const processedDate = isScheduled ? null : new Date().toISOString()
    const status = isScheduled ? 'scheduled' : 'completed'

    // Start manual transaction
    let transactionId: number | undefined
    await db.execute({ sql: 'BEGIN', args: [] })
    try {
      if ((fromAccount.balance ?? 0) < amount) {
        throw new Error('Insufficient balance')
      }

      const result = await db.execute({
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
        try {
          await db.execute({
            sql: 'UPDATE accounts SET balance = balance - ? WHERE id = ?',
            args: [amount, fromAccountId]
          })

          await db.execute({
            sql: 'UPDATE accounts SET balance = balance + ? WHERE id = ?',
            args: [convertedAmount, toAccountId]
          })

          await db.execute({
            sql: `INSERT INTO transaction_logs (
              account_id, transaction_id, action, amount, currency,
              balance_before, balance_after, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
              Number(fromAccount.balance ?? 0), Number(fromAccount.balance ?? 0) - Number(amount), 'completed']
          })

          await db.execute({
            sql: `INSERT INTO transaction_logs (
              account_id, transaction_id, action, amount, currency,
              balance_before, balance_after, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [toAccountId, transactionId, 'credit', convertedAmount, toAccount.currency,
              toAccount.balance, toAccount.balance + convertedAmount, 'completed']
          })

        } catch (error) {
          if (typeof transactionId === 'undefined') {
            throw new Error('Transaction ID is undefined');
          }

          await db.execute({
            sql: 'UPDATE transactions SET status = ? WHERE id = ?',
            args: ['failed', transactionId]
          });


          await db.execute({
            sql: `INSERT INTO transaction_logs (
              account_id, transaction_id, action, amount, currency,
              balance_before, balance_after, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
              fromAccount.balance, fromAccount.balance, 'failed']
          })

          await db.execute({ sql: 'ROLLBACK', args: [] })
          throw error
        }
      } else {
        await db.execute({
          sql: `INSERT INTO transaction_logs (
            account_id, transaction_id, action, amount, currency,
            balance_before, balance_after, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [fromAccountId, transactionId, 'debit', amount, fromAccount.currency,
            fromAccount.balance, fromAccount.balance, 'scheduled']
        })
      }

      await db.execute({ sql: 'COMMIT', args: [] })
    } catch (error) {
      await db.execute({ sql: 'ROLLBACK', args: [] })
      throw error
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