import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'host@example.com' },
    update: { name: 'Demo Host', timezone: 'Pacific/Auckland' },
    create: {
      email: 'host@example.com',
      name: 'Demo Host',
      timezone: 'Pacific/Auckland',
    },
  })

  const existingDefault = await prisma.availabilitySchedule.findFirst({
    where: { userId: user.id, isDefault: true },
  })

  const schedule =
    existingDefault ??
    (await prisma.availabilitySchedule.create({
      data: {
        userId: user.id,
        name: 'Working hours',
        timezone: 'Pacific/Auckland',
        isDefault: true,
      },
    }))

  await prisma.availabilityRule.deleteMany({ where: { scheduleId: schedule.id } })
  await prisma.availabilityRule.createMany({
    data: [1, 2, 3, 4, 5].map((weekday) => ({
      scheduleId: schedule.id,
      weekday,
      startMinutes: 9 * 60,
      endMinutes: 17 * 60,
    })),
  })

  await prisma.eventType.upsert({
    where: { slug: '30-minute-meeting' },
    update: {
      ownerId: user.id,
      scheduleId: schedule.id,
      name: '30 Minute Meeting',
      description: 'A focused 30 minute conversation.',
      durationMinutes: 30,
      slotIntervalMinutes: 30,
      minimumNoticeMinutes: 60,
      bookingWindowDays: 60,
      active: true,
    },
    create: {
      ownerId: user.id,
      scheduleId: schedule.id,
      name: '30 Minute Meeting',
      slug: '30-minute-meeting',
      description: 'A focused 30 minute conversation.',
      durationMinutes: 30,
      slotIntervalMinutes: 30,
      minimumNoticeMinutes: 60,
      bookingWindowDays: 60,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
