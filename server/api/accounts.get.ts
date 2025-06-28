import { getDatabase } from './database'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  
  try {
    const result = await db.execute(`
      SELECT id, name, currency, balance, created_at 
      FROM accounts 
      ORDER BY currency, name
    `)
    
    return {
      success: true,
      data: result.rows ?? result
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch accounts'
    })
  }
})