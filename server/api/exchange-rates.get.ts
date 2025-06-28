import { ensureDatabaseInitialized } from './database'

export default defineEventHandler(async (event) => {
  const db = await ensureDatabaseInitialized(event)
  
  try {
    const result = await db.execute(`
      SELECT from_currency, to_currency, rate, updated_at
      FROM exchange_rates
      ORDER BY from_currency, to_currency
    `)
    const rates = result.rows || []
    
    return {
      success: true,
      data: rates
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch exchange rates'
    })
  }
})