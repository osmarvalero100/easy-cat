import { Catalog } from '../types/catalog';

// Vercel serverless functions reject request bodies larger than 4.5 MB (413).
// Keep a safety margin for JSON overhead.
export const MAX_SAVE_PAYLOAD_BYTES = 4 * 1024 * 1024;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * Resizes and re-encodes an image data URL as JPEG (or WebP/PNG preserved for transparency when requested).
 * Returns the original string if it is not a data URL or compression does not reduce its size.
 */
export async function compressImageDataUrl(
  dataUrl: string | undefined,
  maxDim = 1200,
  quality = 0.82,
  keepTransparency = false
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:image/svg')) {
    return dataUrl || '';
  }

  try {
    const img = await loadImage(dataUrl);
    let width = img.width;
    let height = img.height;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    ctx.drawImage(img, 0, 0, width, height);
    const compressed = keepTransparency
      ? canvas.toDataURL('image/webp', quality)
      : canvas.toDataURL('image/jpeg', quality);

    return compressed.length < dataUrl.length ? compressed : dataUrl;
  } catch {
    return dataUrl;
  }
}

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const payloadSize = (catalog: Catalog) => new Blob([JSON.stringify(catalog)]).size;

/**
 * Progressively recompresses embedded images until the catalog JSON fits under the
 * serverless request body limit. Returns the (possibly) smaller catalog.
 */
export async function shrinkCatalogForSave(catalog: Catalog): Promise<Catalog> {
  if (payloadSize(catalog) <= MAX_SAVE_PAYLOAD_BYTES) return catalog;

  const passes: Array<[number, number]> = [
    [1600, 0.8],
    [1200, 0.75],
    [1000, 0.7],
    [800, 0.65],
    [640, 0.6],
  ];

  let current = catalog;
  for (const [coverDim, quality] of passes) {
    const productDim = Math.min(coverDim, 1000);
    current = {
      ...current,
      coverImage: await compressImageDataUrl(current.coverImage, coverDim, quality),
      brandLogo: current.brandLogo ? await compressImageDataUrl(current.brandLogo, 600, quality, true) : current.brandLogo,
      products: await Promise.all(
        current.products.map(async (p) => ({
          ...p,
          image: await compressImageDataUrl(p.image, productDim, quality),
        }))
      ),
    };
    if (payloadSize(current) <= MAX_SAVE_PAYLOAD_BYTES) break;
  }

  return current;
}

export const getCatalogPayloadSize = payloadSize;
