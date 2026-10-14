# Booking Platform

A clean-room scheduling SaaS MVP inspired by common appointment-booking workflows.

## Implemented

- Responsive scheduling dashboard
- Email/password signup and login with Auth.js
- Protected host dashboard
- Database-backed event types
- Event type creation page
- Meetings dashboard
- Availability overview
- Public booking page
- PostgreSQL + Prisma data model
- Persistent users, event types, schedules, date overrides and bookings
- Timezone-aware slot generation with Luxon
- Minimum notice, booking window, buffers and slot intervals
- Real availability API
- Real booking API
- Serializable booking transactions with conflict retries
- Double-booking protection
- Guest details and booking confirmation flow
- Docker Postgres for local development
- Demo seed data for `30-minute-meeting`
- GitHub Actions build/typecheck CI

## Local setup from GitHub

Requirements: Git, Node.js 20+ and Docker Desktop.

```bash
git clone https://github.com/iparthapps-hash/booking-platform.git
cd booking-platform
npm install
```

Copy `.env.example` to `.env`.

Windows Command Prompt:

```bat
copy .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Start PostgreSQL and initialise the database:

```bash
npm run db:start
npm run db:generate
npm run db:push
npm run db:seed
```

Then start the web app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Demo login:

- Email: `host@example.com`
- Password: `demo12345`

Public demo booking page: `http://localhost:3000/book/30-minute-meeting`

To stop PostgreSQL:

```bash
npm run db:stop
```

## API

### Availability

`GET /api/availability?slug=30-minute-meeting&date=2026-10-15`

### Create booking

`POST /api/bookings`

The API rechecks availability and creates the booking inside a PostgreSQL `Serializable` transaction. If another guest wins the slot first, the API returns HTTP 409 rather than creating a conflicting booking.

## Next milestones

1. Event type editing
2. Availability editor with weekly hours/date overrides
3. Reschedule/cancel lifecycle
4. Google Calendar adapter
5. Microsoft Calendar adapter
6. Email confirmations/reminders
7. Workflows
8. Payments and team scheduling

## Clean-room note

This project implements generic scheduling functionality and original UI. It does not copy proprietary source code, private APIs, branding, copyrighted copy, or protected assets from other products.
