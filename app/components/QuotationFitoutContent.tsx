'use client'

import {
  QuotationLogFitout2Data,
  QuotationLogFitout2Item,
  QuotationLogFitout2Item1,
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

  const toItemsArray = (val: unknown): QuotationLogFitout2Item[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogFitout2Item[]) : [val as QuotationLogFitout2Item]
  const toItems1Array = (val: unknown): QuotationLogFitout2Item1[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogFitout2Item1[]) : [val as QuotationLogFitout2Item1]
  const toSubArray = (val: unknown): QuotationLogFitout2SubItem[] =>
    val == null ? [] : Array.isArray(val) ? (val as QuotationLogFitout2SubItem[]) : [val as QuotationLogFitout2SubItem]

  const items = toItemsArray(data.Items_Details)
  const items1 = toItems1Array(data.Items_Details1)
  const subForm1 = toSubArray(data.SubForm1)
  const subForm2 = toSubArray(data.SubForm2)
  const showItems1 = items1.length > 0
  const showSubForm1 = subForm1.length > 0
  const showSubForm2 = subForm2.length > 0
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
              <div className="quotation-fitout-footer-row quotation-fitout-footer-top">
                <div className="quotation-fitout-footer-left">
                  <span className="quotation-fitout-footer-trade-label">Trade Name : </span>
                  <span className="quotation-fitout-footer-trade-name">{footerData.trade_name}</span>
                </div>
                <div className="quotation-fitout-footer-right">
                  <span className="quotation-fitout-footer-part-label">Part of </span>
                  <span className="quotation-fitout-footer-part-name">{footerData.part_of}</span>
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
                    <strong>Dear&nbsp;&nbsp;&nbsp;</strong>
                    {data.Customer_Name1 ?? '—'}
                  </p>
                  <p className="quotation-fitout-intro">
                    We thank you for the enquiry and have pleasure in submitting our best offer as below details &amp; attached BOQ:
                  </p>

                  <br />

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
                            <th>Unit Price (AED)</th>
                            <th>Total Price (AED)</th>
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
                            <th>Unit Price (AED)</th>
                            <th>Total Price (AED)</th>
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
                            <th>Unit Price (AED)</th>
                            <th>Total Price (AED)</th>
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
                            <th>Unit Price (AED)</th>
                            <th>Total Price (AED)</th>
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
                              <strong>Total Amount (AED):</strong>
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
                                  <strong>Less Special Discount (AED):</strong>
                                </td>
                                <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                  {formatAED(data.Provision_for_Less_Special_Discount_AED)}
                                </td>
                              </tr>
                              <tr className="quotation-fitout-total-row">
                                <td colSpan={10} />
                                <td className="quotation-fitout-totals-label">
                                  <strong>Total Amount After Discount AED:</strong>
                                </td>
                                <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                  {formatAED(data.Total_amount_after_discount_AED)}
                                </td>
                              </tr>
                            </>
                          )}
                          <tr className="quotation-fitout-total-row">
                            <td colSpan={10} />
                            <td className="quotation-fitout-totals-label">
                              <strong>VAT 5% (AED):</strong>
                            </td>
                            <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                              {formatAED(data.VAT_5 ?? 0)}
                            </td>
                          </tr>
                          <tr className="quotation-fitout-total-row">
                            <td colSpan={10} />
                            <td className="quotation-fitout-totals-label">
                              <strong>Grand Total (AED):</strong>
                            </td>
                            <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                              {formatAED(data.Grand_Total_AED1 ?? 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}

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
                      <p className="quotation-fitout-terms-p">1. The following are excluded from our scope:</p>
                      <div className="quotation-fitout-notes-html" dangerouslySetInnerHTML={{ __html: notesHtml }} />
                    </>
                  ) : null}

                  <div className="quotation-fitout-terms">
                    <p>We trust our offer meets with your requirement &amp; look forward to your valued order confirmation.</p>
                    <p>Assuring you of our best services at all times.</p>
                  </div>
                </div>

                {/* Same as Door Core / Door Set 2: last-page-wrap + spacer keep footer at bottom of last page (and every page) */}
                <div className="quotation-fitout-last-page-wrap">
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
                  <div className="quotation-fitout-last-page-spacer" />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
