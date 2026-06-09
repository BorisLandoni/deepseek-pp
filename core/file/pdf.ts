/**
 * Lazy PDF text extraction using pdf.js. This module is only imported on demand (when the
 * user attaches a PDF), so pdf.js lands in a separate chunk and never weighs down startup.
 */

// The worker is bundled as a same-origin file; CSP `script-src 'self'` allows it.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let workerConfigured = false;

export interface PdfExtractResult {
  text: string;
  pages: number;
  pagesRead: number;
}

export async function extractPdfText(file: File, maxPages = 50): Promise<PdfExtractResult> {
  const pdfjs = await import('pdfjs-dist');

  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    workerConfigured = true;
  }

  const data = new Uint8Array(await file.arrayBuffer());
  // isEvalSupported:false keeps pdf.js within the extension CSP (no unsafe-eval).
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;

  const pagesRead = Math.min(doc.numPages, maxPages);
  const parts: string[] = [];
  for (let i = 1; i <= pagesRead; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .join(' ');
    if (line.trim()) parts.push(line);
  }

  try { await doc.destroy(); } catch { /* ignore */ }

  const text = parts.join('\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return { text, pages: doc.numPages, pagesRead };
}
