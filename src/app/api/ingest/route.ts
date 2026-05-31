import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { keyword } = await request.json()

  if (!keyword) {
    return NextResponse.json({ error: 'keyword obrigatória' }, { status: 400 })
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-and-analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ keyword }),
    }
  )

  const data = await res.json()
  return NextResponse.json(data)
}