function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Print quotation content without the current page URL in the browser header/footer.
 * Uses a hidden iframe with a blank document title so Chrome/Edge show minimal chrome
 * when "Headers and footers" is enabled. For a completely clean PDF, turn off
 * "Headers and footers" in the print dialog.
 *
 * `fileName`, when provided, is applied to the *outer* page's `document.title` for the
 * duration of the print — Chrome/Edge's "Save as PDF" dialog takes its suggested filename
 * from the top-level tab title, not from the hidden iframe that actually holds the printed
 * content, so setting it only on the iframe (as before) left the Save dialog falling back to
 * the page's default/blank title (e.g. showing the bare hostname). The original title is
 * restored once the print dialog closes.
 */
export function printQuotationDocument(fileName?: string): void {
  if (typeof window === 'undefined') return

  const originalTitle = document.title
  const trimmedFileName = fileName?.trim()
  let titleRestored = false
  const restoreTitle = () => {
    if (titleRestored) return
    titleRestored = true
    document.title = originalTitle
    window.removeEventListener('afterprint', restoreTitle)
  }
  if (trimmedFileName) {
    document.title = trimmedFileName
    window.addEventListener('afterprint', restoreTitle)
    window.setTimeout(restoreTitle, 10000)
  }

  const sourceRoot =
    document.querySelector<HTMLElement>('main.quotation-doc') ??
    document.querySelector<HTMLElement>('.door-core-quotation-container') ??
    document.querySelector<HTMLElement>('.export-quotation-container') ??
    document.body

  const clone = sourceRoot.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.no-print').forEach((el) => el.remove())

  const stylesheetLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
    .map((link) => {
      const href = link.href
      if (!href) return ''
      return `<link rel="stylesheet" href="${href.replace(/"/g, '&quot;')}">`
    })
    .join('\n')

  const inlineStyles = Array.from(document.querySelectorAll<HTMLStyleElement>('style'))
    .map((style) => `<style>${style.textContent ?? ''}</style>`)
    .join('\n')

  const title = fileName?.trim() ? escapeHtml(fileName.trim()) : ' '

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  ${stylesheetLinks}
  ${inlineStyles}
  <style>
    @page { size: A4; margin: 1cm; }
    html, body { margin: 0; padding: 0; overflow: visible !important; height: auto !important; }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      overflow: visible !important;
    }
    * { overflow: visible !important; max-width: 100%; }
  </style>
</head>
<body class="${document.body.className}">
  ${clone.outerHTML}
</body>
</html>`

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;width:0;height:0;border:0;clip:rect(0,0,0,0);overflow:hidden'
  document.body.appendChild(iframe)

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1000)
  }

  let printed = false
  const doPrint = () => {
    if (printed) return
    printed = true
    const win = iframe.contentWindow
    if (!win) {
      cleanup()
      return
    }
    win.focus()
    win.print()
    cleanup()
  }

  iframe.onload = doPrint
  iframe.srcdoc = html

  window.setTimeout(() => {
    if (!printed && document.body.contains(iframe)) {
      doPrint()
    }
  }, 1500)
}
