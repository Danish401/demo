import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, clearTokenCache, isUsingStaticToken } from '@/lib/zoho'

// Door Core quotation: supports Quotation_Log_Door_Core or Core_Cover_page_Report (env or URL report param)
const CREATOR_BASE = process.env.ZOHO_CREATOR_BASE ?? 'https://www.zohoapis.in/creator/v2.1/data'

// Valid ZOHO report link names (same app, different report links)
const CREATOR_REPORT_NAMES = [
  'Quotation_Log_Door_Core',
  'Core_Cover_page_Report',
  'Quotation_Log_Door_Set_2',
  'Quotation_Door_Set1_Report',
  'Quotation_Log_Fitout_2',
  'Quotation_Report',
] as const
type CreatorReportName = (typeof CREATOR_REPORT_NAMES)[number]

function getReportParam(searchParams: URLSearchParams): string {
  const value = searchParams.get('report')
  return value ? value.trim() : ''
}

function isCreatorReportName(value: string): value is CreatorReportName {
  return (CREATOR_REPORT_NAMES as readonly string[]).includes(value)
}

async function fetchDoorCoreReport(accessToken: string, searchParams: URLSearchParams): Promise<Response> {
  const owner = process.env.ZOHO_ACCOUNT_OWNER
  const appLinkName = process.env.ZOHO_APP_LINK_NAME
  const reportFromUrl = getReportParam(searchParams)
  const envReport = (process.env.ZOHO_REPORT_LINK_NAME ?? '').trim()
  // Use report from URL if it's a known name, else from env, else pass-through from URL
  const reportLinkName = isCreatorReportName(reportFromUrl)
    ? reportFromUrl
    : envReport || reportFromUrl

  const missing: string[] = []
  if (!owner) missing.push('ZOHO_ACCOUNT_OWNER')
  if (!appLinkName) missing.push('ZOHO_APP_LINK_NAME')
  if (!reportLinkName) missing.push('report link (set ZOHO_REPORT_LINK_NAME in env or use ?report=Quotation_Log_Door_Core|Quotation_Log_Door_Set_2|Quotation_Door_Set1_Report|Quotation_Log_Fitout_2|Quotation_Report)')
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
  let field_config = searchParams.get('field_config') || 'all'
  const criteriaParam = searchParams.get('criteria') || ''
  let fields = searchParams.get('fields') || ''
  const privatelink = searchParams.get('privatelink') || ''

  // Quotation_Log_Door_Set_2 and Quotation_Door_Set1_Report share 4 subforms: Items_Details, Section_1, Section_2, Section_3.
  const DOOR_SET_SUBFORMS = 'Items_Details,Section_1,Section_2,Section_3'
  if (reportLinkName === 'Quotation_Log_Door_Set_2' || reportLinkName === 'Quotation_Door_Set1_Report') {
    fields = fields ? `${fields},${DOOR_SET_SUBFORMS}` : DOOR_SET_SUBFORMS
  }
  // Quotation_Log_Fitout_2 and Quotation_Report: same fitout report, same subforms
  const FITOUT_SUBFORMS = 'Items_Details,Items_Details1,SubForm1,SubForm2'
  const isFitoutReport = reportLinkName === 'Quotation_Log_Fitout_2' || reportLinkName === 'Quotation_Report'
  if (isFitoutReport) {
    fields = fields ? `${fields},${FITOUT_SUBFORMS}` : FITOUT_SUBFORMS
  }

  const criteria = id ? `ID == ${id}` : criteriaParam

  // Map Quotation_Report to Zoho report name Quotation_Log_Fitout_2 (same data/report)
  const zohoReportName = reportLinkName === 'Quotation_Report' ? 'Quotation_Log_Fitout_2' : reportLinkName

  const url = new URL(
    `${CREATOR_BASE}/${owner}/${appLinkName}/report/${zohoReportName}`
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
