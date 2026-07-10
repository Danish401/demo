'use client'

import { printQuotationDocument } from '@/lib/print-document'

export default function PrintButton({ fileName }: { fileName?: string }) {
  return (
    <div className="print-button-wrap no-print">
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
