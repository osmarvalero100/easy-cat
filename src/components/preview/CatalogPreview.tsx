import React, { useState } from 'react';
import { Catalog, Product } from '../../types/catalog';
import { CatalogCoverPage } from './CatalogCoverPage';
import { CatalogProductPage } from './CatalogProductPage';
import { CatalogBackCoverPage } from './CatalogBackCoverPage';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface CatalogPreviewProps {
  catalog: Catalog;
  isPrintMode?: boolean;
  onChange?: (updatedCatalog: Catalog) => void;
}

export const CatalogPreview: React.FC<CatalogPreviewProps> = ({
  catalog,
  isPrintMode = false,
  onChange,
}) => {
  // 2 products per page for high-luxury editorial layout
  const productsPerPage = 2;
  const productChunks: Product[][] = [];

  for (let i = 0; i < catalog.products.length; i += productsPerPage) {
    productChunks.push(catalog.products.slice(i, i + productsPerPage));
  }

  const handleUpdateSectionTitle = (index: number, newTitle: string) => {
    if (!onChange) return;
    if (index === 0) {
      onChange({
        ...catalog,
        featuredSectionTitle: newTitle,
      });
    } else {
      onChange({
        ...catalog,
        regularSectionTitle: newTitle,
      });
    }
  };

  const handleUpdateFooterText = (newFooter: string) => {
    if (!onChange) return;
    onChange({
      ...catalog,
      footerText: newFooter,
    });
  };

  const totalPages = 1 + productChunks.length + 1; // Cover + Product Pages + Back Cover
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  return (
    <div className="relative flex flex-col w-full h-full bg-stone-900/5 backdrop-blur-xs">
      {/* Control Bar (Hidden in Print) */}
      {!isPrintMode && (
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/95 border-b border-stone-200 backdrop-blur-md shadow-2xs print:hidden">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Vista Previa Editorial:</span>
              <span className="sm:hidden">Revista:</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-mono bg-stone-100 text-stone-700">
              {totalPages} pág. ({catalog.products.length} velas)
            </span>
          </div>

          {/* Mode Switcher & Zoom */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2 sm:px-2.5 py-1 rounded-md transition-all text-xs ${
                  viewMode === 'all'
                    ? 'bg-white font-medium text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2 sm:px-2.5 py-1 rounded-md transition-all text-xs ${
                  viewMode === 'single'
                    ? 'bg-white font-medium text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Página x pág.
              </button>
            </div>

            {viewMode === 'single' && (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md border bg-white hover:bg-stone-50 disabled:opacity-40"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-stone-700 px-1 text-xs">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md border bg-white hover:bg-stone-50 disabled:opacity-40"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom Controls (hidden on very small screens to avoid horizontal overflow) */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs ml-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="p-1 text-stone-600 hover:text-stone-900"
                title="Reducir zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 text-stone-700">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                className="p-1 text-stone-600 hover:text-stone-900"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages Container */}
      <div className="flex-1 p-2 sm:p-4 md:p-8 overflow-y-auto overflow-x-hidden flex flex-col items-center print:p-0 print:m-0 print:overflow-visible">
        <div
          id="catalog-pages-container"
          className="w-full max-w-[850px] flex flex-col gap-6 md:gap-10 print:gap-0 print:m-0 print:p-0 print:max-w-none transition-all duration-200"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Page 1: Cover */}
          <div
            id="catalog-page-1"
            className={`catalog-page-wrapper ${
              viewMode === 'single' && currentPage !== 1 ? 'hidden print:block' : 'block'
            }`}
          >
            <CatalogCoverPage catalog={catalog} isPrintMode={isPrintMode} />
          </div>

          {/* Product Pages */}
          {productChunks.map((chunk, index) => {
            const pageNum = 2 + index;
            const isHiddenInSingle = viewMode === 'single' && currentPage !== pageNum;

            return (
              <div
                key={index}
                id={`catalog-page-${pageNum}`}
                className={`catalog-page-wrapper ${
                  isHiddenInSingle ? 'hidden print:block' : 'block'
                }`}
              >
                <CatalogProductPage
                  catalog={catalog}
                  products={chunk}
                  pageNumber={pageNum}
                  totalPages={totalPages}
                  sectionTitle={
                    index === 0
                      ? (catalog.featuredSectionTitle || 'Colección Destacada')
                      : (catalog.regularSectionTitle || 'Velas & Aromas')
                  }
                  onUpdateSectionTitle={
                    onChange
                      ? (newTitle) => handleUpdateSectionTitle(index, newTitle)
                      : undefined
                  }
                  isPrintMode={isPrintMode}
                />
              </div>
            );
          })}

          {/* Back Cover Page */}
          <div
            id={`catalog-page-${totalPages}`}
            className={`catalog-page-wrapper ${
              viewMode === 'single' && currentPage !== totalPages ? 'hidden print:block' : 'block'
            }`}
          >
            <CatalogBackCoverPage
              catalog={catalog}
              pageNumber={totalPages}
              isPrintMode={isPrintMode}
              onUpdateFooterText={onChange ? handleUpdateFooterText : undefined}
            />
          </div>
        </div>
      </div>

      {/* Mobile Floating Pagination for Single Page Mode */}
      {!isPrintMode && viewMode === 'single' && (
        <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-4 text-xs font-mono border border-stone-700">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
