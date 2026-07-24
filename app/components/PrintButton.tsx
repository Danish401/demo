'use client'

import { printQuotationDocument } from '@/lib/print-document'
import PrintFontSizeSelector from './PrintFontSizeSelector'

export default function PrintButton({
  fileName,
  showFontSize = true,
}: {
  fileName?: string
  /** When false, only the Print button is shown (avoids duplicate selectors). */
  showFontSize?: boolean
}) {
  return (
    <div className="print-button-wrap no-print">
      {showFontSize && <PrintFontSizeSelector />}
      <button
        type="button"
        onClick={() => printQuotationDocument(fileName)}
        className="print-button"
      >
        Print
      </button>
      <p className="print-hint">
        In the print dialog, turn off <strong>Headers and footers</strong> to hide the URL, date, and page numbers.
      </p>
    </div>
  )
}
