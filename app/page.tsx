import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      eventTypes: { orderBy: { createdAt: 'asc' } },
      availabilitySchedules: {
        where: { isDefault: true },
        include: { rules: true },
        take: 1,
      },
    },
  })

  if (!user) redirect('/login')
  const schedule = user.availabilitySchedules[0]

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Booking Platform</div>
        <nav>
          <a className="active" href="/">Scheduling</a>
          <a href="/meetings">Meetings</a>
          <a href="/availability">Availability</a>
          <a href="#">Workflows</a>
          <a href="#">Integrations</a>
          <a href="#">Settings</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Scheduling</p>
            <h1>Event types</h1>
            <p className="muted">Signed in as {user.name}. Create booking links people can use to schedule time with you.</p>
          </div>
          <div className="row gap">
            <a className="primary" href="/event-types/new">+ New event type</a>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
              <button className="secondary" type="submit">Sign out</button>
            </form>
          </div>
        </header>

        <div className="grid">
          {user.eventTypes.map((meeting) => (
            <article className="card" key={meeting.id}>
              <div className="cardAccent" />
              <div className="cardBody">
                <div className="row between">
                  <span className="status">{meeting.active ? 'Active' : 'Paused'}</span>
                </div>
                <h2>{meeting.name}</h2>
                <p className="muted">{meeting.durationMinutes} min · One-on-one</p>
                <div className="linkBox">/book/{meeting.slug}</div>
                <div className="row gap">
                  <a className="secondary" href={`/book/${meeting.slug}`}>Open booking page</a>
                  <a className="secondary" href={`/event-types/${meeting.id}`}>Edit</a>
                </div>
              </div>
            </article>
          ))}
          {user.eventTypes.length === 0 ? <p className="muted">No event types yet. Create your first one.</p> : null}
        </div>

        <section className="panel">
          <div>
            <p className="eyebrow">Availability</p>
            <h2>{schedule?.name ?? 'Working hours'}</h2>
            <p className="muted">{schedule ? `${schedule.rules.length} weekly rules · ${schedule.timezone}` : 'No default schedule yet.'}</p>
          </div>
          <a className="secondary" href="/availability">Edit availability</a>
        </section>
      </section>
    </main>
  )
}
