import { NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/zoho'

export async function GET() {
  try {
    const access_token = await getAccessToken()
    return NextResponse.json({
      access_token,
      token_type: 'Bearer',
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch Zoho token' },
      { status: 500 }
    )
  }
}
