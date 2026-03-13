'use client'

import { QuotationData } from '@/lib/types'
import { formatCurrency, numberToWords, formatDate } from '@/lib/quotation-utils'
import PrintButton from './PrintButton'

interface ExportQuotationContentProps {
  data: QuotationData
  shippingData?: any
  billingData?: any
  rawQuotationData?: any
}

export default function ExportQuotationContent({ data, shippingData, billingData, rawQuotationData }: ExportQuotationContentProps) {
  // Format date helper for Export format (DD-MMM-YYYY)
  const formatExportDate = (dateString?: string): string => {
    if (!dateString) return ''
    try {
      // If already in DD-MMM-YYYY format, return as is
      if (dateString.match(/\d{2}-\w{3}-\d{4}/)) {
        return dateString.split(' ')[0] // Remove time if present
      }
      // Try to parse and format
      const dateMatch = dateString.match(/(\d{2})-(\w{3})-(\d{4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        return `${day}-${month}-${year}`
      }
      return dateString
    } catch {
      return dateString || ''
    }
  }

  // Use dynamic data from API
  const quotationNumber = data.quotationNumber || rawQuotationData?.Name || ''
  const quotationDate = formatExportDate(data.date || rawQuotationData?.Created_Date_and_time)
  const buyerEnquiryNo = data.buyerEnquiryNo || data.customerReference || rawQuotationData?.customer_Reference || ''
  const buyerEnquiryDate = formatExportDate(data.customerReferenceDate || rawQuotationData?.Customer_Reference_Date)
  const email = rawQuotationData?.Invoice_Sent_Via === 'Email' ? (shippingData?.Email || billingData?.Email || '') : ''
  const otherReference = rawQuotationData?.Additional_info || ''
  const countryOfOrigin = rawQuotationData?.Billing_Country || 'India'
  const countryOfDestination = rawQuotationData?.Shipping_Country || shippingData?.Shipping_Country || ''
  const portOfLoading = rawQuotationData?.Port_of_Loading || ''
  const portOfDischarge = rawQuotationData?.Port_of_Discharge || ''
  const finalDestination = rawQuotationData?.Final_Destination || ''
  const modeOfDelivery = rawQuotationData?.Mode_of_Delivery || data.termsOfDelivery || ''
  const dispatchExWorks = rawQuotationData?.Delivery_Date_Control || data.deliveryDate || ''
  const termsOfPayment = data.termsOfPayment || rawQuotationData?.Term_of_Payment || ''
  const bankName = rawQuotationData?.Bank_Name || 'Indian Overseas Bank'
  const bankBranch = rawQuotationData?.Bank_Branch || 'Jaipur Branch'
  const swiftCode = rawQuotationData?.Swift_Code || 'IOBA0000102'
  const accountNumber = rawQuotationData?.Account_Number || '010200003059'
  const accountName = rawQuotationData?.Account_Name || 'WMW METAL FABRICS LTD'
  const hsCode = rawQuotationData?.HS_Code || '7314.1410'
  const offerValidity = rawQuotationData?.Offer_Validity || '7 Days'
  
  // Get product details from first line item if available
  const firstItem = data.lineItems && data.lineItems.length > 0 ? data.lineItems[0] : null
  const product = firstItem?.product || 'Stainless Steel Wire Cloth (Woven Type)'
  const form = firstItem?.form || ''
  const quality = firstItem?.quality || ''
  
  const currency = data.currency || rawQuotationData?.Currency || 'USD'
  const currencySymbol = currency
  const packingFreight = parseFloat(rawQuotationData?.Packing_Freight || '0') || 0
  const transaction = parseFloat(rawQuotationData?.Transaction_Charges || '0') || 0
  const totalWithCharges = data.totalAmount + packingFreight + transaction
  const amountInWords = numberToWords(totalWithCharges)
  const currencyWords = currency === 'USD' ? 'US Dollars' : currency === 'INR' ? 'Indian Rupees' : currency
  
  // Transform line items from data
  const lineItems = data.lineItems?.map((item, index) => ({
    item: index + 1,
    mesh: item.type || '',
    brand: '',
    size: item.size || '',
    sqmArea: item.subQty || '',
    quantity: item.qty || '',
    rate: parseFloat(item.rate?.replace(/,/g, '') || '0'),
    amount: parseFloat(item.amount?.replace(/,/g, '') || '0')
  })) || []
  
  const netWeightPerPcs = rawQuotationData?.Net_Weight_Per_Pcs || ''
  const totalNetWeight = rawQuotationData?.Total_Net_Weight || ''
  const totalGrossWeight = rawQuotationData?.Total_Gross_Weight || ''
  
  // Consignee details from shipping data
  const consigneeName = shippingData?.Shipping_Address_Name || rawQuotationData?.Shipping_Address_Name || ''
  const consigneeAddress = shippingData?.Shipping_Street || rawQuotationData?.Shipping_Street || ''
  const consigneeCity = shippingData?.Shipping_City || rawQuotationData?.Shipping_City || ''
  const consigneeCountry = shippingData?.Shipping_Country || rawQuotationData?.Shipping_Country || ''
  const kindAttn = shippingData?.Contact_Name || rawQuotationData?.Contact_Name || ''
  const remarks = data.remarks || rawQuotationData?.Remarks || ''

  return (
    <>
      <div className="export-quotation-container" style={{ maxWidth: '210mm', margin: '0 auto', padding: '8mm 15mm 15mm 15mm', fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4', border: '1px solid #000' }}>

        {/* Print table — thead repeats on every printed page */}
        <table className="export-print-table" style={{ width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '10px' }}>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '19%' }} />
          </colgroup>

          {/* ══ REPEATING HEADER ══ */}
          <thead className="export-print-header-row">
            <tr>
              <td colSpan={8} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="export-print-header" style={{ marginBottom: '15px', marginLeft: 0, marginRight: 0, padding: 0 }}>

                  {/* Title */}
                  <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    QUOTATION
                  </div>

                  {/* Header Section - Exporter + Quotation Details */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '15px', tableLayout: 'fixed', marginLeft: 0, marginRight: 0, boxSizing: 'border-box' }}>
                    <colgroup>
                      <col style={{ width: '50%' }} />
                      <col style={{ width: '50%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        {/* Left Column - Exporter */}
                        <td style={{ width: '50%', verticalAlign: 'top', borderRight: '1px solid #000', borderTop: '1px solid #000', borderBottom: '1px solid #000', borderLeft: '1px solid #000', padding: '12px', margin: 0 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Exporter</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <img
                                src="/wmw-logo.png"
                                alt="WMW Logo"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>METAL FABRICS</div>
                          </div>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>WMW METAL FABRICS LIMITED</div>
                          <div style={{ marginBottom: '2px' }}>53, Industrial Area: Jhotwara,</div>
                          <div style={{ marginBottom: '2px' }}>Jaipur 302012 India</div>
                          <div style={{ marginBottom: '2px' }}>Tel: +911417105151</div>
                          <div style={{ marginBottom: '2px' }}>info@wmwindia.com</div>
                          <div>www.wmwindia.com</div>
                        </td>

                        {/* Right Column - Quotation Details */}
                        <td style={{ width: '50%', verticalAlign: 'top', borderRight: '1px solid #000', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '12px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px' }}>
                            <tbody>
                              <tr>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Quotation No. & Date:</td>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{quotationNumber}, {quotationDate}</td>
                              </tr>
                              <tr>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Buyer&apos;s Enquiry No. & Date:</td>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{buyerEnquiryNo}, {buyerEnquiryDate}</td>
                              </tr>
                              <tr>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Email:</td>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{email}</td>
                              </tr>
                              <tr>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Other Reference (x):</td>
                                <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{otherReference}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                </div>{/* end export-print-header */}
              </td>
            </tr>
          </thead>

          {/* ══ BODY — every section is its own <tr> so thead repeats on page breaks ══ */}
          <tbody>

            {/* ── Consignee and Shipping Details (body — shown once, on first page only) ── */}
            <tr>
              <td colSpan={8} style={{ border: 'none', padding: 0, margin: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', tableLayout: 'fixed', marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0, boxSizing: 'border-box' }}>
                  <colgroup>
                    <col style={{ width: '50%' }} />
                    <col style={{ width: '50%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      {/* Left Column - Consignee */}
                      <td style={{ width: '50%', verticalAlign: 'top', borderRight: '1px solid #000', borderTop: '1px solid #000', borderBottom: '1px solid #000', borderLeft: '1px solid #000', padding: '12px', margin: 0 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Consignee:</div>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>{consigneeName}</div>
                        <div style={{ marginBottom: '2px', fontSize: '10px' }}>{consigneeAddress}</div>
                        <div style={{ marginBottom: '2px', fontSize: '10px' }}>{consigneeCity}</div>
                        <div style={{ marginBottom: '4px', fontSize: '10px' }}>{consigneeCountry}</div>
                        {kindAttn && (
                          <div style={{ marginTop: '4px', marginBottom: '15px', fontWeight: 'bold', fontSize: '10px' }}>
                            Kind Attn: {kindAttn}
                          </div>
                        )}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '15px' }}>
                          <tbody>
                            <tr>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Carriage by:</td>
                              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{modeOfDelivery}</td>
                            </tr>
                            <tr>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Port of Loading:</td>
                              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{portOfLoading}</td>
                            </tr>
                            <tr>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Port of Discharge:</td>
                              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{portOfDischarge || ''}</td>
                            </tr>
                            <tr>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Final Destination:</td>
                              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{finalDestination || portOfDischarge || ''}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      {/* Right Column - Country, Payment, Dispatch */}
                      <td style={{ width: '50%', verticalAlign: 'top', borderRight: '1px solid #000', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                          <tbody>
                            <tr>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Country of Origin of Goods:</td>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{countryOfOrigin}</td>
                            </tr>
                            <tr>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Country of Final Destination:</td>
                              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{countryOfDestination}</td>
                            </tr>
                            <tr>
                              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Terms of Payment:</td>
                            </tr>
                            <tr>
                              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '10px' }}>{termsOfPayment}</td>
                            </tr>
                            <tr>
                              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold', fontSize: '10px', backgroundColor: '#1e40af', color: '#fff' }}>OUR BANKER:</td>
                            </tr>
                            <tr>
                              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '9px' }}>
                                {bankName}, {bankBranch}
                                {swiftCode && ` (Swift no. ${swiftCode})`}
                                {accountNumber && ` Account ${accountNumber} of ${accountName}, Jaipur INDIA`}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Dispatch Ex-Works:</td>
                            </tr>
                            <tr>
                              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '10px' }}>{dispatchExWorks}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Description of Goods: header row ── */}
            <tr>
              <td colSpan={5} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                Description of Goods
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Quantity<br />UOM
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Rate<br />USD / UOM
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                Amount<br />USD
              </td>
            </tr>

            {/* ── Product / Form / Quality ── */}
            <tr>
              <td colSpan={5} style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '8px 6px 4px 6px', verticalAlign: 'top' }}>
                <div style={{ marginBottom: '3px' }}><strong>Product :</strong> {product}</div>
                <div style={{ marginBottom: '3px' }}><strong>Form :</strong> {form}</div>
                <div><strong>Quality :</strong> {quality}</div>
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '6px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '6px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '6px' }}></td>
            </tr>

            {/* ── Sub-header: Item / MESH / BRAND / SIZE / Sqm Area ── */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold' }}>Item</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>MESH</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>BRAND</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>SIZE [Mtrs] (LxW)</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>Sqm Area / PC</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}></td>
            </tr>

            {/* ── Line Items ── */}
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.item}</td>
                <td style={{ borderRight: '1px solid #000', padding: '6px' }}>{item.mesh || ''}</td>
                <td style={{ borderRight: '1px solid #000', padding: '6px' }}>{item.brand || ''}</td>
                <td style={{ borderRight: '1px solid #000', padding: '6px' }}>{item.size || ''}</td>
                <td style={{ borderRight: '1px solid #000', padding: '6px' }}>{item.sqmArea || ''}</td>
                <td style={{ borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.quantity} Pcs</td>
                <td style={{ borderRight: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(item.rate, currency)}</td>
                <td style={{ borderRight: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(item.amount, currency)}</td>
              </tr>
            ))}

            {/* ── Spacer ── */}
            <tr>
              <td colSpan={5} style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '8px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '8px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '8px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '8px' }}></td>
            </tr>

            {/* ── Weight Details ── */}
            <tr>
              <td colSpan={5} style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '4px 6px 10px 6px', fontSize: '9px', verticalAlign: 'top' }}>
                <div style={{ marginBottom: '3px' }}>
                  <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Net Weight (Per Pcs.)</span> :&nbsp;{netWeightPerPcs} Kgs. (± 5%)
                </div>
                <div style={{ marginBottom: '3px' }}>
                  <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Total Net Weight</span> :&nbsp;{totalNetWeight} Kgs. (± 5%)
                </div>
                <div>
                  <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Total Gross Weight</span> :&nbsp;{totalGrossWeight} Kgs. (± 5%)
                </div>
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '6px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '6px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '6px' }}></td>
            </tr>

            {/* ── Spacer ── */}
            <tr>
              <td colSpan={5} style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '8px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '8px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '8px' }}></td>
              <td style={{ borderRight: '1px solid #000', padding: '8px' }}></td>
            </tr>

            {/* ── Packing / Freight ── */}
            {packingFreight > 0 && (
              <tr>
                <td colSpan={7} style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px' }}>
                  Packing, Freight &amp; Forwarding charges upto {finalDestination || portOfDischarge || 'Benapole'}, {countryOfDestination} by {modeOfDelivery}:
                </td>
                <td style={{ borderRight: '1px solid #000', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(packingFreight, currency)}
                </td>
              </tr>
            )}

            {/* ── Transaction Charges ── */}
            {transaction > 0 && (
              <tr>
                <td colSpan={7} style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'right', color: '#0000CD' }}>
                  Add.: Transaction charges
                </td>
                <td style={{ borderRight: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold', color: '#0000CD' }}>
                  {formatCurrency(transaction, currency)}
                </td>
              </tr>
            )}

            {/* ── Transport ── */}
            <tr>
              <td colSpan={7} style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontWeight: 'bold' }}>
                Transport
              </td>
              <td style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px 6px' }}></td>
            </tr>

            {/* ── Total CFR ── */}
            <tr>
              <td colSpan={7} style={{ borderBottom: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontWeight: 'bold' }}>
                Total CFR Price upto {finalDestination || portOfDischarge || 'Benapole'} By {modeOfDelivery}:
              </td>
              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px 6px' }}></td>
            </tr>

            {/* ── Note + Currency + Total ── */}
            <tr>
              <td colSpan={6} style={{ borderBottom: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', fontSize: '9px', verticalAlign: 'top' }}>
                {transaction > 0 && (
                  <span>Note : If the total order value is less than {currencySymbol} 2500, transaction fee of {currencySymbol} 100 per invoice shall be charged extra</span>
                )}
              </td>
              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                {currency}
              </td>
              <td style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(totalWithCharges, currency)}
              </td>
            </tr>

            {/* ── Amount Chargeable ── */}
            <tr>
              <td colSpan={1} style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', fontWeight: 'bold', fontSize: '9px', verticalAlign: 'top' }}>
                Amount<br />Chargeable<br />(In words) :
              </td>
              <td colSpan={5} style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', fontSize: '9px', fontWeight: 'bold' }}>
                {currencyWords} {amountInWords} Only
              </td>
              <td style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'right' }}>
                Total:-
              </td>
              <td style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(totalWithCharges, currency)}
              </td>
            </tr>

            {/* ── HS Code & Remarks ── */}
            {(hsCode || remarks) && (
              <tr>
                <td colSpan={8} style={{ padding: '10px 0 0 0', fontSize: '10px' }}>
                  {hsCode && <div><strong>HS Code:</strong> {hsCode}</div>}
                  {remarks && (
                    <div style={{ marginTop: '6px' }}>
                      <strong>Remarks:</strong>
                      <div style={{ marginTop: '4px', whiteSpace: 'pre-line', fontSize: '9px' }}>{remarks}</div>
                    </div>
                  )}
                </td>
              </tr>
            )}

            {/* ── Footer ── */}
            <tr>
              <td colSpan={8} style={{ padding: '30px 0 0 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '50%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}></td>
                      <td style={{ width: '50%', verticalAlign: 'top', border: '1px solid #000', padding: '12px', textAlign: 'right' }}>
                        <div style={{ marginBottom: '8px', fontSize: '10px' }}>
                          <strong>Offer Validity:</strong> {offerValidity}
                        </div>
                        <div style={{ marginBottom: '20px', fontSize: '10px', fontWeight: 'bold' }}>
                          For WMW Metal Fabrics Ltd.
                        </div>
                        <div style={{ marginBottom: '8px', fontSize: '9px', fontStyle: 'italic' }}>
                          This is an electronically generated document, doesn&apos;t require a signature.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '10px' }}>
                          <div style={{ width: '150px', borderTop: '1px solid #000', paddingTop: '4px' }}>Signature</div>
                          <div>&amp; Date: {quotationDate}</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

          </tbody>
        </table>{/* end export-print-table */}

      </div>

      <div className="no-print" style={{ marginTop: '24px', textAlign: 'center' }}>
        <PrintButton />
      </div>
    </>
  )
}
