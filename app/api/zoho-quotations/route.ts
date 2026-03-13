import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, clearTokenCache, isUsingStaticToken } from '@/lib/zoho'

// Zoho Creator API - Quotations form/report (set ZOHO_CREATOR_BASE if not India DC)
// App: https://creatorapp.zoho.in/bvkinfrasoftservicespvtltd/machine-master2/#Form:Quotations
const CREATOR_BASE = process.env.ZOHO_CREATOR_BASE ?? 'https://www.zohoapis.in/creator/v2.1/data'
const OWNER_NAME = 'bvkinfrasoftservicespvtltd'
const APP_LINK_NAME = 'machine-master2'
const REPORT_LINK_NAME = 'All_Quotations'

async function fetchQuotations(accessToken: string, searchParams: URLSearchParams): Promise<Response> {
    // Optional: id (from perm), max_records, criteria, field_config, fields, privatelink
    const id = searchParams.get('id') || ''
    const max_records = searchParams.get('max_records') || '200'
    const field_config = searchParams.get('field_config') || 'all'
    const criteriaParam = searchParams.get('criteria') || ''
    const fields = searchParams.get('fields') || ''
    const privatelink = searchParams.get('privatelink') || ''

    // When id is provided (e.g. from perm/URL), filter by that record ID only (ID is NUMBER in Zoho)
    const criteria = id ? `ID == ${id}` : criteriaParam

    const url = new URL(
      `${CREATOR_BASE}/${OWNER_NAME}/${APP_LINK_NAME}/report/${REPORT_LINK_NAME}`
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

    // First attempt
    let response = await fetchQuotations(accessToken, searchParams)
    let data = await response.json()

    // If we get an authorization error (401/403), try refreshing the token once (skip when using static token)
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      if (!isUsingStaticToken()) {
        const errorCode = data?.code
        if (errorCode === 1030 || response.status === 401 || response.status === 403) {
          clearTokenCache()
          accessToken = await getAccessToken(true)
          response = await fetchQuotations(accessToken, searchParams)
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
        error: err instanceof Error ? err.message : 'Failed to fetch Quotations',
        details: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      },
      { status: 500 }
    )
  }
}
