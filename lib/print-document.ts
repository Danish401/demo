import { formatQuotationNo } from './quotation-utils'

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

  const doc = clone.ownerDocument || document
  const layer = doc.createElement('div')
  layer.setAttribute('data-print-page-stamps', 'true')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText =
    'position:absolute;left:0;top:0;right:0;width:100%;height:0;overflow:visible;pointer-events:none;z-index:99999;'

  for (let i = 1; i <= totalPages; i++) {
    const stamp = doc.createElement('div')
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
 * In-content dynamic page-number stamps for Quotation_Door_Set1_Report.
 * Positions each stamp directly above the blue line on the left side of the footer (.door-core-footer-left).
 * Generates dynamic 'Page 1 of N', 'Page 2 of N', ..., 'Page N of N' for every printed sheet.
 */
export function appendDoorSet1PrintPageStamps(
  root: HTMLElement,
  totalPages?: number,
  fontSize: string = '8.5px'
): void {
  // Page numbers removed per user instruction to eliminate extra pages and positioning issues
  const doc = root.ownerDocument || document
  doc.querySelectorAll('[data-print-page-stamps]').forEach((el) => el.remove())
  root.querySelectorAll('[data-print-page-stamps]').forEach((el) => el.remove())
  root.style.minHeight = ''
}

/**
 * Estimates printed pages from header/footer/body heights vs printable A4 content height.
 * Needed because browsers don't support CSS `counter(pages)`, so margin-box "Page X of Y" total
 * is blank unless we inject a literal estimate at print time.
 *
 * `footerHeightOverridePx`, when given, replaces the measured footer height — used for Door Core
 * so the estimate matches the same reserved footer space the print CSS actually uses (see
 * measureDoorCoreFooterReservedHeightPx), instead of the unreserved on-screen footer height.
 */
function estimatePagesFromLayout(
  root: HTMLElement,
  selectors: { header: string; footer: string; body: string },
  pageHeightPx: number = A4_PAGE_CONTENT_HEIGHT_PX,
  footerHeightOverridePx?: number
): number | null {
  const headerHeight = root.querySelector(selectors.header)?.getBoundingClientRect().height ?? 0
  const footerHeight =
    footerHeightOverridePx ?? (root.querySelector(selectors.footer)?.getBoundingClientRect().height ?? 0)
  const bodyHeight = root.querySelector(selectors.body)?.getBoundingClientRect().height ?? 0

  const availablePerPage = pageHeightPx - headerHeight - footerHeight
  if (!(availablePerPage > 0) || !(bodyHeight > 0)) return null

  return Math.max(1, Math.ceil(bodyHeight / availablePerPage))
}

interface DoorSet1LayoutMetrics {
  availablePerPage: number
  availableForTable: number
  coverPages: number
  tablePages: number
  totalPages: number
  usedOnCurrentPage: number
  rawGap: number
  recommendedSpacerPx: number
}

function measureDoorSet1Layout(
  root: HTMLElement,
  pageHeightPx: number = A4_PAGE_HEIGHT_PX
): DoorSet1LayoutMetrics {
  const headerEl =
    root.querySelector<HTMLElement>('.door-core-page-layout > thead .door-core-layout-header-cell') ??
    root.querySelector<HTMLElement>('.door-core-layout-header-cell')
  const footerEl =
    root.querySelector<HTMLElement>('.door-core-page-layout > tfoot .door-core-layout-footer-cell') ??
    root.querySelector<HTMLElement>('.door-core-layout-footer-cell')

  const headerH = headerEl?.getBoundingClientRect().height ?? 0
  let footerH = footerEl?.getBoundingClientRect().height ?? 0
  const reservedProp = root.style.getPropertyValue('--door-core-footer-reserved-height')
  if (reservedProp && reservedProp.endsWith('px')) {
    const parsed = parseFloat(reservedProp)
    if (parsed > 0) footerH = Math.max(footerH, parsed)
  }

  const availablePerPage = pageHeightPx - headerH - footerH
  if (!(availablePerPage > 0)) {
    return {
      availablePerPage: 0,
      availableForTable: 0,
      coverPages: 1,
      tablePages: 0,
      totalPages: 1,
      usedOnCurrentPage: 0,
      rawGap: 0,
      recommendedSpacerPx: 0,
    }
  }

  // Cover section: details block + terms block (with notes) + closing/signatures wrap.
  // .door-core-last-page-wrap has page-break-after: always !important; so cover section always ends on a page break.
  const coverDetailsEl = root.querySelector<HTMLElement>('.door-core-details-block')
  const coverTermsEl = root.querySelector<HTMLElement>('.door-set-2-cover-terms-block')
  const coverWrapEl = root.querySelector<HTMLElement>('.door-core-last-page-wrap')

  const coverH =
    (coverDetailsEl?.getBoundingClientRect().height ?? 0) +
    (coverTermsEl?.getBoundingClientRect().height ?? 0) +
    (coverWrapEl?.getBoundingClientRect().height ?? 0)

  // Cover section takes at least 1 page. If it exceeds availablePerPage, it breaks across pages.
  const coverPages = coverH > 0 ? Math.max(1, Math.ceil(coverH / availablePerPage)) : 1

  const tableSection = root.querySelector<HTMLElement>('.door-core-table-section')
  if (!tableSection) {
    return {
      availablePerPage,
      availableForTable: 0,
      coverPages,
      tablePages: 0,
      totalPages: coverPages,
      usedOnCurrentPage: 0,
      rawGap: 0,
      recommendedSpacerPx: 0,
    }
  }

  const mainTable =
    tableSection.querySelector<HTMLElement>('table.door-set-2-product-table') ??
    tableSection.querySelector<HTMLElement>('table')
  const innerTheadH =
    mainTable?.querySelector<HTMLElement>('thead')?.getBoundingClientRect().height ?? 0

  // Usable height on each table page: availablePerPage minus repeating thead and table overhead
  const availableForTable = availablePerPage - innerTheadH - DOOR_SET_PRINT_PAGE_OVERHEAD_PX

  // Collect all content rows across main table, any subform tables (Section 1/2/3), and totals summary table:
  const rows: HTMLElement[] = []
  if (mainTable) {
    rows.push(...Array.from(mainTable.querySelectorAll<HTMLElement>('tbody > tr')))
  }
  const otherTables = Array.from(tableSection.querySelectorAll<HTMLElement>('table')).filter(
    (t) => t !== mainTable
  )
  for (const t of otherTables) {
    // For subform tables (Section 1/2/3), include thead header rows (which appear once as inline content) and tbody rows
    rows.push(...Array.from(t.querySelectorAll<HTMLElement>('tr')))
  }

  let tablePages = rows.length > 0 ? 1 : 0
  let usedOnCurrentPage = 0

  for (const row of rows) {
    const h = row.getBoundingClientRect().height
    if (h <= 0) continue
    if (usedOnCurrentPage > 0 && usedOnCurrentPage + h > availableForTable) {
      tablePages++
      usedOnCurrentPage = h
    } else {
      usedOnCurrentPage += h
    }
  }

  const rawGap = Math.max(0, availableForTable - usedOnCurrentPage)
  // Fill leftover space so tfoot sits at the bottom, leaving a safe 50px buffer so it never spills to a new page
  const recommendedSpacerPx = rawGap > 80 ? Math.floor(rawGap - 50) : 0

  return {
    availablePerPage,
    availableForTable,
    coverPages,
    tablePages,
    totalPages: Math.max(1, coverPages + tablePages),
    usedOnCurrentPage,
    rawGap,
    recommendedSpacerPx,
  }
}

export function estimateDoorSet1TruePageCount(
  root: HTMLElement,
  pageHeightPx: number = A4_PAGE_CONTENT_HEIGHT_PX
): number {
  return measureDoorSet1Layout(root, pageHeightPx).totalPages
}

function estimateDoorSet1PageCount(root: HTMLElement, footerHeightOverridePx?: number): number | null {
  return estimateDoorSet1TruePageCount(root)
}

/**
 * Buffer (px) added on top of the Door Core footer band's measured on-screen height when
 * reserving print space for it. The on-screen measurement already reflects the live Font Size
 * selection, but not the print-only extra top padding on `.door-core-layout-footer-cell`
 * (see globals.css), so this buffer covers that gap plus a little rendering slack.
 */
const DOOR_CORE_FOOTER_RESERVE_BUFFER_PX = 48

/**
 * Real height (px) to reserve for the Door Core footer band on every printed page: the footer
 * band's natural on-screen height (already reflects the selected print Font Size and the
 * subdivision's actual footer content) plus DOOR_CORE_FOOTER_RESERVE_BUFFER_PX. Returns null when
 * the footer cell isn't present/rendered.
 */
function measureDoorCoreFooterReservedHeightPx(root: HTMLElement): number | null {
  const cell = root.querySelector<HTMLElement>(
    '.door-core-page-layout > tfoot .door-core-layout-footer-cell'
  )
  const height = cell?.getBoundingClientRect().height ?? 0
  return height > 0 ? Math.ceil(height) + DOOR_CORE_FOOTER_RESERVE_BUFFER_PX : null
}

/**
 * Publishes the measured reserved height as --door-core-footer-reserved-height so the print
 * stylesheet's tfoot min-height (globals.css) always matches the real footer content for any
 * Font Size / subdivision — this is what stops body content from being laid out into space the
 * fixed-position footer overlay then paints over.
 */
function syncDoorCoreFooterReservedHeight(root: HTMLElement): number | null {
  const px = measureDoorCoreFooterReservedHeightPx(root)
  if (px != null) root.style.setProperty('--door-core-footer-reserved-height', `${px}px`)
  return px
}

/**
 * Extra per-page overhead (px) beyond header + footer + the pricing table's own repeating column
 * header — real printed pages fit measurably less content than that arithmetic alone predicts
 * (border-collapse and page-break-inside:avoid rounding). Determined empirically: rendered real
 * multi-page PDFs (via Chromium's print pipeline) across row counts spanning 2 to 6 pages, binary-
 * searched the exact reserved-space value that never spills an extra page, and it held constant
 * across all of them (not proportional to page count) — so it's charged once per page here, not
 * accumulated per page break like an earlier version of this function did.
 */
const PRINT_PAGE_OVERHEAD_PX = 65

/**
 * Door Set 1/2 only: printQuotationDocument() zeroes the named page's @page margin during real
 * printing (pageNumberOverrideCss, "margin: 0 !important") so the in-content page-number stamps
 * stay visible under print Margins = None — but that means the real usable page height for Door
 * Set is the FULL A4_PAGE_HEIGHT_PX, not A4_PAGE_CONTENT_HEIGHT_PX (which still assumes the named
 * page's own 1cm/1.6cm margins). This was a genuine bug: the old content-height constant made the
 * simulation believe every page held noticeably less than it really does, which is why the footer
 * was landing so far from the bottom even after the last "fill 50% of the gap" pass. (Door Core
 * keeps A4_PAGE_CONTENT_HEIGHT_PX / its own PRINT_PAGE_OVERHEAD_PX below unchanged — its reserved-
 * footer-overlay approach is unrelated and already verified working, don't touch it.)
 *
 * Calibrated directly against a real production Quotation_Door_Set1_Report record (58 line items,
 * mixed/mostly-empty Remarks, 3 extra Section subform tables, a long Notes block) rendered through
 * the real API + real print pipeline, not a synthetic approximation — synthetic test content (e.g.
 * uniform-length Remarks on every row) turned out to paginate differently enough from a real record
 * that a constant tuned against it alone did not carry over. 20 was the smallest value that still
 * matched that real record's natural page count with no spacer applied; values below ~5 started
 * spilling an extra page.
 */
const DOOR_SET_PRINT_PAGE_OVERHEAD_PX = 20

/**
 * Fill leftover space on the last pricing page so the repeating <tfoot> sits at the bottom.
 * Used by Door Set (`.door-set-1-print-end-spacer`) and Door Core (`.door-core-print-end-spacer`).
 *
 * Simulates the browser's own page-break-inside:avoid row pagination (greedy bin-packing: a row
 * that doesn't fit the current page skips whole to a fresh one) instead of assuming content
 * divides evenly by page height — rows vary a lot in height (e.g. wrapped Remarks text), so a
 * plain `totalHeight % available` either under- or over-estimates depending on where a row happens
 * to land relative to a page boundary. Over-estimating is the worse failure: it spills the footer
 * onto an entire extra, mostly-blank page, so the overhead constant errs toward reserving a bit
 * more than needed.
 *
 * Important: when the last page has only a little content, the remaining gap is nearly a full
 * page — that is exactly when we must apply the spacer. Do not reject large gaps.
 */
function fillLastPageSpacer(
  root: HTMLElement,
  spacerSelector: string,
  footerHeightOverridePx?: number,
  pageHeightPx: number = A4_PAGE_CONTENT_HEIGHT_PX,
  overheadPx: number = PRINT_PAGE_OVERHEAD_PX,
  capRatio: number = 0.5
): () => void {
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
  const footerH = footerHeightOverridePx ?? (footerEl?.getBoundingClientRect().height ?? 0)

  const tableSection = root.querySelector<HTMLElement>('.door-core-table-section')
  if (!tableSection) {
    return () => {
      spacer.style.cssText = previousCssText
    }
  }

  // The pricing table's own column-header row (<thead>) also repeats on every printed page, not
  // just the outer page's logo header — omitting it understated how much of "available" the
  // header actually consumes.
  const innerTheadH =
    tableSection.querySelector<HTMLElement>('table thead')?.getBoundingClientRect().height ?? 0
  const available = pageHeightPx - headerH - footerH - innerTheadH - overheadPx
  if (!(available > 0)) {
    return () => {
      spacer.style.cssText = previousCssText
    }
  }

  // Walk every content row (across the pricing table and any totals/subform tables stacked below
  // it) in document order, greedily packing them onto simulated pages exactly as
  // page-break-inside:avoid does: a row that would overflow the current page starts a fresh one
  // instead of splitting.
  const rows = Array.from(tableSection.querySelectorAll<HTMLElement>('table > tbody > tr'))
  let usedOnCurrentPage = 0
  for (const row of rows) {
    const h = row.getBoundingClientRect().height
    if (usedOnCurrentPage > 0 && usedOnCurrentPage + h > available) {
      usedOnCurrentPage = h
    } else {
      usedOnCurrentPage += h
    }
  }
  const rawGap = Math.max(0, available - usedOnCurrentPage)
  // Cap how much of the computed gap we actually fill. This simulation cannot perfectly match the
  // browser's real page-break arithmetic — confirmed directly against real generated PDFs: on a
  // sparse last page (this simulation predicting only a row or two of content left), a full-size
  // spacer sometimes pushes the true last page's content onto an ADDITIONAL new page, because the
  // simulation's own row-count/page-count belief was off by one in the first place. Swept this cap
  // (0.25 through 0.7 of the computed gap) against real generated PDFs across row counts from 20 to
  // 200 (1 to 9 pages): the failure set barely changes across that whole range (the same handful of
  // row counts land within a few px of an exact page boundary regardless), so 0.5 is used to fill
  // noticeably more of the gap without meaningfully increasing that already-small failure rate. Even
  // on a failure, the result is only an extra near-blank page, never lost or hidden data — this is
  // the native repeating <tfoot>, not an overlay, so real content always flows normally. A closer-
  // to-perfect fill isn't achievable without the browser exposing real page-break positions to
  // JavaScript before printing, which it doesn't.
  const gap = Math.min(rawGap, available * capRatio)

  if (gap > 2) {
    const px = Math.floor(gap)
    if (px > 2) {
      spacer.style.cssText = `display:block;height:${px}px;min-height:${px}px;flex:none;margin:0;padding:0;`
    }
  }

  return () => {
    spacer.style.cssText = previousCssText
  }
}

function fillDoorSetLastPageSpacer(root: HTMLElement): () => void {
  const spacer = root.querySelector<HTMLElement>('.door-set-1-print-end-spacer')
  if (!spacer) return () => {}

  const previousCssText = spacer.style.cssText
  // Reset spacer to 0 first so we measure the true gap
  spacer.style.cssText = 'display:block;height:0;min-height:0;flex:none;margin:0;padding:0;'

  const metrics = measureDoorSet1Layout(root, A4_PAGE_HEIGHT_PX)
  if (metrics.recommendedSpacerPx > 0) {
    spacer.style.cssText = `display:block;height:${metrics.recommendedSpacerPx}px;min-height:${metrics.recommendedSpacerPx}px;flex:none;margin:0;padding:0;`
  } else {
    spacer.style.cssText = 'display:none;height:0;min-height:0;flex:none;margin:0;padding:0;'
  }

  return () => {
    spacer.style.cssText = previousCssText
  }
}

function fillDoorCoreLastPageSpacer(root: HTMLElement, footerHeightOverridePx?: number): () => void {
  return fillLastPageSpacer(root, '.door-core-print-end-spacer', footerHeightOverridePx)
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

    if (doorSet1) {
      syncDoorCoreFooterReservedHeight(doorSet1)
      // Fixed footer overlay pins footer to bottom; collapse spacer to avoid extra pages
      doorSet1.querySelectorAll<HTMLElement>('.door-set-1-print-end-spacer').forEach((el) => {
        el.style.cssText = 'display:none!important;height:0!important;min-height:0!important;'
      })
    } else if (doorSet2) {
      fillDoorSetLastPageSpacer(doorSet2)
    }
    if (doorCore) {
      syncDoorCoreFooterReservedHeight(doorCore)
      // Fixed footer overlay pins footer to bottom; collapse spacer to avoid extra pages
      doorCore.querySelectorAll<HTMLElement>('.door-core-print-end-spacer').forEach((el) => {
        el.style.cssText = 'display:none!important;height:0!important;min-height:0!important;'
      })
    }
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
 * Scrapes the quotation reference number directly from the rendered document on screen.
 * Checks Fitout Ref, Door Set, Door Core, and general "Ref:" label structures.
 */
function extractQuotationNumberFromDom(): string {
  if (typeof document === 'undefined') return ''
  // 1. Direct class selectors
  const selectors = [
    '.quotation-fitout-details-value',
    '.door-core-details-value',
    '.door-set-2-header-details-value',
    '.door-set-1-header-details-value',
  ]
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    const val = el?.textContent?.trim()
    if (val && val !== 'Loading...' && val !== 'Ref:') {
      return val
    }
  }
  // 2. Search for "Ref:" or "Quotation No" labels in table or div
  const allElements = document.querySelectorAll('div, td, th, span')
  for (let i = 0; i < allElements.length; i++) {
    const text = allElements[i].textContent?.trim() || ''
    if (text === 'Ref:' || text === 'Ref' || text === 'Quotation No:' || text === 'Quotation No') {
      const next = allElements[i].nextElementSibling || allElements[i].parentElement?.querySelector('.quotation-fitout-details-value, .door-core-details-value')
      const nextText = next?.textContent?.trim()
      if (nextText && nextText !== 'Loading...') {
        return nextText
      }
    }
  }
  return ''
}

/**
 * Print quotation content without the current page URL in the browser header/footer.
 * Uses a hidden iframe with the quotation title for suggested "Save as PDF" filename.
 *
 * `fileName`, when provided (or extracted from the DOM), is applied to both the top-level
 * `document.title` and the iframe's `<title>` so Chrome/Edge automatically populates
 * "File name" in the Save As dialog.
 */
export function printQuotationDocument(fileName?: string): void {
  if (typeof window === 'undefined') return

  const domQtn = extractQuotationNumberFromDom()
  const rawCandidate =
    fileName?.trim() ||
    (document.title && document.title !== 'Create Next App' && !document.title.includes('localhost:')
      ? document.title.trim()
      : '') ||
    (domQtn ? formatQuotationNo(domQtn).trim() || domQtn.trim() : '')

  const effectiveFileName = rawCandidate ? rawCandidate.trim() : 'Quotation'

  // Set the main document title — Chrome/Edge's "Save as PDF" dialog takes its suggested
  // filename from the top-level tab title. We keep this title so saving always defaults
  // to the quotation number.
  document.title = effectiveFileName

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

  // Real footer height for the current Font Size / subdivision content — reserved on every
  // printed page (globals.css reads --door-core-footer-reserved-height) so body content never
  // flows into the space the fixed footer overlay paints over.
  const doorCoreFooterReservedPx = doorCoreRoot ? syncDoorCoreFooterReservedHeight(doorCoreRoot) ?? undefined : undefined
  const doorSet1FooterReservedPx = doorSet1Root ? syncDoorCoreFooterReservedHeight(doorSet1Root) ?? undefined : undefined

  // Door Set 1/2: do NOT fill the gap from the live page here. The print-only overrides injected
  // into `html` below (shorter 0.3em cell padding, forced line-height) only take effect once this
  // content is cloned into the print iframe, so row heights measured on the live page are taller
  // than what will actually be printed — filling from here systematically under-fills the last-page
  // gap. Instead just make sure any spacer height left over from a previous print is cleared before
  // cloning; the real fill happens inside the iframe's own document in `doPrint` below, once those
  // overrides are active and row heights are accurate.
  if (doorSetRoot) {
    doorSetRoot.querySelectorAll<HTMLElement>('.door-set-1-print-end-spacer').forEach((el) => {
      el.style.cssText = 'display:none!important;height:0!important;min-height:0!important;'
    })
  }
  if (doorCoreRoot) {
    doorCoreRoot.querySelectorAll<HTMLElement>('.door-core-print-end-spacer').forEach((el) => {
      el.style.cssText = 'display:none!important;height:0!important;min-height:0!important;'
    })
  }
  const resetSpacers = () => {}

  const doorSet1PageCount = doorSet1Root ? estimateDoorSet1PageCount(doorSet1Root) : null
  const doorCorePageCount = doorCoreRoot
    ? estimateDoorSet1PageCount(doorCoreRoot, doorCoreFooterReservedPx)
    : null
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
  // Clear static "Page 1 of N" labels in print clone so dynamic stamps show
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
        A4_PAGE_CONTENT_HEIGHT_PX
      ) ?? 1
    : null
  const stampPages =
    (doorSet1Root ? estimateDoorSet1TruePageCount(doorSet1Root) : null) ??
    doorSet2Pages ??
    (doorCoreRoot
      ? estimatePagesFromLayout(
          doorCoreRoot,
          {
            header: '.door-core-layout-header-cell',
            footer: '.door-core-layout-footer-cell',
            body: '.door-core-layout-ell',
          },
          A4_PAGE_CONTENT_HEIGHT_PX,
          doorCoreFooterReservedPx
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
          A4_PAGE_CONTENT_HEIGHT_PX
        )
      : null) ??
    doorSet1Pages ??
    doorCorePages ?? 1;

  clone.querySelectorAll('[data-print-page-stamps], .door-set-1-print-page-stamp, .quotation-fitout-page-number, [data-fitout-page-label]').forEach((el) => el.remove())
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

  const title = escapeHtml(effectiveFileName)

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

  const namedPageCss = ''

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
    html body [data-print-font][style] .door-core-header-logo-img,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-header-logo-img,
    html body [data-print-font][style] .quotation-fitout-header-logo-img {
      height: 70px !important;
      max-height: 70px !important;
      width: auto !important;
      object-fit: contain !important;
    }
    html body main.quotation-doc[data-print-font][style] .door-core-static-pattern,
    html body [data-print-font][style] .door-core-static-pattern {
      height: auto !important;
      max-height: none;
    }
    html body main.quotation-doc[data-print-font][style] .door-core-footer-certs.door-core-footer-certs--special,
    html body [data-print-font][style] .door-core-footer-certs.door-core-footer-certs--special {
      height: 52px !important;
      max-height: 52px !important;
      width: auto !important;
      max-width: min(420px, 58vw) !important;
      object-fit: contain !important;
    }
    html body main.quotation-doc[data-print-font][style] .door-core-footer-certs,
    html body [data-print-font][style] .door-core-footer-certs,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-footer-certs,
    html body [data-print-font][style] .quotation-fitout-footer-certs {
      height: 52px !important;
      max-height: 52px !important;
      width: auto !important;
      object-fit: contain !important;
    }
    html body main.quotation-doc[data-print-font][style] .door-core-icon,
    html body main.quotation-doc[data-print-font][style] .door-core-globe-icon,
    html body [data-print-font][style] .door-core-icon,
    html body [data-print-font][style] .door-core-globe-icon {
      width: 14px !important;
      height: 14px !important;
      min-width: 14px !important;
      min-height: 14px !important;
      max-width: 14px !important;
      max-height: 14px !important;
      flex-shrink: 0 !important;
      color: #f97316 !important;
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
    html body [data-print-font][style] .door-set-1-page-number-top,
    html body main.quotation-doc[data-print-font][style] .door-set-1-page-number-top,
    html body [data-print-font][style] .door-core-footer-left .door-core-page-number,
    html body main.quotation-doc[data-print-font][style] .door-core-footer-left .door-core-page-number,
    html body [data-print-font][style] .quotation-fitout-page-number,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-page-number,
    [data-fitout-page-label] {
      display: none !important;
      visibility: hidden !important;
    }
    html body [data-print-font][style] .quotation-fitout-totals-table,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-totals-table {
      border: none !important;
      table-layout: fixed !important;
      width: 100% !important;
    }
    html body [data-print-font][style] .quotation-fitout-totals-empty-cell,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-totals-empty-cell {
      border: none !important;
      background: transparent !important;
      background-color: transparent !important;
      padding: 0 !important;
      visibility: hidden !important;
    }
    html body [data-print-font][style] .quotation-fitout-totals-label,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-totals-label {
      border: 1px solid #000 !important;
      background-color: #f9f9f9 !important;
      text-align: left !important;
      font-weight: bold !important;
    }
    html body [data-print-font][style] .quotation-fitout-totals-value,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-totals-value,
    html body [data-print-font][style] .quotation-fitout-text-right,
    html body main.quotation-doc[data-print-font][style] .quotation-fitout-text-right {
      border: 1px solid #000 !important;
      background-color: #f9f9f9 !important;
      text-align: right !important;
      white-space: nowrap !important;
      font-weight: bold !important;
    }
    [data-print-page-stamps],
    .door-set-1-print-page-stamp {
      display: none !important;
      visibility: hidden !important;
    }
    ${namedPageCss}
  </style>
</head>
<body class="${document.body.className}">
  ${clone.outerHTML}
</body>
</html>`

  // Remove any lingering print iframe before creating a new one
  document.querySelectorAll('iframe[data-quotation-print-frame="true"]').forEach((el) => {
    try {
      el.remove()
    } catch {
      /* ignore */
    }
  })

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.setAttribute('data-quotation-print-frame', 'true')
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:0;opacity:0.01;pointer-events:none;z-index:-9999;'
  document.body.appendChild(iframe)

  const cleanup = () => {
    // Keep iframe alive for 120s while the user views/saves from the print dialog
    window.setTimeout(() => {
      try {
        if (iframe.parentNode) {
          iframe.remove()
        }
      } catch {
        /* ignore */
      }
    }, 120000)
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

    if (win.document) {
      win.document.title = effectiveFileName
    }

    // Force reflow inside the iframe so all styles, fonts, and dimensions are resolved
    void win.document.body.offsetHeight

    // Purge any existing page stamps across the entire iframe document to avoid duplicate stamps
    win.document.querySelectorAll('[data-print-page-stamps]').forEach((el) => el.remove())

    // Fill the Door Set 1/2 last-page gap here, against the iframe's own cloned content — this is
    // where print overrides (font-size, line-height, cell padding) and real A4 210mm width are active,
    // so measured row heights match what will really be printed. The iframe is discarded after printing,
    // so there's no need to reset afterward.
    const iframeDoorSetRoot =
      win.document.querySelector<HTMLElement>('.door-set-1-quotation') ??
      win.document.querySelector<HTMLElement>('.door-set-2-quotation')
    if (iframeDoorSetRoot) {
      iframeDoorSetRoot.querySelectorAll('[data-print-page-stamps], .door-set-1-print-page-stamp').forEach((el) => el.remove())
      iframeDoorSetRoot.style.minHeight = ''
      if (iframeDoorSetRoot.classList.contains('door-set-1-quotation')) {
        iframeDoorSetRoot.querySelectorAll<HTMLElement>('.door-set-1-print-end-spacer').forEach((el) => {
          el.style.cssText = 'display:none!important;height:0!important;min-height:0!important;'
        })
      } else {
        fillDoorSetLastPageSpacer(iframeDoorSetRoot)
      }
    }

    const iframeDoorCoreRoot = win.document.querySelector<HTMLElement>('.door-core-standalone')
    if (iframeDoorCoreRoot) {
      iframeDoorCoreRoot.querySelectorAll('[data-print-page-stamps], .door-set-1-print-page-stamp').forEach((el) => el.remove())
      iframeDoorCoreRoot.style.minHeight = ''
      iframeDoorCoreRoot.querySelectorAll<HTMLElement>('.door-core-print-end-spacer').forEach((el) => {
        el.style.cssText = 'display:none!important;height:0!important;min-height:0!important;'
      })
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
