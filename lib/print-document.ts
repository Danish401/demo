function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PX_PER_MM = 96 / 25.4
/** Full A4 height — used for in-content page stamps so numbers still show when print Margins = None */
const A4_PAGE_HEIGHT_MM = 297
const A4_PAGE_HEIGHT_PX = A4_PAGE_HEIGHT_MM * PX_PER_MM
/** A4 height (297mm) minus the 1cm top / 1.6cm bottom page margins on named @page rules in globals.css */
const A4_PAGE_CONTENT_HEIGHT_PX = (297 - 10 - 16) * PX_PER_MM

/**
 * Absolute page-number stamps (one slab per estimated sheet). Works when print Margins = None,
 * because @page margin boxes are suppressed in that mode and cannot draw "Page X of Y".
 */
function appendPrintPageStamps(clone: HTMLElement, totalPages: number, fontSize: string = '8.5px'): void {
  if (totalPages < 1) return

  const prevPosition = clone.style.position
  if (!prevPosition || prevPosition === 'static') {
    clone.style.position = 'relative'
  }

  const layer = document.createElement('div')
  layer.setAttribute('data-print-page-stamps', 'true')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText =
    'position:absolute;left:0;top:0;right:0;width:100%;height:0;overflow:visible;pointer-events:none;z-index:99999;'

  for (let i = 1; i <= totalPages; i++) {
    const stamp = document.createElement('div')
    stamp.textContent = `Page ${i} of ${totalPages}`
    stamp.style.cssText = [
      'position:absolute',
      `top:${(i - 1) * A4_PAGE_HEIGHT_MM}mm`,
      'left:0.5cm',
      `height:${A4_PAGE_HEIGHT_MM}mm`,
      'box-sizing:border-box',
      'display:flex',
      'align-items:flex-end',
      'padding-bottom:0.45cm',
      'font-family:Cambria, serif',
      `font-size:${fontSize}`,
      'font-weight:700',
      'color:#333',
      'white-space:nowrap',
    ].join(';')
    layer.appendChild(stamp)
  }

  clone.appendChild(layer)
}

/**
 * Estimates printed pages from header/footer/body heights vs printable A4 content height.
 * Needed because browsers don't support CSS `counter(pages)`, so margin-box "Page X of Y" total
 * is blank unless we inject a literal estimate at print time.
 */
function estimatePagesFromLayout(
  root: HTMLElement,
  selectors: { header: string; footer: string; body: string },
  pageHeightPx: number = A4_PAGE_CONTENT_HEIGHT_PX
): number | null {
  const headerHeight = root.querySelector(selectors.header)?.getBoundingClientRect().height ?? 0
  const footerHeight = root.querySelector(selectors.footer)?.getBoundingClientRect().height ?? 0
  const bodyHeight = root.querySelector(selectors.body)?.getBoundingClientRect().height ?? 0

  const availablePerPage = pageHeightPx - headerHeight - footerHeight
  if (!(availablePerPage > 0) || !(bodyHeight > 0)) return null

  return Math.max(1, Math.ceil(bodyHeight / availablePerPage))
}

function estimateDoorSet1PageCount(root: HTMLElement): number | null {
  return estimatePagesFromLayout(root, {
    header: '.door-core-layout-header-cell',
    footer: '.door-core-layout-footer-cell',
    body: '.door-core-layout-ell',
  })
}

/**
 * Fill leftover space on the last pricing page so the repeating <tfoot> sits at the bottom.
 * Used by Door Set (`.door-set-1-print-end-spacer`) and Door Core (`.door-core-print-end-spacer`).
 *
 * Important: when the last page has only a little content, the remaining gap is nearly a full
 * page — that is exactly when we must apply the spacer. Do not reject large gaps.
 */
