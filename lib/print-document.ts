/**
 * Print quotation content without the current page URL in the browser header/footer.
 * Uses a hidden iframe with a blank document title so Chrome/Edge show minimal chrome
 * when "Headers and footers" is enabled. For a completely clean PDF, turn off
 * "Headers and footers" in the print dialog.
 */
export function printQuotationDocument(): void {
  if (typeof window === 'undefined') return

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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title> </title>
  ${stylesheetLinks}
  ${inlineStyles}
  <style>
    @page { size: A4; margin: 1cm; }
    html, body { margin: 0; padding: 0; }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
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
