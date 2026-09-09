import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface ExportPdfOptions {
  elementId: string;
  filename?: string;
  quality?: number; // scale multiplier, default 2 for crisp 300dpi output
}

/**
 * Exports a DOM element as a high-fidelity PDF, preserving exact Tailwind CSS styles,
 * RTL Arabic text shaping and cursive ligatures, modern color functions (oklch/lab/hsl),
 * fonts, and margins.
 *
 * Uses html-to-image as the primary engine because SVG foreignObject delegates text
 * shaping directly to the browser's native text shaper (HarfBuzz), ensuring that
 * bold Arabic headings and ligatures remain fully connected rather than split into
 * isolated characters. Falls back to html2canvas-pro if necessary.
 */
export async function exportElementToPdf({
  elementId,
  filename = 'ATS-Resume.pdf',
  quality = 2,
}: ExportPdfOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  // Wait for all web fonts (Cairo, Plus Jakarta Sans) to be fully loaded
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Temporarily ensure element has a clean white background and clean styling for export
  const originalBoxShadow = element.style.boxShadow;
  element.style.boxShadow = 'none';

  let imgData: string;
  let canvasWidth: number;
  let canvasHeight: number;

  try {
    // Primary engine: html-to-image (SVG foreignObject)
    // Preserves native browser Arabic cursive ligatures, font shaping, and modern CSS
    try {
      imgData = await toPng(element, {
        pixelRatio: quality,
        backgroundColor: '#ffffff',
        style: {
          boxShadow: 'none',
          border: 'none',
          borderRadius: '0',
          letterSpacing: 'normal',
        },
        filter: (node) => {
          if ((node as HTMLElement)?.classList?.contains('no-print')) {
            return false;
          }
          return true;
        },
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load rendered image from html-to-image'));
        img.src = imgData;
      });

      canvasWidth = img.naturalWidth || img.width || 800;
      canvasHeight = img.naturalHeight || img.height || 1130;
    } catch (primaryErr) {
      console.warn('html-to-image fallback triggered, falling back to html2canvas-pro:', primaryErr);

      // Secondary engine: html2canvas-pro with explicit Arabic ligature & RTL normalization
      const canvas = await html2canvas(element, {
        scale: quality,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.setAttribute('dir', 'rtl');
            clonedElement.style.direction = 'rtl';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.border = 'none';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.letterSpacing = 'normal';

            // Hide any interactive elements in the PDF export clone
            const noPrintElements = clonedElement.querySelectorAll('.no-print');
            noPrintElements.forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });

            // Enforce letter-spacing normal on all elements inside clone to prevent Arabic letter splitting
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.letterSpacing = 'normal';
              (htmlEl.style as any).fontFeatureSettings = '"liga" 1, "kern" 1';
            });
          }
        },
      });

      imgData = canvas.toDataURL('image/jpeg', 0.98);
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
    }

    // Standard A4 dimensions in millimeters
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Calculate proportional dimensions
    const ratio = canvasHeight / canvasWidth;

    // Margins (in mm)
    const margin = 8;
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = printableWidth * ratio;

    // If it fits on a single page, scale it cleanly to avoid overflow
    if (printableHeight <= pageHeight - margin * 2) {
      const x = margin;
      const y = margin;
      pdf.addImage(imgData, 'JPEG', x, y, printableWidth, printableHeight, undefined, 'FAST');
    } else {
      // Multi-page handling: paginate smoothly
      let heightLeft = printableHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, printableHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - printableHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, printableHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    // Save with sanitized filename
    const sanitizedFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(sanitizedFilename);
  } finally {
    // Restore styling
    element.style.boxShadow = originalBoxShadow;
  }
}
