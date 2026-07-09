'use client'

import {
  QuotationLogFitout2Data,
  QuotationLogFitout2Item,
  QuotationLogFitout2Item1,
  QuotationLogFitout2ManualItem,
  QuotationLogFitout2SubItem,
} from '@/lib/types'

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

/** Header logo – Cloudinary asset (Ideal Fitouts) */
const HEADER_LOGO_URL = 'https://res.cloudinary.com/danisha563/image/upload/v1773400237/23idealfitout_bafong.png'

/** Sales map: name -> designation, mobile, email, signature (matches Zoho Deluge salesMap) */
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
    case 'Jerry Thomas':
      return { name, designation: 'Sales Manager', contact: '050 9421886', signature }
    case 'Santosh P.B':
      return { name, designation: 'Sr. Manager', contact: '050 8961908', signature }
    case 'Dawood Hussain':
      return { name, designation: 'Project Sales Manager', contact: '052 8046858', signature }
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

interface FooterData {
  trade_name: string
  location: string
  part_of: string
  phone: string
  email1: string
  email2: string
  website: string
}

function getFooterData(subDivisions?: string): FooterData {
  return {
    trade_name: 'Ideal Fitout Decoration Design & Fit-Out Co. L.L.C',
    part_of: 'Ideal Special Products F.Z.C',
    location: 'Unit 1108, 51 Tower, Business Bay, Dubai, UAE PO.Box: 94956',
    phone: '+97142986983',
    email1: 'fitouts@ideal.ae',
    email2: 'idealind@eim.ae',
    website: 'www.idealfitouts.ae',
  }
}

/**
 * Trade name / part-of / contact / disclaimer footer band.
 * Rendered twice: once inside the real <tfoot> (kept for its layout/pagination role, hidden visually
 * in print) and once more in a position:fixed overlay so it's pinned to the bottom of every printed
 * page — including the last one, whose real content may not reach the page bottom.
 */
function FooterBandContent({ footerData }: { footerData: FooterData }) {
  return (
    <>
      <div className="quotation-fitout-footer-row quotation-fitout-footer-top">
        <div className="quotation-fitout-footer-left">
          <span className="quotation-fitout-footer-trade-label">Trade Name : </span>
          <span className="quotation-fitout-footer-trade-name">{footerData.trade_name}</span>
        </div>
        <div className="quotation-fitout-footer-right">
          <img
            src="/logo4.png"
            className="quotation-fitout-footer-certs"
            alt="AV CERT / UAF / FSC Certification"
          />
          <div>
            <span className="quotation-fitout-footer-part-label">Part of </span>
            <span className="quotation-fitout-footer-part-name">{footerData.part_of}</span>
          </div>
        </div>
      </div>
      <hr className="quotation-fitout-footer-hr" />
      <div className="quotation-fitout-footer-contact">
        <span className="quotation-fitout-footer-contact-item">
          <svg className="quotation-fitout-footer-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M60 40 C45 40 40 55 45 70 C55 100 100 145 130 155 C145 160 160 155 160 140 V120 C160 112 155 108 148 106 L125 100 C118 98 112 100 108 106 L100 118 C85 108 70 92 60 75 L72 65 C78 60 80 55 78 48 L72 25 C70 18 65 15 58 15 H40 C30 15 25 25 30 35 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {footerData.phone}
        </span>
        <span className="quotation-fitout-footer-contact-item quotation-fitout-footer-email-block">
          <svg className="quotation-fitout-footer-icon" viewBox="0 0 200 200" aria-hidden>
            <rect x="20" y="50" width="160" height="100" rx="10" ry="10" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="20,50 100,110 180,50" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="quotation-fitout-footer-email-lines">
            {footerData.email1}
            <br />
            {footerData.email2}
          </span>
        </span>
        <span className="quotation-fitout-footer-contact-item">
          <svg className="quotation-fitout-footer-icon quotation-fitout-footer-globe" viewBox="0 0 200 200" aria-hidden>
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
        <span className="quotation-fitout-footer-contact-item">
          <svg className="quotation-fitout-footer-icon" viewBox="0 0 200 200" aria-hidden>
            <path d="M100 20 C65 20 40 45 40 80 C40 120 100 180 100 180 C100 180 160 120 160 80 C160 45 135 20 100 20 Z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="100" cy="80" r="18" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="quotation-fitout-footer-address-lines">
            Unit 1108, 51 Tower,<br />
            Business Bay, Dubai, UAE<br />
            PO.Box: 94956
          </span>
        </span>
      </div>
      <p className="quotation-fitout-footer-signature-note">
        ** This is a computer generated quotation and hence does not require a signature. **
      </p>
    </>
  )
}

