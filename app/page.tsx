'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PrintButton from './components/PrintButton'
import QuotationContent from './components/QuotationContent'
import PerformaInvoiceContent from './components/PerformaInvoiceContent'
import ExportQuotationContent from './components/ExportQuotationContent'
import SLSQuotationContent from './components/SLSQuotationContent'
import GKDQuotationContent from './components/GKDQuotationContent'
import BVKQuotationContent from './components/BVKQuotationContent'
import DoorCoreQuotationContent from './components/DoorCoreQuotationContent'
import { ZohoQuotationResponse, ShippingMasterResponse, BillingMasterResponse, TemplateType, ZohoQuotation, QuotationData, DoorCoreQuotationResponse, CoreCoverPageData } from '@/lib/types'
import { transformQuotationData, determineTemplateType } from '@/lib/quotation-utils'

// Mock data for WMW template design testing
const getMockWMWData = (): QuotationData => ({
  quotationNumber: 'ARQT/24-25/0097',
  date: '02/08/2024',
  buyerEnquiryNo: 'E Mail',
  termsOfPayment: '30 Days, Cheque on Delivery',
  incoTerms: '',
  termsOfDelivery: 'To Pay - Godown Delivery',
  deliveryDate: '16/08/2024',
  followUpDate: '',
  dueDate: '',
  customerReference: 'E Mail',
  customerReferenceDate: '02/08/2024',
  currency: 'INR',
  remarks: '',
  lineItems: [
    {
      product: 'Stainless Steel Wire Cloth',
      quality: '0316L',
      form: 'Endless',
      size: '3.9400x2.5500',
      type: 'FORMX - 030',
      delivery: '16/08/2024',
      uom: 'SQMT',
      qty: '2',
      subQty: '20.0940',
      unit: 'Two Pc',
      pieces: '20.0940, Two Pc',
      rate: '5,500.00',
      amount: '110,517.00',
    },
    {
      product: 'Stainless Steel Wire Cloth',
      quality: '0316L',
      form: 'Endless',
      size: '3.9250x2.5500',
      type: 'FORMX - 010',
      delivery: '16/08/2024',
      uom: 'SQMT',
      qty: '3',
      subQty: '30.0264',
      unit: 'Three Pc',
      pieces: '30.0264, Three Pc',
      rate: '6,000.00',
      amount: '180,158.40',
    },
  ],
  totalAmount: 290675.40,
})

const getMockShippingData = () => ({
  Shipping_Address_Name: 'Viva Board Pvt. Ltd.',
  Parent_Account: 'Viva Board Pvt. Ltd.',
  Shipping_Street: 'Survey No. 284-285, Vill & MDL: Renjal, Dist: Nizamabad',
  Shipping_City: 'Nizamabad',
  Shipping_State: 'Telangana',
  Shipping_Postal_Code: '503235',
  Shipping_Country: 'India',
  Shipping_State_Code: '36',
  Shipping_GST_No: '36AADCV7529D1Z9',
  Address_Type: 'Primary',
})

const getMockBillingData = () => ({
  Billing_Address_Name: 'Viva Board Pvt. Ltd.',
  Parent_Account: 'Viva Board Pvt. Ltd.',
  Billing_Street: 'Survey No. 284-285, Vill & MDL: Renjal, Dist: Nizamabad',
  Billing_City: 'Nizamabad',
  Billing_State: 'Telangana',
  Billing_Postal_Code: '503235',
  Billing_Country: 'India',
  Billing_State_Code: '36',
  Billing_GST_No: '36AADCV7529D1Z9',
  Address_Type: 'Primary',
})

