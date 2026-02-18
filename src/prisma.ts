import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

let prisma: PrismaClient
let pool: Pool

declare global {
  var __prisma: PrismaClient | undefined
  var __pool: Pool | undefined
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
} else {
  if (!global.__pool) {
    global.__pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  }
  pool = global.__pool
  
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ 
      adapter: new PrismaPg(pool) 
    })
  }
  prisma = global.__prisma
}

process.on('beforeExit', async () => {
  await pool.end()
  await prisma.$disconnect()
})

export default prisma