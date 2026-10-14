'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

type AvailabilityResponse = {
  eventType: {
    id: string
    name: string
    description: string | null
    durationMinutes: number
    locationType: string
    hostName: string
    timezone: string
  }
  date: string
  slots: Array<{ startsAt: string; endsAt: string; label: string }>
}

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function BookingPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [date, setDate] = useState(todayIso)
  const [data, setData] = useState<AvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetch(`/api/availability?slug=${encodeURIComponent(slug)}&date=${encodeURIComponent(date)}`, {
      cache: 'no-store',
    })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Unable to load availability')
        return payload as AvailabilityResponse
      })
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setData(null)
          setError(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug, date])

  const longDate = useMemo(() => {
    const value = new Date(`${date}T12:00:00`)
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(value)
  }, [date])

  return (
    <main className="bookingPage">
      <section className="bookingCard">
        <div className="bookingInfo">
          <p className="eyebrow">Booking</p>
          <h1>{data?.eventType.name || 'Meeting'}</h1>
          <p className="muted">{data?.eventType.description || 'Choose a date to see available times.'}</p>
          {data && <p><strong>{data.eventType.durationMinutes} minutes</strong></p>}
          {data && <p className="muted">{data.eventType.locationType}</p>}
          {data && <p className="muted">{data.eventType.timezone}</p>}
        </div>

        <div className="bookingMain">
          <p className="eyebrow">{longDate}</p>
          <h2>Select a date and time</h2>

          <label className="datePicker">
            Date
            <input type="date" value={date} min={todayIso()} onChange={(event) => setDate(event.target.value)} />
          </label>

          <h2>Available times</h2>
          {loading && <p className="muted">Checking availability…</p>}
          {error && <p className="errorText">{error}</p>}
          {!loading && !error && data?.slots.length === 0 && (
            <p className="muted">No times are available on this date. Try another day.</p>
          )}

          <div className="slots">
            {data?.slots.map((slot) => (
              <a
                className="slot"
                href={`/book/${encodeURIComponent(slug)}/details?startsAt=${encodeURIComponent(slot.startsAt)}`}
                key={slot.startsAt}
              >
                {slot.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
