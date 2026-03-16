import { ZohoQuotation, QuotationData, QuotationLineItem, TemplateType } from './types'

/**
 * Formats a date string from Zoho format to display format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return ''
  
  try {
    // Handle formats like "19-Feb-2026" or "19-Feb-2026 11:40:35"
    // Zoho date format: DD-MMM-YYYY or DD-MMM-YYYY HH:MM:SS
    const dateMatch = dateString.match(/(\d{2})-(\w{3})-(\d{4})/)
    if (dateMatch) {
      const [, day, month, year] = dateMatch
      // Convert month name to number (Jan=0, Feb=1, etc.)
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      }
      const monthNum = monthMap[month] ?? 0
      const date = new Date(parseInt(year), monthNum, parseInt(day))
      if (!isNaN(date.getTime())) {
        // Format as DD/MM/YYYY
        return `${day}/${String(monthNum + 1).padStart(2, '0')}/${year}`
      }
    }
    
    // Fallback: try standard Date parsing
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    return dateString
  } catch {
    return dateString
  }
}

/**
 * Formats a number with Indian number formatting (commas)
 */
export function formatCurrency(value: string | number | undefined, currency: string = 'INR'): string {
  if (!value) return '0.00'
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
  if (isNaN(num)) return '0.00'
  // Use en-US locale for USD, en-IN for INR
  const locale = currency === 'USD' ? 'en-US' : 'en-IN'
  return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Converts number to words
 */
export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  function convertHundreds(n: number): string {
    let result = ''
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' '
      n %= 10
    }
    if (n > 0) {
      result += ones[n] + ' '
    }
    return result.trim()
  }
  
  if (num === 0) return 'Zero'
  
  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * 100)
  
  let words = ''
  
  // Handle thousands
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000)
    words += convertHundreds(thousands) + ' Thousand '
  }
  
  // Handle hundreds
  const remainder = integerPart % 1000
  if (remainder > 0) {
    words += convertHundreds(remainder)
  }
  
  // Handle decimal part (cents/paisa)
  if (decimalPart > 0) {
    words += ` and ${decimalPart}/100`
  }
  
  return words.trim()
}

/**
 * Maps Template field value to Category data field names
 * Returns object with lineItemsField and productDetailsField
 */
export function getCategoryFieldsFromTemplate(templateField?: string): {
  lineItemsField: keyof ZohoQuotation
  productDetailsField: keyof ZohoQuotation
} {
  if (!templateField) {
    return {
      lineItemsField: 'Category_1_MM_Database_WI_2_0',
      productDetailsField: 'Category_1_MM_Database_WI'
    }
  }

  const template = templateField.trim()
  
  // Map Template field to Category fields
  if (template.includes('Category 2 WMW') || template === 'Category 2 WMW') {
    return {
      lineItemsField: 'Category_2_MM_Database_WMW_2_0',
      productDetailsField: 'Category_2_MM_Database_WMW'
    }
  } else if (template.includes('Category 1 MM Database WMW') || template === 'Category 1 MM Database WMW') {
    return {
      lineItemsField: 'Category_1_MM_Database_WMW_2_0',
      productDetailsField: 'Category_1_MM_Database_WMW'
    }
  } else if (template.includes('Category 2 MM Database WI') || template.includes('Category 2 WI')) {
    return {
      lineItemsField: 'Category_2_MM_Database_WI_2_0',
      productDetailsField: 'Category_2_MM_Database_WI'
    }
  } else if (template.includes('Category 1 MM Database WI') || template.includes('Category 1 WI')) {
    return {
      lineItemsField: 'Category_1_MM_Database_WI_2_0',
      productDetailsField: 'Category_1_MM_Database_WI'
    }
  }
  
  // Default fallback
  return {
    lineItemsField: 'Category_1_MM_Database_WI_2_0',
    productDetailsField: 'Category_1_MM_Database_WI'
  }
}

/**
 * Determines template type from Type_Of_Quotation and Template fields
 */
