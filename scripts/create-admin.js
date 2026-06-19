/**
 * Create or promote a user to admin.
 *
 * Usage:
 *   node scripts/create-admin.js <email> [name] [password]
 *
 * Example:
 *   node scripts/create-admin.js kazibweusama@gmail.com "Usama Kazibwe" "Fabrio@2026"
 */

const { PrismaClient } = require('@prisma/client')
const { hashPassword } = require('better-auth/crypto')

const prisma = new PrismaClient()

function nameFromEmail(email) {
  const local = email.split('@')[0] || 'Admin'
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  const name = process.argv[3]?.trim() || nameFromEmail(email)
  const password = process.argv[4] || 'Fabrio@2026'

  if (!email) {
    console.error('Usage: node scripts/create-admin.js <email> [name] [password]')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'admin', emailVerified: true, name: existing.name || name },
    })

    const account = await prisma.account.findFirst({
      where: { userId: existing.id, providerId: 'credential' },
    })

    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { password: await hashPassword(password) },
      })
    } else {
      await prisma.account.create({
        data: {
          userId: existing.id,
          accountId: existing.id,
          providerId: 'credential',
          password: await hashPassword(password),
        },
      })
    }

    console.log(`Updated existing user to admin: ${email}`)
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
        role: 'admin',
      },
    })

    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: await hashPassword(password),
      },
    })

    console.log(`Created admin user: ${email}`)
  }

  console.log(`Name: ${name}`)
  console.log(`Password: ${password}`)
  console.log('Login at /auth/login, then open /admin/products to manage products.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())