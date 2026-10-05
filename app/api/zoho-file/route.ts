import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, clearTokenCache, isUsingStaticToken } from '@/lib/zoho'

const CREATOR_BASE = process.env.ZOHO_CREATOR_BASE ?? 'https://www.zohoapis.in/creator/v2.1/data'

const CREATOR_REPORT_NAMES = [
  'Quotation_Log_Door_Core',
  'Core_Cover_page_Report',
  'Quotation_Log_Door_Set_2',
  'Quotation_Door_Set1_Report',
  'Quotation_Log_Fitout_2',
  'Quotation_Report',
] as const

function resolveReportName(searchParams: URLSearchParams): string {
  const reportFromUrl = (searchParams.get('report') ?? '').trim()
  const envReport = (process.env.ZOHO_REPORT_LINK_NAME ?? '').trim()
  if (reportFromUrl && CREATOR_REPORT_NAMES.includes(reportFromUrl as (typeof CREATOR_REPORT_NAMES)[number])) {
    return reportFromUrl
  }
  return envReport || reportFromUrl || 'Quotation_Log_Door_Core'
}

async function fetchZohoFile(
  accessToken: string,
  recordId: string,
  reportLinkName: string,
  fieldLinkName: string,
  filepath: string
): Promise<Response> {
  const owner = process.env.ZOHO_ACCOUNT_OWNER
  const appLinkName = process.env.ZOHO_APP_LINK_NAME

  if (!owner || !appLinkName) {
    return NextResponse.json(
      { error: 'Missing ZOHO_ACCOUNT_OWNER or ZOHO_APP_LINK_NAME' },
      { status: 400 }
    )
  }

  const zohoReportName = reportLinkName === 'Quotation_Report' ? 'Quotation_Log_Fitout_2' : reportLinkName

  const url = new URL(
    `${CREATOR_BASE}/${owner}/${appLinkName}/report/${zohoReportName}/${recordId}/${fieldLinkName}/download`
  )
  url.searchParams.set('filepath', filepath)

  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('id') || searchParams.get('perm') || ''
    const fieldLinkName = (searchParams.get('field') || 'Excel_Upload1').trim()
    const filepath = (searchParams.get('filepath') || '').trim()
    const reportLinkName = resolveReportName(searchParams)

    if (!recordId || !filepath) {
      return NextResponse.json(
        { error: 'Missing id and filepath query parameters' },
        { status: 400 }
      )
    }

    let accessToken = await getAccessToken()
    let response = await fetchZohoFile(accessToken, recordId, reportLinkName, fieldLinkName, filepath)

    if (!response.ok && (response.status === 401 || response.status === 403)) {
      if (!isUsingStaticToken()) {
        clearTokenCache()
        accessToken = await getAccessToken(true)
        response = await fetchZohoFile(accessToken, recordId, reportLinkName, fieldLinkName, filepath)
      }
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      let errJson: Record<string, unknown> = {}
      try {
        errJson = JSON.parse(errText) as Record<string, unknown>
      } catch {
        // non-json body
      }
      const message =
        (typeof errJson.message === 'string' && errJson.message) ||
        (typeof errJson.error === 'string' && errJson.error) ||
        errText ||
        'Failed to download file from Zoho Creator'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to download Zoho file' },
      { status: 500 }
    )
  }
}
