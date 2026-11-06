import { Catalog } from '../types/catalog';
import { INITIAL_CATALOG } from '../data/defaultCatalog';

const STORAGE_KEY = 'easycat_catalog_data';
// Stores only the slug of the last edited catalog, so the (large) catalog JSON is kept once
const CURRENT_SLUG_KEY = `${STORAGE_KEY}__current_slug`;

const isQuotaError = (err: unknown) =>
  err instanceof DOMException &&
  (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

// Removes cached catalogs other than the one being saved to free localStorage space
const evictOtherCatalogs = (keepKey: string) => {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY) && key !== keepKey && key !== CURRENT_SLUG_KEY) {
      localStorage.removeItem(key);
    }
  }
};

export const saveCatalogToStorage = (catalog: Catalog): void => {
  if (typeof window === 'undefined') return;
  const slugKey = `${STORAGE_KEY}_${catalog.slug}`;
  try {
    const json = JSON.stringify(catalog);
    localStorage.setItem(CURRENT_SLUG_KEY, catalog.slug || '');
    // Legacy key duplicated the whole catalog; drop it to halve storage usage
    localStorage.removeItem(STORAGE_KEY);
    try {
      localStorage.setItem(slugKey, json);
    } catch (err) {
      if (!isQuotaError(err)) throw err;
      evictOtherCatalogs(slugKey);
      localStorage.setItem(slugKey, json);
    }
  } catch (err) {
    if (isQuotaError(err)) {
      // The local cache is only a convenience copy; MySQL remains the source of truth
      localStorage.removeItem(slugKey);
      console.warn('Catalog too large for localStorage; skipping local backup copy.');
    } else {
      console.error('Error saving catalog to localStorage', err);
    }
  }
};

export const getCatalogFromStorage = (slug?: string): Catalog => {
  if (typeof window === 'undefined') return INITIAL_CATALOG;
  try {
    const targetSlug = slug || localStorage.getItem(CURRENT_SLUG_KEY);
    if (targetSlug) {
      const storedBySlug = localStorage.getItem(`${STORAGE_KEY}_${targetSlug}`);
      if (storedBySlug) return JSON.parse(storedBySlug);
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error('Error loading catalog from localStorage', err);
  }
  return INITIAL_CATALOG;
};

export const encodeCatalogToShareUrl = (catalog: Catalog, origin: string): string => {
  try {
    const slug = catalog.slug || 'catalogo';
    const jsonStr = JSON.stringify(catalog);
    const encoded = btoa(encodeURIComponent(jsonStr));
    return `${origin}/c/${slug}#data=${encoded}`;
  } catch (e) {
    console.error('Error encoding catalog to URL', e);
    return `${origin}/c/${catalog.slug || 'catalogo'}`;
  }
};

export const decodeCatalogFromShareUrl = (hashOrQuery: string): Catalog | null => {
  try {
    if (!hashOrQuery) return null;
    const match = hashOrQuery.match(/data=([^&]+)/);
    if (!match || !match[1]) return null;
    const decodedStr = decodeURIComponent(atob(match[1]));
    return JSON.parse(decodedStr);
  } catch (e) {
    console.error('Error decoding catalog from URL', e);
    return null;
  }
};