function fillLastPageSpacer(root: HTMLElement, spacerSelector: string): () => void {
  const spacer = root.querySelector<HTMLElement>(spacerSelector)
  if (!spacer) return () => {}

  const previousCssText = spacer.style.cssText
  spacer.style.cssText = 'display:block;height:0;min-height:0;flex:none;margin:0;padding:0;'

  const headerEl = root.querySelector<HTMLElement>(
    '.door-core-page-layout > thead .door-core-layout-header-cell'
  )
  const footerEl = root.querySelector<HTMLElement>(
    '.door-core-page-layout > tfoot .door-core-layout-footer-cell'
  )
  const headerH = headerEl?.getBoundingClientRect().height ?? 0
  const footerH = footerEl?.getBoundingClientRect().height ?? 0

  const available = A4_PAGE_CONTENT_HEIGHT_PX - headerH - footerH
  const tableSection = root.querySelector<HTMLElement>('.door-core-table-section')
  if (!(available > 0) || !tableSection) {
    return () => {
      spacer.style.cssText = previousCssText
    }
  }

  void tableSection.offsetHeight
  const sectionH = tableSection.getBoundingClientRect().height
  const usedOnLastPage = sectionH % available
  // Near-zero residue → content already landed on an exact page boundary
  const gap = usedOnLastPage < 0.5 ? 0 : available - usedOnLastPage

  if (gap > 2) {
    // Leave a couple px so we don't spill a blank page from float / border rounding
    const px = Math.max(0, Math.floor(gap) - 2)
    if (px > 2) {
      spacer.style.cssText = `display:block;height:${px}px;min-height:${px}px;flex:none;margin:0;padding:0;`
    }
  }

  return () => {
    spacer.style.cssText = previousCssText
  }
}

function fillDoorSetLastPageSpacer(root: HTMLElement): () => void {
  return fillLastPageSpacer(root, '.door-set-1-print-end-spacer')
}

function fillDoorCoreLastPageSpacer(root: HTMLElement): () => void {
  return fillLastPageSpacer(root, '.door-core-print-end-spacer')
}

/**
 * Recalculate last-page spacers after a live font-size change so pagination
 * stays consistent between preview and print.
 */
export function refreshPrintLayoutAfterFontChange(): void {
  if (typeof document === 'undefined') return

  const main = document.querySelector<HTMLElement>('main.quotation-doc') ?? document.body
  main
    .querySelectorAll<HTMLElement>('.door-set-1-print-end-spacer, .door-core-print-end-spacer')
    .forEach((el) => {
      el.style.cssText = ''
    })

  requestAnimationFrame(() => {
    const doorSet1 = main.querySelector<HTMLElement>('.door-set-1-quotation')
    const doorSet2 =
      !doorSet1 ? main.querySelector<HTMLElement>('.door-set-2-quotation') : null
    const doorCore =
      !doorSet1 && !doorSet2
        ? main.querySelector<HTMLElement>('.door-core-standalone')
        : null

    if (doorSet1) fillDoorSetLastPageSpacer(doorSet1)
    else if (doorSet2) fillDoorSetLastPageSpacer(doorSet2)
    if (doorCore) fillDoorCoreLastPageSpacer(doorCore)
  })
}

