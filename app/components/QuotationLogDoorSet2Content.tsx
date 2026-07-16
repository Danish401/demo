'use client'

import { useEffect, useState } from 'react'
import { QuotationLogDoorSet2Data, QuotationLogDoorSet2Item, QuotationLogDoorSet2SubItem } from '@/lib/types'
import { boldCivilDefenceHtml, formatAedAmountInWords, formatSealDescriptionHtml, plainZohoDisplayText } from '@/lib/quotation-utils'
import DirhamSymbol from './DirhamSymbol'

/** Parse a Zoho AED value (may be a comma-formatted string) into a plain number, defaulting to 0 */
function parseAED(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0
  const num = typeof value === 'string' ? parseFloat(String(value).replace(/,/g, '')) : value
  return isNaN(num) ? 0 : num
}

/** Format AED values for display using standard international 3-digit comma grouping (e.g. 1,328,510.40) */
function formatAED(value: string | number | undefined | null): string {
  return parseAED(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** True if field has displayable value (hide row/section when false) */
function hasValue(v: unknown): boolean {
  if (v == null) return false
  const s = String(v).trim()
  return s !== ''
}

/** "Total Quotation value: Ð x,xxx (Dirhams … Fils Only)" note, shown once on the cover letter above Payment Terms */
function QuotationValueNote({ data }: { data: QuotationLogDoorSet2Data }) {
  return (
    <p className="door-set-2-quotation-value-note">
      Total Quotation value: <DirhamSymbol /> {formatAED(data.Grand_Total_AED)} (
      {formatAedAmountInWords(data.Grand_Total_AED)})
      <br />
      For detailed quotation refer the attached sheet.
    </p>
  )
}

function DoorSetSubformSectionTable({
  header,
  rows,
  subTotal,
}: {
  header?: string
  rows: QuotationLogDoorSet2SubItem[]
  subTotal?: number | string | null
}) {
  const headerText = (header ?? '').trim()

  return (
    <table className="door-core-product-table door-core-subform-table">
      <thead>
        {headerText && (
          <tr className="door-core-subform-section-header-row">
            <th colSpan={5} className="door-core-subform-section-title">
              {headerText}
            </th>
          </tr>
        )}
        <tr>
          <th>SL.{'\u00A0'}NO.</th>
          <th>Description</th>
          <th>Qty</th>
          <th>
            Unit
            <br />
            Price
            <br />
            (<DirhamSymbol />)
          </th>
          <th>
            Total
            <br />
            Price
            <br />
            (<DirhamSymbol />)
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td>{row.S_No1 ?? ''}</td>
            <td>{row.Description ?? ''}</td>
            <td className="door-core-text-right">{row.Qty1 ?? ''}</td>
            <td className="door-core-text-right">
              {row.Unit_Price1 != null ? formatAED(row.Unit_Price1) : ''}
            </td>
            <td className="door-core-text-right">
              {row.Total_Amount_AED != null ? formatAED(row.Total_Amount_AED) : ''}
            </td>
          </tr>
        ))}
        {hasValue(subTotal) && (
          <tr className="door-core-subtotal">
            <td colSpan={3} />
            <td className="door-core-text-right">
              <strong>Sub Total:</strong>
            </td>
            <td className="door-core-text-right">{formatAED(subTotal)}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

/** Footer data for print footer (trade name, contact, certs) - matches DoorCore */
interface DoorCoreStyleFooterData {
  trade_name: string
  phone: string
  location: string
  email1: string
  email2: string
  website: string
}

function getFooterData(subDivisions?: string): DoorCoreStyleFooterData {
  const sub = (subDivisions || '').trim()
  switch (sub) {
    case 'ABU DHABI':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING - L.L.C - S.P.C',
        phone: '+971 25513828',
        location: '94956, Abu Dhabi',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'DUBAI':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC',
        phone: '+971 25513828',
        location: '94956, Abu Dhabi',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'FUJAIRAH':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC FUJAIRAH BRANCH 1',
        phone: '+971 42986983',
        location: '48143, Dubai, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'RAS AL KHAIMAH':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC OPC - RAK Branch',
        phone: '+971 42986983',
        location: '48143, Dubai, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'SHARJAH':
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC - SHJ.BR 1',
        phone: '+971 42986983',
        location: '66976, Sharjah, UAE',
        email1: 'sales@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfirestop.ae',
      }
    case 'IDEAL FITOUTS':
      return {
        trade_name: 'Ideal Fitout Decoration Design & Fit-Out Co. L.L.C',
        phone: '+97142986983',
        location: 'Unit 1108, 51 Tower, Business Bay, Dubai, UAE PO.Box: 94956',
        email1: 'fitouts@ideal.ae',
        email2: 'idealind@eim.ae',
        website: 'www.idealfitouts.ae',
      }
    case 'AJMAN':
      return {
        trade_name: '',
        phone: '+971 67404840',
        location: 'Gate No. 2, Ajman Free Zone\nAjman, UAE,PO.Box: 9033',
        email1: 'sales@ideal.ae',
        email2: '',
        website: 'www.ideal.ae',
      }
    case 'Export':
      return {
        trade_name: '',
        phone: '+971 67404840',
        location: 'Gate No. 2, Ajman Free Zone\nAjman, UAE,PO.Box: 9033',
        email1: 'sales@ideal.ae',
        email2: '',
        website: 'www.ideal.ae',
      }
    default:
      return {
        trade_name: 'IDEAL FIRESTOP TRADING LLC',
        phone: '+971 25513828',
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
        designation: 'Sales Executive',
        contact: '+971 50 306 3428',
        signature,
      }
  }
}

/**
 * Trade name / certs / contact / distributor / disclaimer footer band.
 * Rendered twice for Door Set 2: once inside the real <tfoot> (kept for its layout/pagination role,
 * hidden visually in print) and once more in a position:fixed overlay so it's pinned to the bottom
 * of every printed page — including the last one, whose real content may not reach the page bottom.
 */
function FooterBandContent({
  footerData,
  data,
  isAjmanOrExportSubdivision,
  pageLabel,
}: {
  footerData: DoorCoreStyleFooterData
  data: QuotationLogDoorSet2Data
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
            src="/logo4.png"
            className="door-core-footer-certs"
            alt="AV CERT / UAF / FSC Certification"
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
          {pageLabel ? (
            <span className="door-core-page-number" data-door-set1-page-label>
              {pageLabel}
            </span>
          ) : null}
          <p className="door-set-2-footer-signature-note">
            ** This is a computer generated quotation and hence does not require a signature. **
          </p>
        </div>
      </div>
    </>
  )
}

const LOGO_IDEAL_FITOUTS = 'https://i.ibb.co/nsrVgzqF/Screenshot-2025-04-08-131618.png'
const LOGO_IDEAL_FIRESTOP = 'https://i.ibb.co/3KVzWsK/Screenshot-2025-04-08-131639.png'
/** Same header asset as Door Core when Sub_Divisions is AJMAN or Export */
const LOGO_IDEAL_SPECIAL = 'https://i.ibb.co/Wvs029TQ/ideal-special.png'

export type DoorSet2ViewMode = 'simple' | 'approved'
export type DoorSetQuotationVariant = 'door-set-1' | 'door-set-2'

interface QuotationLogDoorSet2ContentProps {
  data: QuotationLogDoorSet2Data
  /** 'simple' = no signature (default); 'approved' = show signature when SalesPerson_Approval_Status === 'Approved' */
  viewMode?: DoorSet2ViewMode
  /** Quotation_Door_Set1_Report uses uniform 8.5px typography and bottom-left page numbers */
  variant?: DoorSetQuotationVariant
}

export default function QuotationLogDoorSet2Content({
  data,
  viewMode = 'simple',
  variant = 'door-set-2',
}: QuotationLogDoorSet2ContentProps) {
  const footerData = getFooterData(data.Sub_Divisions)
  const signatureForEntity =
    plainZohoDisplayText(data.Trader_Name ?? data.Trader_Name1, '') || footerData.trade_name
  const salesDetails = getSalesPersonDetails(data.Sales_Person)
  const hasSalesPerson = hasValue(data.Sales_Person)
  const approvalStatus = (data.SalesPerson_Approval_Status ?? data.Approval ?? '').toString().trim()
  const showSignature = approvalStatus === 'Approved' && viewMode === 'approved' && hasSalesPerson
  const hasDiscount =
    data.Provision_for_Less_Special_Discount_AED != null &&
    Number(data.Provision_for_Less_Special_Discount_AED) !== 0
  const hasVat = data.VAT_5_AED != null && Number(data.VAT_5_AED) !== 0
  const amountAfterDiscount = parseAED(data.Total_Amount_AED) - parseAED(data.Provision_for_Less_Special_Discount_AED)
  const sealDescHTML = formatSealDescriptionHtml(data.Seal_Description)
  const hasGrandTotal = hasValue(data.Grand_Total_AED)
  const hasTotalAmount = hasValue(data.Total_Amount_AED)
  const hasSubTotal = hasValue(data.Sub_Total)
  const hasTotalQuantity = hasValue(data.Total_Quantity)
  const showIntumescentSeal =
    (data.Seals_Require1 ?? '').toString().trim() === 'Yes' &&
    (data.Intumescent_seals ?? '').toString().trim() !== ''

  const division = (data.Division ?? '').trim()
  const subDivision = (data.Sub_Divisions ?? '').trim().toUpperCase()
  const isAjmanOrExportSubdivision = subDivision === 'AJMAN' || subDivision === 'EXPORT'
  const isDoorSet1 = variant === 'door-set-1'
  const [pageLabel, setPageLabel] = useState('Page 1')

  useEffect(() => {
    if (!isDoorSet1) return
    const PX_PER_MM = 96 / 25.4
    const pageContentPx = (297 - 10 - 16) * PX_PER_MM
    const update = () => {
      const root = document.querySelector<HTMLElement>('.door-set-1-quotation')
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
  }, [data, isDoorSet1])

  const logoSrc = isAjmanOrExportSubdivision
    ? LOGO_IDEAL_SPECIAL
    : division === 'Ideal Fitouts'
      ? LOGO_IDEAL_FITOUTS
      : division === 'Ideal Firestop'
        ? LOGO_IDEAL_FIRESTOP
        : LOGO_IDEAL_FIRESTOP

  // Normalize subforms to arrays (Zoho may return array or single object)
  const toItemsArray = (val: unknown): QuotationLogDoorSet2Item[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogDoorSet2Item[]) : [val as QuotationLogDoorSet2Item]
  const toSectionArray = (section: unknown): QuotationLogDoorSet2SubItem[] =>
    section == null ? [] : Array.isArray(section) ? (section as QuotationLogDoorSet2SubItem[]) : [section as QuotationLogDoorSet2SubItem]

  // 4 subforms: Items_Details (main door table) + Section_1, Section_2, Section_3. Show Section_X only when it has at least one row.
  const items = toItemsArray(data.Items_Details)
  const section1 = toSectionArray(data.Section_1)
  const section2 = toSectionArray(data.Section_2)
  const section3 = toSectionArray(data.Section_3)
  const showSection1 = section1.length > 0
  const showSection2 = section2.length > 0
  const showSection3 = section3.length > 0

  const containerClassName = [
    'door-core-quotation-container',
    'door-set-2-quotation',
    isDoorSet1 ? 'door-set-1-quotation' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const footerPageLabel = isDoorSet1 ? pageLabel : undefined

  return (
    <div className={containerClassName}>
      <div
        className={
          isAjmanOrExportSubdivision
            ? 'door-core-static-pattern door-core-static-pattern--halftone'
            : 'door-core-static-pattern'
        }
        aria-hidden
      />
      <table className="door-core-page-layout">
        <thead>
          <tr>
            <td className="door-core-layout-header-cell">
              <div className="door-core-header-logo-crop">
                <img
                  src={logoSrc}
                  alt={division || 'Ideal'}
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
                pageLabel={footerPageLabel}
              />
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td className="door-core-layout-ell">
              <div className="door-core-details-block">
                <h1 className="door-core-cover-title">
                  <u>Quotation</u>
                </h1>

                {hasValue(data.Quotation_No) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Ref:</strong></div>
                    <div className="door-core-details-value">{data.Quotation_No}</div>
                  </div>
                )}
                {hasValue(data.Quotation_Submission_Date) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Date:</strong></div>
                    <div className="door-core-details-value">{data.Quotation_Submission_Date}</div>
                  </div>
                )}
                {(hasValue(data.Organization_Name1) || hasValue(data.Emirates)) && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>To:</strong></div>
                    <div className="door-core-details-value">
                      {data.Organization_Name1 ?? ''}
                      {(data.Organization_Name1 || data.Emirates) && <br />}
                      {data.Emirates ?? ''}{data.Emirates ? ', U.A.E' : ''}
                    </div>
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
                {data.Outer_Frame?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Outer Frame:</strong></div>
                    <div className="door-core-details-value">{data.Outer_Frame}</div>
                  </div>
                )}
                {data.Architrave?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Architrave:</strong></div>
                    <div className="door-core-details-value">{data.Architrave}</div>
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
                {showIntumescentSeal && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label"><strong>Intumescent seal:</strong></div>
                    <div className="door-core-seal-value">{data.Intumescent_seals ?? ''}</div>
                  </div>
                )}
                {showIntumescentSeal && sealDescHTML && (
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
                {data.Hardware?.trim() && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label"><strong>Hardware set:</strong></div>
                    <div className="door-core-seal-value">{data.Hardware}</div>
                  </div>
                )}
              </div>

              <div className="door-set-2-cover-terms-block">
                {hasGrandTotal && <QuotationValueNote data={data} />}

                {hasValue(data.Payment_Terms1) && (
                  <>
                    <strong>1. Payment Terms</strong>
                    <p className="door-core-terms-p">{data.Payment_Terms1}</p>
                  </>
                )}

                {hasValue(data.Validity) && (
                  <>
                    <strong>2. Validity</strong>
                    <p className="door-core-terms-p">{data.Validity}</p>
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
              </div>

              {/* Cover letter closes here with the signature; item pricing starts fresh on the next page */}
              <div className="door-core-last-page-wrap">
                <div className="door-core-closing-print-group">
                  <div className="door-core-terms">
                    <p>We trust our offer meets with your requirement &amp; look forward to your valued order confirmation.</p>
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
                <div className="door-core-last-page-spacer" />
              </div>

              <div className="door-core-table-section">
                {items.length > 0 && (
                <table className="door-core-product-table door-set-2-product-table">
                  <colgroup>
                    <col className="ds2-col-slno" />
                    <col className="ds2-col-doorref" />
                    {isDoorSet1 ? (
                      <>
                        <col className="ds2-col-productref" />
                        <col className="ds2-col-fire" />
                        <col className="ds2-col-acoustic" />
                        <col className="ds2-col-width" />
                        <col className="ds2-col-height" />
                        <col className="ds2-col-jamb" />
                        <col className="ds2-col-leafthick" />
                        <col className="ds2-col-doortype" />
                      </>
                    ) : (
                      <>
                        <col className="ds2-col-width" />
                        <col className="ds2-col-height" />
                        <col className="ds2-col-jamb" />
                        <col className="ds2-col-leafthick" />
                        <col className="ds2-col-doortype" />
                        <col className="ds2-col-productref" />
                        <col className="ds2-col-acoustic" />
                        <col className="ds2-col-fire" />
                      </>
                    )}
                    <col className="ds2-col-vision" />
                    <col className="ds2-col-hardware" />
                    <col className="ds2-col-qty" />
                    <col className="ds2-col-unitprice" />
                    <col className="ds2-col-totalprice" />
                    <col className="ds2-col-remarks" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="door-set-2-th-slno" rowSpan={2}>SL.<br />NO.</th>
                      <th rowSpan={2}>Door Ref</th>
                      {isDoorSet1 ? (
                        <>
                          <th rowSpan={2}>Product Ref.</th>
                          <th rowSpan={2}>Fire Rating<br />(Min)</th>
                          <th rowSpan={2}>Acoustic<br />Rating (dB)</th>
                          <th colSpan={2}>Structural Opening</th>
                          <th rowSpan={2}>Jamb<br />(mm)</th>
                          <th rowSpan={2}>Leaf Thick<br />(mm)</th>
                          <th rowSpan={2}>Door Type</th>
                        </>
                      ) : (
                        <>
                          <th colSpan={2}>
                            {data.Width_Height?.trim() || 'Door Leaf Size'}
                          </th>
                          <th rowSpan={2}>Jamb<br />(mm)</th>
                          <th rowSpan={2}>Leaf Thick<br />(mm)</th>
                          <th rowSpan={2}>Door Type</th>
                          <th rowSpan={2}>Product Ref.</th>
                          <th rowSpan={2}>Acoustic<br />Rating (dB)</th>
                          <th rowSpan={2}>Fire Rating<br />(Min)</th>
                        </>
                      )}
                      <th rowSpan={2}>Vision Panel<br />(mm)</th>
                      <th rowSpan={2}>Hardware<br />Set</th>
                      <th rowSpan={2}>Qty<br />(Nos)</th>
                      <th rowSpan={2}>
                        Unit Price
                        <br />(<DirhamSymbol />)
                      </th>
                      <th rowSpan={2}>
                        Total Unit Price
                        <br />(<DirhamSymbol />)
                      </th>
                      <th rowSpan={2}>Remarks</th>
                    </tr>
                    <tr>
                      <th>Width (mm)</th>
                      <th>Height (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.S_No1 ?? ''}</td>
                        <td>{record.Door_Ref ?? ''}</td>
                        {isDoorSet1 ? (
                          <>
                            <td>{record.Product_Ref ?? ''}</td>
                            <td>{record.Fire_Rating_Min ?? ''}</td>
                            <td>{record.Acoustic_Rating_db ?? ''}</td>
                            <td>{record.Door_Leaf_width_mm ?? ''}</td>
                            <td>{record.Door_Leaf_Height_mm ?? ''}</td>
                            <td>{record.Jamb_mm ?? ''}</td>
                            <td>{record.Leaf_Thick_mm ?? ''}</td>
                            <td>{record.Door_Type ?? ''}</td>
                          </>
                        ) : (
                          <>
                            <td>{record.Door_Leaf_width_mm ?? ''}</td>
                            <td>{record.Door_Leaf_Height_mm ?? ''}</td>
                            <td>{record.Jamb_mm ?? ''}</td>
                            <td>{record.Leaf_Thick_mm ?? ''}</td>
                            <td>{record.Door_Type ?? ''}</td>
                            <td>{record.Product_Ref ?? ''}</td>
                            <td>{record.Acoustic_Rating_db ?? ''}</td>
                            <td>{record.Fire_Rating_Min ?? ''}</td>
                          </>
                        )}
                        <td>{record.Vision_Panel_MM ?? ''}</td>
                        <td>{record.Hardware_Set ?? ''}</td>
                        <td>{record.Quantity1 ?? ''}</td>
                        <td className="door-core-text-right">
                          {record.Unit_Price1 != null ? formatAED(record.Unit_Price1) : ''}
                        </td>
                        <td className="door-core-text-right">
                          {record.Amount_AED != null ? formatAED(record.Amount_AED) : ''}
                        </td>
                        <td>{record.Remarks ?? ''}</td>
                      </tr>
                    ))}
                    {hasTotalQuantity && (
                      <tr className="door-core-subtotal">
                        <td colSpan={12} className="door-core-text-right">
                          <strong>Total Quantity:</strong>
                        </td>
                        <td className="door-core-text-right">
                          {Math.round(Number(data.Total_Quantity))}
                        </td>
                        <td />
                        <td />
                        <td />
                      </tr>
                    )}
                    {hasSubTotal && (
                      <tr className="door-core-subtotal">
                        <td colSpan={14} className="door-core-text-right">
                          <strong>Sub Total:</strong>
                        </td>
                        <td className="door-core-text-right">{formatAED(data.Sub_Total)}</td>
                        <td />
                      </tr>
                    )}
                  </tbody>
                </table>
                )}

                {/* Section_1: show when data.Section_1 != null (match Zoho template) */}
                {showSection1 && (
                  <DoorSetSubformSectionTable
                    header={data.SubForm_Header}
                    rows={section1}
                    subTotal={data.Sub_Total1}
                  />
                )}

                {/* Section_2: show when data.Section_2 != null (match Zoho template) */}
                {showSection2 && (
                  <DoorSetSubformSectionTable
                    header={data.SubForm_Header1}
                    rows={section2}
                    subTotal={data.Sub_Total2}
                  />
                )}

                {/* Section_3: show when data.Section_3 != null (match Zoho template) */}
                {showSection3 && (
                  <DoorSetSubformSectionTable
                    header={data.Subform_Header2}
                    rows={section3}
                    subTotal={data.Sub_Total3}
                  />
                )}

                {(hasTotalAmount || hasDiscount || hasVat || hasGrandTotal) && (
                <table className="door-core-product-table door-core-totals-table door-set-2-totals-summary">
                  <colgroup>
                    <col className="door-set-2-totals-col-label" />
                    <col className="door-set-2-totals-col-value" />
                  </colgroup>
                  <tbody>
                    {hasTotalAmount && (
                      <tr className="door-core-totals-row">
                        <td className="door-set-2-totals-label-cell">
                          <strong>Total Amount (<DirhamSymbol />):</strong>
                        </td>
                        <td className="door-core-text-right door-core-total-value door-set-2-totals-amount-cell">
                          {formatAED(data.Total_Amount_AED)}
                        </td>
                      </tr>
                    )}
                    {hasDiscount && (
                      <>
                        <tr className="door-core-totals-row">
                          <td className="door-set-2-totals-label-cell">
                            <strong>Less Special Discount (<DirhamSymbol />):</strong>
                          </td>
                          <td className="door-core-text-right door-set-2-totals-amount-cell">
                            {formatAED(data.Provision_for_Less_Special_Discount_AED)}
                          </td>
                        </tr>
                        <tr className="door-core-totals-row">
                          <td className="door-set-2-totals-label-cell">
                            <strong>Amount After Discount (<DirhamSymbol />):</strong>
                          </td>
                          <td className="door-core-text-right door-set-2-totals-amount-cell">
                            {formatAED(amountAfterDiscount)}
                          </td>
                        </tr>
                      </>
                    )}
                    {hasVat && (
                      <tr className="door-core-totals-row">
                        <td className="door-set-2-totals-label-cell">
                          <strong>VAT 5% (<DirhamSymbol />):</strong>
                        </td>
                        <td className="door-core-text-right door-set-2-totals-amount-cell">
                          {formatAED(data.VAT_5_AED)}
                        </td>
                      </tr>
                    )}
                    {hasGrandTotal && (
                      <tr className="door-core-totals-row">
                        <td className="door-set-2-totals-label-cell">
                          <strong>Grand Total (<DirhamSymbol />):</strong>
                        </td>
                        <td className="door-core-text-right door-core-total-value door-core-grand-total-cell door-set-2-totals-amount-cell">
                          {formatAED(data.Grand_Total_AED)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                )}

                {/* Fills leftover space on the last pricing page so the repeating <tfoot> sits at the bottom */}
                <div className="door-set-1-print-end-spacer" aria-hidden="true" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Print-only duplicate of the footer band, pinned to the bottom of every printed page (including
          the last one, whose real content may not reach the page bottom). The <tfoot> above still renders
          normally for on-screen viewing and keeps its original layout/pagination role for print, just
          hidden visually there, so this doesn't change how content already paginates across pages. */}
      <div className="door-set-2-print-footer-overlay door-core-layout-footer-cell" aria-hidden="true">
        <FooterBandContent
          footerData={footerData}
          data={data}
          isAjmanOrExportSubdivision={isAjmanOrExportSubdivision}
          pageLabel={footerPageLabel}
        />
      </div>
    </div>
  )
}
