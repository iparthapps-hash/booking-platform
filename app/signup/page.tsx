'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '')
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setLoading(false)
      setError(data.error || 'Could not create account.')
      return
    }

    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      router.push('/login')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="eyebrow">Create account</p>
        <h1>Start scheduling</h1>
        <p className="muted">Create your host account. You can configure calendars after signup.</p>
        <form className="form" onSubmit={submit}>
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
          {error ? <p className="errorText">{error}</p> : null}
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="muted">Already have an account? <a href="/login"><strong>Sign in</strong></a></p>
      </section>
    </main>
  )
}
