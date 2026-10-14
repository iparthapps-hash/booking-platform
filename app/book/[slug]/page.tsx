const days = [
  { label: '13', disabled: true },
  { label: '14', selected: true },
  { label: '15' },
  { label: '16' },
  { label: '17' },
  { label: '18', disabled: true },
  { label: '19', disabled: true },
  { label: '20' },
  { label: '21' },
  { label: '22' },
  { label: '23' },
  { label: '24' },
  { label: '25', disabled: true },
  { label: '26', disabled: true },
]

const slots = ['9:00 AM', '9:30 AM', '10:30 AM', '11:00 AM', '1:30 PM', '2:00 PM']

export default function BookingPage() {
  return (
    <main className="bookingPage">
      <section className="bookingCard">
        <div className="bookingInfo">
          <p className="eyebrow">Booking</p>
          <h1>30 Minute Meeting</h1>
          <p className="muted">A focused 30 minute conversation.</p>
          <p><strong>30 minutes</strong></p>
          <p className="muted">Online meeting</p>
          <p className="muted">Pacific/Auckland</p>
        </div>

        <div className="bookingMain">
          <p className="eyebrow">October 2026</p>
          <h2>Select a date and time</h2>

          <div className="calendarGrid">
            {days.map((day, index) => (
              <button
                key={`${day.label}-${index}`}
                className={`day ${day.disabled ? 'disabled' : 'available'} ${day.selected ? 'selected' : ''}`}
                disabled={day.disabled}
              >
                {day.label}
              </button>
            ))}
          </div>

          <h2>Available times</h2>
          <div className="slots">
            {slots.map((slot) => (
              <a className="slot" href={`/book/30-minute-meeting/details?time=${encodeURIComponent(slot)}`} key={slot}>{slot}</a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
