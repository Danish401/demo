'use client'

import { QuotationLogDoorSet2Data, QuotationLogDoorSet2Item, QuotationLogDoorSet2SubItem } from '@/lib/types'

/** Format AED values for display */
function formatAED(value: string | number | undefined): string {
  if (value === undefined || value === null) return '0.00'
  const num = typeof value === 'string' ? parseFloat(String(value).replace(/,/g, '')) : value
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** True if field has displayable value (hide row/section when false) */
function hasValue(v: unknown): boolean {
  if (v == null) return false
  const s = String(v).trim()
  return s !== ''
}

interface FooterData {
  trade_name: string
  location: string
}

function getSignatureFooterData(subDivisions?: string): FooterData {
  const sub = (subDivisions || '').trim()
  switch (sub) {
    case 'AJMAN':
      return { trade_name: 'IDEAL SPECIAL PRODUCTS FZC', location: '94956 , Abu Dhabi' }
    case 'FUJAIRAH':
      return { trade_name: 'IDEAL FIRESTOP TRADING LLC', location: '48143, Dubai, UAE' }
    case 'ABU DHABI':
      return { trade_name: 'IDEAL FIRESTOP TRADING - L.L.C - S.P.C', location: '94956, Abu Dhabi' }
    case 'DUBAI':
      return { trade_name: 'IDEAL FIRESTOP TRADING LLC', location: '48143, Dubai, UAE' }
    case 'RAS AL KHAIMAH':
      return { trade_name: 'IDEAL FIRESTOP TRADING LLC ', location: '48143, Dubai, UAE' }
    case 'SHARJAH':
      return { trade_name: 'IDEAL FIRESTOP TRADING LLC', location: '66976, Sharjah, UAE' }
    case 'Export':
      return { trade_name: 'IDEAL SPECIAL PRODUCTS FZC', location: '94956 , Abu Dhabi' }
    case 'IDEAL FITOUTS':
      return {
        trade_name: 'Ideal Fitout Decoration Design & Fit-Out Co. L.L.C',
        location: 'Unit 1108, 51 Tower ,Business Bay, Dubai, UAE PO.Box: 94956',
      }
    default:
      return { trade_name: 'IDEAL FIRESTOP TRADING LLC', location: '48143, Dubai, UAE' }
  }
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
        trade_name: 'IDEAL FIRESTOP TRADING LLC FUJAIRAH BRANCH',
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
        trade_name: 'IDEAL FIRESTOP TRADING LLC - SHJ.BR',
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
    case 'Export':
      return {
        trade_name: 'IDEAL SPECIAL PRODUCTS FZC',
        phone: '',
        location: '94956, Abu Dhabi',
        email1: '',
        email2: '',
        website: '',
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
      return { name, designation: 'Sr. Manager', contact: '050 8961908', signature }
    case 'Dawood Hussain':
      return { name, designation: 'Project Sales Manager', contact: '052 8046858', signature }
    case 'Jerry Thomas':
      return { name, designation: 'Sales Manager', contact: '050 9421886', signature }
    case 'Antony Joy Panikulam':
      return { name, designation: 'Director', contact: '050 3513428', signature }
    case 'Ritu Antony':
      return { name, designation: 'Division Head - Fit Out', contact: '050 3063428', signature }
    case 'Noureddin Alzaben':
      return { name, designation: 'Business Development Manager', contact: '052 8531082', signature }
    default:
      return {
        name: name || '—',
        designation: 'Sales Executive',
        contact: '+971 50 306 3428',
        signature,
      }
  }
}

const LOGO_IDEAL_FITOUTS = 'https://i.ibb.co/nsrVgzqF/Screenshot-2025-04-08-131618.png'
const LOGO_IDEAL_FIRESTOP = 'https://i.ibb.co/3KVzWsK/Screenshot-2025-04-08-131639.png'

export type DoorSet2ViewMode = 'simple' | 'approved'

interface QuotationLogDoorSet2ContentProps {
  data: QuotationLogDoorSet2Data
  /** 'simple' = no signature (default); 'approved' = show signature when SalesPerson_Approval_Status === 'Approved' */
  viewMode?: DoorSet2ViewMode
}

export default function QuotationLogDoorSet2Content({ data, viewMode = 'simple' }: QuotationLogDoorSet2ContentProps) {
  const footerData = getFooterData(data.Sub_Divisions)
  const signatureFooter = getSignatureFooterData(data.Sub_Divisions)
  const salesDetails = getSalesPersonDetails(data.Sales_Person)
  const approvalStatus = (data.SalesPerson_Approval_Status ?? data.Approval ?? '').toString().trim()
  const showSignature = approvalStatus === 'Approved' && viewMode === 'approved'
  const hasDiscount =
    data.Provision_for_Less_Special_Discount_AED != null &&
    Number(data.Provision_for_Less_Special_Discount_AED) !== 0
  const sealDescHTML = data.Seal_Description?.trim()
    ? data.Seal_Description.replace(/\n/g, '<br />')
    : ''
  const showIntumescentSeal =
    (data.Seals_Require1 ?? '').toString().trim() === 'Yes' &&
    (data.Intumescent_seals ?? '').toString().trim() !== ''

  const division = (data.Division ?? '').trim()
  const logoSrc =
    division === 'Ideal Fitouts'
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

  return (
    <div className="door-core-quotation-container door-set-2-quotation">
      <div className="door-core-static-pattern" aria-hidden />
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
              <div className="door-core-footer-row door-core-footer-top">
                <div className="door-core-footer-left">
                  <span className="door-core-footer-trade-label">Trade Name: </span>
                  <span className="door-core-footer-trade-name">{footerData.trade_name}</span>
                </div>
                <div className="door-core-footer-right">
                  <img
                    src="https://i.ibb.co/k6srwW6p/Screenshot-2026-01-13-171144.png"
                    className="door-core-footer-certs"
                    alt="Certifications"
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
                      <span className="door-core-footer-contact-item">
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
                  Exclusive distributors in UAE for <span className="door-core-brand-name">Ideal Special Products F.Z.C</span>
                </p>
              </div>
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
                <strong>Dear&nbsp;&nbsp;</strong>{data.Customer_Name1 ?? '—'}<br />
                <p className="door-core-intro-p">
                  We thank you for the enquiry and have pleasure in submitting our best offer as below details &amp; attached BOQ:
                </p>

                {data.Scope_field?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label"><strong>Scope:</strong></div>
                    <div className="door-core-details-value">{data.Scope_field}</div>
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
                    <div className="door-core-seal-label">Intumescent seal:</div>
                    <div className="door-core-seal-value">{data.Intumescent_seals ?? ''}</div>
                  </div>
                )}
                {showIntumescentSeal && sealDescHTML && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label">Seal description:</div>
                    <div className="door-core-seal-value" dangerouslySetInnerHTML={{ __html: sealDescHTML }} />
                  </div>
                )}
                {data.Acoustic_Seals?.trim() && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label">Acoustic seals:</div>
                    <div className="door-core-seal-value">{data.Acoustic_Seals}</div>
                  </div>
                )}
                {data.Hardware?.trim() && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label">Hardware set:</div>
                    <div className="door-core-seal-value">{data.Hardware}</div>
                  </div>
                )}
              </div>

              <div className="door-core-table-section">
                <table className="door-core-product-table door-set-2-product-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Door Leaf</th>
                      <th>Product Ref</th>
                      <th>Fire Rating (mins)</th>
                      <th>Acoustic Rating (db)</th>
                      <th>Door Leaf Size Width (mm)</th>
                      <th>Door Leaf Size Height (mm)</th>
                      <th>Jamb (mm)</th>
                      <th>Leaf Thick (mm)</th>
                      <th>Door Type</th>
                      <th>Vision Panel (mm)</th>
                      <th>Hardware Set</th>
                      <th>Unit</th>
                      <th className="door-core-text-right">Qty</th>
                      <th className="door-core-text-right">Unit Price (AED)</th>
                      <th className="door-core-text-right">Total Price (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.S_No1 ?? ''}</td>
                        <td>{record.Door_Ref ?? ''}</td>
                        <td>{record.Product_Ref ?? ''}</td>
                        <td>{record.Fire_Rating_Min ?? ''}</td>
                        <td>{record.Acoustic_Rating_db ?? ''}</td>
                        <td>{record.Door_Leaf_width_mm ?? ''}</td>
                        <td>{record.Door_Leaf_Height_mm ?? ''}</td>
                        <td>{record.Jamb_mm ?? ''}</td>
                        <td>{record.Leaf_Thick_mm ?? ''}</td>
                        <td>{record.Door_Type ?? ''}</td>
                        <td>{record.Vision_Panel_MM ?? ''}</td>
                        <td>{record.Hardware_Set ?? ''}</td>
                        <td>{record.Unit1 ?? ''}</td>
                        <td className="door-core-text-right">{record.Quantity1 ?? ''}</td>
                        <td className="door-core-text-right">
                          {record.Unit_Price1 != null ? formatAED(record.Unit_Price1) : ''}
                        </td>
                        <td className="door-core-text-right">
                          {record.Amount_AED != null ? formatAED(record.Amount_AED) : ''}
                        </td>
                      </tr>
                    ))}
                    <tr className="door-core-subtotal">
                      <td colSpan={13} className="door-core-text-right">
                        <strong>Total Quantity:</strong>
                      </td>
                      <td className="door-core-text-right">{data.Total_Quantity ?? ''}</td>
                      <td />
                      <td />
                    </tr>
                    <tr className="door-core-subtotal">
                      <td colSpan={14} />
                      <td className="door-core-text-right"><strong>Sub Total:</strong></td>
                      <td className="door-core-text-right">{formatAED(data.Sub_Total)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Section_1: show when data.Section_1 != null (match Zoho template) */}
                {showSection1 && (
                  <>
                    <div className="door-core-section-title">{data.SubForm_Header ?? ''}</div>
                    <table className="door-core-product-table door-core-subform-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Description</th>
                          <th className="door-core-text-right">Qty</th>
                          <th className="door-core-text-right">Unit Price (AED)</th>
                          <th className="door-core-text-right">Total Price (AED)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section1.map((row, idx) => (
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
                        <tr className="door-core-subtotal">
                          <td colSpan={3} />
                          <td className="door-core-text-right"><strong>Sub Total:</strong></td>
                          <td className="door-core-text-right">{formatAED(data.Sub_Total1)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {/* Section_2: show when data.Section_2 != null (match Zoho template) */}
                {showSection2 && (
                  <>
                    <div className="door-core-section-title">{data.SubForm_Header1 ?? ''}</div>
                    <table className="door-core-product-table door-core-subform-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Description</th>
                          <th className="door-core-text-right">Qty</th>
                          <th className="door-core-text-right">Unit Price (AED)</th>
                          <th className="door-core-text-right">Total Price (AED)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section2.map((row, idx) => (
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
                        <tr className="door-core-subtotal">
                          <td colSpan={3} />
                          <td className="door-core-text-right"><strong>Sub Total:</strong></td>
                          <td className="door-core-text-right">{formatAED(data.Sub_Total2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {/* Section_3: show when data.Section_3 != null (match Zoho template) */}
                {showSection3 && (
                  <>
                    <div className="door-core-section-title">{data.Subform_Header2 ?? ''}</div>
                    <table className="door-core-product-table door-core-subform-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Description</th>
                          <th className="door-core-text-right">Qty</th>
                          <th className="door-core-text-right">Unit Price (AED)</th>
                          <th className="door-core-text-right">Total Price (AED)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section3.map((row, idx) => (
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
                        <tr className="door-core-subtotal">
                          <td colSpan={3} />
                          <td className="door-core-text-right"><strong>Sub Total:</strong></td>
                          <td className="door-core-text-right">{formatAED(data.Sub_Total3)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                <table className="door-core-product-table door-core-totals-table">
                  <tbody>
                    <tr className="door-core-totals-row">
                      <td colSpan={10} />
                      <td className="door-core-text-right">
                        <strong>Total Amount (AED):</strong>
                      </td>
                      <td className="door-core-text-right door-core-total-value">
                        {formatAED(data.Total_Amount_AED)}
                      </td>
                      <td />
                    </tr>
                    {hasDiscount && (
                      <tr className="door-core-totals-row">
                        <td colSpan={10} />
                        <td className="door-core-text-right">
                          <strong>Less Special Discount (AED):</strong>
                        </td>
                        <td className="door-core-text-right">
                          {formatAED(data.Provision_for_Less_Special_Discount_AED)}
                        </td>
                        <td />
                      </tr>
                    )}
                    <tr className="door-core-totals-row">
                      <td colSpan={10} />
                      <td className="door-core-text-right">
                        <strong>VAT 5% (AED):</strong>
                      </td>
                      <td className="door-core-text-right">
                        {formatAED(data.VAT_5_AED)}
                      </td>
                      <td />
                    </tr>
                    <tr className="door-core-totals-row">
                      <td colSpan={10} />
                      <td className="door-core-text-right">
                        <strong>Grand Total (AED):</strong>
                      </td>
                      <td className="door-core-text-right door-core-total-value" className="door-core-grand-total-cell">
                        {formatAED(data.Grand_Total_AED)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>

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
                    <p className="door-core-terms-p">1. The following are excluded from our scope:</p>
                    <div
                      className="door-core-notes-p door-core-notes-html"
                      dangerouslySetInnerHTML={{ __html: data.Notes1 ?? '' }}
                    />
                  </>
                )}

                <div className="door-core-terms">
                  <p>We trust our offer meets with your requirement &amp; look forward to your valued order confirmation.</p>
                  <p>Assuring you of our best services at all times.</p>
                </div>

                <div className="door-core-last-page-wrap">
                  <div className="door-core-signature-block">
                    <p>Thanks and Regards</p>
                    <br />
                    <strong>For {signatureFooter.trade_name}</strong>
                    <br />
                    <br />
                    <p>Address : {signatureFooter.location}</p>
                    <br />
                    {salesDetails.name}
                    <br />
                    {salesDetails.designation}
                    <br />
                    {salesDetails.contact}
                    <br />
                    <br />
                    {showSignature ? (
                      <div
                        style={{
                          marginBottom: '60px',
                          marginRight: '32px',
                          textAlign: 'right',
                          marginLeft: 'auto',
                          width: 'fit-content',
                          maxWidth: '100%',
                        }}
                      >
                        {salesDetails.signature ? (
                          <>
                            <img
                              src={salesDetails.signature}
                              alt={`Signature of ${salesDetails.name}`}
                              style={{
                                maxWidth: '200px',
                                height: 'auto',
                                display: 'block',
                                marginLeft: 'auto',
                                marginBottom: '4px',
                              }}
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
                      <div className="door-core-signature-line">
                        Signature:<br />
                        <span
                          style={{
                            borderBottom: '2px solid #000',
                            width: '150px',
                            display: 'inline-block',
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="door-core-last-page-spacer" />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