export function determineTemplateType(
  typeOfQuotation?: string,
  templateField?: string
): TemplateType {
  // If Type_Of_Quotation is "Export", always use EXPORT template
  if (typeOfQuotation?.trim().toLowerCase() === 'export') {
    return 'EXPORT'
  }
  
  // For Import or other types, determine from Template field
  if (!templateField) {
    return 'WI' // Default
  }
  
  const template = templateField.trim()
  
  // Map Template field to template type
  if (template.includes('Category 2 WMW') || template === 'Category 2 WMW') {
    return 'WMW2'
  } else if (template.includes('Category 1 MM Database WMW') || template === 'Category 1 MM Database WMW') {
    return 'WMW'
  } else if (template.includes('Category 1 MM Database WI') || template.includes('Category 1 WI')) {
    return 'WI'
  }
  
  // Default fallback
  return 'WI'
}

/**
 * Transforms Zoho quotation data to quotation display format
 */
export function transformQuotationData(
  zohoData: ZohoQuotation, 
  templateType: TemplateType = 'WI',
  templateField?: string
): QuotationData {
  const lineItems: QuotationLineItem[] = []
  let totalAmount = 0

  // Get Category fields based on templateField if provided, otherwise use templateType
  let zohoLineItems: any[] = []
  let productDetails: any[] = []
  
  if (templateField) {
    // Use templateField to determine Category fields
    const categoryFields = getCategoryFieldsFromTemplate(templateField)
    zohoLineItems = (zohoData[categoryFields.lineItemsField] as any[]) || []
    productDetails = (zohoData[categoryFields.productDetailsField] as any[]) || []
  } else {
    // Fallback to original logic based on templateType
    zohoLineItems = templateType === 'WI' 
      ? (zohoData.Category_1_MM_Database_WI_2_0 || [])
      : templateType === 'WMW2'
      ? (zohoData.Category_2_MM_Database_WMW_2_0 || [])
      : templateType === 'EXPORT'
      ? (zohoData.Category_1_MM_Database_WI_2_0 || [])
      : templateType === 'SLS'
      ? (zohoData.Category_1_MM_Database_WI_2_0 || [])
      : templateType === 'GKD'
      ? (zohoData.Category_1_MM_Database_WI_2_0 || [])
      : templateType === 'BVK'
      ? (zohoData.Category_1_MM_Database_WI_2_0 || [])
      : (zohoData.Category_1_MM_Database_WMW_2_0 || [])
    
    productDetails = templateType === 'WI'
      ? (zohoData.Category_1_MM_Database_WI || [])
      : templateType === 'WMW2'
      ? (zohoData.Category_2_MM_Database_WMW || [])
      : templateType === 'EXPORT'
      ? (zohoData.Category_1_MM_Database_WI || [])
      : templateType === 'SLS'
      ? (zohoData.Category_1_MM_Database_WI || [])
      : templateType === 'GKD'
      ? (zohoData.Category_1_MM_Database_WI || [])
      : templateType === 'BVK'
      ? (zohoData.Category_1_MM_Database_WI || [])
      : (zohoData.Category_1_MM_Database_WMW || [])
  }

  /**
   * Extracts Quality from Product_Code by splitting on '.' and getting second-to-last segment
   * Example: FG.PM.OER.PDW.30x150.SSxSS.316L.V01 -> 316L
   */
  const extractQualityFromProductCode = (productCode?: string): string => {
    if (!productCode) return ''
    const parts = productCode.split('.')
    if (parts.length >= 2) {
      // Get second-to-last element
      return parts[parts.length - 2] || ''
    }
    return ''
  }

  if (templateType === 'WMW' || templateType === 'WMW2') {
    // WMW template uses different structure
    zohoLineItems.forEach((item, index) => {
      // Try to find matching product detail by Last_item_ref (capital L) or last_item_ref (lowercase) or Line_Item_ref
      const itemRef = (item as any).Last_item_ref?.trim() || item.last_item_ref?.trim() || item.Line_Item_ref?.trim()
      const productDetail = itemRef
        ? productDetails.find((pd: any) => 
            pd.Last_item_ref?.trim() === itemRef || 
            pd.last_item_ref?.trim() === itemRef || 
            pd.Line_Item_ref?.trim() === itemRef
          ) || productDetails[index] || {}
        : productDetails[index] || {}
      
      // Map product information - different for WMW2 (Category 2)
      const product = templateType === 'WMW2'
        ? (productDetail.Product_Name || productDetail.Product_Group || item.Line_Item_ref || 'N/A')
        : (productDetail.Product_Master || productDetail.Product_Name || productDetail.Product_Group || 'N/A')
      
      // Type: Use Brand_Selling_Name or Brand_Category
      const type = productDetail.Brand_Selling_Name || productDetail.Brand_Category || item.Line_Item_ref || ''
      
      // Quality: Extract from Product_Code (second-to-last segment when split by '.')
      const quality = extractQualityFromProductCode(productDetail.Product_Code) || ''
      
      // Form: Different mapping for WMW2 (Category 2)
      const form = templateType === 'WMW2'
        ? (productDetail.Invoice_Form || productDetail.Supply_Form || item.Invoice_Dimension_Type || '')
        : (productDetail.Invoice_Form || productDetail.Supply_Form || '')
      
      // Size: Use Length_field and Width, or dimensions
      const size = productDetail.Length_field && productDetail.Width
        ? `${productDetail.Length_field}x${productDetail.Width}`
        : productDetail.Invoice_Dimension_1 && productDetail.Invoice_Dimension_2
        ? `${productDetail.Invoice_Dimension_1}x${productDetail.Invoice_Dimension_2}`
        : productDetail.Supply_Dimension_1 && productDetail.Supply_Dimension_2
        ? `${productDetail.Supply_Dimension_1}x${productDetail.Supply_Dimension_2}`
        : productDetail.Length_field || productDetail.Invoice_Dimension_1 || productDetail.Supply_Dimension_1 || ''

      // Map quantities and pricing for WMW
      const qty = item.Qty?.trim() || productDetail.Qty?.trim() || '0'
      const subQty = item.SQM?.trim() || productDetail.SQM?.trim() || productDetail.Total_SQM?.trim() || '0'
      const rate = item.Selling_Price?.trim() || productDetail.List_Price?.trim() || '0'
      // Use Total_Cost for WMW2, Gross_Amount for WMW, fallback to Total_Price or Total_Sale_Value
      const amount = templateType === 'WMW2'
        ? (item.Total_Cost?.trim() || item.Gross_Amount?.trim() || productDetail.Total_Price?.trim() || item.Total_Sale_Value?.trim() || '0')
        : (item.Gross_Amount?.trim() || productDetail.Total_Price?.trim() || item.Total_Sale_Value?.trim() || '0')
      
      // Calculate unit description
      const qtyNum = parseFloat(qty.replace(/,/g, '')) || 0
      const unit = qtyNum === 1 ? 'One Pc' : 
                   qtyNum === 2 ? 'Two Pc' : 
                   qtyNum === 3 ? 'Three Pc' : 
                   qtyNum === 4 ? 'Four Pc' : 
                   qtyNum > 0 ? `${qtyNum} Pc` : ''

      // Pieces from line item or product detail
      const pieces = item.Pieces?.trim() || productDetail.Pieces?.trim() || ''

      lineItems.push({
        product,
        quality,
        form,
        size,
        type,
        delivery: formatDate(zohoData.Delivery_Date_Control),
        uom: item.UOM_Billing?.trim() || productDetail.UOM_Billing?.trim() || 'SQMT',
        qty,
        subQty,
        unit,
        pieces: pieces && subQty ? `${subQty}, ${unit}` : (pieces || ''),
        rate: formatCurrency(rate),
        amount: formatCurrency(amount),
      })

      // Add to total using Total_Cost for WMW2, Gross_Amount for WMW
      const amountNum = parseFloat(amount.toString().replace(/,/g, '')) || 0
      totalAmount += amountNum
    })
  } else {
    // WI template (existing logic)
  zohoLineItems.forEach((item, index) => {
    // Try to find matching product detail by Line_Item_ref or by index
    const lineItemRef = item.Line_Item_ref?.trim()
    const productDetail = lineItemRef
      ? productDetails.find((pd: any) => pd.Line_Item_ref?.trim() === lineItemRef) || productDetails[index] || {}
      : productDetails[index] || {}
    
    // Map product information - prioritize product detail fields
    const product = productDetail.Product_Name || productDetail.Product_Group || 'N/A'
    
    // Type: Use Brand_Category
    const type = productDetail.Brand_Category || item.Line_Item_ref || ''
    
    // Quality: Extract from Product_Code (second-to-last segment when split by '.')
    const quality = extractQualityFromProductCode(productDetail.Product_Code) || ''
    
    // Form: Use Invoice_Dimension_Type from line item, fallback to product detail
    const form = item.Invoice_Dimension_Type || productDetail.Invoice_Form || productDetail.Supply_Form || ''
    
    // Size: Use Invoice dimensions from line item, fallback to Supply dimensions from product detail
    const size = item.Invoice_Dimension_1 && item.Invoice_Dimension_2 
      ? `${item.Invoice_Dimension_1}x${item.Invoice_Dimension_2}`
      : productDetail.Supply_Dimension_1 && productDetail.Supply_Dimension_2
      ? `${productDetail.Supply_Dimension_1}x${productDetail.Supply_Dimension_2}`
      : item.Invoice_Dimension_1 || productDetail.Supply_Dimension_1 || ''

    // Map quantities and pricing
    const qty = item.Qty?.trim() || '0'
    const subQty = item.SQM?.trim() || '0'
    const rate = item.Selling_Price?.trim() || '0'
    const amount = item.Total_Sale_Value?.trim() || '0'
    
    // Calculate unit description
    const qtyNum = parseFloat(qty.replace(/,/g, '')) || 0
    const unit = qtyNum === 1 ? 'One Pc' : 
                 qtyNum === 2 ? 'Two Pc' : 
                 qtyNum === 3 ? 'Three Pc' : 
                 qtyNum === 4 ? 'Four Pc' : 
                 qtyNum > 0 ? `${qtyNum} Pc` : ''

    // Check if Pieces field exists in the line item
    const pieces = item.Pieces?.trim() || ''

    lineItems.push({
      product,
      quality,
      form,
      size,
      type,
      delivery: formatDate(zohoData.Delivery_Date_Control),
      uom: item.UOM_Billing?.trim() || 'SQMT',
      qty,
      subQty,
      unit,
      pieces,
      rate: formatCurrency(rate),
      amount: formatCurrency(amount),
    })

    // Add to total
    const amountNum = parseFloat(amount.toString().replace(/,/g, '')) || 0
    totalAmount += amountNum
  })
  }

  return {
    quotationNumber: zohoData.Name || `QT-${zohoData.ID}`,
    date: formatDate(zohoData.Created_Date_and_time),
    buyerEnquiryNo: zohoData.customer_Reference || '',
    termsOfPayment: zohoData.Term_of_Payment || zohoData.Method_of_Payment || '',
    incoTerms: '',
    termsOfDelivery: zohoData.Delivery_Terms || zohoData.Mode_of_Delivery || '',
    deliveryDate: formatDate(zohoData.Delivery_Date_Control),
    followUpDate: formatDate(zohoData.Follow_up_Date),
    dueDate: formatDate(zohoData.Due_Date),
    customerReference: zohoData.customer_Reference || '',
    customerReferenceDate: formatDate(zohoData.Customer_Reference_Date),
    currency: zohoData.Currency || 'INR',
    remarks: zohoData.Remarks || '',
    lineItems,
    totalAmount,
  }
}
