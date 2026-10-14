import { BookingStatus, Prisma } from '@prisma/client'
import { DateTime } from 'luxon'
import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlotsBySlug } from '@/lib/availability'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type BookingInput = {
  slug?: string
  startsAt?: string
  guestName?: string
  guestEmail?: string
  guestTimezone?: string
  notes?: string
}

function isRetryable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034'
}

export async function POST(request: NextRequest) {
  let body: BookingInput

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const slug = body.slug?.trim()
  const guestName = body.guestName?.trim()
  const guestEmail = body.guestEmail?.trim().toLowerCase()
  const guestTimezone = body.guestTimezone?.trim() || 'UTC'

  if (!slug || !body.startsAt || !guestName || !guestEmail) {
    return NextResponse.json(
      { error: 'slug, startsAt, guestName and guestEmail are required' },
      { status: 400 },
    )
  }

  if (!/^\S+@\S+\.\S+$/.test(guestEmail)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }

  const requestedStart = DateTime.fromISO(body.startsAt, { setZone: true }).toUTC()
  if (!requestedStart.isValid) {
    return NextResponse.json({ error: 'Invalid startsAt timestamp' }, { status: 400 })
  }

  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: { schedule: true },
  })

  if (!eventType || !eventType.active) {
    return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
  }

  const localDate = requestedStart.setZone(eventType.schedule.timezone).toISODate()
  if (!localDate) return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })

  const availability = await getAvailableSlotsBySlug(slug, localDate)
  const requestedSlot = availability?.slots.find(
    (slot) => DateTime.fromISO(slot.startsAt).toUTC().toMillis() === requestedStart.toMillis(),
  )

  if (!requestedSlot) {
    return NextResponse.json({ error: 'That time is no longer available' }, { status: 409 })
  }

  const requestedEnd = DateTime.fromISO(requestedSlot.endsAt).toUTC()
  const blockedStart = requestedStart.minus({ minutes: eventType.bufferBeforeMinutes })
  const blockedEnd = requestedEnd.plus({ minutes: eventType.bufferAfterMinutes })

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const booking = await prisma.$transaction(
        async (tx) => {
          const conflict = await tx.booking.findFirst({
            where: {
              hostId: eventType.ownerId,
              status: BookingStatus.CONFIRMED,
              startsAt: { lt: blockedEnd.toJSDate() },
              endsAt: { gt: blockedStart.toJSDate() },
            },
            select: { id: true },
          })

          if (conflict) throw new Error('SLOT_TAKEN')

          return tx.booking.create({
            data: {
              eventTypeId: eventType.id,
              hostId: eventType.ownerId,
              guestName,
              guestEmail,
              guestTimezone,
              notes: body.notes?.trim() || null,
              startsAt: requestedStart.toJSDate(),
              endsAt: requestedEnd.toJSDate(),
            },
            select: {
              id: true,
              startsAt: true,
              endsAt: true,
              guestName: true,
              guestEmail: true,
              status: true,
            },
          })
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      )

      return NextResponse.json({ booking }, { status: 201 })
    } catch (error) {
      if (error instanceof Error && error.message === 'SLOT_TAKEN') {
        return NextResponse.json({ error: 'That time was just booked by someone else' }, { status: 409 })
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ error: 'That time was just booked by someone else' }, { status: 409 })
      }

      if (isRetryable(error) && attempt < 2) continue

      console.error('booking error', error)
      return NextResponse.json({ error: 'Unable to create booking' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Unable to create booking' }, { status: 500 })
}
