const meetings = [
  { title: '30 Minute Meeting', duration: '30 min', active: true },
  { title: '15 Minute Intro', duration: '15 min', active: true },
]

export default function HomePage() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Booking Platform</div>
        <nav>
          <a className="active" href="#">Scheduling</a>
          <a href="#">Meetings</a>
          <a href="#">Availability</a>
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
            <p className="muted">Create booking links people can use to schedule time with you.</p>
          </div>
          <button className="primary">+ New event type</button>
        </header>

        <div className="grid">
          {meetings.map((meeting) => (
            <article className="card" key={meeting.title}>
              <div className="cardAccent" />
              <div className="cardBody">
                <div className="row between">
                  <span className="status">Active</span>
                  <button className="iconBtn">•••</button>
                </div>
                <h2>{meeting.title}</h2>
                <p className="muted">{meeting.duration} · One-on-one</p>
                <div className="linkBox">booking-platform.app/your-name/{meeting.title.toLowerCase().replaceAll(' ', '-')}</div>
                <div className="row gap">
                  <button className="secondary">Copy link</button>
                  <button className="secondary">Open booking page</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="panel">
          <div>
            <p className="eyebrow">Availability</p>
            <h2>Working hours</h2>
            <p className="muted">Monday–Friday · 9:00 AM–5:00 PM · Pacific/Auckland</p>
          </div>
          <button className="secondary">Edit availability</button>
        </section>
      </section>
    </main>
  )
}