const headerSupplierCell = (
  <td style={{ width: '55%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Supplier</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div style={{ width: '48px', height: '48px', background: '#1e40af', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>wmw</div>
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

/** View mode for Door Core: 'simple' = no signature, 'approved' = show signature when record is approved */
function getDoorCoreViewMode(searchParams: URLSearchParams): 'simple' | 'approved' {
  const view = (searchParams.get('view') || '').trim().toLowerCase()
  return view === 'approved' ? 'approved' : 'simple'
}

export default function QuotationPage() {
  const searchParams = useSearchParams()
  const viewMode = getDoorCoreViewMode(searchParams)
  const [quotationData, setQuotationData] = useState<any>(null)
  const [rawQuotationData, setRawQuotationData] = useState<ZohoQuotation | null>(null)
  const [shippingData, setShippingData] = useState<any>(null)
  const [billingData, setBillingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templateType, setTemplateType] = useState<TemplateType>('WI')
  const [doorCoreData, setDoorCoreData] = useState<CoreCoverPageData | null>(null)

  useEffect(() => {
    const fetchQuotation = async () => {
      const report = (searchParams.get('report') || '').trim()
      const useDoorCore =
        report === 'door_core' ||
        report === 'Quotation_Log_Door_Core' ||
        report === 'Core_Cover_page_Report'

      try {
        setLoading(true)
        setError(null)
        setDoorCoreData(null)

        const id = searchParams.get('id') || searchParams.get('perm') || ''

        if (useDoorCore) {
          if (!id) {
            throw new Error('Door Core quotation requires id or perm in URL (e.g. ?report=door_core&id=123)')
          }
          const reportParam = report ? `&report=${encodeURIComponent(report)}` : ''
          const response = await fetch(`/api/zoho-door-core?id=${encodeURIComponent(id)}${reportParam}`)
          const data: DoorCoreQuotationResponse = await response.json()
          if (!response.ok || data.code !== 3000 || !data.data || data.data.length === 0) {
            throw new Error(data.error || 'No Door Core quotation data found')
          }
          setDoorCoreData(data.data[0])
          return
        }

        const url = id
          ? `/api/zoho-quotations?id=${encodeURIComponent(id)}`
          : '/api/zoho-quotations'

        const response = await fetch(url)
        const data: ZohoQuotationResponse = await response.json()

        if (!response.ok || data.code !== 3000 || !data.data || data.data.length === 0) {
          throw new Error(data.error || 'No quotation data found')
        }

        const quotation = data.data[0]
        setRawQuotationData(quotation)

        // Determine template type from API response
        const typeOfQuotation = quotation.Type_Of_Quotation
        const templateField = quotation.Template

        // Auto-set template type based on Type_Of_Quotation and Template fields
        const autoTemplateType = determineTemplateType(typeOfQuotation, templateField)
        setTemplateType(autoTemplateType)

        // Transform the first quotation with determined template type and template field
        const transformed = transformQuotationData(quotation, autoTemplateType, templateField)
        setQuotationData(transformed)

        // Fetch Shipping and Billing Masters if Account_Module exists
        if (quotation.Account_Module?.CRM_Account_ID) {
          const accountId = quotation.Account_Module.CRM_Account_ID

          // Fetch Shipping Masters
          try {
            const shippingResponse = await fetch(`/api/zoho-shipping-masters?account_id=${encodeURIComponent(accountId)}`)
            const shippingData: ShippingMasterResponse = await shippingResponse.json()
            if (shippingResponse.ok && shippingData.code === 3000 && shippingData.data && shippingData.data.length > 0) {
              // Prefer Primary address, otherwise use first one
              const primaryShipping = shippingData.data.find((item: any) => item.Address_Type === 'Primary')
              setShippingData(primaryShipping || shippingData.data[0])
            }
          } catch (err) {
            console.error('Error fetching shipping masters:', err)
          }

          // Fetch Billing Masters
          try {
            const billingResponse = await fetch(`/api/zoho-billing-masters?account_id=${encodeURIComponent(accountId)}`)
            const billingData: BillingMasterResponse = await billingResponse.json()
            if (billingResponse.ok && billingData.code === 3000 && billingData.data && billingData.data.length > 0) {
              // Prefer Primary address, otherwise use first one
              const primaryBilling = billingData.data.find((item: any) => item.Address_Type === 'Primary')
              setBillingData(primaryBilling || billingData.data[0])
            }
          } catch (err) {
            console.error('Error fetching billing masters:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching quotation:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quotation')
      } finally {
        setLoading(false)
      }
    }

    fetchQuotation()
  }, [searchParams])

  // Re-transform data when template type changes (only if manually changed, not auto-determined)
  useEffect(() => {
    if (rawQuotationData) {
      const templateField = rawQuotationData.Template
      const transformed = transformQuotationData(rawQuotationData, templateType, templateField)
      setQuotationData(transformed)
    }
  }, [templateType, rawQuotationData])

  // Create header quotation/invoice cell with dynamic data or placeholder
  // For WMW and WMW2 templates, use the structured format with borders
  const headerQuotationCell = (templateType === 'WMW' || templateType === 'WMW2') ? (
    quotationData ? (
      <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '50%' }}><strong>Quotation No</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '30%' }}>{quotationData.quotationNumber}</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', width: '10%' }}><strong>Date</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', width: '10%' }}>{quotationData.date}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Buyer,S Enquiry N</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>{quotationData.buyerEnquiryNo || ''}</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}><strong>Date</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}>{quotationData.customerReferenceDate || quotationData.date}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Terms Of Payment</strong></td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}>{quotationData.termsOfPayment || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Inco Terms</strong></td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}>{quotationData.incoTerms || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Terms Of Delivery</strong></td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}>{quotationData.termsOfDelivery || ''}</td>
            </tr>
          </tbody>
        </table>
      </td>
    ) : (
      <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '50%' }}><strong>Quotation No</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '30%' }}>Loading...</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', width: '10%' }}><strong>Date</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', width: '10%' }}>Loading...</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Buyer,S Enquiry N</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}><strong>Date</strong></td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Terms Of Payment</strong></td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Inco Terms</strong></td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}><strong>Terms Of Delivery</strong></td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px' }}></td>
            </tr>
          </tbody>
        </table>
      </td>
    )
  ) : (
    quotationData ? (
      <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
        <table style={{ width: '100%', border: 'none' }}>
          <tbody>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Quotation No</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{quotationData.quotationNumber}</td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Date</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{quotationData.date}</td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Buyer&apos;s Enquiry No</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{quotationData.buyerEnquiryNo || ''}</td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Payment</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{quotationData.termsOfPayment || ''}</td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Inco Terms</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{quotationData.incoTerms || ''}</td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Delivery</strong></td><td style={{ border: 'none', padding: '4px 0' }}>{quotationData.termsOfDelivery || ''}</td></tr>
          </tbody>
        </table>
      </td>
    ) : (
      <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
        <table style={{ width: '100%', border: 'none' }}>
          <tbody>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Quotation No</strong></td><td style={{ border: 'none', padding: '4px 0' }}>Loading...</td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Date</strong></td><td style={{ border: 'none', padding: '4px 0' }}>Loading...</td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Buyer&apos;s Enquiry No</strong></td><td style={{ border: 'none', padding: '4px 0' }}></td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Payment</strong></td><td style={{ border: 'none', padding: '4px 0' }}></td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Inco Terms</strong></td><td style={{ border: 'none', padding: '4px 0' }}></td></tr>
            <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Delivery</strong></td><td style={{ border: 'none', padding: '4px 0' }}></td></tr>
          </tbody>
        </table>
      </td>
    )
  )

  return (
    <main className="quotation-doc" style={{ padding: '16px' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
        <PrintButton />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div>Loading quotation data...</div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error loading quotation</div>
          <div>{error}</div>
          <div style={{ marginTop: '16px', fontSize: '14px' }}>
            <Link href="/" style={{ color: '#1e40af', textDecoration: 'underline' }}>
              Try again
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && doorCoreData && (
        <DoorCoreQuotationContent data={doorCoreData} viewMode={viewMode} />
      )}

      {!loading && !error && !doorCoreData && quotationData && (
        <>
          {templateType === 'EXPORT' ? (
            <ExportQuotationContent
              data={quotationData}
              shippingData={shippingData}
              billingData={billingData}
              rawQuotationData={rawQuotationData}
            />
          ) : templateType === 'SLS' ? (
            <SLSQuotationContent
              data={quotationData}
              shippingData={shippingData}
              billingData={billingData}
              rawQuotationData={rawQuotationData}
            />
          ) : templateType === 'GKD' ? (
            <GKDQuotationContent
              data={quotationData}
              shippingData={shippingData}
              billingData={billingData}
              rawQuotationData={rawQuotationData}
            />
          ) : templateType === 'BVK' ? (
            <BVKQuotationContent
              data={quotationData}
              shippingData={shippingData}
              billingData={billingData}
              rawQuotationData={rawQuotationData}
            />
          ) : (templateType === 'WMW' || templateType === 'WMW2') ? (
            <table className="print-doc-table" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <thead>
                <tr>
                  {headerSupplierCell}
                  {headerQuotationCell}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ verticalAlign: 'top', border: 'none', padding: 0 }}>
                    <PerformaInvoiceContent data={quotationData} shippingData={shippingData} billingData={billingData} />
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="print-doc-table" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <thead>
                <tr>
                  {headerSupplierCell}
                  {headerQuotationCell}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ verticalAlign: 'top', border: 'none', padding: 0 }}>
                    <QuotationContent data={quotationData} shippingData={shippingData} billingData={billingData} />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  )
}
