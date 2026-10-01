import { Catalog } from '../types/catalog';
import { INITIAL_CATALOG } from '../data/defaultCatalog';

const STORAGE_KEY = 'easycat_catalog_data';

export const saveCatalogToStorage = (catalog: Catalog): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    localStorage.setItem(`${STORAGE_KEY}_${catalog.slug}`, JSON.stringify(catalog));
  } catch (err) {
    console.error('Error saving catalog to localStorage', err);
  }
};

export const getCatalogFromStorage = (slug?: string): Catalog => {
  if (typeof window === 'undefined') return INITIAL_CATALOG;
  try {
    if (slug) {
      const storedBySlug = localStorage.getItem(`${STORAGE_KEY}_${slug}`);
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
