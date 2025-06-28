import { getDatabase } from '../database'

export default defineEventHandler(async (event) => {
  const accountId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const db = getDatabase()
  
  try {
    if (!accountId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Account ID is required'
      })
    }

    let sql = `
      SELECT 
        tl.*,
        t.note,
        t.from_currency,
        t.to_currency,
        t.exchange_rate,
        CASE 
          WHEN tl.action = 'debit' THEN fa.name
          ELSE ta.name
        END as related_account
      FROM transaction_logs tl
      LEFT JOIN transactions t ON tl.transaction_id = t.id
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      WHERE tl.account_id = ?
    `
    
    const params = [String(accountId)]
    
    if (query.status) {
      sql += ' AND tl.status = ?'
      params.push(String(query.status))
    }
    
    sql += ' ORDER BY tl.created_at DESC'
    
    const result = await db.execute(sql, params)
    const logs = result.rows || []

    return {
      success: true,
      data: logs
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch account logs'
    })
  }
})