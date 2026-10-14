import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlotsBySlug } from '@/lib/availability'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  const date = request.nextUrl.searchParams.get('date')

  if (!slug || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'slug and date (YYYY-MM-DD) are required' }, { status: 400 })
  }

  try {
    const result = await getAvailableSlotsBySlug(slug, date)
    if (!result) return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    return NextResponse.json(result)
  } catch (error) {
    console.error('availability error', error)
    return NextResponse.json({ error: 'Unable to load availability' }, { status: 500 })
  }
}
