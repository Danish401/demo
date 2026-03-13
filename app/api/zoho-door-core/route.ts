import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, clearTokenCache, isUsingStaticToken } from '@/lib/zoho'

// Door Core quotation: supports Quotation_Log_Door_Core or Core_Cover_page_Report (env or URL report param)
const CREATOR_BASE = process.env.ZOHO_CREATOR_BASE ?? 'https://www.zohoapis.in/creator/v2.1/data'

// Both are valid ZOHO_REPORT_LINK_NAME values for Door Core (same app, different report links)
const DOOR_CORE_REPORT_NAMES = ['Quotation_Log_Door_Core', 'Core_Cover_page_Report'] as const
type DoorCoreReportName = (typeof DOOR_CORE_REPORT_NAMES)[number]

function getReportParam(searchParams: URLSearchParams): string {
  const direct = searchParams.get('report')
  if (direct) return direct.trim()
  for (const [key, value] of searchParams.entries()) {
    if (key.trim().toLowerCase() === 'report') return value.trim()
  }
  return ''
}

function isDoorCoreReportName(value: string): value is DoorCoreReportName {
  return (DOOR_CORE_REPORT_NAMES as readonly string[]).includes(value)
}

async function fetchDoorCoreReport(accessToken: string, searchParams: URLSearchParams): Promise<Response> {
  const owner = process.env.ZOHO_ACCOUNT_OWNER
  const appLinkName = process.env.ZOHO_APP_LINK_NAME
  const reportFromUrl = getReportParam(searchParams)
  const envReport = (process.env.ZOHO_REPORT_LINK_NAME ?? '').trim()
  // Use report from URL if it's one of the two known names, else from env, else pass-through from URL
  const reportLinkName = isDoorCoreReportName(reportFromUrl)
    ? reportFromUrl
    : envReport || reportFromUrl

  const missing: string[] = []
  if (!owner) missing.push('ZOHO_ACCOUNT_OWNER')
  if (!appLinkName) missing.push('ZOHO_APP_LINK_NAME')
  if (!reportLinkName) missing.push('report link (set ZOHO_REPORT_LINK_NAME in env or use ?report=Quotation_Log_Door_Core|Core_Cover_page_Report)')
  if (missing.length > 0) {
    return NextResponse.json(
      {
        code: 400,
        error: `Missing: ${missing.join(', ')}`,
      },
      { status: 400 }
    )
  }

  const id = searchParams.get('id') || searchParams.get('perm') || ''
  const max_records = searchParams.get('max_records') || '200'
  const field_config = searchParams.get('field_config') || 'all'
  const criteriaParam = searchParams.get('criteria') || ''
  const fields = searchParams.get('fields') || ''
  const privatelink = searchParams.get('privatelink') || ''

  const criteria = id ? `ID == ${id}` : criteriaParam

  const url = new URL(
    `${CREATOR_BASE}/${owner}/${appLinkName}/report/${reportLinkName}`
  )
  url.searchParams.set('max_records', max_records)
  url.searchParams.set('field_config', field_config)
  if (criteria) url.searchParams.set('criteria', criteria)
  if (fields) url.searchParams.set('fields', fields)
  if (privatelink) url.searchParams.set('privatelink', privatelink)

  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      Accept: 'application/json',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let accessToken = await getAccessToken()

    let response = await fetchDoorCoreReport(accessToken, searchParams)
    let data = await response.json()

    if (!response.ok && (response.status === 401 || response.status === 403)) {
      if (!isUsingStaticToken()) {
        const errorCode = data?.code
        if (errorCode === 1030 || response.status === 401 || response.status === 403) {
          clearTokenCache()
          accessToken = await getAccessToken(true)
          response = await fetchDoorCoreReport(accessToken, searchParams)
          data = await response.json()
        }
      }
    }

    if (!response.ok) {
      const message = data?.message || data?.error_description || data?.error || 'Zoho Creator API error'
      return NextResponse.json(
        {
          code: response.status,
          error: message,
          details: data,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch Door Core quotation',
        details: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      },
      { status: 500 }
    )
  }
}
