const DEFAULT_ACCOUNTS_DOMAIN = 'accounts.zoho.in'
const SAFETY_BUFFER_MS = 5 * 60 * 1000 // Refresh 5 minutes before expiry
const CRON_REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes for cron job

let cached: { access_token: string; expires_at: number } | null = null
let lastRefreshTime: number = 0

/**
 * Clears the cached token (useful when token is invalid/expired)
 */
export function clearTokenCache(): void {
  cached = null
  lastRefreshTime = 0
}

/**
 * Gets the last refresh time (useful for monitoring)
 */
export function getLastRefreshTime(): number {
  return lastRefreshTime
}

/**
 * True when ZOHO_ACCESS_TOKEN is set (no refresh calls). Use to skip retry on 401.
 */
export function isUsingStaticToken(): boolean {
  return Boolean(process.env.ZOHO_ACCESS_TOKEN?.trim())
}

/**
 * Checks if token needs refresh based on cron interval
 */
export function shouldRefreshForCron(): boolean {
  const now = Date.now()
  return !lastRefreshTime || (now - lastRefreshTime) >= CRON_REFRESH_INTERVAL_MS
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  const staticToken = process.env.ZOHO_ACCESS_TOKEN?.trim()
  const now = Date.now()

  // If ZOHO_ACCESS_TOKEN is set, use it (avoids refresh calls when rate-limited)
  if (staticToken) {
    if (!forceRefresh && cached?.access_token === staticToken && cached.expires_at > now) {
      return cached.access_token
    }
    // Treat static token as valid for 50 minutes so we don't hit refresh
    cached = {
      access_token: staticToken,
      expires_at: now + 50 * 60 * 1000,
    }
    lastRefreshTime = now
    return staticToken
  }

  const refreshToken = process.env.ZOHO_REFRESH_TOKEN
  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing Zoho env: ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET')
  }

  // Return cached token if it's still valid and not forcing refresh
  if (!forceRefresh && cached && cached.expires_at > now) {
    return cached.access_token
  }

  // Clear cache if forcing refresh or token expired
  if (forceRefresh || (cached && cached.expires_at <= now)) {
    cached = null
  }

  const domain = process.env.ZOHO_ACCOUNTS_DOMAIN?.trim() || DEFAULT_ACCOUNTS_DOMAIN
  const tokenUrl = domain.startsWith('http') ? domain : `https://${domain}/oauth/v2/token`

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await res.json()

  if (!res.ok) {
    // Clear cache on error
    cached = null
    throw new Error(`Zoho token error: ${JSON.stringify(data)}`)
  }

  // Use actual expires_in from Zoho response (in seconds), convert to milliseconds
  // Default to 3600 seconds (1 hour) if not provided
  const expiresInSeconds = data.expires_in_sec || data.expires_in || 3600
  const expiresInMs = expiresInSeconds * 1000

  cached = {
    access_token: data.access_token,
    // Set expiry with safety buffer (refresh 5 minutes before actual expiry)
    expires_at: now + expiresInMs - SAFETY_BUFFER_MS,
  }

  // Update last refresh time for cron monitoring
  lastRefreshTime = now

  return data.access_token
}
