# Booking Platform

A clean-room scheduling SaaS MVP inspired by common appointment-booking workflows.

## Current V1 scaffold

- Scheduling dashboard
- Event type cards
- Availability summary
- Public booking page
- Date/time selection
- Guest details form
- Confirmation state
- Responsive desktop/mobile layout

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the host dashboard and http://localhost:3000/book/30-minute-meeting for the public booking flow.

## Next implementation milestones

1. Database + migrations
2. Authentication
3. Persistent event types
4. Availability rules and date overrides
5. Slot-generation service
6. Atomic booking/conflict protection
7. Meetings dashboard
8. Reschedule/cancel lifecycle
9. Google/Microsoft calendar adapters
10. Email notifications and workflows

## Clean-room note

This project implements generic scheduling functionality and original UI. It does not copy proprietary source code, private APIs, branding, copyrighted copy, or protected assets from other products.
