import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const printBrowserCatalog = (): void => {
  if (typeof window === 'undefined') return;
  window.print();
};

/**
 * Converts an image URL (including cross-origin URLs) to a base64 Data URL.
 * Ensures html2canvas renders external images cleanly without CORS issues.
 */
async function toDataUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return url;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    // If fetch fails (offline or blocked), fallback to original URL
    return url;
  }
}

export const exportCatalogToPdfFile = async (
  containerId: string = 'catalog-pages-container',
  filename: string = 'Catalogo-Velas-Artesanales.pdf',
  onProgress?: (step: string) => void
): Promise<void> => {
  if (typeof window === 'undefined') return;

  onProgress?.('Preparando catálogo para exportación...');

  // Ensure fonts are ready
  try {
    await document.fonts?.ready;
  } catch (e) {
    // Font loading fallback
  }

  // Query all catalog pages in the preview
  const pageElements = document.querySelectorAll<HTMLElement>('.catalog-page');

  if (!pageElements || pageElements.length === 0) {
    throw new Error('No se encontraron páginas para exportar.');
  }

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  // Standard A4 pixel proportions at 96 DPI
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  // Create an off-screen staging container with fixed A4 dimensions
  const stagingContainer = document.createElement('div');
  stagingContainer.id = 'pdf-staging-container';
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.left = '-99999px';
  stagingContainer.style.top = '0';
  stagingContainer.style.width = `${A4_WIDTH_PX}px`;
  stagingContainer.style.height = `${A4_HEIGHT_PX}px`;
  stagingContainer.style.overflow = 'hidden';
  stagingContainer.style.zIndex = '-9999';
  stagingContainer.style.pointerEvents = 'none';
  document.body.appendChild(stagingContainer);

  try {
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`Procesando página ${i + 1} de ${pageElements.length}...`);

      // Deep clone the page element
      const clonedPage = pageEl.cloneNode(true) as HTMLElement;

      // Force fixed A4 dimensions and strip screen artifacts (shadows, rounded corners, transforms)
      clonedPage.style.display = 'flex';
      clonedPage.style.flexDirection = 'column';
      clonedPage.style.justifyContent = 'space-between';
      clonedPage.style.width = `${A4_WIDTH_PX}px`;
      clonedPage.style.height = `${A4_HEIGHT_PX}px`;
      clonedPage.style.minHeight = `${A4_HEIGHT_PX}px`;
      clonedPage.style.maxHeight = `${A4_HEIGHT_PX}px`;
      clonedPage.style.boxSizing = 'border-box';
      clonedPage.style.margin = '0';
      clonedPage.style.boxShadow = 'none';
      clonedPage.style.borderRadius = '0';
      clonedPage.style.transform = 'none';
      clonedPage.style.overflow = 'hidden';

      // Adjust padding based on page type
      const isProductPage = clonedPage.querySelector('.grid') !== null;
      if (isProductPage) {
        clonedPage.style.padding = '36px 42px';
      } else {
        clonedPage.style.padding = '48px 52px';
      }

      // Remove any interactive buttons (e.g. "Pedir esta vela por WhatsApp") and print-hidden items
      const interactiveButtons = clonedPage.querySelectorAll('button, .print\\:hidden');
      interactiveButtons.forEach((btn) => btn.remove());

      // Ensure product grid is strictly 2 columns on product pages
      const grids = clonedPage.querySelectorAll('.grid');
      grids.forEach((grid) => {
        grid.classList.remove('grid-cols-1');
        grid.classList.add('grid-cols-2');
        (grid as HTMLElement).style.display = 'grid';
        (grid as HTMLElement).style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        (grid as HTMLElement).style.gap = '20px';
      });

      // Clear backdrop-filters which can cause rendering anomalies in html2canvas
      clonedPage.querySelectorAll<HTMLElement>('*').forEach((el) => {
        if (el.style) {
          el.style.backdropFilter = 'none';
          (el.style as unknown as Record<string, string>)['-webkit-backdrop-filter'] = 'none';
        }
      });

      // Inline all images as base64 Data URLs to completely eliminate CORS failures
      const images = Array.from(clonedPage.querySelectorAll('img'));
      await Promise.all(
        images.map(async (img) => {
          img.crossOrigin = 'anonymous';
          if (img.src && !img.src.startsWith('data:')) {
            const dataUrl = await toDataUrl(img.src);
            img.src = dataUrl;
          }
          if (!img.complete) {
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          }
        })
      );

      // Mount into staging container
      stagingContainer.replaceChildren(clonedPage);

      // Brief pause for browser layout stabilization
      await new Promise((r) => setTimeout(r, 80));

      const pageBg = getComputedStyle(pageEl).backgroundColor || '#FAF8F5';

      // High-resolution canvas capture (scale 2 = 1588 x 2246 px for crisp vector-like print)
      const canvas = await html2canvas(clonedPage, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: pageBg,
        logging: false,
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: 1280,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    onProgress?.('Guardando archivo PDF...');
    pdf.save(filename);
  } finally {
    if (stagingContainer && stagingContainer.parentNode) {
      stagingContainer.parentNode.removeChild(stagingContainer);
    }
  }
};

