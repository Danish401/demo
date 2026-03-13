import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, clearTokenCache } from '@/lib/zoho'

/**
 * Cron job endpoint to refresh Zoho access token every hour.
 * Uses ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN from env.
 * New token is cached in memory and persisted to .zoho-token.json when writable.
 *
 * Called by:
 * - Vercel Cron (vercel.json: "0 * * * *")
 * - External cron (cron-job.org, EasyCron, etc.) – hit GET/POST every hour
 *
 * Security: Set CRON_SECRET in env and send header x-cron-secret when using external cron.
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET

    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid cron secret' },
        { status: 401 }
      )
    }

    // Force refresh the token
    clearTokenCache()
    const accessToken = await getAccessToken(true)

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString(),
      token_preview: accessToken.substring(0, 20) + '...',
    })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to refresh token',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also support POST for cron services that use POST
export async function POST(request: NextRequest) {
  return GET(request)
}