function estimateFitoutPageCount(root: HTMLElement): number | null {
  return estimatePagesFromLayout(root, {
    header: '.quotation-fitout-header-cell',
    footer: '.quotation-fitout-footer-cell',
    body: '.quotation-fitout-body-cell',
  })
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

  const printFontSize =
    sourceRoot.style.getPropertyValue('--print-font-size')?.trim() ||
    document.documentElement.style.getPropertyValue('--print-font-size')?.trim() ||
    '8.5px'
  const printFontScale =
    sourceRoot.style.getPropertyValue('--print-font-scale')?.trim() ||
    document.documentElement.style.getPropertyValue('--print-font-scale')?.trim() ||
    String(Number.parseFloat(printFontSize) / 8.5)
  // Ensure the cloned root carries the variables into the print iframe
  sourceRoot.style.setProperty('--print-font-size', printFontSize)
  sourceRoot.style.setProperty('--print-font-scale', printFontScale)
  sourceRoot.setAttribute('data-print-font', printFontSize)

  // Containers may be nested under main.quotation-doc — check both root and descendants
  const doorSet1Root =
    sourceRoot.classList.contains('door-set-1-quotation')
      ? sourceRoot
      : sourceRoot.querySelector<HTMLElement>('.door-set-1-quotation')
  const doorSet2Root =
    !doorSet1Root
      ? sourceRoot.classList.contains('door-set-2-quotation')
        ? sourceRoot
        : sourceRoot.querySelector<HTMLElement>('.door-set-2-quotation')
      : null
  const doorSetRoot = doorSet1Root ?? doorSet2Root
  const doorCoreRoot =
    !doorSetRoot &&
    (sourceRoot.classList.contains('door-core-standalone')
      ? sourceRoot
      : sourceRoot.querySelector<HTMLElement>('.door-core-standalone'))
  const fitoutRoot =
    !doorSetRoot &&
    !doorCoreRoot &&
    (sourceRoot.classList.contains('quotation-fitout-container')
      ? sourceRoot
      : sourceRoot.querySelector<HTMLElement>('.quotation-fitout-container'))

  // Fill last-page gap before measuring pages / cloning so footer sits at bottom without fixed overlay
  const resetDoorSetSpacer = doorSetRoot ? fillDoorSetLastPageSpacer(doorSetRoot) : () => {}
  const resetDoorCoreSpacer = doorCoreRoot ? fillDoorCoreLastPageSpacer(doorCoreRoot) : () => {}
  const resetSpacers = () => {
    resetDoorSetSpacer()
    resetDoorCoreSpacer()
  }

  const doorSet1PageCount = doorSet1Root ? estimateDoorSet1PageCount(doorSet1Root) : null
  const doorCorePageCount = doorCoreRoot ? estimateDoorSet1PageCount(doorCoreRoot) : null
  const fitoutPageCount = fitoutRoot ? estimateFitoutPageCount(fitoutRoot) : null
  const fitoutPages = fitoutPageCount ?? (fitoutRoot ? 1 : null)
  const doorCorePages = doorCorePageCount ?? (doorCoreRoot ? 1 : null)
  const doorSet1Pages = doorSet1PageCount ?? (doorSet1Root ? 1 : null)

  // On-screen footer can show estimated total; print uses @page counter(page) instead
  // (static "Page 1 of N" in the footer band cannot increment per printed sheet).
  if (fitoutRoot && fitoutPages != null) {
    fitoutRoot.querySelectorAll<HTMLElement>('[data-fitout-page-label]').forEach((el) => {
      el.textContent = `Page 1 of ${fitoutPages}`
    })
  }
  if (doorCoreRoot && doorCorePages != null) {
    doorCoreRoot.querySelectorAll<HTMLElement>('[data-door-core-page-label]').forEach((el) => {
      el.textContent = `Page 1 of ${doorCorePages}`
    })
  }
  if (doorSet1Root && doorSet1Pages != null) {
    doorSet1Root.querySelectorAll<HTMLElement>('[data-door-set1-page-label]').forEach((el) => {
      el.textContent = `Page 1 of ${doorSet1Pages}`
    })
  }

  const clone = sourceRoot.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.no-print').forEach((el) => el.remove())
  // Clear static "Page 1 of N" — it cannot increment per sheet
  clone
    .querySelectorAll<HTMLElement>(
      '[data-fitout-page-label], [data-door-core-page-label], [data-door-set1-page-label]'
    )
    .forEach((el) => {
      el.textContent = ''
    })

  // In-content stamps: visible even when print dialog Margins = None (@page margin boxes are off then).
  // Full-bleed A4 (margin:0 below) so stamps align under both Default and None.
  const doorSet2Pages = doorSet2Root
    ? estimatePagesFromLayout(
        doorSet2Root,
        {
          header: '.door-core-layout-header-cell',
          footer: '.door-core-layout-footer-cell',
          body: '.door-core-layout-ell',
        },
        A4_PAGE_HEIGHT_PX
      ) ?? 1
    : null
  const stampPages =
    (doorSet1Root
      ? estimatePagesFromLayout(
          doorSet1Root,
          {
            header: '.door-core-layout-header-cell',
            footer: '.door-core-layout-footer-cell',
            body: '.door-core-layout-ell',
          },
          A4_PAGE_HEIGHT_PX
        )
      : null) ??
    doorSet2Pages ??
    (doorCoreRoot
      ? estimatePagesFromLayout(
          doorCoreRoot,
          {
            header: '.door-core-layout-header-cell',
            footer: '.door-core-layout-footer-cell',
            body: '.door-core-layout-ell',
          },
          A4_PAGE_HEIGHT_PX
        )
      : null) ??
    (fitoutRoot
      ? estimatePagesFromLayout(
          fitoutRoot,
          {
            header: '.quotation-fitout-header-cell',
            footer: '.quotation-fitout-footer-cell',
            body: '.quotation-fitout-body-cell',
          },
          A4_PAGE_HEIGHT_PX
        )
      : null) ??
    doorSet1Pages ??
    doorCorePages ??
    fitoutPages
  if (stampPages != null) {
    appendPrintPageStamps(clone, stampPages, printFontSize)
  }
  resetSpacers()

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

  // Zero @page margins so Default and None share the same full-page height (297mm).
  // Page numbers then come from in-content stamps (margin boxes need margin space and vanish on None).
  const pageNumberOverrideCss = (pageName: string) =>
    `@page ${pageName} {
      size: A4;
      margin: 0 !important;
      @bottom-left { content: none; }
      @bottom-center { content: none; }
      @bottom-right { content: none; }
    }`

  const namedPageCss =
    doorSet1Root || doorSet2Root
      ? pageNumberOverrideCss('door-set-1-quotation-page')
      : doorCoreRoot
        ? pageNumberOverrideCss('door-core-quotation-page')
        : fitoutRoot
          ? pageNumberOverrideCss('fitout-quotation-page')
          : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  ${stylesheetLinks}
  ${inlineStyles}
  <style>
    html, body { margin: 0; padding: 0; overflow: visible !important; height: auto !important; }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      overflow: visible !important;
      --print-font-size: ${printFontSize};
      --print-font-scale: ${printFontScale};
    }
    * { overflow: visible !important; max-width: 100%; }
    /* Match on-screen Font Size selector — layout-preserving print override */
    html body main.quotation-doc[data-print-font][style],
    html body main.quotation-doc[data-print-font][style] *:not(svg):not(svg *):not(img):not(picture),
    html body [data-print-font][style],
    html body [data-print-font][style] *:not(svg):not(svg *):not(img):not(picture) {
      font-size: ${printFontSize} !important;
      line-height: 1.35 !important;
    }
    html body main.quotation-doc[data-print-font][style] th,
    html body main.quotation-doc[data-print-font][style] td,
    html body [data-print-font][style] th,
    html body [data-print-font][style] td {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      text-overflow: clip !important;
      vertical-align: middle !important;
      padding-top: 0.3em !important;
      padding-bottom: 0.3em !important;
      box-sizing: border-box !important;
    }
    html body main.quotation-doc[data-print-font][style] table,
    html body [data-print-font][style] table {
      table-layout: fixed !important;
      width: 100% !important;
    }
    html body main.quotation-doc[data-print-font][style] img,
    html body [data-print-font][style] img {
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }
    html body main.quotation-doc[data-print-font][style] .door-core-header-logo-img,
    html body main.quotation-doc[data-print-font][style] .door-core-footer-certs,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-footer-certs,
    html body main.quotation-doc[data-print-font][style] .door-core-static-pattern {
      height: auto !important;
      max-height: none;
    }
    html body main.quotation-doc[data-print-font][style] .no-print,
    html body main.quotation-doc[data-print-font][style] .no-print * {
      font-size: revert !important;
      line-height: revert !important;
    }
    /* "Quotation" title always 12px */
    html body main.quotation-doc[data-print-font][style] .door-core-cover-title,
    html body main.quotation-doc[data-print-font][style] .door-core-cover-title *,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-title,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-title *,
    html body main.quotation-doc[data-print-font][style] .quotation-title,
    html body main.quotation-doc[data-print-font][style] .quotation-title *,
    html body [data-print-font][style] .door-core-cover-title,
    html body [data-print-font][style] .door-core-cover-title *,
    html body [data-print-font][style] .quotation-fitout-title,
    html body [data-print-font][style] .quotation-fitout-title * {
      font-size: 12px !important;
      line-height: 1.3 !important;
    }
    ${namedPageCss}
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

    let parentNotified = false
    const notifyParentAfterPrint = () => {
      if (parentNotified) return
      parentNotified = true
      try {
        window.dispatchEvent(new Event('afterprint'))
      } catch {
        /* ignore */
      }
      cleanup()
    }

    // Iframe print does not bubble afterprint to the parent — used to reset Font Size selector
    win.addEventListener('afterprint', notifyParentAfterPrint)
    win.focus()
    win.print()
    // Fallback if the browser never fires afterprint on the iframe
    window.setTimeout(notifyParentAfterPrint, 120000)
  }

  iframe.onload = doPrint
  iframe.srcdoc = html

  window.setTimeout(() => {
    if (!printed && document.body.contains(iframe)) {
      doPrint()
    }
  }, 1500)
}
