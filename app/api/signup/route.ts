import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!name || !email || password.length < 8) {
    return Response.json({ error: 'Name, email and a password of at least 8 characters are required.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'An account with this email already exists.' }, { status: 409 })
  }

  const passwordHash = await hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, timezone: 'Pacific/Auckland' },
    select: { id: true, name: true, email: true },
  })

  return Response.json({ user }, { status: 201 })
}
