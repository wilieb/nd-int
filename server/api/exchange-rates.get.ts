import { getDatabase } from './database'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  
  try {
    const rates = db.prepare(`
      SELECT from_currency, to_currency, rate, updated_at
      FROM exchange_rates
      ORDER BY from_currency, to_currency
    `).all()
    
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