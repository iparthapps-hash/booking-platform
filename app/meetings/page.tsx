import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function MeetingsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/login')

  const bookings = await prisma.booking.findMany({
    where: { hostId: user.id },
    include: { eventType: true },
    orderBy: { startsAt: 'asc' },
    take: 100,
  })

  return (
    <main className="simplePage">
      <div className="simpleHeader">
        <div><p className="eyebrow">Meetings</p><h1>Your bookings</h1></div>
        <a className="secondary" href="/">Back to dashboard</a>
      </div>
      <div className="listCard">
        {bookings.length === 0 ? <p className="muted">No bookings yet.</p> : bookings.map((booking) => (
          <div className="listRow" key={booking.id}>
            <div>
              <strong>{booking.eventType.name}</strong>
              <p className="muted">{booking.guestName} · {booking.guestEmail}</p>
            </div>
            <div className="meetingMeta">
              <span>{new Intl.DateTimeFormat('en-NZ', { dateStyle: 'medium', timeStyle: 'short', timeZone: user.timezone }).format(booking.startsAt)}</span>
              <span className="status">{booking.status}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
