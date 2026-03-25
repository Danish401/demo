import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const DEFAULT_ACCOUNTS_DOMAIN = 'accounts.zoho.in'
const SAFETY_BUFFER_MS = 5 * 60 * 1000 // Refresh 5 minutes before expiry
const CRON_REFRESH_INTERVAL_MS = 23 * 60 * 60 * 1000 // 23 hours – cron runs once per day (Vercel Hobby)
const TOKEN_FILE = '.zoho-token.json'

let cached: { access_token: string; expires_at: number } | null = null
let lastRefreshTime: number = 0
let refreshPromise: Promise<{ access_token: string; expires_at: number }> | null = null
let cooldownUntil: number = 0

async function loadPersistedToken(): Promise<{ access_token: string; expires_at: number } | null> {
  try {
    const path = join(process.cwd(), TOKEN_FILE)
    const raw = await readFile(path, 'utf-8')
    const data = JSON.parse(raw) as { access_token?: string; expires_at?: number }
    if (data?.access_token && typeof data.expires_at === 'number' && data.expires_at > Date.now()) {
      return { access_token: data.access_token, expires_at: data.expires_at }
    }
  } catch {
    // File missing or invalid – ignore
  }
  return null
}

async function persistToken(access_token: string, expires_at: number): Promise<void> {
  try {
    const path = join(process.cwd(), TOKEN_FILE)
    await writeFile(path, JSON.stringify({ access_token, expires_at }), 'utf-8')
  } catch {
    // e.g. read-only filesystem (Vercel); in-memory cache still used
  }
}

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

  const hasValidCached = Boolean(cached && cached.expires_at > now)

  // Return cached token if it's still valid and not forcing refresh
  if (!forceRefresh && hasValidCached) return cached!.access_token

  // If Zoho is rate-limiting the token endpoint, avoid retry storms.
  // If we still have a valid cached token, keep using it even if caller asked for refresh.
  if (cooldownUntil > now) {
    if (hasValidCached) return cached!.access_token
    throw new Error(
      `Zoho token rate-limited. Please try again after ${Math.ceil((cooldownUntil - now) / 1000)}s.`
    )
  }

  // Clear cache if forcing refresh or token expired
  if (forceRefresh || (cached && cached.expires_at <= now)) {
    cached = null
  }

  // Use persisted token from file if still valid (helps after deploy/restart)
  if (!forceRefresh && !cached) {
    const persisted = await loadPersistedToken()
    if (persisted) {
      cached = persisted
      lastRefreshTime = now
      return cached.access_token
    }
  }

  // Single-flight: if multiple requests arrive while refreshing, they share the same refresh.
  if (refreshPromise) {
    return (await refreshPromise).access_token
  }

  const doRefresh = async (): Promise<{ access_token: string; expires_at: number }> => {
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

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      // Clear cache on error
      cached = null

      const errorText = (() => {
        if (typeof data?.error_description === 'string') return data.error_description
        if (typeof data?.error === 'string') return data.error
        return JSON.stringify(data)
      })()

      // Zoho commonly uses: "You have made too many requests continuously..."
      if (errorText.toLowerCase().includes('too many requests continuously')) {
        // Cooldown to prevent “retry storms” while Zoho blocks token refresh.
        cooldownUntil = Date.now() + 5 * 60 * 1000 // 5 minutes
      }

      throw new Error(`Zoho token error: ${JSON.stringify(data)}`)
    }

    // Use actual expires_in from Zoho response (in seconds), convert to milliseconds
    // Default to 3600 seconds (1 hour) if not provided
    const expiresInSeconds = data.expires_in_sec || data.expires_in || 3600
    const expiresInMs = expiresInSeconds * 1000

    if (typeof data.access_token !== 'string' || !data.access_token) {
      cached = null
      throw new Error(`Zoho token response missing access_token: ${JSON.stringify(data)}`)
    }

    const expires_at = Date.now() + expiresInMs - SAFETY_BUFFER_MS
    const tokenObj = {
      access_token: data.access_token,
      expires_at,
    }

    cached = tokenObj
    lastRefreshTime = Date.now()
    await persistToken(tokenObj.access_token, tokenObj.expires_at)

    return tokenObj
  }

  refreshPromise = doRefresh()
  try {
    const tokenObj = await refreshPromise
    return tokenObj.access_token
  } finally {
    refreshPromise = null
  }
}
