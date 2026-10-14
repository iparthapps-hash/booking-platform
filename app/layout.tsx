import './globals.css'

export const metadata = {
  title: 'Booking Platform',
  description: 'Clean-room scheduling platform MVP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