export type FitoutViewMode = 'simple' | 'approved'

interface QuotationFitoutContentProps {
  data: QuotationLogFitout2Data
  /** 'simple' = no signature (default); 'approved' = show signature when Approval === 'Approved' (use ?view=approved in URL) */
  viewMode?: FitoutViewMode
}

export default function QuotationFitoutContent({ data, viewMode = 'simple' }: QuotationFitoutContentProps) {
  const footerData = getFooterData(data.Sub_Divisions)
  const salesDetails = getSalesPersonDetails(data.Sales_Person)
  const approvalStatus = (data.SalesPerson_Approval_Status ?? data.Approval ?? '').toString().trim()
  const showSignature = approvalStatus === 'Approved' && viewMode === 'approved'
  const hasDiscount =
    data.Provision_for_Less_Special_Discount_AED != null &&
    Number(data.Provision_for_Less_Special_Discount_AED) !== 0
  const hasVat = data.VAT_5 != null && Number(data.VAT_5) !== 0

  const toItemsArray = (val: unknown): QuotationLogFitout2Item[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogFitout2Item[]) : [val as QuotationLogFitout2Item]
  const toItems1Array = (val: unknown): QuotationLogFitout2Item1[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogFitout2Item1[]) : [val as QuotationLogFitout2Item1]
  const toSubArray = (val: unknown): QuotationLogFitout2SubItem[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogFitout2SubItem[]) : [val as QuotationLogFitout2SubItem]
  const toManualItemsArray = (val: unknown): QuotationLogFitout2ManualItem[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogFitout2ManualItem[]) : [val as QuotationLogFitout2ManualItem]

  const items = toItemsArray(data.Items_Details)
  const items1 = toItems1Array(data.Items_Details1)
  const subForm1 = toSubArray(data.SubForm1)
  const subForm2 = toSubArray(data.SubForm2)
  const manuallyFilled = toManualItemsArray(data.Manually_Filled)
  const showItems1 = items1.length > 0
  const showSubForm1 = subForm1.length > 0
  const showSubForm2 = subForm2.length > 0
  const showManuallyFilled = manuallyFilled.length > 0
  const hasAnyRows = items.length > 0 || showItems1 || showSubForm1 || showSubForm2

  const projectName = data.Project?.trim() || data.Project_Name?.trim()
  const notesHtml = (data.Notes ?? data.Notes1 ?? '').trim()
  const hasNoRows = !hasAnyRows

  return (
    <div className={`quotation-fitout-container${hasNoRows ? ' quotation-fitout-has-no-rows' : ''}`}>
      <div className="quotation-fitout-static-pattern" aria-hidden />
      <table className="quotation-fitout-page-layout">
        <thead>
          <tr>
            <td className="quotation-fitout-header-cell">
              <div className="quotation-fitout-header-logo">
                <img
                  src={HEADER_LOGO_URL}
                  alt="Ideal Fitouts"
                  className="quotation-fitout-header-logo-img"
                />
              </div>
            </td>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td className="quotation-fitout-footer-cell">
              <FooterBandContent footerData={footerData} />
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td className="quotation-fitout-body-cell">
              <div className="quotation-fitout-container-inner">
                <div className="quotation-fitout-details-block">
                  <h1 className="quotation-fitout-title">
                    <u>Quotation</u>
                  </h1>

                  <div className="quotation-fitout-details">
                    {hasValue(data.Quotation_No) && (
                      <div className="quotation-fitout-details-row">
                        <div className="quotation-fitout-details-label">Ref:</div>
                        <div className="quotation-fitout-details-value">{data.Quotation_No}</div>
                      </div>
                    )}
                    {hasValue(data.Quotation_Submission_Date) && (
                      <div className="quotation-fitout-details-row">
                        <div className="quotation-fitout-details-label">Date:</div>
                        <div className="quotation-fitout-details-value">{data.Quotation_Submission_Date}</div>
                      </div>
                    )}
                    {hasValue(data.Organization_Name1) && (
                      <div className="quotation-fitout-details-row">
                        <div className="quotation-fitout-details-label">To:</div>
                        <div className="quotation-fitout-details-value">{data.Organization_Name1}</div>
                      </div>
                    )}
                    {hasValue(data.Emirates) && (
                      <div className="quotation-fitout-details-row">
                        <div className="quotation-fitout-details-label" />
                        <div className="quotation-fitout-details-value">{data.Emirates}, U.A.E</div>
                      </div>
                    )}
                    {projectName ? (
                      <div className="quotation-fitout-details-row">
                        <div className="quotation-fitout-details-label">Project Name:</div>
                        <div className="quotation-fitout-details-value">{projectName}</div>
                      </div>
                    ) : null}
                    {hasValue(data.Project_Location) && (
                      <div className="quotation-fitout-details-row">
                        <div className="quotation-fitout-details-label">Project Location:</div>
                        <div className="quotation-fitout-details-value">{data.Project_Location}</div>
                      </div>
                    )}
                    {hasValue(data.Subject_field) && (
                      <div className="quotation-fitout-details-row">
                        <div className="quotation-fitout-details-label">Subject:</div>
                        <div className="quotation-fitout-details-value">{data.Subject_field}</div>
                      </div>
                    )}
                  </div>

                  <p className="quotation-fitout-salutation">
                    <strong>Dear Sir/Madam,</strong>
                  </p>
                  <p className="quotation-fitout-intro">
                    We thank you for the enquiry and have pleasure in submitting our best offer as below details &amp; attached BOQ:
                  </p>
                </div>

                {showManuallyFilled && (
                  <div className="quotation-fitout-manual-items-block">
                    <table className="quotation-fitout-product-table quotation-fitout-manual-items-table">
                      <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '55%' }} />
                        <col style={{ width: '25%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Description</th>
                          <th>Amount <DirhamSymbol /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {manuallyFilled.map((record, idx) => (
                          <tr key={idx}>
                            <td>{record.Item ?? ''}</td>
                            <td>{record.Description ?? ''}</td>
                            <td className="quotation-fitout-text-right">
                              {record.Amount != null ? formatAED(record.Amount) : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="quotation-fitout-cover-terms-block">
                  {hasValue(data.Payment_Terms) && (
                    <>
                      <strong>1. Payment Terms</strong>
                      <p className="quotation-fitout-terms-p">{data.Payment_Terms}</p>
                    </>
                  )}

                  {hasValue(data.Validity) && (
                    <>
                      <strong>2. Validity</strong>
                      <p className="quotation-fitout-terms-p">{data.Validity}</p>
                    </>
                  )}

                  {notesHtml ? (
                    <>
                      <strong>4. Notes</strong>
                      <div className="quotation-fitout-notes-html" dangerouslySetInnerHTML={{ __html: notesHtml }} />
                    </>
                  ) : null}
                </div>

                {/* Cover letter closes here with the signature; item pricing (when present) starts fresh on the next page */}
                <div className={`quotation-fitout-last-page-wrap${hasAnyRows ? ' quotation-fitout-cover-close' : ''}`}>
                  <div className="quotation-fitout-terms">
                    <p>We trust our offer meets with your requirement &amp; look forward to your valued order confirmation.</p>
                    <p>Assuring you of our best services at all times.</p>
                  </div>
                  <div className="quotation-fitout-signature-block">
                    <p className="quotation-fitout-signature-greeting">Thanks and Regards</p>
                    <p className="quotation-fitout-signature-team">
                      <strong>


                        For {footerData.trade_name}

                      </strong>
                    </p>
                    <p className="quotation-fitout-signature-detail">{salesDetails.name}</p>
                    <p className="quotation-fitout-signature-detail">{salesDetails.designation}</p>
                    <p className="quotation-fitout-signature-detail">{salesDetails.contact}</p>
                    {showSignature ? (
                      <div className="quotation-fitout-signature-image-wrap">
                        {salesDetails.signature ? (
                          <>
                            <img
                              src={salesDetails.signature}
                              alt={`Signature of ${salesDetails.name}`}
                              className="quotation-fitout-signature-img"
                            />
                            <strong className="quotation-fitout-signature-label">Signature</strong>
                          </>
                        ) : (
                          <span className="quotation-fitout-signature-placeholder">
                            Signature not on file for this salesperson.
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="quotation-fitout-signature-line-wrap">
                        Signature:
                        <br />
                        <span />
                      </div>
                    )}
                  </div>
                  {!hasAnyRows && <div className="quotation-fitout-last-page-spacer" />}
                </div>

                {hasAnyRows && (
                <div className="quotation-fitout-pricing-section">
                  {/* Section 1: Subform_Header + Items_Details – only when there are rows */}
                  {items.length > 0 && (
                    <>
                      <div className="quotation-fitout-section-title">
                        <strong>{data.Subform_Header ?? ''}</strong>
                      </div>
                      <table className="quotation-fitout-product-table">
                        <colgroup>
                          <col style={{ width: '7.5%' }} />
                          <col style={{ width: '47.5%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '13%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>SL.{'\u00A0'}NO.</th>
                            <th>Description</th>
                            <th>Unit</th>
                            <th>Qty</th>
                            <th>Unit Price <DirhamSymbol /></th>
                            <th>Total Price <DirhamSymbol /></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((record, idx) => (
                            <tr key={idx}>
                              <td>{record.S_No1 ?? ''}</td>
                              <td>{record.Item_Description ?? ''}</td>
                              <td>{record.Unit ?? ''}</td>
                              <td className="quotation-fitout-text-right">{record.Quantity1 ?? ''}</td>
                              <td className="quotation-fitout-text-right">
                                {record.Unit_Price != null ? formatAED(record.Unit_Price) : ''}
                              </td>
                              <td className="quotation-fitout-text-right">
                                {record.Amount_AED1 != null ? formatAED(record.Amount_AED1) : ''}
                              </td>
                            </tr>
                          ))}
                          <tr className="quotation-fitout-subtotal">
                            <td colSpan={4} />
                            <td>
                              <strong>Sub Total:</strong>
                            </td>
                            <td className="quotation-fitout-text-right">{formatAED(data.Sub_Total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}

                  {showItems1 && (
                    <>
                      <br />
                      <div className="quotation-fitout-section-title">
                        <strong>{data.Subform_Header1 ?? ''}</strong>
                      </div>
                      <table className="quotation-fitout-product-table">
                        <colgroup>
                          <col style={{ width: '7.5%' }} />
                          <col style={{ width: '47.5%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '13%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>SL.{'\u00A0'}NO.</th>
                            <th>Description</th>
                            <th>Unit</th>
                            <th>Qty</th>
                            <th>Unit Price <DirhamSymbol /></th>
                            <th>Total Price <DirhamSymbol /></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items1.map((record, idx) => (
                            <tr key={idx}>
                              <td>{record.S_No1 ?? ''}</td>
                              <td>{record.Item_Description ?? ''}</td>
                              <td>{record.Unit1 ?? ''}</td>
                              <td className="quotation-fitout-text-right">{record.Quantity1 ?? ''}</td>
                              <td className="quotation-fitout-text-right">
                                {record.Unit_Price1 != null ? formatAED(record.Unit_Price1) : ''}
                              </td>
                              <td className="quotation-fitout-text-right">
                                {record.Amount_AED != null ? formatAED(record.Amount_AED) : ''}
                              </td>
                            </tr>
                          ))}
                          <tr className="quotation-fitout-subtotal">
                            <td colSpan={4} />
                            <td>
                              <strong>Sub Total:</strong>
                            </td>
                            <td className="quotation-fitout-text-right">{formatAED(data.Sub_Total1)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}

                  {showSubForm1 && (
                    <>
                      <br />
                      <div className="quotation-fitout-section-title">
                        <strong>{data.Subform_Header2 ?? ''}</strong>
                      </div>
                      <table className="quotation-fitout-product-table">
                        <colgroup>
                          <col style={{ width: '7.5%' }} />
                          <col style={{ width: '47.5%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '13%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>SL.{'\u00A0'}NO.</th>
                            <th>Description</th>
                            <th>Unit</th>
                            <th>Qty</th>
                            <th>Unit Price <DirhamSymbol /></th>
                            <th>Total Price <DirhamSymbol /></th>
                          </tr>
                        </thead>
                        <tbody>
                          {subForm1.map((record, idx) => (
                            <tr key={idx}>
                              <td>{record.S_No1 ?? ''}</td>
                              <td>{record.Item_Description ?? ''}</td>
                              <td>{record.Unit1 ?? ''}</td>
                              <td className="quotation-fitout-text-right">{record.Qty1 ?? ''}</td>
                              <td className="quotation-fitout-text-right">
                                {record.Unit_Price1 != null ? formatAED(record.Unit_Price1) : ''}
                              </td>
                              <td className="quotation-fitout-text-right">
                                {record.Amount_AED != null ? formatAED(record.Amount_AED) : ''}
                              </td>
                            </tr>
                          ))}
                          <tr className="quotation-fitout-subtotal">
                            <td colSpan={4} />
                            <td>
                              <strong>Sub Total:</strong>
                            </td>
                            <td className="quotation-fitout-text-right">{formatAED(data.Sub_Total2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}

                  {showSubForm2 && (
                    <>
                      <br />
                      <div className="quotation-fitout-section-title">
                        <strong>{data.Subform_Header3 ?? ''}</strong>
                      </div>
                      <table className="quotation-fitout-product-table">
                        <colgroup>
                          <col style={{ width: '7.5%' }} />
                          <col style={{ width: '47.5%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '13%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>SL.{'\u00A0'}NO.</th>
                            <th>Description</th>
                            <th>Unit</th>
                            <th>Qty</th>
                            <th>Unit Price <DirhamSymbol /></th>
                            <th>Total Price <DirhamSymbol /></th>
                          </tr>
                        </thead>
                        <tbody>
                          {subForm2.map((record, idx) => (
                            <tr key={idx}>
                              <td>{record.S_No1 ?? ''}</td>
                              <td>{record.Item_Description ?? ''}</td>
                              <td>{record.Unit1 ?? ''}</td>
                              <td className="quotation-fitout-text-right">{record.Qty1 ?? ''}</td>
                              <td className="quotation-fitout-text-right">
                                {record.Unit_Price1 != null ? formatAED(record.Unit_Price1) : ''}
                              </td>
                              <td className="quotation-fitout-text-right">
                                {record.Amount_AED != null ? formatAED(record.Amount_AED) : ''}
                              </td>
                            </tr>
                          ))}
                          <tr className="quotation-fitout-subtotal">
                            <td colSpan={4} />
                            <td>
                              <strong>Sub Total:</strong>
                            </td>
                            <td className="quotation-fitout-text-right">{formatAED(data.Sub_Total3)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}

                  {/* Totals: only when there is at least one row in any section */}
                  {hasAnyRows && (
                    <>
                      <br />
                      <table className="quotation-fitout-product-table quotation-fitout-totals-table">
                        <tbody>
                          <tr className="quotation-fitout-total-row">
                            <td colSpan={10} />
                            <td className="quotation-fitout-totals-label">
                              <strong>Total Amount <DirhamSymbol />:</strong>
                            </td>
                            <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                              {formatAED(data.Total_Amount_AED1 ?? 0)}
                            </td>
                          </tr>
                          {hasDiscount && (
                            <>
                              <tr className="quotation-fitout-total-row">
                                <td colSpan={10} />
                                <td className="quotation-fitout-totals-label">
                                  <strong>Less Special Discount <DirhamSymbol />:</strong>
                                </td>
                                <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                  {formatAED(data.Provision_for_Less_Special_Discount_AED)}
                                </td>
                              </tr>
                              <tr className="quotation-fitout-total-row">
                                <td colSpan={10} />
                                <td className="quotation-fitout-totals-label">
                                  <strong>Total Amount After Discount <DirhamSymbol />:</strong>
                                </td>
                                <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                  {formatAED(data.Total_amount_after_discount_AED)}
                                </td>
                              </tr>
                            </>
                          )}
                          {hasVat && (
                            <tr className="quotation-fitout-total-row">
                              <td colSpan={10} />
                              <td className="quotation-fitout-totals-label">
                                <strong>VAT 5% <DirhamSymbol />:</strong>
                              </td>
                              <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                {formatAED(data.VAT_5 ?? 0)}
                              </td>
                            </tr>
                          )}
                          <tr className="quotation-fitout-total-row">
                            <td colSpan={10} />
                            <td className="quotation-fitout-totals-label">
                              <strong>Grand Total <DirhamSymbol />:</strong>
                            </td>
                            <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                              {formatAED(data.Grand_Total_AED1 ?? 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}

                </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Print-only duplicate of the footer band, pinned to the bottom of every printed page (including
          the last one, whose real content may not reach the page bottom). The <tfoot> above still renders
          normally for on-screen viewing and keeps its original layout/pagination role for print, just
          hidden visually there, so this doesn't change how content already paginates across pages. */}
      <div className="quotation-fitout-print-footer-overlay quotation-fitout-footer-cell" aria-hidden="true">
        <FooterBandContent footerData={footerData} />
      </div>
    </div>
  )
}
