import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name = String(body.name ?? '').trim()
  const durationMinutes = Number(body.durationMinutes ?? 30)
  const description = String(body.description ?? '').trim() || null

  if (!name || !Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 480) {
    return Response.json({ error: 'Enter a valid name and duration.' }, { status: 400 })
  }

  let schedule = await prisma.availabilitySchedule.findFirst({ where: { userId: user.id, isDefault: true } })
  if (!schedule) {
    schedule = await prisma.availabilitySchedule.create({
      data: {
        userId: user.id,
        name: 'Working hours',
        timezone: user.timezone,
        isDefault: true,
        rules: {
          create: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMinutes: 540, endMinutes: 1020 })),
        },
      },
    })
  }

  const base = slugify(name) || 'meeting'
  let slug = base
  let suffix = 2
  while (await prisma.eventType.findUnique({ where: { slug } })) slug = `${base}-${suffix++}`

  const eventType = await prisma.eventType.create({
    data: {
      ownerId: user.id,
      scheduleId: schedule.id,
      name,
      slug,
      description,
      durationMinutes,
      slotIntervalMinutes: Math.min(durationMinutes, 30),
    },
  })

  return Response.json({ eventType }, { status: 201 })
}
