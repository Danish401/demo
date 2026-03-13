/**
 * Tax calculation utilities
 */

// Supplier state (hardcoded - WMW Metal Fabrics Ltd is in Rajasthan)
const SUPPLIER_STATE = 'Rajasthan'

// Tax rates
const CGST_RATE = 9 // 9%
const SGST_RATE = 9 // 9%
const IGST_RATE = 18 // 18%

export interface TaxCalculation {
  cgstRate: number
  sgstRate: number
  igstRate: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  taxAmount: number
  totalAfterTax: number
  isSameState: boolean
}

/**
 * Calculates GST based on supplier and billing states
 * @param billingState - State from billing address
 * @param taxableAmount - Amount before tax
 * @returns Tax calculation object
 */
export function calculateTax(billingState: string | undefined, taxableAmount: number): TaxCalculation {
  const isSameState = billingState?.trim().toLowerCase() === SUPPLIER_STATE.toLowerCase()
  
  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0
  let cgstRate = 0
  let sgstRate = 0
  let igstRate = 0

  if (isSameState) {
    // Same state: Apply CGST + SGST (9% + 9% = 18%)
    cgstRate = CGST_RATE
    sgstRate = SGST_RATE
    cgstAmount = (taxableAmount * CGST_RATE) / 100
    sgstAmount = (taxableAmount * SGST_RATE) / 100
  } else {
    // Different state: Apply IGST (18%)
    igstRate = IGST_RATE
    igstAmount = (taxableAmount * IGST_RATE) / 100
  }

  const taxAmount = cgstAmount + sgstAmount + igstAmount
  const totalAfterTax = taxableAmount + taxAmount

  return {
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxAmount,
    totalAfterTax,
    isSameState,
  }
}
