'use client'

import Link from 'next/link'
import { QuotationData } from '@/lib/types'
import { formatCurrency } from '@/lib/quotation-utils'
import { calculateTax } from '@/lib/tax-calculator'

interface PerformaInvoiceContentProps {
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
      <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>METAL FABRICS</div>
    </div>
    <div style={{ fontWeight: 'bold' }}>WMW Metal Fabrics Ltd</div>
    <div>53, Industrial Area, Jhotwara,</div>
    <div>Jaipur-302012</div>
    <div>Rajasthan, India</div>
    <div>Tel: +91.141.7105151</div>
    <div>wmw.wmwindia.com</div>
    <div>info@wmwindia.com</div>
    <div>GSTIN:08AAACW2620D1ZS</div>
    <div>CIN: U27109WB1995PLC068681</div>
  </td>
)

export default function PerformaInvoiceContent({ data, shippingData, billingData }: PerformaInvoiceContentProps) {
  // Calculate taxes based on billing state
  const billingState = billingData?.Billing_State || ''
  const taxableAmount = data.totalAmount
  const taxCalculation = calculateTax(billingState, taxableAmount)

  const headerInvoiceCell = (
    <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px', width: '50%' }}><strong>Quotation No</strong></td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', width: '30%' }}>{data.quotationNumber}</td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', width: '10%' }}><strong>Date</strong></td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', width: '10%' }}>{data.date}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Buyer,S Enquiry N</strong></td>
            <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{data.buyerEnquiryNo || ''}</td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}><strong>Date</strong></td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{data.customerReferenceDate || data.date}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Terms Of Payment</strong></td>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}>{data.termsOfPayment || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Inco Terms</strong></td>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}>{data.incoTerms || ''}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Terms Of Delivery</strong></td>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}>{data.termsOfDelivery || ''}</td>
          </tr>
        </tbody>
      </table>
    </td>
  )

  const totalAmount = formatCurrency(data.totalAmount)

  return (
    <>
      {/* Performa Invoice Content Div */}
      <div className="performa-invoice-content-section" style={{ border: '1px solid #000', padding: '16px', marginBottom: '24px' }}>
        {/* Title - Performa Invoice */}
        <p className="performa-invoice-title" style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase', marginTop: 0 }}>
          Performa Invoice
        </p>
        
        {/* Header table - shown on screen, repeated in print */}
        <table className="repeating-header" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '12px' }}>
          <tbody>
            <tr>
              {headerSupplierCell}
              {headerInvoiceCell}
            </tr>
          </tbody>
        </table>
        
        <div>
        {/* Consignee and Recipient */}
        <table style={{ marginTop: '12px', width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', border: '1px solid #000', padding: '12px', verticalAlign: 'top' }}>
                <div className="section-title" style={{ fontWeight: 'bold', marginBottom: '8px' }}>Detail Of Consignee/Shipped To</div>
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
                    <table style={{ marginTop: '8px', width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>State Code</td>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>{shippingData.Shipping_State_Code || ''}</td>
                        </tr>
                        {shippingData.Shipping_GST_No && (
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '4px' }}>GST Number</td>
                            <td style={{ border: '1px solid #000', padding: '4px' }}>{shippingData.Shipping_GST_No}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#666' }}>No shipping data available</div>
                )}
              </td>
              <td style={{ width: '50%', border: '1px solid #000', padding: '12px', verticalAlign: 'top' }}>
                <div className="section-title" style={{ fontWeight: 'bold', marginBottom: '8px' }}>Detail Of Recipient/Billed To</div>
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
                    <table style={{ marginTop: '8px', width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>State Code</td>
                          <td style={{ border: '1px solid #000', padding: '4px' }}>{billingData.Billing_State_Code || ''}</td>
                        </tr>
                        {billingData.Billing_GST_No && (
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '4px' }}>GST Number</td>
                            <td style={{ border: '1px solid #000', padding: '4px' }}>{billingData.Billing_GST_No}</td>
                          </tr>
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
        <div className="section-title" style={{ marginTop: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Description Of Goods</div>
        <table className="goods-description-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead style={{ display: 'table-header-group' }}>
            <tr>
              <th style={{ width: '40%', textAlign: 'left', border: '1px solid #000', padding: '8px', backgroundColor: '#f5f5f5', fontWeight: 'bold', display: 'table-cell' }}>Product / Quality / Form / Size / Type</th>
              <th style={{ width: '12%', border: '1px solid #000', padding: '8px', backgroundColor: '#f5f5f5', fontWeight: 'bold', display: 'table-cell' }}>Delivery</th>
              <th style={{ width: '8%', border: '1px solid #000', padding: '8px', backgroundColor: '#f5f5f5', fontWeight: 'bold', display: 'table-cell' }}>UOM</th>
              <th style={{ width: '15%', border: '1px solid #000', padding: '8px', backgroundColor: '#f5f5f5', fontWeight: 'bold', display: 'table-cell' }}>Quantity</th>
              <th style={{ width: '12%', textAlign: 'right', border: '1px solid #000', padding: '8px', backgroundColor: '#f5f5f5', fontWeight: 'bold', display: 'table-cell' }}>Rate/SQM</th>
              <th style={{ width: '13%', textAlign: 'right', border: '1px solid #000', padding: '8px', backgroundColor: '#f5f5f5', fontWeight: 'bold', display: 'table-cell' }}>Amount INR</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.length > 0 ? (
              data.lineItems.map((row, i) => (
                <tr key={i}>
                  <td style={{ verticalAlign: 'top', border: '1px solid #000', padding: '8px' }}>
                    <div><strong>Product</strong>: {row.product}</div>
                    {row.quality && <div><strong>Quality</strong>: {row.quality}</div>}
                    {row.form && <div><strong>Form</strong>: {row.form}</div>}
                    {row.size && <div><strong>Size</strong>: {row.size}</div>}
                    {row.type && <div><strong>Type</strong>: {row.type}</div>}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{row.delivery}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{row.uom}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {row.qty}
                    {row.pieces && <><br />{row.pieces}</>}
                  </td>
                  <td className="text-right" style={{ border: '1px solid #000', padding: '8px' }}>{row.rate}</td>
                  <td className="text-right" style={{ border: '1px solid #000', padding: '8px' }}>{row.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666', border: '1px solid #000' }}>
                  No line items found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="text-right font-bold" style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total {data.currency}</td>
              <td className="text-right font-bold" style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        {/* Bottom section: Validity, Charges, Notes (left) | Calculation (right) */}
        <table style={{ marginTop: '12px', width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '55%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
                <div style={{ marginBottom: '8px' }}><strong>QUOTATION VALIDITY:</strong> 07 Days from the date of Quotation</div>
                <table style={{ marginBottom: '12px', width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f5f5f5' }}></th>
                      <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f5f5f5' }}>Freight</th>
                      <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f5f5f5' }}>Insurance</th>
                      <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f5f5f5' }}>Packing</th>
                      <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f5f5f5' }}>HSN Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>Excl.</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>Incl.</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>Incl.</td>
                      <td style={{ border: '1px solid #000', padding: '6px' }}>
                        <table style={{ width: '100%', border: 'none' }}>
                          <tbody>
                            <tr>
                              <td style={{ border: 'none', padding: '2px 0' }}>StainlessSteelWireCloth</td>
                              <td style={{ border: 'none', padding: '2px 0', textAlign: 'right' }}>7314</td>
                            </tr>
                            <tr>
                              <td style={{ border: 'none', padding: '2px 0' }}>PB Wire Cloth</td>
                              <td style={{ border: 'none', padding: '2px 0', textAlign: 'right' }}>7419</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
                <table style={{ width: '100%', border: 'none' }}>
                  <tbody>
                    <tr><td style={{ border: 'none', padding: '4px 0', fontWeight: 'bold' }}>Total INR</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{totalAmount}</td></tr>
                    <tr><td style={{ border: 'none', padding: '4px 0' }}>Freight Charge</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                    <tr><td style={{ border: 'none', padding: '4px 0' }}>Packing Charges</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                    <tr><td style={{ border: 'none', padding: '4px 0' }}>Seam Charges</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>0.00</td></tr>
                    <tr><td style={{ border: 'none', padding: '4px 0', fontWeight: 'bold' }}>Total Amount Before Tax</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(taxableAmount)}</td></tr>
                    <tr>
                      <td style={{ border: 'none', padding: '4px 0' }}>Add CGST @ {taxCalculation.cgstRate > 0 ? `${taxCalculation.cgstRate}%` : '0.00'}</td>
                      <td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.cgstAmount)}</td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none', padding: '4px 0' }}>Add SGST @ {taxCalculation.sgstRate > 0 ? `${taxCalculation.sgstRate}%` : '0.00'}</td>
                      <td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.sgstAmount)}</td>
                    </tr>
                    <tr>
                      <td style={{ border: 'none', padding: '4px 0' }}>Add IGST @ {taxCalculation.igstRate > 0 ? `${taxCalculation.igstRate}%` : '0.00'}</td>
                      <td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.igstAmount)}</td>
                    </tr>
                    <tr><td style={{ border: 'none', padding: '4px 0' }}>Tax Amount GST</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right' }}>{formatCurrency(taxCalculation.taxAmount)}</td></tr>
                    <tr><td style={{ border: 'none', padding: '4px 0', fontWeight: 'bold' }}>Total Amount After GST</td><td style={{ border: 'none', padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(taxCalculation.totalAfterTax)}</td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Remarks */}
        <table style={{ marginTop: '12px', width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Remarks :-</div>
                <ol style={{ marginLeft: '20px', lineHeight: 1.6 }}>
                  <li>Mentioned delivery date is from date of confirmed PO other terms if any</li>
                  <li>Subjects to terms and conditions enclosed.</li>
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

        {/* Amount in Words */}
        <div className="amount-in-words" style={{ marginTop: '12px', padding: '8px 0' }}>
          <strong>Amount Chargeable (In words):-</strong> {data.currency} {formatCurrency(taxCalculation.totalAfterTax)} Only
        </div>

        {/* Bank Details with Blue Header Bar */}
        <table style={{ marginTop: '12px', width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#1e40af', color: '#fff', fontWeight: 'bold' }} colSpan={2}>
                <table style={{ width: '100%', border: 'none' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: 'none', padding: 0, fontWeight: 'bold', color: '#fff' }}>Bank Details :-</td>
                      <td style={{ border: 'none', padding: 0, textAlign: 'right', fontWeight: 'bold', color: '#fff' }}>For WMW Metal Fabrics Ltd.</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
                <div style={{ marginBottom: '4px' }}>Bank Name: Indian Overseas Bank</div>
                <div style={{ marginBottom: '4px' }}>Account Number: 015802000003059</div>
                <div style={{ marginBottom: '4px' }}>Branch Code: 0158</div>
                <div style={{ marginBottom: '4px' }}>IFSC Code: IOBA0000158</div>
                <div>Swift Code: IOBAINBB158</div>
              </td>
              <td style={{ width: '50%', verticalAlign: 'top', border: '1px solid #000', padding: '12px', textAlign: 'right' }}>
                <div style={{ marginBottom: '4px' }}>Computer Generated Document</div>
                <div style={{ marginBottom: '4px' }}>No Signature Needed</div>
                <div>Dated: {data.date}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '10px' }}>DOC NO. WMW/MKT/F.1 (Rev.00)</div>
        </div>
      </div>

      {/* Standard Conditions of Sale - included for printing */}
      <div className="conditions-for-print conditions-doc" style={{ border: '1px solid #000', padding: '16px', marginTop: '24px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px' }}>STANDARD CONDITIONS OF SALE:</h1>

        <p style={{ marginBottom: '16px', lineHeight: 1.6 }}>
          <strong>Pretext -</strong> In the below stated terms and conditions of the sale, WMW Metal Fabrics Ltd., hereby referred to as &apos;The Company&apos; is holding the entity mentioned in the invoice, here by referred to as &quot;The Buyer&quot; liable to all stated terms as on the date of this invoice.
        </p>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>1. Contract</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>1.1.</strong> All quotations and orders are subject to these conditions. In the event of any inconsistency between these conditions and the Buyers conditions of purchase or supply, these conditions shall prevail. The Buyer irrevocably accepts these conditions.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>1.2.</strong> The contract is not assignable. The Buyer cannot withdraw from this contract unless specifically agreed to in writing by the company in the event of withdrawal the Buyer shall pay full contract price.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>2. DELIVERY</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>2.1.</strong> Goods will be delivered to the location specified in the acceptance of order on the terms as per order. Unless specifically agreed in writing any date for delivery specified by the company is an estimate only and any failure to deliver goods by that shall not constitute a breach of contract or negligence, nor shall the company be liable for the consequences.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>2.2.</strong> If a Buyer falls to take delivery, the company will have the right to make a charge of handling and storage of the goods (@ 1% per week of the invoice price with the maximum of) 50%)and the buyer will also be liable for demurrage and/or additional transportation costs incurred by the company.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>2.3.</strong> Where the contract specifies delivery by installment and the Company makes defective deliveries in respect of one or more installments the Buyer shall not be entitled to repudiate the whole contract.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>2.4.</strong> Where any goods have not been collected by the Buyer within three months from the date of notification to the Buyer that the goods are ready for dispatch, the company reserves the right to call back the material at the buyers cost and recover in full the price of the contract.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>3. RISK</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>3.1.</strong> Risk shall pass to the Buyer as soon as the goods are dispatched and the Buyer is responsible for all loss damage or deterioration to the goods.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>4. PRICE</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>4.1.</strong> The price quoted by the company is its current price. The Company reserves the rights to revise the contract price of the goods and the date of dispatch to take account of increase in costs including (without lamination) currency fluctuations, wages, materials, transport, overhead and taxes etc. between those prevailing at the date of the contract..</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>4.2.</strong> In the event of any alteration being required by the Buyer in design or specification of the company shall be entitled to make an appropriate adjustment to the contract.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>5. PAYMENT</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>5.1.</strong> Each consignment shall be separately invoiced and paid for. The payment shall be made/remitted by the Buyer to the Company&apos;s Bankers at Jaipur, India.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>5.2.</strong> Payment is due in full when the goods leave the company premises or on the expiry of any agreed extended payment period. If the price is payable by installments and any amount is not paid on the due date, the whole outstanding balance becomes immediately due and payable. Interest is chargeable on a day to day basis on all overdue amount at the rate specified in any special conditions or if no such rate is specified, at a rate of 10% over and above of the bank rate for the time being of the Reserve Bank of India.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>6. CLAIMS</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>6.1.</strong> The Buyer shall not be entitled to any claim in respect of any repairs of alterations to goods undertaken by the Buyer without the prior specific written consent of the Company nor in respect of any defect arising by reason of normal wear and tear or damage due to misuse/accident.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>6.2.</strong> The company&apos;s liability in relation to any claim (whether for breach of contract of otherwise) shall neither, in any circumstances, exceed the ex-factory price of the goods, nor shall the Company be liable for any consequential or indirect loss or damage. No warranty is given as performance running time etc. Consideration of claim/complaints will only be undertaken provided the whole piece in question is made available to us for examination. Complaints regarding faulty supply cannot be accepted after 6 months from the date of invoice. Any complaint cannot be raised if the product is not used within 12 months of invoice date. Any liability thereafter lies with the buyer.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>6.3.</strong> Without prejudice to any other rights which it may have against the Buyers, the company may rescind the contract, in whole or in part, or suspend deliveries under it or of any other goods in any of the following circumstances:</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6, marginLeft: '20px' }}><strong>6.3.1.</strong> If any sum is due from the Buyer to the Company under the contract (or of any other account) but it is unpaid.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6, marginLeft: '20px' }}><strong>6.3.2.</strong> If the Buyer is in breach of any provision of the contract.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6, marginLeft: '20px' }}><strong>6.3.3.</strong> If the Buyer become bankrupt or insolvent or unable to pay its debt.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6, marginLeft: '20px' }}><strong>6.3.4.</strong> If the company is not in a position to deliver the goods as per the contract.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>7. SPECIFICATION, COPYRIGHT</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>7.1.</strong> Buyer will indemnify the Company from and against all claims, proceedings, damages, and expenses to which the Company may become liable as a result of work done in accordance with the Buyer specifications which infringes any patent or registered design.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>7.2.</strong> Where specifications are to be supplied to the Company, the Buyer shall supply such specification within a time specified by the Company so as to enable the company tocomplete the delivery within contract period as per predefined written approvals from the company.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>7.3.</strong> The Copyright of all documents (including drawings) furnished to the Buyer by the in connection with this contract shall at all times remain vested in the Company. Neither the documents nor their contents shall be used for any purpose other than for which they were furnished. The Buyer shall not disclose the documents to any other party without the expresses written consent of the company.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>8. GENERAL PLAN</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>8.1.</strong> Without prejudice to any other right which it may have against the Buyer the company shall have a general lien over any property of the Buyer which is in the company&apos;s possession, in respect of all unpaid debts to it from the Buyer. The Company shall be entitled to dispose of the property as it thinks fit after expiration of 14 days prior notice to the Buyer, and to apply the proceeds of sale in, or towards payments of the debts.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>8.2.</strong> The company shall be under no liability if it is prevented from, or delayed in carrying out any part of its agreements for any cause beyond its control.</p>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>8.3.</strong> The Buyer warrants that these conditions are freely accepted in the knowledge and on the basis that the price charged for the goods would be higher if the Company were under liability or potential liability, than as set out in these conditions.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>9. LIMITATION OF DAMAGES</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>9.1.</strong> Seller shall not be liable to Buyer for any SPECIAL, EXEMPLARY, PROXIMATE CONSEQUENTIAL OR INCIDENTAL DAMAGES, WHETHER ARISING UNDER CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHER THEORY OF LAW OR EQUITY. SELLER&apos;S MAXIMUM LIABILITY TO BUYER SHALL NOT EXCEED THE CONTRACT PRICE OF THE ORDER GIVING RISE TO THE CLAIM, DEMAND, OR CAUSE OF ACTION.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>10. INDEMNIFICATION</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>10.1.</strong> Buyer shall defend, indemnify and hold harmless seller, and Seller&apos;s directors, officers and employees, from any and all claims, losses, liability, damages and expenses, including but not limited to, attorney&apos;s fees and costs of defense, arising from, related to, or in any way connected with or alleged to rise from or out of any asserted deficiencies or defects in the Product causes by any alteration or modification thereof by Buyer with or without Seller&apos;s written consent, or improper handling or storage by Buyer.</p>
        </div>

        <div className="section" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>11. ARBITRATION & JURISDICTION</div>
          <p style={{ marginBottom: '8px', lineHeight: 1.6 }}><strong>11.1.</strong> In case of any dispute, the same shall be referred to the arbitration of mutually acceptable arbitrator or a panel of two arbitrators, one to be appointed by each of us and who before the start of the proceedings shall appoint an umpire and their decision shall be final and binding on both of us. The arbitration shall be held at Jaipur, India and jurisdiction of this agreement lies at Jaipur, India only.</p>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/conditions" style={{ color: '#1e40af', textDecoration: 'underline' }}>
          View Standard Conditions of Sale
        </Link>
      </div>
    </>
  )
}
