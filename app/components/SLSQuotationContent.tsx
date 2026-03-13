'use client'

import { QuotationData } from '@/lib/types'
import { formatCurrency } from '@/lib/quotation-utils'
import PrintButton from './PrintButton'

interface SLSQuotationContentProps {
  data: QuotationData
  shippingData?: any
  billingData?: any
  rawQuotationData?: any
}

export default function SLSQuotationContent({ data, shippingData, billingData, rawQuotationData }: SLSQuotationContentProps) {
  // Format date helper for DD.MM.YYYY format
  const formatSLSDate = (dateString?: string): string => {
    if (!dateString) return ''
    try {
      const dateMatch = dateString.match(/(\d{2})-(\w{3})-(\d{4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
          'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }
        const monthNum = monthMap[month] || '01'
        return `${day}.${monthNum}.${year}`
      }
      return dateString
    } catch {
      return dateString || ''
    }
  }

  // Format date for inquiry (DD.MM.YY)
  const formatInquiryDate = (dateString?: string): string => {
    if (!dateString) return ''
    try {
      const dateMatch = dateString.match(/(\d{2})-(\w{3})-(\d{4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
          'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }
        const monthNum = monthMap[month] || '01'
        const shortYear = year.slice(-2)
        return `${day}.${monthNum}.${shortYear}`
      }
      return dateString
    } catch {
      return dateString || ''
    }
  }

  // Use dynamic data from API
  const date = formatSLSDate(data.date || rawQuotationData?.Created_Date_and_time)
  const quotationRefNo = data.quotationNumber || rawQuotationData?.Name || ''
  const inquiryDate = formatInquiryDate(data.customerReferenceDate || rawQuotationData?.Customer_Reference_Date)
  const recipientName = shippingData?.Contact_Name || rawQuotationData?.Contact_Name || ''
  const recipientCompany = shippingData?.Shipping_Address_Name || rawQuotationData?.Shipping_Address_Name || billingData?.Billing_Address_Name || ''
  const recipientAddress = shippingData?.Shipping_Street || rawQuotationData?.Shipping_Street || ''
  const recipientCity = shippingData?.Shipping_City || rawQuotationData?.Shipping_City || ''
  const recipientState = `${shippingData?.Shipping_State || rawQuotationData?.Shipping_State || ''}, ${shippingData?.Shipping_Country || rawQuotationData?.Shipping_Country || 'India'}`.trim()
  
  // Transform line items from data
  const lineItems = data.lineItems?.map((item, index) => ({
    item: index + 1,
    product: `${item.product || ''}${item.quality ? `; ${item.quality}` : ''}`.trim(),
    qty: item.qty || '',
    unitPrice: parseFloat(item.rate?.replace(/,/g, '') || '0'),
    totalPrice: parseFloat(item.amount?.replace(/,/g, '') || '0')
  })) || []
  
  const pleaseNote = rawQuotationData?.Please_Note || data.remarks || ''
  const packing = rawQuotationData?.Packing || 'Included'
  const taxes = rawQuotationData?.Taxes || 'All taxes extra as applicable from time to time.'
  const payment = data.termsOfPayment || rawQuotationData?.Term_of_Payment || ''
  const quotationValidity = rawQuotationData?.Offer_Validity || '7 Days'
  const warrantyDisclaimer = rawQuotationData?.Warranty_Disclaimer || 'We declare that our products are wearing parts. Therefore, they are excluded from any warranty regulations.'
  const generalTerms = rawQuotationData?.General_Terms || 'All WMW goods and services are subject to the WMW General Terms and Conditions, a copy of which is available on the WMW website (www.wmwindia.com) or you may request a hard copy which we can send to you. This is in line with the wording on the website.'
  const closingStatement = rawQuotationData?.Closing_Statement || 'We hope that the above quotation is of interest and will gladly be of further help with any request you may have.'
  const contactPerson = rawQuotationData?.Payement || 'Mr. Milap Verma'
  const contactNumber = rawQuotationData?.Contact_Number || '(+91-9358584002)'
  const companyName = rawQuotationData?.Company_Name || 'WMW Industries Limited.'
  const companyFormerName = rawQuotationData?.Company_Former_Name || 'Formerly known as GKD India Limited'
  const registeredAddress = rawQuotationData?.Registered_Address || '52, Industrial Area, Jhotwara, Jaipur-302012, Rajasthan, India'
  const phone = rawQuotationData?.Phone || '+91 141 7105100'
  const email = rawQuotationData?.Email || 'info@wmwindia.com'
  const website = rawQuotationData?.Website || 'www.wmwindia.com'
  const registeredOffice = rawQuotationData?.Registered_Office || '# Imax Imperial, Room No. 1C, 1st floor, 101/5, S.N. Banerjee Road, Kolkata-700014, West Bengal, India'
  const tagline = rawQuotationData?.Tagline || 'Weaving Technical Mesh Solutions'
  const cin = rawQuotationData?.CIN || 'U51909WB2011PLC163277'
  const gstin = rawQuotationData?.GSTIN || billingData?.Billing_GST_No || shippingData?.Shipping_GST_No || '08AAECG2743F1ZS'
  const groupCompany = rawQuotationData?.Group_Company || 'A BVK Group Company'

  return (
    <>
      <div className="sls-quotation-container" style={{ maxWidth: '210mm', margin: '0 auto', padding: '10mm 20mm 20mm 20mm', fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.6' }}>
        {/* Header with Logo and Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', marginTop: 0 }}>
          {/* Left side - Empty for recipient info */}
          <div></div>
          
          {/* Right side - Logo, Company Name, and Date */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginTop: 0 }}>
            {/* WMW Logo - 150px */}
            <div style={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 0, paddingTop: 0 }}>
              <img 
                src="/wmw-logo.png" 
                alt="WMW Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', marginTop: 0 }}
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {/* Company Name */}
            <div style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', textAlign: 'right' }}>
              WMW INDUSTRIES LTD
            </div>
            {/* Date */}
            <div style={{ fontSize: '11px', textAlign: 'right' }}>
              <strong>Date:</strong> {date}
            </div>
          </div>
        </div>

        {/* Recipient Information */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '12px' }}>To,</div>
          <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>{recipientName}</div>
          <div style={{ marginBottom: '5px' }}>{recipientCompany}</div>
          <div style={{ marginBottom: '5px' }}>{recipientAddress}</div>
          <div style={{ marginBottom: '5px' }}>{recipientCity}</div>
          <div>{recipientState}</div>
        </div>

        {/* Quotation Reference */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Quotation Ref. No.:</strong> {quotationRefNo}
          </div>
          <div style={{ marginBottom: '20px' }}>
            Concerning your inquiry vide email dated {inquiryDate}, we are pleased to quote our price here.
          </div>
        </div>

        {/* Product Table */}
        <div style={{ marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Item</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Product</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>QTY/KG</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Unit Price/ INR</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Total Price/ INR</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.item}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{item.product}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.unitPrice, 'INR')}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.totalPrice, 'INR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Terms and Conditions */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Please Note:</strong> {pleaseNote}
          </div>
          <div style={{ marginBottom: '10px', borderTop: '1px solid #000', paddingTop: '10px', marginTop: '10px' }}>
            <strong>Packing:</strong> {packing}
          </div>
          <div style={{ marginBottom: '10px', borderTop: '1px solid #000', paddingTop: '10px', marginTop: '10px' }}>
            <strong>Taxes:</strong> {taxes}
          </div>
          <div style={{ marginBottom: '10px', borderTop: '1px solid #000', paddingTop: '10px', marginTop: '10px' }}>
            <strong>Payment:</strong> {payment}
          </div>
          <div style={{ marginBottom: '10px', borderTop: '1px solid #000', paddingTop: '10px', marginTop: '10px' }}>
            <strong>Quotation Validity Time:</strong> {quotationValidity}
          </div>
          <div style={{ marginBottom: '15px', marginTop: '15px' }}>
            {warrantyDisclaimer}
          </div>
          <div style={{ marginBottom: '15px' }}>
            {generalTerms}
          </div>
          <div style={{ marginBottom: '25px' }}>
            {closingStatement}
          </div>
        </div>

        {/* Contact Person */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{companyName}</div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Contact Person:</strong> {contactPerson} {contactNumber}
          </div>
        </div>

        {/* Signature Section */}
        <div style={{ marginBottom: '40px', marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ width: '200px' }}>
              <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '10px' }}>Signature</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', marginBottom: '4px' }}>Date: {date}</div>
            </div>
          </div>
        </div>

        {/* Footer - Company Details */}
        <div style={{ borderTop: '2px solid #000', paddingTop: '15px', marginTop: '40px', fontSize: '9px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ width: '60%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>WMW INDUSTRIES LIMITED</div>
              <div style={{ marginBottom: '8px', fontSize: '8px' }}>{companyFormerName}</div>
              <div style={{ marginBottom: '4px' }}>{registeredAddress}</div>
              <div style={{ marginBottom: '4px' }}>{phone} | {email} | {website}</div>
              <div style={{ marginTop: '8px' }}>
                <strong>Registered Office:</strong> {registeredOffice}
              </div>
            </div>
            <div style={{ width: '35%', textAlign: 'right' }}>
              <div style={{ marginBottom: '4px' }}>{tagline}</div>
              <div style={{ marginBottom: '4px' }}>CIN: {cin}</div>
              <div style={{ marginBottom: '4px' }}>GST: {gstin}</div>
              <div style={{ fontWeight: 'bold', marginTop: '8px' }}>{groupCompany}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: '24px', textAlign: 'center' }}>
        <PrintButton />
      </div>
    </>
  )
}
