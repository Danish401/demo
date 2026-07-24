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

/** Quotation No display: use "-" instead of "." (e.g. FSFUJ/00001/Qtn.26 → FSFUJ/00001/Qtn-26) */
export function formatQuotationNo(value?: string | null): string {
  if (value == null || value === '') return ''
  return String(value).replace(/\./g, '-')
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

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const SCALE_WORDS = ['', 'Thousand', 'Million', 'Billion', 'Trillion']

function convertHundreds(n: number): string {
  let x = n
  let result = ''
  if (x >= 100) {
    result += ONES[Math.floor(x / 100)] + ' Hundred '
    x %= 100
  }
  if (x >= 20) {
    result += TENS[Math.floor(x / 10)] + ' '
    x %= 10
  }
  if (x > 0) {
    result += ONES[x] + ' '
  }
  return result.trim()
}

/**
 * Non-negative integer to words (e.g. 17514 → "Seventeen Thousand Five Hundred Fourteen").
 */
export function integerToWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return ''
  const int = Math.floor(n)
  if (int === 0) return 'Zero'

  const chunks: number[] = []
  let x = int
  while (x > 0) {
    chunks.push(x % 1000)
    x = Math.floor(x / 1000)
  }

  let result = ''
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i]
    if (chunk === 0) continue
    const scale = SCALE_WORDS[i]
    result += convertHundreds(chunk) + (scale ? ' ' + scale + ' ' : '')
  }
  return result.trim()
}

/**
 * Converts number to words (integer + optional hundredths as "xx/100")
 */
export function numberToWords(num: number): string {
  if (!Number.isFinite(num)) return ''
  const abs = Math.abs(num)
  const integerPart = Math.floor(abs)
  const decimalPart = Math.round((abs - integerPart) * 100)

  let words = integerToWords(integerPart)
  if (num < 0) words = 'Minus ' + words

  if (decimalPart > 0) {
    words += ` and ${decimalPart}/100`
  }

  return words.trim()
}

/**
 * Amount in words for totals lines (e.g. "Dirhams Ten Thousand … and Fifty Fils Only").
 * Uses the word "Dirhams", not the Dirham currency glyph.
 */
export function formatAedAmountInWords(value: string | number | undefined): string {
  if (value === undefined || value === null) return 'Dirhams ' + integerToWords(0) + ' Only'
  const num = typeof value === 'string' ? parseFloat(String(value).replace(/,/g, '')) : Number(value)
  if (!Number.isFinite(num)) return 'Dirhams ' + integerToWords(0) + ' Only'

  const abs = Math.abs(num)
  const intPart = Math.floor(abs)
  const decPart = Math.round((abs - intPart) * 100) % 100

  let s = integerToWords(intPart)
  if (decPart > 0) {
    const filWord = decPart === 1 ? 'Fil' : 'Fils'
    s += ' and ' + integerToWords(decPart) + ' ' + filWord
  }
  return 'Dirhams ' + s + ' Only'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Bolds "<word(s)> Civil Defence/Defense" within free text (e.g. Scope_field). The certifying
 * authority named in the text is typed per record and doesn't necessarily match the record's own
 * Emirates field — a door can be Civil-Defense-approved by one emirate while the project itself
 * is in another — so this matches the capitalized word(s) immediately preceding "Civil
 * Defence/Defense" in the text directly, rather than relying on a separate field.
 */
export function boldCivilDefenceHtml(text: string): string {
  const escaped = escapeHtml(text)
  return escaped.replace(
    /((?:[A-Z][a-zA-Z]*\s+){1,4}Civil\s+Defen[cs]e)/g,
    (match) => `<strong>${match}</strong>`
  )
}

/**
 * Formats Seal_Description from Zoho: each line with bold prefix up to ":" and dividers between rows.
 */
export function formatSealDescriptionHtml(raw: string | undefined): string {
  if (!raw?.trim()) return ''

  const normalized = raw
    .trim()
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return ''

  const items = lines
    .map((line) => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const prefix = line.slice(0, colonIndex + 1).trim()
        const detail = line.slice(colonIndex + 1).trim()
        return `<div class="door-core-seal-description-item"><strong>${escapeHtml(prefix)}</strong>${detail ? ` ${escapeHtml(detail)}` : ''}</div>`
      }
      return `<div class="door-core-seal-description-item">${escapeHtml(line)}</div>`
    })
    .join('')

  return `<div class="door-core-seal-description-list">${items}</div>`
}

