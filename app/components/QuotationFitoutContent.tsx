'use client'

import { Fragment, useEffect, useState } from 'react'
import {
  QuotationLogFitout2Data,
  QuotationLogFitout2Item,
  QuotationLogFitout2Item1,
  QuotationLogFitout2ManualItem,
  QuotationLogFitout2SubItem,
} from '@/lib/types'
import DirhamSymbol from './DirhamSymbol'
import { formatQuotationNo } from '@/lib/quotation-utils'

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

/** Normalized product-line row for Fitout subform tables */
type FitoutSectionRow = {
  slNo?: string | number | null
  description?: string | null
  unit?: string | null
  qty?: string | number | null
  unitPrice?: string | number | null
  totalPrice?: string | number | null
}

type FitoutProductSection = {
  header?: string
  rows: FitoutSectionRow[]
  subTotal?: string | number | null
}

/** Single combined product table for all Fitout sections (no gaps between Joinery / Civil / etc.) */
function FitoutCombinedProductTable({ sections }: { sections: FitoutProductSection[] }) {
  const visible = sections.filter((section) => section.rows.length > 0)
  if (visible.length === 0) return null

  return (
    <table className="quotation-fitout-product-table quotation-fitout-subform-table quotation-fitout-combined-table">
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
          <th>
            Unit
            <br />
            Price
            <br />(<DirhamSymbol />)
          </th>
          <th>
            Total
            <br />
            Price
            <br />(<DirhamSymbol />)
          </th>
        </tr>
      </thead>
      <tbody>
        {visible.map((section, sectionIdx) => {
          const headerText = (section.header ?? '').trim()
          return (
            <Fragment key={sectionIdx}>
              {headerText && (
                <tr className="quotation-fitout-subform-section-header-row">
                  <th colSpan={6} className="quotation-fitout-subform-section-title">
                    {headerText}
                  </th>
                </tr>
              )}
              {section.rows.map((record, idx) => (
                <tr key={`${sectionIdx}-${idx}`}>
                  <td>{record.slNo ?? ''}</td>
                  <td>{record.description ?? ''}</td>
                  <td>{record.unit ?? ''}</td>
                  <td className="quotation-fitout-text-right">{record.qty ?? ''}</td>
                  <td className="quotation-fitout-text-right">
                    {record.unitPrice != null ? formatAED(record.unitPrice) : ''}
                  </td>
                  <td className="quotation-fitout-text-right">
                    {record.totalPrice != null ? formatAED(record.totalPrice) : ''}
                  </td>
                </tr>
              ))}
              {hasValue(section.subTotal) && (
                <tr className="quotation-fitout-subtotal">
                  <td colSpan={4} />
                  <td>
                    <strong>Sub Total:</strong>
                  </td>
                  <td className="quotation-fitout-text-right">{formatAED(section.subTotal)}</td>
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
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
      return { name, designation: 'Sales Manager', contact: '+971 50 942 1886', signature }
    case 'Santosh P.B':
      return { name, designation: 'Sr. Manager', contact: '+971 50 896 1908', signature }
    case 'Dawood Hussain':
      return { name, designation: 'Project Sales Manager', contact: '+971 52 804 6858', signature }
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
    location: 'Unit 1004, Le Solarium Tower,\nDubai Silicon Oasis,\nDubai, U.A.E',
    phone: '+971 42986983',
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
function FooterBandContent({
  footerData,
  pageLabel,
}: {
  footerData: FooterData
  pageLabel: string
}) {
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
            Unit 1004, Le Solarium Tower,<br />
            Dubai Silicon Oasis,<br />
            Dubai, U.A.E
          </span>
        </span>
      </div>
      <div className="quotation-fitout-footer-bottom-bar">
        <span className="quotation-fitout-page-number" data-fitout-page-label>
          {pageLabel}
        </span>
        <p className="quotation-fitout-footer-signature-note">
          ** This is a computer generated quotation and hence does not require a signature. **
        </p>
      </div>
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
  const hasSalesPerson = hasValue(data.Sales_Person)
  const approvalStatus = (data.SalesPerson_Approval_Status ?? data.Approval ?? '').toString().trim()
  const showSignature = approvalStatus === 'Approved' && viewMode === 'approved' && hasSalesPerson
  const hasDiscount =
    data.Provision_for_Less_Special_Discount_AED != null &&
    Number(data.Provision_for_Less_Special_Discount_AED) !== 0
  const hasVat = data.VAT_5 != null && parseAED(data.VAT_5) !== 0
  const hasTotalAmount = hasValue(data.Total_Amount_AED1)
  const hasGrandTotal = hasValue(data.Grand_Total_AED1)
  const hasAmountAfterDiscount = hasValue(data.Total_amount_after_discount_AED)

  const [pageLabel, setPageLabel] = useState('Page 1')

  useEffect(() => {
    const PX_PER_MM = 96 / 25.4
    const pageContentPx = (297 - 10 - 16) * PX_PER_MM
    const update = () => {
      const root = document.querySelector<HTMLElement>('.quotation-fitout-container')
      if (!root) return
      const headerH = root.querySelector('.quotation-fitout-header-cell')?.getBoundingClientRect().height ?? 0
      const footerH = root.querySelector('.quotation-fitout-footer-cell')?.getBoundingClientRect().height ?? 0
      const bodyH = root.querySelector('.quotation-fitout-body-cell')?.getBoundingClientRect().height ?? 0
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
  const manuallyFilledTotal = manuallyFilled.reduce((sum, record) => sum + parseAED(record.Amount), 0)
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
              <FooterBandContent footerData={footerData} pageLabel={pageLabel} />
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
                        <div className="quotation-fitout-details-value">{formatQuotationNo(data.Quotation_No)}</div>
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
                          <th className="quotation-fitout-text-right">Amount (<DirhamSymbol />)</th>
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
                        {hasVat && (
                          <tr className="quotation-fitout-manual-items-vat">
                            <td colSpan={2}>
                              <strong>
                                VAT 5% (<DirhamSymbol />)
                              </strong>
                            </td>
                            <td className="quotation-fitout-text-right">
                              <strong>{formatAED(data.VAT_5)}</strong>
                            </td>
                          </tr>
                        )}
                        <tr className="quotation-fitout-manual-items-total">
                          <td colSpan={2}>
                            <strong>
                              Total Amount (<DirhamSymbol />)
                            </strong>
                          </td>
                          <td className="quotation-fitout-text-right">
                            <strong>
                              {formatAED(
                                hasGrandTotal
                                  ? data.Grand_Total_AED1
                                  : hasTotalAmount
                                    ? data.Total_Amount_AED1
                                    : manuallyFilledTotal
                              )}
                            </strong>
                          </td>
                        </tr>
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

                {/* Cover letter closes with closing lines + signature; pricing starts on the next page (CSS break-before). */}
                <div className={`quotation-fitout-last-page-wrap${hasAnyRows ? ' quotation-fitout-cover-close' : ''}`}>
                  <div className="quotation-fitout-terms">
                    <p>We trust our offer meets with your requirement &amp; look forward to your valued order confirmation.</p>
                    <p>Assuring you of our best services at all times.</p>
                  </div>
                  <div className="quotation-fitout-signature-block">
                    <p className="quotation-fitout-signature-greeting">Thanks and Regards</p>
                    {hasValue(footerData.trade_name) && (
                      <p className="quotation-fitout-signature-team">
                        <strong>For Ideal Fitout Decspapers Design &amp; Fit-Out Co. L.L.C</strong>
                      </p>
                    )}
                    {hasSalesPerson && (
                      <>
                        <p className="quotation-fitout-signature-detail">{salesDetails.name}</p>
                        <p className="quotation-fitout-signature-detail">{salesDetails.designation}</p>
                        <p className="quotation-fitout-signature-detail">{salesDetails.contact}</p>
                      </>
                    )}
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
                      <div className="quotation-fitout-signature-block-spacer" />
                    )}
                  </div>
                  {!hasAnyRows && <div className="quotation-fitout-last-page-spacer" />}
                </div>

                {hasAnyRows && (
                <div className="quotation-fitout-pricing-section">
                  <FitoutCombinedProductTable
                    sections={[
                      {
                        header: data.Subform_Header,
                        subTotal: data.Sub_Total,
                        rows: items.map((record) => ({
                          slNo: record.S_No1,
                          description: record.Item_Description,
                          unit: record.Unit,
                          qty: record.Quantity1,
                          unitPrice: record.Unit_Price,
                          totalPrice: record.Amount_AED1,
                        })),
                      },
                      {
                        header: data.Subform_Header1,
                        subTotal: data.Sub_Total1,
                        rows: items1.map((record) => ({
                          slNo: record.S_No1,
                          description: record.Item_Description,
                          unit: record.Unit1,
                          qty: record.Quantity1,
                          unitPrice: record.Unit_Price1,
                          totalPrice: record.Amount_AED,
                        })),
                      },
                      {
                        header: data.Subform_Header2,
                        subTotal: data.Sub_Total2,
                        rows: subForm1.map((record) => ({
                          slNo: record.S_No1,
                          description: record.Item_Description,
                          unit: record.Unit1,
                          qty: record.Qty1,
                          unitPrice: record.Unit_Price1,
                          totalPrice: record.Amount_AED,
                        })),
                      },
                      {
                        header: data.Subform_Header3,
                        subTotal: data.Sub_Total3,
                        rows: subForm2.map((record) => ({
                          slNo: record.S_No1,
                          description: record.Item_Description,
                          unit: record.Unit1,
                          qty: record.Qty1,
                          unitPrice: record.Unit_Price1,
                          totalPrice: record.Amount_AED,
                        })),
                      },
                    ]}
                  />

                  {/* Totals: only when there is at least one row in any section */}
                  {hasAnyRows && (hasTotalAmount || hasDiscount || hasVat || hasGrandTotal) && (
                    <div className="quotation-fitout-totals-block">
                      <table className="quotation-fitout-product-table quotation-fitout-totals-table">
                        <tbody>
                          {hasTotalAmount && (
                            <tr className="quotation-fitout-total-row">
                              <td colSpan={10} />
                              <td className="quotation-fitout-totals-label">
                                <strong>Total Amount (<DirhamSymbol />):</strong>
                              </td>
                              <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                {formatAED(data.Total_Amount_AED1)}
                              </td>
                            </tr>
                          )}
                          {hasDiscount && (
                            <>
                              <tr className="quotation-fitout-total-row">
                                <td colSpan={10} />
                                <td className="quotation-fitout-totals-label">
                                  <strong>Less Special Discount (<DirhamSymbol />):</strong>
                                </td>
                                <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                  {formatAED(data.Provision_for_Less_Special_Discount_AED)}
                                </td>
                              </tr>
                              {hasAmountAfterDiscount && (
                                <tr className="quotation-fitout-total-row">
                                  <td colSpan={10} />
                                  <td className="quotation-fitout-totals-label">
                                    <strong>Total Amount After Discount (<DirhamSymbol />):</strong>
                                  </td>
                                  <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                    {formatAED(data.Total_amount_after_discount_AED)}
                                  </td>
                                </tr>
                              )}
                            </>
                          )}
                          {hasVat && (
                            <tr className="quotation-fitout-total-row">
                              <td colSpan={10} />
                              <td className="quotation-fitout-totals-label">
                                <strong>VAT 5% (<DirhamSymbol />):</strong>
                              </td>
                              <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                {formatAED(data.VAT_5)}
                              </td>
                            </tr>
                          )}
                          {hasGrandTotal && (
                            <tr className="quotation-fitout-total-row">
                              <td colSpan={10} />
                              <td className="quotation-fitout-totals-label">
                                <strong>Grand Total (<DirhamSymbol />):</strong>
                              </td>
                              <td className="quotation-fitout-totals-value quotation-fitout-text-right">
                                {formatAED(data.Grand_Total_AED1)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
        <FooterBandContent footerData={footerData} pageLabel={pageLabel} />
      </div>
    </div>
  )
}
