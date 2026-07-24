'use client'

import { useCallback, useEffect, useState } from 'react'
import { refreshPrintLayoutAfterFontChange } from '@/lib/print-document'

/** Options for the print preview font-size dropdown — add entries here to extend. */
export const PRINT_FONT_SIZE_OPTIONS = [
  { value: '8.5px', label: '8.5px (Default)' },
  { value: '9px', label: '9px' },
  { value: '9.5px', label: '9.5px' },
  { value: '10px', label: '10px' },
] as const

export type PrintFontSize = (typeof PRINT_FONT_SIZE_OPTIONS)[number]['value']

export const DEFAULT_PRINT_FONT_SIZE: PrintFontSize = '8.5px'

/** Design baseline used for --print-font-scale (spacing / rhythm). */
export const PRINT_FONT_BASE_PX = 8.5

const PRINT_FONT_ATTR = 'data-print-font'

function parsePx(size: string): number {
  const n = Number.parseFloat(size)
  return Number.isFinite(n) && n > 0 ? n : PRINT_FONT_BASE_PX
}

function getPrintTargets(): HTMLElement[] {
  if (typeof document === 'undefined') return []
  const targets: HTMLElement[] = [document.documentElement]
  const main = document.querySelector<HTMLElement>('main.quotation-doc')
  if (main) targets.push(main)
  return targets
}

/**
 * Apply --print-font-size + --print-font-scale for live preview and print clone.
 * Scale (relative to 8.5px) drives padding/line rhythm so layout stays proportional.
 */
export function applyPrintFontSize(size: string): void {
  const px = parsePx(size)
  const scale = String(px / PRINT_FONT_BASE_PX)
  for (const el of getPrintTargets()) {
    el.style.setProperty('--print-font-size', size)
    el.style.setProperty('--print-font-scale', scale)
    el.setAttribute(PRINT_FONT_ATTR, size)
  }
  refreshPrintLayoutAfterFontChange()
}

/** Restore default size (print session end / unmount). */
export function resetPrintFontSize(): void {
  applyPrintFontSize(DEFAULT_PRINT_FONT_SIZE)
}

export function getActivePrintFontSize(): string {
  if (typeof document === 'undefined') return DEFAULT_PRINT_FONT_SIZE
  const main = document.querySelector<HTMLElement>('main.quotation-doc')
  const fromMain = main?.style.getPropertyValue('--print-font-size')?.trim()
  if (fromMain) return fromMain
  const fromRoot = document.documentElement.style.getPropertyValue('--print-font-size')?.trim()
  return fromRoot || DEFAULT_PRINT_FONT_SIZE
}

/**
 * Font Size dropdown for print preview.
 * Updates --print-font-size live; resets to 8.5px after print dialog closes.
 */
export default function PrintFontSizeSelector() {
  const [fontSize, setFontSize] = useState<PrintFontSize>(DEFAULT_PRINT_FONT_SIZE)

  const sync = useCallback((size: PrintFontSize) => {
    setFontSize(size)
    applyPrintFontSize(size)
  }, [])

  useEffect(() => {
    applyPrintFontSize(fontSize)

    const onAfterPrint = () => {
      sync(DEFAULT_PRINT_FONT_SIZE)
    }
    window.addEventListener('afterprint', onAfterPrint)
    return () => {
      window.removeEventListener('afterprint', onAfterPrint)
      for (const el of getPrintTargets()) {
        el.removeAttribute(PRINT_FONT_ATTR)
        el.style.removeProperty('--print-font-size')
        el.style.removeProperty('--print-font-scale')
      }
      refreshPrintLayoutAfterFontChange()
    }
    // Intentionally mount-only: apply default, listen for afterprint, clean up on leave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <label className="print-font-size-selector no-print">
      <span className="print-font-size-label">Font Size</span>
      <span className="print-font-size-field">
        <select
          className="print-font-size-select"
          value={fontSize}
          aria-label="Font Size"
          onChange={(e) => sync(e.target.value as PrintFontSize)}
        >
          {PRINT_FONT_SIZE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}
