import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const formatMinutes = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`

export default async function AvailabilityPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      availabilitySchedules: {
        where: { isDefault: true },
        include: { rules: { orderBy: { weekday: 'asc' } }, overrides: { orderBy: { date: 'asc' } } },
        take: 1,
      },
    },
  })
  if (!user) redirect('/login')
  const schedule = user.availabilitySchedules[0]

  return (
    <main className="simplePage">
      <div className="simpleHeader">
        <div><p className="eyebrow">Availability</p><h1>{schedule?.name ?? 'Working hours'}</h1></div>
        <a className="secondary" href="/">Back to dashboard</a>
      </div>
      <section className="listCard">
        <p className="muted">Timezone: {schedule?.timezone ?? user.timezone}</p>
        {schedule ? dayNames.map((day, weekday) => {
          const rules = schedule.rules.filter((rule) => rule.weekday === weekday)
          return (
            <div className="listRow" key={day}>
              <strong>{day}</strong>
              <span className="muted">{rules.length ? rules.map((rule) => `${formatMinutes(rule.startMinutes)}–${formatMinutes(rule.endMinutes)}`).join(', ') : 'Unavailable'}</span>
            </div>
          )
        }) : <p className="muted">No schedule exists yet.</p>}
      </section>
    </main>
  )
}