/** Strip HTML / entities from Zoho text fields so display size is not driven by inline styles. */
export function plainZohoDisplayText(raw: unknown, emptyFallback = '—'): string {
  if (raw == null) return emptyFallback
  let s = String(raw).trim()
  if (!s) return emptyFallback
  if (/<[^>]+>/.test(s)) {
    s = s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
  return s || emptyFallback
}

/**
 * Strip Zoho rich-text inline font sizes (editor often defaults to 10) so CSS can enforce a cap
 * (e.g. 8.5px on Quotation_Door_Set1_Report Notes1). Also clears nowrap / nbsp so text wraps cleanly.
 * Keeps lists/bold/etc.
 */
export function stripZohoRichTextFontSize(html: string): string {
  if (!html) return html
  return html
    .replace(/font-size\s*:\s*[^;}"']+;?/gi, '')
    .replace(/white-space\s*:\s*[^;}"']+;?/gi, '')
    .replace(/(?:min-|max-)?width\s*:\s*[^;}"']+;?/gi, '')
    .replace(/text-align\s*:\s*[^;}"']+;?/gi, '')
    .replace(/display\s*:\s*inline[^;}"']*;?/gi, '')
    .replace(/\s*size\s*=\s*(["']?)\d+\1/gi, '')
    .replace(/\s*style\s*=\s*(["'])\s*\1/gi, '')
    .replace(/\s*style\s*=\s*(["'])\s*;\s*\1/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
}

/**
 * Subform Description: each item ends with a qty like "4 Nos" / "4Nos" — break to a new line after Nos
 * when more text follows (e.g. next "Supply of …" item on the same row).
 */
export function formatMultiLineDescription(raw: string | undefined | null): string {
  if (raw == null) return ''
  let s = String(raw).trim()
  if (!s) return ''

  s = s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<\/div>\s*<div[^>]*>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')

  if (/<[^>]+>/.test(s)) {
    s = s.replace(/<[^>]*>/g, ' ')
  }

  s = s.replace(/\s+/g, ' ').trim()

  /* Break after qty ending in Nos (4 Nos, 4Nos, etc.) when another item follows on the same line */
  s = s.replace(/(\d+\s*Nos\b)\s*(?=\S)/gi, '$1\n')

  /* Fallback: break before each additional "Supply of" on the same line */
  s = s.replace(/\s+(?=Supply\s+of\b)/gi, '\n')

  return s
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

/** Detect main (1.) vs roman sub (i.) numbering at the start of an HTML fragment */
function parseNotesBlockMarker(inner: string): { type: 'main' | 'sub' | 'plain'; body: string } {
  const trimmed = inner.trim()
  /* Allow optional bold/italic wrappers around "1." / "i." (common in Zoho rich text) */
  const mainMatch = trimmed.match(
    /^(?:<(?:strong|b|em|i|span|u)[^>]*>\s*)*(\d+)\.\s*(?:<\/(?:strong|b|em|i|span|u)>\s*)*/i
  )
  if (mainMatch) return { type: 'main', body: trimmed.slice(mainMatch[0].length) }
  const romanMatch = trimmed.match(
    /^(?:<(?:strong|b|em|i|span|u)[^>]*>\s*)*([ivxlcdm]+)\.\s*(?:<\/(?:strong|b|em|i|span|u)>\s*)*/i
  )
  if (romanMatch) return { type: 'sub', body: trimmed.slice(romanMatch[0].length) }
  return { type: 'plain', body: trimmed }
}

/** Turn flat Zoho <p>/<div> blocks with inline "1." / "i." prefixes into semantic lists */
function convertPlainNumberedNotesToList(html: string): string {
  const blockRegex = /<(p|div)([^>]*)>([\s\S]*?)<\/\1>/gi
  const items: { type: 'main' | 'sub' | 'plain'; html: string }[] = []
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(html)) !== null) {
    const parsed = parseNotesBlockMarker(match[3])
    if (!parsed.body && parsed.type === 'plain') continue
    if (parsed.type === 'plain' && items.length) {
      items[items.length - 1].html += ` ${parsed.body}`
    } else {
      items.push({ type: parsed.type, html: parsed.body })
    }
  }

  if (!items.some((i) => i.type === 'main' || i.type === 'sub')) return html

  let result = '<ol class="door-core-notes-count-list">'
  let openMain = false
  let openSub = false

  for (const item of items) {
    if (item.type === 'main') {
      if (openSub) {
        result += '</ol>'
        openSub = false
      }
      if (openMain) result += '</li>'
      result += `<li>${item.html}`
      openMain = true
    } else if (item.type === 'sub') {
      if (!openSub) {
        result += '<ol class="door-core-notes-sublist">'
        openSub = true
      }
      result += `<li>${item.html}</li>`
    } else if (openMain) {
      result += ` ${item.html}`
    }
  }

  if (openSub) result += '</ol>'
  if (openMain) result += '</li>'
  result += '</ol>'
  return result
}

/** Merge inline HTML blocks to a single text string (keeps inline tags like strong) */
function flattenInlineHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>\s*<p[^>]*>/gi, ' ')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, ' ')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTagsToPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Pull orphan <p>/<div> blocks after a </li> into that list item's text (e.g. pt 4 "mandatory.") */
function collectTrailingOrphanText(olInner: string, startPos: number): { text: string; endPos: number } {
  let pos = startPos
  let combined = ''

  while (pos < olInner.length) {
    const nextLi = olInner.indexOf('<li', pos)
    const nextOlClose = olInner.indexOf('</ol>', pos)
    const slice = olInner.slice(pos)
    const orphanMatch = slice.match(/^\s*<(p|div)[^>]*>([\s\S]*?)<\/\1>/i)
    if (!orphanMatch) break

    const absStart = pos + (orphanMatch.index ?? 0)
    if (nextLi !== -1 && absStart >= nextLi) break
    if (nextOlClose !== -1 && absStart >= nextOlClose) break

    const plain = stripTagsToPlainText(orphanMatch[2])
    if (/^\d+\.\s/.test(plain) || /^[ivxlcdm]+\.\s/i.test(plain)) break

    combined += ` ${flattenInlineHtml(orphanMatch[0])}`
    pos = absStart + orphanMatch[0].length
  }

  return { text: combined.trim(), endPos: pos }
}

function injectTextIntoLi(itemHtml: string, extraText: string): string {
  if (!extraText) return itemHtml
  const m = itemHtml.match(/^<li([^>]*)>([\s\S]*)<\/li>$/i)
  if (!m) return itemHtml

  const [, attrs, content] = m
  const nestedMatch = content.match(/((?:<ol[\s\S]*?<\/ol>|<ul[\s\S]*?<\/ul>)\s*)+$/i)
  const nestedRaw = nestedMatch?.[0] ?? ''
  const textPart = nestedRaw ? content.slice(0, content.length - nestedRaw.length) : content
  const merged = `${flattenInlineHtml(textPart)} ${extraText}`.replace(/\s+/g, ' ').trim()

  return `<li${attrs}>${merged}${nestedRaw}</li>`
}

function parseTopLevelListItems(olInner: string): string[] {
  const items: string[] = []
  let pos = 0

  while (pos < olInner.length) {
    const liStart = olInner.indexOf('<li', pos)
    if (liStart === -1) break

    let depth = 0
    let j = liStart
    while (j < olInner.length) {
      if (/^<li[\s>]/i.test(olInner.slice(j))) {
        depth++
        j = olInner.indexOf('>', j) + 1
        continue
      }
      if (/^<\/li>/i.test(olInner.slice(j))) {
        depth--
        j += 5
        if (depth === 0) break
        continue
      }
      j++
    }

    if (depth !== 0) break

    let itemHtml = olInner.slice(liStart, j)
    const orphan = collectTrailingOrphanText(olInner, j)
    if (orphan.text) itemHtml = injectTextIntoLi(itemHtml, orphan.text)

    items.push(itemHtml)
    pos = orphan.endPos > j ? orphan.endPos : j
  }

  return items
}

function processNotesListItem(itemHtml: string, textClass: string): string {
  const m = itemHtml.match(/^<li([^>]*)>([\s\S]*)<\/li>$/i)
  if (!m) return itemHtml

  const [, attrs, content] = m
  const nestedMatch = content.match(/((?:<ol[\s\S]*?<\/ol>|<ul[\s\S]*?<\/ul>)\s*)+$/i)
  const nestedRaw = nestedMatch?.[0]?.trim() ?? ''
  const textPart = nestedRaw ? content.slice(0, content.length - nestedRaw.length) : content
  let flat = flattenInlineHtml(textPart)
  /* Number comes from list-style — strip Zoho/manual "4." / "i." (incl. bold) and leftover spaces/nbsp */
  flat = flat.replace(
    /^(?:\s|&nbsp;|\u00a0)*(?:<(?:strong|b|em|i|span|u)[^>]*>\s*)*(?:\d+\.|[ivxlcdm]+\.)(?:\s*<\/(?:strong|b|em|i|span|u)>)*(?:\s|&nbsp;|\u00a0)*/i,
    ''
  )
  flat = flat.replace(/^(?:\d+\.|[ivxlcdm]+\.)(?:\s|&nbsp;|\u00a0)*/i, '')
  flat = flat.replace(/^(?:&nbsp;|\u00a0|\s)+/g, '').trim()
  const nested = nestedRaw ? processNotesOrderedList(nestedRaw, true) : ''

  if (!flat && !nested) return `<li${attrs}></li>`
  return `<li${attrs}>${flat ? `<span class="${textClass}">${flat}</span>` : ''}${nested}</li>`
}

function processNotesOrderedList(listHtml: string, isSub = false): string {
  const olMatch = listHtml.match(/^<ol([^>]*)>([\s\S]*)<\/ol>$/i)
  if (!olMatch) return listHtml

  const [, attrs, inner] = olMatch
  const treatAsSub =
    isSub ||
    /\btype\s*=\s*["']?i["']?/i.test(attrs) ||
    /list-style-type\s*:\s*lower-roman/i.test(attrs)
  const listClass = treatAsSub ? 'door-core-notes-sublist' : 'door-core-notes-count-list'
  const textClass = treatAsSub ? 'door-set-1-note-subtext' : 'door-set-1-note-text'
  const items = parseTopLevelListItems(inner)
  const body = items.map((item) => processNotesListItem(item, textClass)).join('')

  let classAttr = attrs
  if (/class\s*=/i.test(attrs)) {
    classAttr = attrs.replace(/class\s*=\s*(["'])([^"']*)\1/i, (_, q, cls) => {
      const cleaned = String(cls)
        .replace(/\bdoor-core-notes-(count-list|sublist)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
      return `class=${q}${cleaned ? `${cleaned} ` : ''}${listClass}${q}`
    })
  } else {
    classAttr = `${attrs} class="${listClass}"`
  }

  return `<ol${classAttr}>${body}</ol>`
}

/** Replace only top-level <ol>…</ol> blocks so nested sublists stay intact */
function mapTopLevelOrderedLists(html: string, mapFn: (olHtml: string) => string): string {
  let result = ''
  let pos = 0

  while (pos < html.length) {
    const start = html.indexOf('<ol', pos)
    if (start === -1) {
      result += html.slice(pos)
      break
    }
    if (!/^<ol[\s>]/i.test(html.slice(start))) {
      result += html.slice(pos, start + 3)
      pos = start + 3
      continue
    }

    result += html.slice(pos, start)
    let depth = 0
    let j = start
    let end = -1
    while (j < html.length) {
      if (/^<ol[\s>]/i.test(html.slice(j))) {
        depth++
        const gt = html.indexOf('>', j)
        j = gt === -1 ? html.length : gt + 1
        continue
      }
      if (/^<\/ol>/i.test(html.slice(j))) {
        depth--
        j += 5
        if (depth === 0) {
          end = j
          break
        }
        continue
      }
      j++
    }

    if (end === -1) {
      result += html.slice(start)
      break
    }

    result += mapFn(html.slice(start, end))
    pos = end
  }

  return result
}

/**
 * Normalize Zoho Notes1 rich text for Door Set 1: strip inline sizing, build proper lists,
 * merge continuation lines into their parent point, and wrap text for hanging-indent CSS.
 */
export function normalizeDoorSetNotesHtml(html: string): string {
  if (!html?.trim()) return html

  let s = stripZohoRichTextFontSize(html)
  s = s.replace(/<p>\s*<\/p>/gi, '').replace(/<div>\s*<\/div>/gi, '')
  /* Zoho editor indent styles create huge gaps in the report — strip them */
  s = s.replace(/margin-left\s*:\s*[^;"']+;?/gi, '')
  s = s.replace(/padding-left\s*:\s*[^;"']+;?/gi, '')
  s = s.replace(/text-indent\s*:\s*[^;"']+;?/gi, '')
  s = s.replace(/\s*mso-[a-z-]+\s*:\s*[^;"']+;?/gi, '')
  s = s.replace(/&nbsp;/gi, ' ')
  s = s.replace(/\u00a0/g, ' ')

  /* Zoho often puts "1." / "i." inside <li> while also using <ol> — drop duplicate prefix */
  s = s.replace(/<li([^>]*)>([\s\S]*?)<\/li>/gi, (_, attrs, inner) => {
    const cleaned = inner.replace(
      /^(\s*(?:<(?:strong|b|em|i|span|u)[^>]*>\s*)*)(\d+\.\s+|[ivxlcdm]+\.\s+)/i,
      '$1'
    )
    return `<li${attrs}>${cleaned}</li>`
  })

  if (/<ol[\s>]/i.test(s)) {
    s = mapTopLevelOrderedLists(s, (listBlock) => processNotesOrderedList(listBlock, false))
  } else {
    const converted = convertPlainNumberedNotesToList(s)
    if (converted !== s) {
      s = mapTopLevelOrderedLists(converted, (listBlock) => processNotesOrderedList(listBlock, false))
    }
  }

  return s
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
    quotationNumber: formatQuotationNo(zohoData.Name || `QT-${zohoData.ID}`),
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
