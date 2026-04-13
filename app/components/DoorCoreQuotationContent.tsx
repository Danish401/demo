'use client'

import { CoreCoverPageData } from '@/lib/types'
import { formatAedAmountInWords, plainZohoDisplayText } from '@/lib/quotation-utils'

/** True if field has displayable value (hide row/section when false) */
function hasValue(v: unknown): boolean {
  if (v == null) return false
  const s = String(v).trim()
  return s !== ''
}

export type DoorCoreViewMode = 'simple' | 'approved'

interface DoorCoreQuotationContentProps {
  data: CoreCoverPageData
  /** 'simple' = no signature (default); 'approved' = show signature when data.Approval === 'Approved' */
  viewMode?: DoorCoreViewMode
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
        designation: 'Designation not available',
        contact: 'Contact not available',
        signature,
      }
  }
}

function formatAED(value: string | number | undefined): string {
  if (value === undefined || value === null) return '0.00'
  const num = typeof value === 'string' ? parseFloat(String(value).replace(/,/g, '')) : value
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Default "3. Notes" content when API does not return Notes1 (e.g. Core_Cover_page_Report). Numbered 1–8 with bullet sub-list under 1. */
const DEFAULT_NOTES_HTML = `
<ol class="door-core-notes-count-list">
<li>The following are excluded from our scope:
<ul>
<li>Installation of door sets</li>
<li>Ironmongeries</li>
<li>Moulding, paneling, and any other design work apart from what is mentioned above</li>
<li>Any other items which are not specifically mentioned</li>
</ul>
</li>
<li>Alteration of any kind of our doors (e.g., making grooves or recesses) can significantly impact their performance and must not be done without our prior approval.</li>
<li>Installation must be carried out in accordance with standard practice for Fire and Acoustic doors. Details shall be shared upon supply.</li>
<li>Vision panels, wherever applicable, shall be strictly built-in as per the required size during fabrication at additional cost.</li>
<li>For Fire Rated Doors, all ironmongeries and accessories must have valid fire rating certification and Civil Defense approval. Intumescent protection for hardware (hinges, lock case, closer, etc.) is mandatory.</li>
<li>Upon completion, labels and Civil Defense Certificate will be issued after inspection (for Fire Rating only). Manufacturer's Acoustic Certificate will also be provided.</li>
<li>Issuance of labels and certificates is subject to clearance of any outstanding payments.</li>
<li>All our products carry a 1-year warranty from the date of installation/certification/labelling, covering manufacturing defects only.</li>
</ol>
`.trim()

export default function DoorCoreQuotationContent({ data, viewMode = 'simple' }: DoorCoreQuotationContentProps) {
  const footerData = getFooterData(data.Sub_Divisions)
  const salesDetails = getSalesPersonDetails(data.Sales_Person)
  const approvalStatus = (data.Approval ?? '').trim()
  const showSignature = approvalStatus === 'Approved' && viewMode === 'approved'
  const hasDiscount =
    data.Provision_for_Less_Special_Discount_AED != null &&
    Number(data.Provision_for_Less_Special_Discount_AED) !== 0
  const sealDescHTML = data.Seal_Description?.trim()
    ? data.Seal_Description.replace(/\n/g, '<br />')
    : ''

  return (
    <div className="door-core-quotation-container">
      <div className="door-core-static-pattern" aria-hidden />
      <table className="door-core-page-layout">
        {/* Header: repeats on every printed page */}
        <thead>
          <tr>
            <td className="door-core-layout-header-cell">
              <div className="door-core-header-logo-crop">
                <img
                  src="https://i.ibb.co/bjs2kFm4/Screenshot-2026-01-13-171206.png"
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
              {/* Top row: Trade Name (left) + Certification logos (right) */}
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
              {/* Contact row: phone, email, website, location (only when subdivision has them) */}
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
              {/* Cover details block - no duplicate logo; header already shows logo on every page */}
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
                  <strong className="door-core-salutation-dear">Dear&nbsp;&nbsp;&nbsp;</strong>
                  <span className="door-core-salutation-name">{plainZohoDisplayText(data.Customer_Name1)}</span>
                </p>
                <p className="door-core-intro-p">
                  We thank you for the enquiry and have pleasure in submitting our best offer as below details &amp; attached BOQ
                </p>
                <br />

                {data.Scope_field?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label">Scope:</div>
                    <div className="door-core-details-value">{data.Scope_field}</div>
                  </div>
                )}
                {data.FR_Core?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label">FR Core:</div>
                    <div className="door-core-details-value">{data.FR_Core}</div>
                  </div>
                )}
                {data.Acoustic_Core?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label">Acoustic Core:</div>
                    <div className="door-core-details-value">{data.Acoustic_Core}</div>
                  </div>
                )}
                {data.Facing?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label">Facing:</div>
                    <div className="door-core-details-value">{data.Facing}</div>
                  </div>
                )}
                {data.Lipping?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label">Lipping:</div>
                    <div className="door-core-details-value">{data.Lipping}</div>
                  </div>
                )}
                {data.Finish?.trim() && (
                  <div className="door-core-details-row">
                    <div className="door-core-details-label">Finish:</div>
                    <div className="door-core-details-value">{data.Finish}</div>
                  </div>
                )}
                {data.Intumescent_seals?.trim() && (
                  <div className="door-core-seal-row">
                    <div className="door-core-seal-label">Intumescent seal:</div>
                    <div className="door-core-seal-value">{data.Intumescent_seals}</div>
                  </div>
                )}
                {sealDescHTML && (
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
              </div>

              {/* BOQ table section */}
              <div className="door-core-table-section">
                <table className="door-core-product-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}>SR. No</th>
                      <th>Door Ref</th>
                      <th>Door Leaf width (mm)</th>
                      <th>Door Leaf Height (mm)</th>
                      <th>Leaf Thick (mm)</th>
                      <th>Door Type</th>
                      <th>Product Ref</th>
                      <th>Acoustic Rating (db)</th>
                      <th>Fire Rating (mins)</th>
                      <th>Vision Panel (mm)</th>
                      <th>Qty.</th>
                      <th>Unit Price (AED)</th>
                      <th>Total Unit Price (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.BOQ || []).map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.S_No1 ?? ''}</td>
                        <td style={{ textAlign: 'right' }}>{record.Door_Ref ?? ''}</td>
                        <td>{record.Door_Leaf_Width_mm ?? ''}</td>
                        <td>{record.Door_Leaf_Height_mm ?? ''}</td>
                        <td>{record.Leaf_Thick_mm ?? ''}</td>
                        <td style={{ textAlign: 'right' }}>{record.Door_Type ?? ''}</td>
                        <td style={{ textAlign: 'right' }}>{record.Product_Ref ?? ''}</td>
                        <td>{record.Acoustic_Rating_db ?? ''}</td>
                        <td>{record.Fire_Rating_mins ?? ''}</td>
                        <td style={{ textAlign: 'right' }}>{record.Vision_Panel_mm ?? ''}</td>
                        <td>{record.Qty1 ?? ''}</td>
                        <td style={{ textAlign: 'right' }}>{record.Unit_Price_AED1 != null ? formatAED(record.Unit_Price_AED1) : ''}</td>
                        <td style={{ textAlign: 'right' }}>{record.Total_Unit_Price_AED1 != null ? formatAED(record.Total_Unit_Price_AED1) : ''}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={12} className="door-core-total-label">
                        Total Amount AED :-
                      </td>
                      <td className="door-core-total-value" style={{ textAlign: 'right' }}>{formatAED(data.Total_Amount_AED)}</td>
                    </tr>
                    <tr>
                      <td colSpan={12} className="door-core-total-label">
                        VAT 5% AED :-
                      </td>
                      <td className="door-core-total-value" style={{ textAlign: 'right' }}>{formatAED(data.VAT_5)}</td>
                    </tr>
                    {hasDiscount && (
                      <tr>
                        <td colSpan={12} className="door-core-total-label">
                          Less Special Discount AED :-
                        </td>
                        <td className="door-core-total-value" style={{ textAlign: 'right' }}>{formatAED(data.Provision_for_Less_Special_Discount_AED)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={12} className="door-core-total-label door-core-grand-total-label-cell">
                        <div className="door-core-grand-total-line">Grand Total AED :-</div>
                        <div className="door-core-amount-in-words">
                          <span className="door-core-amount-in-words-label">In words:</span>{' '}
                          {formatAedAmountInWords(data.Grand_Total_AED)}
                        </div>
                      </td>
                      <td className="door-core-total-value" style={{ textAlign: 'right' }}>{formatAED(data.Grand_Total_AED)}</td>
                    </tr>
                  </tbody>
                </table>

                <br />
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
                {/* Always show 3. Notes: use API Notes1 when present (Quotation_Log_Door_Core), else default (Core_Cover_page_Report) */}
                <strong>3. Notes</strong>
                <div
                  className="door-core-notes-p door-core-notes-html"
                  dangerouslySetInnerHTML={{ __html: hasValue(data.Notes1) ? (data.Notes1 ?? '') : DEFAULT_NOTES_HTML }}
                />

                {/* Closing lines + signature stay on one page when printing (avoid orphan “Assuring you…” before signature) */}
                <div className="door-core-last-page-wrap">
                  <div className="door-core-closing-print-group">
                    <div className="door-core-terms">
                      <p>We trust our offer meets with your requirement &amp; look forward to your valued order confirmation.</p>
                      <p>Assuring you of our best services at all times.</p>
                    </div>
                    <div className="door-core-signature-block">
                      <p className="door-core-signature-greeting">Thanks and Regards</p>
                      <p className="door-core-signature-for-line">
                        <strong>For {footerData.trade_name}</strong>
                      </p>
                      <p className="door-core-signature-detail">{salesDetails.name}</p>
                      <p className="door-core-signature-detail">{salesDetails.designation}</p>
                      <p className="door-core-signature-detail">{salesDetails.contact}</p>
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
