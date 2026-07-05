/** Render PDF bytes to PNG data URLs (one per page) for print-friendly display */
export async function renderPdfToPageImages(pdfBytes: ArrayBuffer): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist')

  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  }

  const pdf = await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise
  const pageImages: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')
    if (!context) continue

    await page.render({ canvasContext: context, viewport, canvas }).promise
    pageImages.push(canvas.toDataURL('image/png'))
  }

  return pageImages
}
