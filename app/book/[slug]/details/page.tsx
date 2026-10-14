'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

export default function BookingDetailsPage() {
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const startsAt = searchParams.get('startsAt') || ''
  const [submitted, setSubmitted] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const displayTime = useMemo(() => {
    if (!startsAt) return 'No time selected'
    const date = new Date(startsAt)
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date)
  }, [startsAt])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!startsAt) {
      setError('Please return and choose a time first.')
      return
    }

    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: params.slug,
          startsAt,
          guestName: form.get('name'),
          guestEmail: form.get('email'),
          notes: form.get('notes'),
          guestTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create booking')

      setBookingId(payload.booking.id)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="bookingPage">
        <section className="bookingCard" style={{ gridTemplateColumns: '1fr' }}>
          <div className="bookingMain">
            <p className="eyebrow">Confirmed</p>
            <h1>Your meeting is booked</h1>
            <p className="muted">{displayTime}</p>
            <p>Your booking is safely stored. Calendar invitations and email notifications come in the integration phase.</p>
            <p className="muted">Booking reference: {bookingId}</p>
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
          <h1>Confirm your meeting</h1>
          <p><strong>{displayTime}</strong></p>
        </div>
        <div className="bookingMain">
          <h2>Enter your details</h2>
          <form className="form" onSubmit={submit}>
            <label>Name<input required name="name" placeholder="Your name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@example.com" /></label>
            <label>Anything we should know?<textarea name="notes" rows={4} placeholder="Optional" /></label>
            {error && <p className="errorText">{error}</p>}
            <button className="primary" type="submit" disabled={submitting}>
              {submitting ? 'Booking…' : 'Confirm booking'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
