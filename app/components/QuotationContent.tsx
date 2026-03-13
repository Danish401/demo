'use client'

import Link from 'next/link'
import { QuotationData } from '@/lib/types'
import { formatCurrency } from '@/lib/quotation-utils'
import { calculateTax } from '@/lib/tax-calculator'

/** True if field has displayable value (hide row when false) */
function hasValue(v: unknown): boolean {
  if (v == null) return false
  const s = String(v).trim()
  return s !== ''
}

interface QuotationContentProps {
  data: QuotationData
  shippingData?: any
  billingData?: any
}

const headerSupplierCell = (
  <td style={{ width: '55%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Supplier</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img 
          src="/wmw-logo.png" 
          alt="WMW Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>METAL FABRICS</div>
    </div>
    <div style={{ fontWeight: 'bold' }}>WMW Metal Fabrics Ltd</div>
    <div>53, Industrial Area, Jhotwara, Jaipur-302012, Rajasthan, India</div>
    <div>Tel: +91.141.7105151</div>
    <div>www.wmwindia.com</div>
    <div>info@wmwindia.com</div>
    <div>GSTIN: 08AAACW2620D1Z8</div>
    <div>CIN: U27109WB1995PLC068681</div>
  </td>
)

export default function QuotationContent({ data, shippingData, billingData }: QuotationContentProps) {
  // Calculate taxes based on billing state
  const billingState = billingData?.Billing_State || ''
  const taxableAmount = data.totalAmount
  const taxCalculation = calculateTax(billingState, taxableAmount)

  const headerQuotationCell = (
    <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
      <table style={{ width: '100%', border: 'none' }}>
        <tbody>
          {hasValue(data.quotationNumber) && (
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Quotation No</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{data.quotationNumber}</td></tr>
          )}
          {hasValue(data.date) && (
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Date</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{data.date}</td></tr>
          )}
          {hasValue(data.buyerEnquiryNo) && (
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Buyer&apos;s Enquiry No</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{data.buyerEnquiryNo}</td></tr>
          )}
          {hasValue(data.termsOfPayment) && (
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Payment</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{data.termsOfPayment}</td></tr>
          )}
          {hasValue(data.incoTerms) && (
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Inco Terms</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{data.incoTerms}</td></tr>
          )}
          {hasValue(data.termsOfDelivery) && (
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Delivery</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{data.termsOfDelivery}</td></tr>
          )}
        </tbody>
      </table>
    </td>
  )

  const totalAmount = formatCurrency(data.totalAmount)

  return (
    <>
      {/* Quotation Content Div - All content until Remarks */}
      <div className="quotation-content-section" style={{ border: '1px solid #000', padding: '16px', marginBottom: '24px' }}>
      {/* Title - Show at the top of first page only */}
      <p className="quotation-title" style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase', marginTop: 0 }}>
        QUOTATION
      </p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
        <thead className="repeating-header">
          <tr>
            {headerSupplierCell}
            {headerQuotationCell}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2} style={{ border: 'none', padding: 0 }}>

      {/* Consignee and Recipient */}
      <table style={{ marginTop: '12px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', border: '1px solid #000', padding: '12px', verticalAlign: 'top' }}>
              <div className="section-title">Detail Of Consignee/Shipped To</div>
              {shippingData ? (
                <>
                  {shippingData.Shipping_Address_Name && (
                    <div style={{ fontWeight: 'bold', marginTop: '6px' }}>{shippingData.Shipping_Address_Name}</div>
                  )}
                  {shippingData.Parent_Account && (
                    <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{shippingData.Parent_Account}</div>
                  )}
                  {shippingData.Shipping_Street && (
                    <div>{shippingData.Shipping_Street}</div>
                  )}
                  {shippingData.Shipping_City && (
                    <div>
                      {shippingData.Shipping_City}
                      {shippingData.Shipping_State && `, ${shippingData.Shipping_State}`}
                      {shippingData.Shipping_Postal_Code && ` ${shippingData.Shipping_Postal_Code}`}
                    </div>
                  )}
                  {shippingData.Shipping_Country && (
                    <div>{shippingData.Shipping_Country}</div>
                  )}
                  <table style={{ marginTop: '8px', width: '100%' }}>
                    <tbody>
                      {shippingData.Shipping_State && (
                        <tr><td style={{ padding: '4px' }}>State</td><td style={{ padding: '4px' }}>{shippingData.Shipping_State}</td></tr>
                      )}
                      {shippingData.Shipping_GST_No && (
                        <tr><td style={{ padding: '4px' }}>GST Number</td><td style={{ padding: '4px' }}>{shippingData.Shipping_GST_No}</td></tr>
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#666' }}>No shipping data available</div>
              )}
            </td>
            <td style={{ width: '50%', border: '1px solid #000', padding: '12px', verticalAlign: 'top' }}>
              <div className="section-title">Detail Of Recipient/Billed To</div>
              {billingData ? (
                <>
                  {billingData.Billing_Address_Name && (
                    <div style={{ fontWeight: 'bold', marginTop: '6px' }}>{billingData.Billing_Address_Name}</div>
                  )}
                  {billingData.Parent_Account && (
                    <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{billingData.Parent_Account}</div>
                  )}
                  {billingData.Billing_Street && (
                    <div>{billingData.Billing_Street}</div>
                  )}
                  {billingData.Billing_City && (
                    <div>
                      {billingData.Billing_City}
                      {billingData.Billing_State && `, ${billingData.Billing_State}`}
                      {billingData.Billing_Postal_Code && ` ${billingData.Billing_Postal_Code}`}
                    </div>
                  )}
                  {billingData.Billing_Country && (
                    <div>{billingData.Billing_Country}</div>
                  )}
                  <table style={{ marginTop: '8px', width: '100%' }}>
                    <tbody>
                      {billingData.Billing_State && (
                        <tr><td style={{ padding: '4px' }}>State</td><td style={{ padding: '4px' }}>{billingData.Billing_State}</td></tr>
                      )}
                      {billingData.Billing_GST_No && (
                        <tr><td style={{ padding: '4px' }}>GST Number</td><td style={{ padding: '4px' }}>{billingData.Billing_GST_No}</td></tr>
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#666' }}>No billing data available</div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Description Of Goods */}
      <div className="section-title" style={{ marginTop: '12px' }}>Description Of Goods</div>
      <table className="goods-description-table">
        <thead>
          <tr>
            <th style={{ width: '40%', textAlign: 'left' }}>Product / Quality / Form / Size / Type</th>
            <th style={{ width: '12%' }}>Delivery</th>
            <th style={{ width: '8%' }}>UOM</th>
            <th style={{ width: '15%' }}>Quantity</th>
            <th style={{ width: '12%', textAlign: 'right' }}>Rate/SQM</th>
            <th style={{ width: '13%', textAlign: 'right' }}>Amount INR</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.length > 0 ? (
            data.lineItems.map((row, i) => (
              <tr key={i}>
                <td style={{ verticalAlign: 'top' }}>
                  <div><strong>Product</strong>: {row.product}</div>
                  {row.quality && <div><strong>Quality</strong>: {row.quality}</div>}
                  {row.form && <div><strong>Form</strong>: {row.form}</div>}
                  {row.size && <div><strong>Size</strong>: {row.size}</div>}
                  {row.type && <div><strong>Type</strong>: {row.type}</div>}
                </td>
                <td>{row.delivery}</td>
                <td>{row.uom}</td>
                <td>
                  {row.qty}
                  {row.pieces && <><br />{row.pieces}</>}
                </td>
                <td className="text-right">{row.rate}</td>
                <td className="text-right">{row.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No line items found
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-right font-bold">Total {data.currency}</td>
            <td className="text-right font-bold">{totalAmount}</td>
          </tr>
        </tfoot>
      </table>

      {/* Bottom section: Validity, Charges, Notes (left) | Calculation (right) */}
      <table style={{ marginTop: '12px' }}>
        <tbody>
          <tr>
            <td style={{ width: '55%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
              <div style={{ marginBottom: '8px' }}><strong>QUOTATION VALIDITY:</strong> 07 Days from the date of Quotation</div>
              <table style={{ marginBottom: '12px' }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Freight</th>
                    <th>Insurance</th>
                    <th>Packing</th>
                    <th>HSN Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td>Excl</td>
                    <td>Incl</td>
                    <td>Excl</td>
                    <td>Stainless Steel Wire Cloth 7314<br />PB Wire Cloth 7419</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Notes</div>
              <div style={{ border: '1px solid #000', minHeight: '60px', padding: '8px', whiteSpace: 'pre-wrap' }}>
                {data.remarks || ''}
              </div>
            </td>
            <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
              <table style={{ width: '100%', border: 'none' }}>
                <tbody>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}>Freight Charge</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}>Packing Charges</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}>Seam Charges</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0', fontWeight: 'bold' }}>Total Amount Before Tax</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(taxableAmount)}</td></tr>
                  {taxCalculation.cgstRate > 0 && (
                    <tr><td style={{ border: 'none', padding: '4px 0' }}>Add CGST @ {taxCalculation.cgstRate}%</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.cgstAmount)}</td></tr>
                  )}
                  {taxCalculation.sgstRate > 0 && (
                    <tr><td style={{ border: 'none', padding: '4px 0' }}>Add SGST @ {taxCalculation.sgstRate}%</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.sgstAmount)}</td></tr>
                  )}
                  {taxCalculation.igstRate > 0 && (
                    <tr><td style={{ border: 'none', padding: '4px 0' }}>Add IGST @ {taxCalculation.igstRate}%</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.igstAmount)}</td></tr>
                  )}
                  {taxCalculation.cgstRate === 0 && taxCalculation.sgstRate === 0 && taxCalculation.igstRate === 0 && (
                    <>
                      <tr><td style={{ border: 'none', padding: '4px 0' }}>Add CGST @</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                      <tr><td style={{ border: 'none', padding: '4px 0' }}>Add SGST @</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                      <tr><td style={{ border: 'none', padding: '4px 0' }}>Add IGST @</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                    </>
                  )}
                  <tr><td style={{ border: 'none', padding: '4px 0' }}>Tax Amount GST</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.taxAmount)}</td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0', fontWeight: 'bold' }}>Total Amount After GST</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(taxCalculation.totalAfterTax)}</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="amount-in-words">
        <strong>Amount Chargeable (in words):-</strong> {data.currency} {formatCurrency(taxCalculation.totalAfterTax)} Only
      </div>

      {/* Remarks and Authorization */}
      <table style={{ marginTop: '12px' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Remarks:-</div>
              <ol style={{ marginLeft: '20px', lineHeight: 1.6 }}>
                <li>We hope you will find the offer as per your needs. We request you to release your valued PO at the earliest.</li>
                <li>Please mention this quotation number on your PO and all communications.</li>
                <li>This quotation is valid only for the products & quantity mentioned.</li>
                <li>Mentioned delivery date is from date of confirmed PO other terms if any.</li>
                <li>Subjects to terms and conditions closed.</li>
              </ol>
            </td>
            <td style={{ width: '40%', verticalAlign: 'top', border: '1px solid #000', padding: '12px', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>For WMW Metal Fabrics Ltd.</div>
              <div>Computer Generated Document</div>
              <div>No Signature Needed</div>
              <div style={{ marginTop: '8px' }}>Dated: {data.date}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '10px' }}>DOC NO. WMW/MKT/F.1 (Rev.00)</div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <div className="no-print" style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/conditions" style={{ color: '#1e40af', textDecoration: 'underline' }}>
          View Standard Conditions of Sale
        </Link>
      </div>

      {/* Standard Conditions of Sale - included for printing */}
      <div className="conditions-for-print conditions-doc" style={{ border: '1px solid #000', padding: '16px' }}>
        <h1>STANDARD CONDITIONS OF SALE:</h1>
        <p>
          The following conditions apply to all business conducted by WMW Metal Fabrics Ltd. (&quot;The Company&quot;) with the recipient (&quot;The Buyer&quot;). These conditions are effective on the date of the invoice.
        </p>
        <div className="section">
          <div className="section-title">1. CONTRACT:</div>
          <p><strong>1.1.</strong> All quotations and orders are subject to these conditions. In case of inconsistency, these conditions prevail over the Buyer&apos;s conditions of purchase or supply. The Buyer irrevocably accepts these conditions.</p>
          <p><strong>1.2.</strong> The contract is not assignable. The Buyer cannot withdraw without specific written agreement from the company. Upon withdrawal, the Buyer must pay the full contract price.</p>
        </div>
        <div className="section">
          <div className="section-title">2. DELIVERY:</div>
          <p><strong>2.1.</strong> Goods will be delivered to the specified location on the acceptance of order. Dates are specified by the company. Company not liable for failure to deliver goods if it doesn&apos;t constitute a breach of contract or negligence.</p>
          <p><strong>2.2.</strong> If the Buyer fails to take delivery, the company has the right to charge for handling and storage (1% per week of invoice price, up to 50%) and additional transportation costs.</p>
          <p><strong>2.3.</strong> If delivery is by installment and the Company makes defective deliveries in one or more installments, the Buyer is not entitled to repudiate the whole contract.</p>
          <p><strong>2.4.</strong> If goods are not collected within three months of notification, the company reserves the right to recall and recover the full price.</p>
        </div>
        <div className="section">
          <div className="section-title">3. RISK:</div>
          <p><strong>3.1.</strong> Risk passes to the Buyer as soon as goods are dispatched. Buyer is responsible for all loss, damage, or deterioration.</p>
        </div>
        <div className="section">
          <div className="section-title">4. PRICE:</div>
          <p><strong>4.1.</strong> The price quoted is the current price. The Company reserves the right to adjust the price due to cost increases (e.g., currency fluctuations, wages, materials, transport, overhead).</p>
          <p><strong>4.2.</strong> If the Buyer initiates design or specification changes, the company may adjust the price accordingly.</p>
        </div>
        <div className="section">
          <div className="section-title">5. PAYMENT:</div>
          <p><strong>5.1.</strong> Each consignment is separately invoiced and paid for. Payment is to be made to the Company&apos;s Bank in Jaipur, India.</p>
          <p><strong>5.2.</strong> Payment is due in full upon goods leaving the company or expiry of any agreed extended payment period. If not paid on due date, the outstanding balance becomes immediately due and payable with interest charged at 10% over the bank rate.</p>
        </div>
        <div className="section">
          <div className="section-title">6. CLAIMS:</div>
          <p><strong>6.1.</strong> Buyer is not entitled to claims for repairs/alterations without company&apos;s written consent, or for defects arising from normal wear and tear or accident.</p>
          <p><strong>6.2.</strong> Company&apos;s liability is limited to the ex-factory price of the goods; not liable for consequential or indirect loss or damage. No warranty for performance. Complaints not accepted after 6 months from invoice date. Any liability ceases after 12 months.</p>
          <p><strong>6.3.</strong> Company may rescind the contract or suspend deliveries under specific circumstances:</p>
          <p><strong>6.3.1.</strong> Any sum due from the Buyer to the Company is unpaid.</p>
          <p><strong>6.3.2.</strong> The Buyer is in breach of any contract provision.</p>
          <p><strong>6.3.3.</strong> The Buyer becomes bankrupt, insolvent, or unable to pay debts.</p>
          <p><strong>6.3.4.</strong> The company is unable to deliver goods as per the contract.</p>
        </div>
        <div className="section">
          <div className="section-title">7. SPECIFICATION COPYRIGHT:</div>
          <p><strong>7.1.</strong> Buyer indemnifies the Company against all claims related to work done in accordance with Buyer&apos;s specifications.</p>
          <p><strong>7.2.</strong> If specifications are supplied by the Buyer, the Company will supply such specifications within a specified time frame.</p>
          <p><strong>7.3.</strong> Copyright of all documents (including drawings) furnished to the Buyer remains with the Company. Documents are not to be used for other purposes or disclosed without written consent.</p>
        </div>
        <div className="section">
          <div className="section-title">8. GENERAL PROVISIONS:</div>
          <p><strong>8.1.</strong> Company has a general lien over any Buyer&apos;s property in its possession for unpaid debts. Company can dispose of the property after 14 days&apos; notice to apply proceeds to debt.</p>
          <p><strong>8.2.</strong> Company is not liable for delay in carrying out any part of its agreements for any cause beyond its control.</p>
          <p><strong>8.3.</strong> Buyer warrants that these conditions are accepted with the knowledge that the price charged would be higher if the Company were under liability or potential liability.</p>
        </div>
        <div className="section">
          <div className="section-title">9. LIMITATION OF DAMAGES:</div>
          <p><strong>9.1.</strong> Seller is not liable for special, exemplary, proximate consequential, or incidental damages. Seller&apos;s maximum liability is limited to the contract price of the order giving rise to the claim.</p>
        </div>
        <div className="section">
          <div className="section-title">10. INDEMNIFICATION:</div>
          <p><strong>10.1.</strong> Buyer shall defend, indemnify, and hold harmless the Seller and its directors, officers, and employees from any and all claims, losses, liability, damages, and expenses, including legal fees, related to, or arising from, or connected with, or alleged to arise from or out of any asserted deficiencies or defects the Product caused by any alteration or modification thereof by Buyer with or without Seller&apos;s written consent, or improper handling or storage by Buyer.</p>
        </div>
        <div className="section">
          <div className="section-title">11. ARBITRATION & JURISDICTION:</div>
          <p><strong>11.1.</strong> In case of any dispute, it shall be referred to mutually acceptable arbitration. An umpire and their decision shall be final and binding. The arbitration will be held at Jaipur, India, and jurisdiction for this agreement is Jaipur, India only.</p>
        </div>
      </div>
    </>
  )
}
