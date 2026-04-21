/**
 * Seed file — Calculator History
 * Populates the `calculations` table with realistic sample data.
 *
 * Usage:
 *   npx ts-node --project tsconfig.seed.json database/seed.ts
 * OR add to package.json:
 *   "seed": "ts-node database/seed.ts"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Sample data — two fictional sessions with varied arithmetic expressions
// ---------------------------------------------------------------------------

const SESSION_A = 'a1b2c3d4-0000-4000-8000-000000000001'
const SESSION_B = 'b5e6f7a8-0000-4000-8000-000000000002'

interface SeedCalculation {
  expression: string
  result: string
  sessionId: string
  createdAt: Date
}

function minutesAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 1000)
}

const calculations: SeedCalculation[] = [
  // Session A — basic arithmetic sequence
  { expression: '1 + 1',           result: '2',                sessionId: SESSION_A, createdAt: minutesAgo(60) },
  { expression: '10 - 4',          result: '6',                sessionId: SESSION_A, createdAt: minutesAgo(58) },
  { expression: '7 * 8',           result: '56',               sessionId: SESSION_A, createdAt: minutesAgo(55) },
  { expression: '100 / 4',         result: '25',               sessionId: SESSION_A, createdAt: minutesAgo(50) },
  { expression: '3 + 4 * 2',       result: '11',               sessionId: SESSION_A, createdAt: minutesAgo(45) },
  { expression: '(3 + 4) * 2',     result: '14',               sessionId: SESSION_A, createdAt: minutesAgo(40) },
  { expression: '9 % 4',           result: '1',                sessionId: SESSION_A, createdAt: minutesAgo(35) },
  { expression: '2 ** 10',         result: '1024',             sessionId: SESSION_A, createdAt: minutesAgo(30) },

  // Session B — decimal and larger numbers
  { expression: '0.1 + 0.2',       result: '0.3',              sessionId: SESSION_B, createdAt: minutesAgo(20) },
  { expression: '999 * 999',       result: '998001',           sessionId: SESSION_B, createdAt: minutesAgo(18) },
  { expression: '1000000 / 7',     result: '142857.142857',    sessionId: SESSION_B, createdAt: minutesAgo(15) },
  { expression: '3.14159 * 2',     result: '6.28318',          sessionId: SESSION_B, createdAt: minutesAgo(12) },
  { expression: '(-5) + 20',       result: '15',               sessionId: SESSION_B, createdAt: minutesAgo(10) },
  { expression: '50 / 0',          result: 'Error: Div by 0',  sessionId: SESSION_B, createdAt: minutesAgo(8)  },
  { expression: 'sqrt(144)',        result: '12',               sessionId: SESSION_B, createdAt: minutesAgo(5)  },
  { expression: '15 % 4',          result: '3',                sessionId: SESSION_B, createdAt: minutesAgo(2)  },
]

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('🌱  Seeding calculator history...')

  // Wipe existing seed data (idempotent re-runs)
  await prisma.calculation.deleteMany({
    where: {
      sessionId: { in: [SESSION_A, SESSION_B] },
    },
  })

  const created = await prisma.calculation.createMany({
    data: calculations,
    skipDuplicates: true,
  })

  console.log(`✅  Created ${created.count} calculation records.`)

  // Verify
  const total = await prisma.calculation.count()
  console.log(`📊  Total calculations in DB: ${total}`)
}

main()
  .catch((err) => {
    console.error('❌  Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })