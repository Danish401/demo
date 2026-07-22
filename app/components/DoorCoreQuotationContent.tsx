'use client'

import { useEffect, useState } from 'react'
import { CoreCoverPageData } from '@/lib/types'
import { boldCivilDefenceHtml, formatAedAmountInWords, formatQuotationNo, formatSealDescriptionHtml, plainZohoDisplayText } from '@/lib/quotation-utils'

/** True if field has displayable value (hide row/section when false) */
function hasValue(v: unknown): boolean {
  if (v == null) return false
  const s = String(v).trim()
  return s !== ''
}

/**
 * New UAE Dirham currency symbol (Unicode U+20C3, accepted for Unicode 18.0 / Sept 2026).
 * Rendered as inline SVG rather than the Unicode character since no OS/browser ships the
 * glyph yet — path data sourced from the Central Bank of UAE coin glyph.
 */
function DirhamSymbol() {
  return (
    <svg
      viewBox="0 0 1000 870"
      width="0.78em"
      height="0.68em"
      fill="currentColor"
      role="img"
      aria-label="AED"
      style={{ display: 'inline-block', verticalAlign: '-0.05em' }}
    >
      <path d="m88.3 1c0.4 0.6 2.6 3.3 4.7 5.9 15.3 18.2 26.8 47.8 33 85.1 4.1 24.5 4.3 32.2 4.3 125.6v87h-41.8c-38.2 0-42.6-0.2-50.1-1.7-11.8-2.5-24-9.2-32.2-17.8-6.5-6.9-6.3-7.3-5.9 13.6 0.5 17.3 0.7 19.2 3.2 28.6 4 14.9 9.5 26 17.8 35.9 11.3 13.6 22.8 21.2 39.2 26.3 3.5 1 10.9 1.4 37.1 1.6l32.7 0.5v43.3 43.4l-46.1-0.3-46.3-0.3-8-3.2c-9.5-3.8-13.8-6.6-23.1-14.9l-6.8-6.1 0.4 19.1c0.5 17.7 0.6 19.7 3.1 28.7 8.7 31.8 29.7 54.5 57.4 61.9 6.9 1.9 9.6 2 38.5 2.4l30.9 0.4v89.6c0 54.1-0.3 94-0.8 100.8-0.5 6.2-2.1 17.8-3.5 25.9-6.5 37.3-18.2 65.4-35 83.6l-3.4 3.7h169.1c101.1 0 176.7-0.4 187.8-0.9 19.5-1 63-5.3 72.8-7.4 3.1-0.6 8.9-1.5 12.7-2.1 8.1-1.2 21.5-4 40.8-8.9 27.2-6.8 52-15.3 76.3-26.1 7.6-3.4 29.4-14.5 35.2-18 3.1-1.8 6.8-4 8.2-4.7 3.9-2.1 10.4-6.3 19.9-13.1 4.7-3.4 9.4-6.7 10.4-7.4 4.2-2.8 18.7-14.9 25.3-21 25.1-23.1 46.1-48.8 62.4-76.3 2.3-4 5.3-9 6.6-11.1 3.3-5.6 16.9-33.6 18.2-37.8 0.6-1.9 1.4-3.9 1.8-4.3 2.6-3.4 17.6-50.6 19.4-60.9 0.6-3.3 0.9-3.8 3.4-4.3 1.6-0.3 24.9-0.3 51.8-0.1 53.8 0.4 53.8 0.4 65.7 5.9 6.7 3.1 8.7 4.5 16.1 11.2 9.7 8.7 8.8 10.1 8.2-11.7-0.4-12.8-0.9-20.7-1.8-23.9-3.4-12.3-4.2-14.9-7.2-21.1-9.8-21.4-26.2-36.7-47.2-44l-8.2-3-33.4-0.4-33.3-0.5 0.4-11.7c0.4-15.4 0.4-45.9-0.1-61.6l-0.4-12.6 44.6-0.2c38.2-0.2 45.3 0 49.5 1.1 12.6 3.5 21.1 8.3 31.5 17.8l5.8 5.4v-14.8c0-17.6-0.9-25.4-4.5-37-7.1-23.5-21.1-41-41.1-51.8-13-7-13.8-7.2-58.5-7.5-26.2-0.2-39.9-0.6-40.6-1.2-0.6-0.6-1.1-1.6-1.1-2.4 0-0.8-1.5-7.1-3.5-13.9-23.4-82.7-67.1-148.4-131-197.1-8.7-6.7-30-20.8-38.6-25.6-3.3-1.9-6.9-3.9-7.8-4.5-4.2-2.3-28.3-14.1-34.3-16.6-3.6-1.6-8.3-3.6-10.4-4.4-35.3-15.3-94.5-29.8-139.7-34.3-7.4-0.7-17.2-1.8-21.7-2.2-20.4-2.3-48.7-2.6-209.4-2.6-135.8 0-169.9 0.3-169.4 1zm330.7 43.3c33.8 2 54.6 4.6 78.9 10.5 74.2 17.6 126.4 54.8 164.3 117 3.5 5.8 18.3 36 20.5 42.1 10.5 28.3 15.6 45.1 20.1 67.3 1.1 5.4 2.6 12.6 3.3 16 0.7 3.3 1 6.4 0.7 6.7-0.5 0.4-100.9 0.6-223.3 0.5l-222.5-0.2-0.3-128.5c-0.1-70.6 0-129.3 0.3-130.4l0.4-1.9h71.1c39 0 78 0.4 86.5 0.9zm297.5 350.3c0.7 4.3 0.7 77.3 0 80.9l-0.6 2.7-227.5-0.2-227.4-0.3-0.2-42.4c-0.2-23.3 0-42.7 0.2-43.1 0.3-0.5 97.2-0.8 227.7-0.8h227.2zm-10.2 171.7c0.5 1.5-1.9 13.8-6.8 33.8-5.6 22.5-13.2 45.2-20.9 62-3.8 8.6-13.3 27.2-15.6 30.7-1.1 1.6-4.3 6.7-7.1 11.2-18 28.2-43.7 53.9-73 72.9-10.7 6.8-32.7 18.4-38.6 20.2-1.2 0.3-2.5 0.9-3 1.3-0.7 0.6-9.8 4-20.4 7.8-19.5 6.9-56.6 14.4-86.4 17.5-19.3 1.9-22.4 2-96.7 2h-76.9v-129.7-129.8l220.9-0.4c121.5-0.2 221.6-0.5 222.4-0.7 0.9-0.1 1.8 0.5 2.1 1.2z" />
    </svg>
  )
}

/** "Total Quotation value: Ð x,xxx (Dirhams … Only)" — numeric uses Dirham symbol; words use "Dirhams" */
function QuotationValueNote({ data }: { data: CoreCoverPageData }) {
  return (
    <p className="door-core-quotation-value-note">
      Total Quotation value: <DirhamSymbol /> {formatAED(data.Grand_Total_AED)} (
      {formatAedAmountInWords(data.Grand_Total_AED)})
      <br />
      For detailed quotation refer the attached sheet.
    </p>
  )
}

export type DoorCoreViewMode = 'simple' | 'approved'

interface DoorCoreQuotationContentProps {
  data: CoreCoverPageData
  /** 'simple' = no signature (default); 'approved' = show signature when data.Approval === 'Approved' */
  viewMode?: DoorCoreViewMode
  /** Kept for call-site compatibility; Tender PDF attachment is no longer used */
  reportName?: string
}

interface FooterData {
  trade_name: string
  phone: string
  location: string
  email1: string
  email2: string
  website: string
}

function getFooterData(subDivisions?: string): FooterData {
  const sub = (subDivisions || '').trim()
  switch (sub) {
    case 'ABU DHABI':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING - L.L.C - S.P.C',
        phone: '+971 2 551 3828',
        location: '94956, Abu Dhabi',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'DUBAI':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC',
        phone: '+971 4 298 6983',
        location: '48143, Dubai, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'FUJAIRAH':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC FUJAIRAH BRANCH 1',
        phone: '+971 4 298 6983',
        location: '48143, Dubai, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'RAS AL KHAIMAH':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC OPC - RAK Branch',
        phone: '+971 4 298 6983',
        location: '48143, Dubai, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'SHARJAH':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC - SHJ.BR 1',
        phone: '+971 4 298 6983',
        location: '66976, Sharjah, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'IDEAL FITOUTS':
      return {
        trade_name: 'Ideal Fitout Decoration Design & Fit-Out Co. L.L.C',
        phone: '+971 4 298 6983',
        location: 'Unit 1108, 51 Tower, Business Bay, Dubai, UAE PO.Box: 94956',
        email1: 'fitouts@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfitouts.ae',
      }
    case 'AJMAN':
      return {
        trade_name: '',
        phone: '+971 6 740 4840',
        location: 'Gate No. 2, Ajman Free Zone\nAjman, UAE,PO.Box: 9033',
        email1: 'sales@ideal.ae',
        email2: '',
        website: 'www.ideal.ae',
      }
    case 'Export':
      return {
        trade_name: '',
        phone: '+971 6 740 4840',
        location: 'Gate No. 2, Ajman Free Zone\nAjman, UAE,PO.Box: 9033',
        email1: 'sales@ideal.ae',
        email2: '',
        website: 'www.ideal.ae',
      }
    default:
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC',
        phone: '+971 2 551 3828',
        location: '48143, Dubai, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
  }
}

const SALES_SIGNATURES: Record<string, string> = {
  'Jerry Thomas':
    'https://res.cloudinary.com/danisha563/image/upload/v1762774122/20251110134630898_1__page-0001223_abxda9.jpg',
  'Santosh P.B':
    'https://res.cloudinary.com/danisha563/image/upload/v1765964957/signature_kzoqdl.png',
  'Dawood Hussain':
    'https://res.cloudinary.com/danisha563/image/upload/v1765964957/signature_kzoqdl.png',
}

function getSalesPersonDetails(
  salesPerson?: string
): { name: string; designation: string; contact: string; signature?: string } {
  const name = (salesPerson || '').trim()
  const signature = name ? SALES_SIGNATURES[name] : undefined
  switch (name) {
    case 'Santosh P.B':
      return { name, designation: 'Sr. Manager', contact: '+971 50 896 1908', signature }
    case 'Dawood Hussain':
      return { name, designation: 'Project Sales Manager', contact: '+971 52 804 6858', signature }
    case 'Jerry Thomas':
      return { name, designation: 'Sales Manager', contact: '+971 50 942 1886', signature }
    case 'Antony Joy Panikulam':
      return { name, designation: 'Director', contact: '+971 50 351 3428', signature }
    case 'Ritu Antony':
      return { name, designation: 'Division Head - Fit Out', contact: '+971 50 306 3428', signature }
    case 'Noureddin Alzaben':
      return { name, designation: 'Business Development Manager', contact: '+971 52 853 1082', signature }
    default:
      return {
        name: name || '—',
        designation: 'Designation not available',
        contact: '+971 50 306 3428',
        signature,
      }
  }
}

/** Parse a Zoho AED value (may be a comma-formatted string) into a plain number, defaulting to 0 */
function parseAED(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0
  const num = typeof value === 'string' ? parseFloat(String(value).replace(/,/g, '')) : value
  return isNaN(num) ? 0 : num
}

function formatAED(value: string | number | undefined): string {
  return parseAED(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** "Thanks and Regards" + signature block — rendered on the cover letter before BOQ */
function ClosingSignatureGroup({
  signatureForEntity,
  isAjmanOrExportSubdivision,
  salesDetails,
  showSignature,
  hasSalesPerson,
}: {
  signatureForEntity: string
  isAjmanOrExportSubdivision: boolean
  salesDetails: { name: string; designation: string; contact: string; signature?: string }
  showSignature: boolean
  hasSalesPerson: boolean
}) {
  return (
    <div className="door-core-closing-print-group">
      <div className="door-core-terms">
        <p>Assuring you of our best services at all times.</p>
      </div>
      <div className="door-core-signature-block">
        <p className="door-core-signature-greeting">Thanks and Regards</p>
        {!isAjmanOrExportSubdivision && hasValue(signatureForEntity) && (
          <p className="door-core-signature-for-line">
            <strong>For {signatureForEntity}</strong>
          </p>
        )}
        {hasSalesPerson && (
          <>
            <p className="door-core-signature-detail">{salesDetails.name}</p>
            <p className="door-core-signature-detail">{salesDetails.designation}</p>
            <p className="door-core-signature-detail">{salesDetails.contact}</p>
          </>
        )}
        {showSignature ? (
          <div className="door-core-signature-image-wrap">
            {salesDetails.signature ? (
              <>
                <img
                  src={salesDetails.signature}
                  alt={`Signature of ${salesDetails.name}`}
                  className="door-core-signature-img"
                />
                <strong className="door-core-signature-label">Signature</strong>
              </>
            ) : (
              <span className="door-core-signature-placeholder">
                Signature not on file for this salesperson.
              </span>
            )}
          </div>
        ) : (
          <div className="door-core-signature-block-spacer" />
        )}
      </div>
    </div>
  )
}

/**
 * Trade name / certs / contact / distributor / disclaimer footer band.
 * Rendered in the repeating <tfoot> (reserves space; hidden in print) and in a fixed overlay
 * that pins the visible footer to the bottom of every printed page — including short last pages.
 */
function FooterBandContent({
  footerData,
  data,
  isAjmanOrExportSubdivision,
  pageLabel,
}: {
  footerData: FooterData
  data: CoreCoverPageData
  isAjmanOrExportSubdivision: boolean
  pageLabel?: string
}) {
  return (
    <>
      <div className="door-core-footer-row door-core-footer-top">
        <div className="door-core-footer-left">
          {!isAjmanOrExportSubdivision && (
            <>
              <span className="door-core-footer-trade-label">Trade Name: </span>
              <span className="door-core-footer-trade-name">{footerData.trade_name}</span>
            </>
          )}
        </div>
        <div className="door-core-footer-right">
          <img
            src={isAjmanOrExportSubdivision ? '/special.png' : '/logo4.png'}
            className={`door-core-footer-certs${isAjmanOrExportSubdivision ? ' door-core-footer-certs--special' : ''}`}
            alt={
              isAjmanOrExportSubdivision
                ? 'AV CERT / UAF / Intertek / FSC Certification'
                : 'AV CERT / UAF / FSC Certification'
            }
          />
        </div>
      </div>
      {(footerData.phone || footerData.email1 || footerData.website || footerData.location) && (
        <>
          <hr className="door-core-footer-hr" />
          <div className="door-core-footer-contact">
            {footerData.phone && (
              <span className="door-core-footer-contact-item">
                <svg className="door-core-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path
                    d="M60 40 C45 40 40 55 45 70 C55 100 100 145 130 155 C145 160 160 155 160 140 V120 C160 112 155 108 148 106 L125 100 C118 98 112 100 108 106 L100 118 C85 108 70 92 60 75 L72 65 C78 60 80 55 78 48 L72 25 C70 18 65 15 58 15 H40 C30 15 25 25 30 35 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {footerData.phone}
              </span>
            )}
            {(footerData.email1 || footerData.email2) && (
              <span className="door-core-footer-contact-item door-core-footer-email-block">
                <svg className="door-core-icon" viewBox="0 0 200 200" aria-hidden>
                  <rect x="20" y="50" width="160" height="100" rx="10" ry="10" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="20,50 100,110 180,50" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="door-core-footer-email-lines">
                  {footerData.email1}
                  {footerData.email1 && footerData.email2 && <br />}
                  {footerData.email2}
                </span>
              </span>
            )}
            {footerData.website && (
              <span className="door-core-footer-contact-item">
                <svg className="door-core-globe-icon" viewBox="0 0 200 200" aria-hidden>
                  <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="100" y1="15" x2="100" y2="185" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M70 20 C50 60 50 140 70 180" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M130 20 C150 60 150 140 130 180" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="15" y1="100" x2="185" y2="100" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 70 C60 50 140 50 180 70" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 130 C60 150 140 150 180 130" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {footerData.website}
              </span>
            )}
            {footerData.location && (
              <span className="door-core-footer-contact-item door-core-footer-location-text">
                <svg className="door-core-icon" viewBox="0 0 200 200" aria-hidden>
                  <path d="M100 20 C65 20 40 45 40 80 C40 120 100 180 100 180 C100 180 160 120 160 80 C160 45 135 20 100 20 Z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="100" cy="80" r="18" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {footerData.location}
              </span>
            )}
          </div>
        </>
      )}
      <div className="door-core-footer-bottom">
        <p className="door-core-distributor-text">
          Exclusive distributors in UAE for{' '}
          <span className="door-core-brand-name">
            {plainZohoDisplayText(data.Trader_Name ?? data.Trader_Name1, 'Ideal Special Products F.Z.C')}
          </span>
        </p>
        <div className="door-core-footer-bottom-bar">
          <span className="door-core-page-number" data-door-core-page-label>
            {pageLabel ?? 'Page 1'}
          </span>
          <p className="door-core-footer-signature-note">
            ** This is a computer generated quotation and hence does not require a signature. **
          </p>
        </div>
      </div>
    </>
  )
}

/** Payment Terms / Validity / Notes — rendered on the cover letter before BOQ */
function PaymentTermsValidityNotes({ data }: { data: CoreCoverPageData }) {
  return (
    <>
      {hasValue(data.Payment_Terms1) && (
        <>
          <div className="door-core-payment-section">
            <strong>1. Payment Terms</strong>
            <p className="door-core-terms-p">{data.Payment_Terms1}</p>
          </div>
          <br />
        </>
      )}
      {hasValue(data.Validity) && (
        <>
          <strong>2. Validity</strong>
          <p className="door-core-terms-p">{data.Validity}</p>
          <br />
        </>
      )}
      {hasValue(data.Notes1) && (
        <>
          <strong>3. Notes</strong>
          <div
            className="door-core-notes-p door-core-notes-html"
            dangerouslySetInnerHTML={{ __html: data.Notes1 ?? '' }}
          />
        </>
      )}
    </>
  )
}

export default function DoorCoreQuotationContent({
  data,
  viewMode = 'simple',
}: DoorCoreQuotationContentProps) {
  const [pageLabel, setPageLabel] = useState('Page 1')

  useEffect(() => {
    const PX_PER_MM = 96 / 25.4
    const pageContentPx = (297 - 10 - 16) * PX_PER_MM
    const update = () => {
      const root = document.querySelector<HTMLElement>('.door-core-standalone')
      if (!root) return
      const headerH = root.querySelector('.door-core-layout-header-cell')?.getBoundingClientRect().height ?? 0
      const footerH = root.querySelector('.door-core-layout-footer-cell')?.getBoundingClientRect().height ?? 0
      const bodyH = root.querySelector('.door-core-layout-ell')?.getBoundingClientRect().height ?? 0
      const available = pageContentPx - headerH - footerH
      const pages = available > 0 && bodyH > 0 ? Math.max(1, Math.ceil(bodyH / available)) : 1
      setPageLabel(`Page 1 of ${pages}`)
    }
    update()
    const t = window.setTimeout(update, 400)
    window.addEventListener('resize', update)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', update)
    }
  }, [data])

  const footerData = getFooterData(data.Sub_Divisions)
  const signatureForEntity =
    plainZohoDisplayText(data.Trader_Name ?? data.Trader_Name1, '') || footerData.trade_name
  const salesDetails = getSalesPersonDetails(data.Sales_Person)
  const hasSalesPerson = hasValue(data.Sales_Person)
  const approvalStatus = (data.Approval ?? '').trim()
  const showSignature = approvalStatus === 'Approved' && viewMode === 'approved' && hasSalesPerson
  const hasDiscount =
    data.Provision_for_Less_Special_Discount_AED != null &&
    Number(data.Provision_for_Less_Special_Discount_AED) !== 0
  const hasVat = data.VAT_5 != null && Number(data.VAT_5) !== 0
  const amountAfterDiscount = parseAED(data.Total_Amount_AED) - parseAED(data.Provision_for_Less_Special_Discount_AED)
  const sealDescHTML = formatSealDescriptionHtml(data.Seal_Description)
  const boqRows = data.BOQ || []
  const hasBoqRows = boqRows.length > 0
  const showRemarksColumn = boqRows.some((record) => hasValue(record.Remarks))
  const totalQty = boqRows.reduce((sum, record) => {
    const qty = typeof record.Qty1 === 'string' ? parseFloat(record.Qty1) : record.Qty1
    return sum + (typeof qty === 'number' && !isNaN(qty) ? qty : 0)
  }, 0)
  const hasGrandTotal = hasValue(data.Grand_Total_AED)
  const hasTotalAmount = hasValue(data.Total_Amount_AED)

  const subDivision = (data.Sub_Divisions ?? '').trim().toUpperCase()
  const isAjmanOrExportSubdivision = subDivision === 'AJMAN' || subDivision === 'EXPORT'

  const logoUrl =
    subDivision === 'AJMAN' || subDivision === 'EXPORT'
      ? '/specialheader.png'
      : 'https://i.ibb.co/bjs2kFm4/Screenshot-2026-01-13-171206.png'

  return (
    <div className="door-core-quotation-container door-core-standalone">
      {isAjmanOrExportSubdivision ? (
        <img
          src="/special-watermark.png?v=4"
          alt=""
          aria-hidden
          className="door-core-static-pattern door-core-static-pattern--halftone"
        />
      ) : (
        <div className="door-core-static-pattern" aria-hidden />
      )}
      <table className="door-core-page-layout">
        <thead>
          <tr>
            <td className="door-core-layout-header-cell">
              <div className="door-core-header-logo-crop">
                <img
                  src={logoUrl}
                  alt="Ideal"
                  className="door-core-header-logo-img"
                />
              </div>
            </td>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td className="door-core-layout-footer-cell">
              <FooterBandContent
                footerData={footerData}
                data={data}
                isAjmanOrExportSubdivision={isAjmanOrExportSubdivision}
                pageLabel={pageLabel}
              />
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td className="door-core-layout-ell">
              {/* Cover details block - no duplicate logo; header already shows logo on every page */}
              <div className="door-core-details-block">
                <h1 className="door-core-cover-title">
                  <u>Quotation</u>
                </h1>

                {hasValue(data.Quotation_No) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Ref:</strong></div>
                    <div className="door-core-details-value">{formatQuotationNo(data.Quotation_No)}</div>
                  </div>
                )}
                {hasValue(data.Quotation_Submission_Date) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Date:</strong></div>
                    <div className="door-core-details-value">{data.Quotation_Submission_Date}</div>
                  </div>
                )}
                {hasValue(data.Organization_Name1) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>To:</strong></div>
                    <div className="door-core-details-value">{data.Organization_Name1}</div>
                  </div>
                )}
                {hasValue(data.Emirates) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label" />
                    <div className="door-core-details-value">{data.Emirates}, U.A.E</div>
                  </div>
                )}
                {data.Project_Name?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Project Name:</strong></div>
                    <div className="door-core-details-value">{data.Project_Name}</div>
                  </div>
                )}
                {hasValue(data.Project_Location) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Project Location:</strong></div>
                    <div className="door-core-details-value">{data.Project_Location}</div>
                  </div>
                )}
                {hasValue(data.Subject_field) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Subject:</strong></div>
                    <div className="door-core-details-value">{data.Subject_field}</div>
                  </div>
                )}

                <br />
                <p className="door-core-salutation">
                  <strong className="door-core-salutation-dear">Dear Sir/Madam,</strong>
                </p>
                <p className="door-core-intro-p">
                  We thank you for the enquiry and have pleasure in submitting our best offer as below details &amp; attached BOQ
                </p>
                <br />

                {data.Scope_field?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Scope:</strong></div>
                    <div
                      className="door-core-details-value"
                      dangerouslySetInnerHTML={{ __html: boldCivilDefenceHtml(data.Scope_field) }}
                    />
                  </div>
                )}
                {data.FR_Core?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>FR Core:</strong></div>
                    <div className="door-core-details-value">{data.FR_Core}</div>
                  </div>
                )}
                {data.Acoustic_Core?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Acoustic Core:</strong></div>
                    <div className="door-core-details-value">{data.Acoustic_Core}</div>
                  </div>
                )}
                {data.Facing?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Facing:</strong></div>
                    <div className="door-core-details-value">{data.Facing}</div>
                  </div>
                )}
                {data.Lipping?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Lipping:</strong></div>
                    <div className="door-core-details-value">{data.Lipping}</div>
                  </div>
                )}
                {data.Finish?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Finish:</strong></div>
                    <div className="door-core-details-value">{data.Finish}</div>
                  </div>
                )}
                {data.Intumescent_seals?.trim() && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label"><strong>Intumescent seal:</strong></div>
                    <div className="door-core-seal-value">{data.Intumescent_seals}</div>
                  </div>
                )}
                {sealDescHTML && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label"><strong>Seal description:</strong></div>
                    <div className="door-core-seal-value" dangerouslySetInnerHTML={{ __html: sealDescHTML }} />
                  </div>
                )}
                {data.Acoustic_Seals?.trim() && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label"><strong>Acoustic seals:</strong></div>
                    <div className="door-core-seal-value">{data.Acoustic_Seals}</div>
                  </div>
                )}
              </div>

              {/* Cover letter closes with value summary, terms/notes, and signature —
                  BOQ subform starts after (Normal and Tender both use BOQ_Details, never PDF). */}
              <div className="door-core-cover-terms-block">
                {hasGrandTotal && <QuotationValueNote data={data} />}
                <PaymentTermsValidityNotes data={data} />
              </div>

              <div className="door-core-last-page-wrap door-core-cover-close">
                <ClosingSignatureGroup
                  signatureForEntity={signatureForEntity}
                  isAjmanOrExportSubdivision={isAjmanOrExportSubdivision}
                  salesDetails={salesDetails}
                  showSignature={showSignature}
                  hasSalesPerson={hasSalesPerson}
                />
              </div>

              {/* BOQ subform table (same for Normal + Tender) */}
              <div className="door-core-table-section door-core-boq-table-section">
                {hasBoqRows && (
                <table className="door-core-product-table door-core-boq-product-table">
                  <colgroup>
                    <col className="door-core-boq-col-slno" />
                    <col className="door-core-boq-col-doorref" />
                    <col className="door-core-boq-col-productref" />
                    <col className="door-core-boq-col-fire" />
                    <col className="door-core-boq-col-acoustic" />
                    <col className="door-core-boq-col-width" />
                    <col className="door-core-boq-col-height" />
                    <col className="door-core-boq-col-leafthick" />
                    <col className="door-core-boq-col-doortype" />
                    <col className="door-core-boq-col-vision" />
                    <col className="door-core-boq-col-qty" />
                    <col className="door-core-boq-col-unitprice" />
                    <col className="door-core-boq-col-totalprice" />
                    {showRemarksColumn && <col className="door-core-boq-col-remarks" />}
                  </colgroup>
                  <thead>
                    <tr>
                      <th rowSpan={2}>
                        SL.
                        <br />
                        NO.
                      </th>
                      <th rowSpan={2}>
                        Door
                        <br />
                        Ref
                      </th>
                      <th rowSpan={2}>
                        Product
                        <br />
                        Ref
                      </th>
                      <th rowSpan={2}>
                        Fire
                        <br />
                        Rating (mins)
                      </th>
                      <th rowSpan={2}>
                        Acoustic
                        <br />
                        Rating (db)
                      </th>
                      <th colSpan={2}>{data.Width_Height?.trim() || 'Door Leaf Size'}</th>
                      <th rowSpan={2}>
                        Leaf
                        <br />
                        Thick (mm)
                      </th>
                      <th rowSpan={2}>
                        Door
                        <br />
                        Type
                      </th>
                      <th rowSpan={2}>
                        Vision
                        <br />
                        Panel (mm)
                      </th>
                      <th rowSpan={2}>Qty.</th>
                      <th rowSpan={2}>
                        <div>Unit Price</div>
                        <div className="door-core-boq-th-currency"><DirhamSymbol /></div>
                      </th>
                      <th rowSpan={2}>
                        <div>Total Unit Price</div>
                        <div className="door-core-boq-th-currency"><DirhamSymbol /></div>
                      </th>
                      {showRemarksColumn && <th rowSpan={2}>Remarks</th>}
                    </tr>
                    <tr>
                      <th>
                        Width
                        <br />
                        (mm)
                      </th>
                      <th>
                        Height
                        <br />
                        (mm)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqRows.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.S_No1 ?? ''}</td>
                        <td>{record.Door_Ref ?? ''}</td>
                        <td>{record.Product_Ref ?? ''}</td>
                        <td>{record.Fire_Rating_mins ?? ''}</td>
                        <td>{record.Acoustic_Rating_db ?? ''}</td>
                        <td>{record.Door_Leaf_Width_mm ?? ''}</td>
                        <td>{record.Door_Leaf_Height_mm ?? ''}</td>
                        <td>{record.Leaf_Thick_mm ?? ''}</td>
                        <td>{record.Door_Type ?? ''}</td>
                        <td>{record.Vision_Panel_mm ?? ''}</td>
                        <td>{record.Qty1 ?? ''}</td>
                        <td className="door-core-text-right">
                          {record.Unit_Price_AED1 != null ? formatAED(record.Unit_Price_AED1) : ''}
                        </td>
                        <td className="door-core-text-right">
                          {record.Total_Unit_Price_AED1 != null ? formatAED(record.Total_Unit_Price_AED1) : ''}
                        </td>
                        {showRemarksColumn && <td>{record.Remarks ?? ''}</td>}
                      </tr>
                    ))}
                    {hasBoqRows && totalQty > 0 && (
                      <tr className="door-core-boq-totals-row">
                        <td colSpan={10} className="door-core-total-label">
                          <strong>Total Quantity:</strong>
                        </td>
                        <td className="door-core-total-value door-core-text-center">{totalQty}</td>
                        <td className="door-core-total-value" />
                        <td className="door-core-total-value" />
                        {showRemarksColumn && <td className="door-core-total-value" />}
                      </tr>
                    )}
                    {hasTotalAmount && (
                      <tr className="door-core-boq-totals-row">
                        <td colSpan={12} className="door-core-total-label">
                          Total Amount
                        </td>
                        <td className="door-core-total-value door-core-text-right">{formatAED(data.Total_Amount_AED)}</td>
                        {showRemarksColumn && <td className="door-core-total-value" />}
                      </tr>
                    )}
                    {hasDiscount && (
                      <>
                        <tr className="door-core-boq-totals-row">
                          <td colSpan={12} className="door-core-total-label">
                            Less Special Discount <DirhamSymbol /> :-
                          </td>
                          <td className="door-core-total-value door-core-text-right">
                            {formatAED(data.Provision_for_Less_Special_Discount_AED)}
                          </td>
                          {showRemarksColumn && <td className="door-core-total-value" />}
                        </tr>
                        <tr className="door-core-boq-totals-row">
                          <td colSpan={12} className="door-core-total-label">
                            Amount After Discount <DirhamSymbol /> :-
                          </td>
                          <td className="door-core-total-value door-core-text-right">
                            {formatAED(amountAfterDiscount)}
                          </td>
                          {showRemarksColumn && <td className="door-core-total-value" />}
                        </tr>
                      </>
                    )}
                    {hasVat && (
                      <tr className="door-core-boq-totals-row">
                        <td colSpan={12} className="door-core-total-label">
                          VAT 5%
                        </td>
                        <td className="door-core-total-value door-core-text-right">{formatAED(data.VAT_5)}</td>
                        {showRemarksColumn && <td className="door-core-total-value" />}
                      </tr>
                    )}
                    {hasGrandTotal && (
                      <tr className="door-core-boq-totals-row">
                        <td colSpan={12} className="door-core-total-label door-core-grand-total-label-cell">
                          <div className="door-core-total-amount-in-words-line">
                            <strong>Total Amount :</strong> {formatAedAmountInWords(data.Grand_Total_AED)}
                          </div>
                        </td>
                        <td className="door-core-total-value door-core-text-right">{formatAED(data.Grand_Total_AED)}</td>
                        {showRemarksColumn && <td className="door-core-total-value" />}
                      </tr>
                    )}
                  </tbody>
                </table>
                )}
                <div className="door-core-print-end-spacer" aria-hidden="true" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="door-core-print-footer-overlay door-core-layout-footer-cell" aria-hidden="true">
        <FooterBandContent
          footerData={footerData}
          data={data}
          isAjmanOrExportSubdivision={isAjmanOrExportSubdivision}
          pageLabel={pageLabel}
        />
      </div>
    </div>
  )
}
