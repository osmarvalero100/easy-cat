import { Catalog, Product, ProductGroup } from '../types/catalog';

/**
 * Returns a normalized list of product groups for a catalog.
 * If the catalog does not yet define productGroups, it constructs default groups
 * based on featuredSectionTitle and regularSectionTitle to preserve backward compatibility.
 */
export function normalizeProductGroups(catalog: Catalog): ProductGroup[] {
  if (catalog.productGroups && catalog.productGroups.length > 0) {
    return catalog.productGroups;
  }

  // Backward compatibility fallback for legacy catalogs
  const featuredTitle = catalog.featuredSectionTitle?.trim() || 'Colección Destacada';
  const regularTitle = catalog.regularSectionTitle?.trim() || 'Velas & Aromas';

  if (catalog.products && catalog.products.length > 2) {
    return [
      {
        id: 'group-default-1',
        name: featuredTitle,
        subtitle: 'Piezas artesanales de autor',
      },
      {
        id: 'group-default-2',
        name: regularTitle,
        subtitle: 'Aromas botánicos & colecciones clásicas',
      },
    ];
  }

  return [
    {
      id: 'group-default-1',
      name: featuredTitle,
      subtitle: 'Piezas artesanales de autor',
    },
  ];
}

export interface GroupedProductsItem {
  group: ProductGroup;
  products: Product[];
}

/**
 * Groups catalog products by their assigned group.
 * If products do not have a groupId, or have an invalid groupId:
 * - In legacy mode (no explicit productGroups), the first 2 products go to the 1st group,
 *   and remaining products go to the 2nd group (if available).
 * - Otherwise, unassigned products go to the first group, ensuring no product is ever hidden.
 */
export function getGroupedProducts(catalog: Catalog): GroupedProductsItem[] {
  const groups = normalizeProductGroups(catalog);
  const products = catalog.products || [];

  const groupMap = new Map<string, Product[]>();
  groups.forEach((g) => groupMap.set(g.id, []));

  const hasExplicitGroups = Boolean(catalog.productGroups && catalog.productGroups.length > 0);

  if (!hasExplicitGroups) {
    // Legacy distribution: first 2 in group 0, rest in group 1 (if available)
    products.forEach((p, index) => {
      if (index < 2 || groups.length === 1) {
        groupMap.get(groups[0].id)!.push(p);
      } else {
        groupMap.get(groups[1].id)!.push(p);
      }
    });
  } else {
    // Explicit groups defined: check each product's groupId
    const firstGroupId = groups[0].id;
    products.forEach((p) => {
      if (p.groupId && groupMap.has(p.groupId)) {
        groupMap.get(p.groupId)!.push(p);
      } else {
        // Fallback to first group so product is never lost
        groupMap.get(firstGroupId)!.push(p);
      }
    });
  }

  return groups.map((group) => ({
    group,
    products: groupMap.get(group.id) || [],
  }));
}

export interface CatalogProductPageItem {
  group: ProductGroup;
  products: Product[];
  pageNumber: number;
  pageIndexInGroup: number;
  totalPagesInGroup: number;
  sectionTitle: string;
  sectionSubtitle?: string;
}

export interface CatalogPagesResult {
  pages: CatalogProductPageItem[];
  totalPages: number;
}

/**
 * Generates editorial A4 page chunks (2 products per page) grouped by section/group.
 * Each grouping starts on its own fresh page with its own page title!
 * Returns the page items and the overall totalPages count (Cover + Product Pages + Back Cover).
 */
export function getCatalogPages(catalog: Catalog, productsPerPage = 2): CatalogPagesResult {
  const groupedItems = getGroupedProducts(catalog);
  const pages: CatalogProductPageItem[] = [];

  let currentPageNumber = 2; // Page 1 is the Cover Page

  // If there are groups with products, generate pages for them
  const activeGroups = groupedItems.filter((item) => item.products.length > 0);

  // If all groups are empty, we still render 1 empty page for the first group to show structure
  if (activeGroups.length === 0 && groupedItems.length > 0) {
    const firstGroup = groupedItems[0].group;
    pages.push({
      group: firstGroup,
      products: [],
      pageNumber: currentPageNumber,
      pageIndexInGroup: 0,
      totalPagesInGroup: 1,
      sectionTitle: firstGroup.name,
      sectionSubtitle: firstGroup.subtitle,
    });
    currentPageNumber++;
  } else {
    activeGroups.forEach((item) => {
      const { group, products } = item;
      const chunks: Product[][] = [];
      for (let i = 0; i < products.length; i += productsPerPage) {
        chunks.push(products.slice(i, i + productsPerPage));
      }

      const totalPagesInGroup = chunks.length;

      chunks.forEach((chunk, chunkIndex) => {
        pages.push({
          group,
          products: chunk,
          pageNumber: currentPageNumber,
          pageIndexInGroup: chunkIndex,
          totalPagesInGroup,
          sectionTitle: group.name,
          sectionSubtitle: group.subtitle,
        });
        currentPageNumber++;
      });
    });
  }

  // Cover (1) + Product Pages + Back Cover (1)
  const totalPages = pages.length + 2;

  return {
    pages,
    totalPages,
  };
}
