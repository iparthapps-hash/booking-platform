# Booking Platform

A clean-room scheduling SaaS MVP inspired by common appointment-booking workflows.

## Implemented

- Responsive scheduling dashboard
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
- Demo seed data for `30-minute-meeting`
- GitHub Actions build/typecheck CI

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database.
2. Install dependencies and create the schema:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000` for the host dashboard and `http://localhost:3000/book/30-minute-meeting` for the public booking flow.

## API

### Availability

`GET /api/availability?slug=30-minute-meeting&date=2026-10-15`

Returns event metadata and currently bookable UTC timestamps for that local schedule date.

### Create booking

`POST /api/bookings`

```json
{
  "slug": "30-minute-meeting",
  "startsAt": "2026-10-15T00:00:00.000Z",
  "guestName": "Guest Name",
  "guestEmail": "guest@example.com",
  "guestTimezone": "Pacific/Auckland",
  "notes": "Optional"
}
```

The API rechecks availability and creates the booking inside a PostgreSQL `Serializable` transaction. If another guest wins the slot first, the API returns HTTP 409 rather than creating a conflicting booking.

## Next milestones

1. Authentication + protected host dashboard
2. Persistent event-type editor
3. Availability editor UI
4. Meetings dashboard
5. Reschedule/cancel lifecycle
6. Google Calendar adapter
7. Microsoft Calendar adapter
8. Email confirmations/reminders
9. Workflows
10. Payments and team scheduling

## Clean-room note

This project implements generic scheduling functionality and original UI. It does not copy proprietary source code, private APIs, branding, copyrighted copy, or protected assets from other products.
