import { ensureDatabaseInitialized } from './database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = await ensureDatabaseInitialized(event)
  
  try {
    let sql = `
      SELECT 
        t.*,
        fa.name as from_account_name,
        ta.name as to_account_name
      FROM transactions t
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
    `
    
    const conditions = []
    const params: any[] = []
    
    if (query.currency) {
      conditions.push('(t.from_currency = ? OR t.to_currency = ?)')
      params.push(query.currency, query.currency)
    }
    
    if (query.account_id) {
      conditions.push('(t.from_account_id = ? OR t.to_account_id = ?)')
      params.push(query.account_id, query.account_id)
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    
    sql += ' ORDER BY t.created_at DESC'
    
    const result = await db.execute(sql, params)
    const transactions = result.rows ?? []
    
    return {
      success: true,
      data: transactions
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions'
    })
  }
})