'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewEventTypePage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)

    const response = await fetch('/api/event-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        description: form.get('description'),
        durationMinutes: Number(form.get('durationMinutes')),
      }),
    })

    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) {
      setError(data.error || 'Could not create event type.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="simplePage">
      <div className="simpleHeader">
        <div><p className="eyebrow">Scheduling</p><h1>New event type</h1></div>
        <a className="secondary" href="/">Cancel</a>
      </div>
      <section className="formCard">
        <form className="form" onSubmit={submit}>
          <label>Name<input name="name" required placeholder="30 Minute Consultation" /></label>
          <label>Description<textarea name="description" rows={4} placeholder="What should guests expect?" /></label>
          <label>Duration
            <select name="durationMinutes" defaultValue="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>
          {error ? <p className="errorText">{error}</p> : null}
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create event type'}</button>
        </form>
      </section>
    </main>
  )
}
