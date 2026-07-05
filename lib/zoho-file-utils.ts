/** Extract filepath query param from Zoho Creator file-upload field value */
export function parseZohoFileFieldPath(fieldValue: unknown): string | null {
  if (fieldValue == null) return null
  const s = String(fieldValue).trim()
  if (!s) return null

  const queryMatch = s.match(/[?&]filepath=([^&]+)/)
  if (queryMatch?.[1]) {
    try {
      return decodeURIComponent(queryMatch[1])
    } catch {
      return queryMatch[1]
    }
  }

  // Plain filepath string (no URL path)
  if (!s.includes('/')) return s

  return null
}
