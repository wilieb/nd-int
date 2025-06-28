import { getDatabase } from './database'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  
  try {
    const accounts = db.prepare(`
      SELECT id, name, currency, balance, created_at 
      FROM accounts 
      ORDER BY currency, name
    `).all()
    
    return {
      success: true,
      data: accounts
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch accounts'
    })
  }
})