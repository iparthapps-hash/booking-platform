'use client'

import { FormEvent, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function BookingDetailsPage() {
  const params = useSearchParams()
  const time = params.get('time') || '9:00 AM'
  const [submitted, setSubmitted] = useState(false)

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="bookingPage">
        <section className="bookingCard" style={{ gridTemplateColumns: '1fr' }}>
          <div className="bookingMain">
            <p className="eyebrow">Confirmed</p>
            <h1>Your meeting is booked</h1>
            <p className="muted">30 Minute Meeting · {time} · Pacific/Auckland</p>
            <p>A confirmation email and calendar invitation will be sent when integrations are connected.</p>
            <a className="secondary" href="/">Return to dashboard</a>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="bookingPage">
      <section className="bookingCard">
        <div className="bookingInfo">
          <p className="eyebrow">Your selection</p>
          <h1>30 Minute Meeting</h1>
          <p><strong>{time}</strong></p>
          <p className="muted">October 14, 2026 · Pacific/Auckland</p>
        </div>
        <div className="bookingMain">
          <h2>Enter your details</h2>
          <form className="form" onSubmit={submit}>
            <label>Name<input required name="name" placeholder="Your name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@example.com" /></label>
            <label>Anything we should know?<textarea name="notes" rows={4} placeholder="Optional" /></label>
            <button className="primary" type="submit">Confirm booking</button>
          </form>
        </div>
      </section>
    </main>
  )
}
