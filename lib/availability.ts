import { BookingStatus } from '@prisma/client'
import { DateTime } from 'luxon'
import { prisma } from '@/lib/prisma'

export type AvailableSlot = {
  startsAt: string
  endsAt: string
  label: string
}

export async function getAvailableSlotsBySlug(slug: string, date: string) {
  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true } },
      schedule: {
        include: {
          rules: true,
          overrides: { where: { date } },
        },
      },
    },
  })

  if (!eventType || !eventType.active) return null

  const zone = eventType.schedule.timezone
  const localDay = DateTime.fromISO(date, { zone }).startOf('day')
  if (!localDay.isValid) throw new Error('Invalid date')

  const dayStartUtc = localDay.toUTC()
  const dayEndUtc = localDay.plus({ days: 1 }).toUTC()
  const weekday = localDay.weekday % 7
  const override = eventType.schedule.overrides[0]

  let windows: Array<{ startMinutes: number; endMinutes: number }> = []

  if (override) {
    if (override.available && override.startMinutes != null && override.endMinutes != null) {
      windows = [{ startMinutes: override.startMinutes, endMinutes: override.endMinutes }]
    }
  } else {
    windows = eventType.schedule.rules
      .filter((rule) => rule.weekday === weekday)
      .map((rule) => ({ startMinutes: rule.startMinutes, endMinutes: rule.endMinutes }))
  }

  const existing = await prisma.booking.findMany({
    where: {
      hostId: eventType.ownerId,
      status: BookingStatus.CONFIRMED,
      startsAt: { lt: dayEndUtc.toJSDate() },
      endsAt: { gt: dayStartUtc.toJSDate() },
    },
    select: { startsAt: true, endsAt: true },
  })

  const now = DateTime.utc()
  const earliestMs = now.plus({ minutes: eventType.minimumNoticeMinutes }).toMillis()
  const latestMs = now.plus({ days: eventType.bookingWindowDays }).toMillis()
  const slots: AvailableSlot[] = []

  for (const window of windows) {
    for (
      let minute = window.startMinutes;
      minute + eventType.durationMinutes <= window.endMinutes;
      minute += eventType.slotIntervalMinutes
    ) {
      const startLocal = localDay.plus({ minutes: minute })
      const endLocal = startLocal.plus({ minutes: eventType.durationMinutes })
      const startUtc = startLocal.toUTC()
      const endUtc = endLocal.toUTC()
      const startMs = startUtc.toMillis()

      if (startMs < earliestMs || startMs > latestMs) continue

      const blockedStartMs = startUtc.minus({ minutes: eventType.bufferBeforeMinutes }).toMillis()
      const blockedEndMs = endUtc.plus({ minutes: eventType.bufferAfterMinutes }).toMillis()
      const overlaps = existing.some((booking) => {
        const existingStartMs = booking.startsAt.getTime()
        const existingEndMs = booking.endsAt.getTime()
        return blockedStartMs < existingEndMs && blockedEndMs > existingStartMs
      })

      if (!overlaps) {
        const startsAt = startUtc.toISO()
        const endsAt = endUtc.toISO()
        if (!startsAt || !endsAt) continue

        slots.push({
          startsAt,
          endsAt,
          label: startLocal.toFormat('h:mm a'),
        })
      }
    }
  }

  return {
    eventType: {
      id: eventType.id,
      name: eventType.name,
      description: eventType.description,
      durationMinutes: eventType.durationMinutes,
      locationType: eventType.locationType,
      hostName: eventType.owner.name,
      timezone: zone,
    },
    date,
    slots,
  }
}
