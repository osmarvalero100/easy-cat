import React, { useState, useEffect } from 'react';
import { Catalog, Product, hasCustomLogo, getBrandInitials } from '../../types/catalog';
import { VisualDimensionIndicator } from './VisualDimensionIndicator';
import { FragranceBadgeList } from './FragranceBadgeList';
import { ColorSwatchList } from './ColorSwatchList';
import { IncludesBadgeList } from './IncludesBadgeList';
import { MessageCircle, Clock, Sparkles, Edit2, Check } from 'lucide-react';

interface CatalogProductPageProps {
  catalog: Catalog;
  products: Product[];
  pageNumber: number;
  totalPages: number;
  sectionTitle?: string;
  isPrintMode?: boolean;
  onUpdateSectionTitle?: (newTitle: string) => void;
}

export const CatalogProductPage: React.FC<CatalogProductPageProps> = ({
  catalog,
  products,
  pageNumber,
  totalPages,
  sectionTitle = 'Colección de Temporada',
  isPrintMode = false,
  onUpdateSectionTitle,
}) => {
  const { theme, contact } = catalog;
  const { palette } = theme;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(sectionTitle);

  useEffect(() => {
    setTempTitle(sectionTitle);
  }, [sectionTitle]);

  const handleWhatsAppOrder = (product: Product) => {
    if (!contact.whatsapp) return;
    const phone = contact.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `¡Hola! Vi su catálogo "${catalog.title}" y me interesa ordenar la vela: *${product.name}* (Precio: ${catalog.theme.currencySymbol}${product.price.toLocaleString()}). ¿Tienen disponibilidad?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div
      className={`catalog-page relative w-full min-h-0 md:aspect-[1/1.414] mx-auto p-4 sm:p-6 md:p-12 flex flex-col justify-between overflow-visible md:overflow-hidden ${
        isPrintMode ? 'shadow-none rounded-none aspect-[1/1.414] overflow-hidden' : 'shadow-xl rounded-sm'
      } print:shadow-none print:m-0 print:rounded-none print:aspect-[1/1.414] print:overflow-hidden`}
      style={{
        backgroundColor: palette.background,
        color: palette.textPrimary,
      }}
    >
      {/* Page Header */}
      <div
        className="relative z-10 pb-3 md:pb-4 border-b flex items-center justify-between"
        style={{ borderColor: palette.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden border shadow-xs shrink-0"
            style={{
              borderColor: `${palette.primary}30`,
              backgroundColor: hasCustomLogo(catalog.brandLogo) ? '#ffffff' : `${palette.primary}12`,
            }}
          >
            {hasCustomLogo(catalog.brandLogo) ? (
              <img
                src={catalog.brandLogo!}
                alt={catalog.brandName || 'Marca'}
                crossOrigin="anonymous"
                className="w-full h-full object-contain p-0.5 rounded-full"
              />
            ) : (
              <span
                className="font-serif font-bold text-xs sm:text-sm tracking-wider select-none"
                style={{ color: palette.primary }}
              >
                {getBrandInitials(catalog.brandName)}
              </span>
            )}
          </div>
          <div>
            <span
              className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase block"
              style={{ color: palette.secondary }}
            >
              {catalog.brandName} · {catalog.seasonTag}
            </span>
            <div className="flex items-center gap-2 mt-0.5 group">
              {isEditingTitle && onUpdateSectionTitle && !isPrintMode ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempTitle}
                    autoFocus
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => {
                      setIsEditingTitle(false);
                      if (tempTitle.trim() && tempTitle !== sectionTitle) {
                        onUpdateSectionTitle(tempTitle.trim());
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingTitle(false);
                        if (tempTitle.trim() && tempTitle !== sectionTitle) {
                          onUpdateSectionTitle(tempTitle.trim());
                        }
                      } else if (e.key === 'Escape') {
                        setIsEditingTitle(false);
                        setTempTitle(sectionTitle);
                      }
                    }}
                    className="font-serif text-base sm:text-lg md:text-xl font-normal uppercase tracking-wide px-2 py-0.5 rounded border border-emerald-600 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsEditingTitle(false);
                      if (tempTitle.trim() && tempTitle !== sectionTitle) {
                        onUpdateSectionTitle(tempTitle.trim());
                      }
                    }}
                    className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-800"
                    title="Guardar título"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <h2
                    className={`font-serif text-lg sm:text-xl md:text-2xl font-normal uppercase tracking-wide ${
                      onUpdateSectionTitle && !isPrintMode ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                    }`}
                    style={{ color: palette.primary }}
                    onClick={() => {
                      if (onUpdateSectionTitle && !isPrintMode) {
                        setTempTitle(sectionTitle);
                        setIsEditingTitle(true);
                      }
                    }}
                    title={onUpdateSectionTitle && !isPrintMode ? 'Clic para editar título' : undefined}
                  >
                    {sectionTitle}
                  </h2>
                  {onUpdateSectionTitle && !isPrintMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempTitle(sectionTitle);
                        setIsEditingTitle(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-all print:hidden"
                      title="Editar título de esta sección"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono opacity-60">
            Pág. {pageNumber} / {totalPages}
          </span>
        </div>
      </div>

      {/* Products Grid (2 products per editorial A4 page for high luxury presentation) */}
      <div
        className={`relative z-10 my-3 md:my-auto py-2 grid ${
          isPrintMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
        } print:grid-cols-2 gap-5 md:gap-8 flex-1 items-start w-full`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={`group flex flex-col h-full bg-white/70 ${
              isPrintMode ? '' : 'backdrop-blur-xs'
            } rounded-lg md:rounded-md border p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all`}
            style={{
              borderColor: palette.border,
              backgroundColor: palette.cardBackground,
            }}
          >
            {/* Product Image */}
            <div
              className="relative aspect-square sm:aspect-square w-full max-h-72 sm:max-h-80 md:max-h-none overflow-hidden rounded-md md:rounded-sm bg-stone-100 mb-3.5 border shrink-0"
              style={{ borderColor: palette.border }}
            >
              <img
                src={
                  product.image ||
                  'https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=600&q=80'
                }
                alt={product.name}
                crossOrigin="anonymous"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />

              {product.isSeasonalSpecial && (
                <span
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs"
                  style={{
                    backgroundColor: palette.primary,
                    color: '#FFFFFF',
                  }}
                >
                  Edición Especial
                </span>
              )}
            </div>

            {/* Title & SKU & Price */}
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex flex-wrap sm:flex-nowrap items-baseline justify-between gap-1.5 sm:gap-2">
                <h3
                  className="font-serif text-lg md:text-xl font-medium leading-tight"
                  style={{ color: palette.primary }}
                >
                  {product.name}
                </h3>
                <span
                  className="font-serif text-base md:text-lg font-bold whitespace-nowrap"
                  style={{ color: palette.accent || palette.primary }}
                >
                  {catalog.theme.currencySymbol}
                  {product.price.toLocaleString()}
                </span>
              </div>

              {product.sku && (
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                  Ref: {product.sku}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p
              className="text-xs leading-relaxed opacity-85 mb-3 line-clamp-4 md:line-clamp-3"
              style={{ color: palette.textSecondary }}
            >
              {product.description}
            </p>

            {/* Visual Dimension Indicator (Alto ↕ y Ancho ↔) */}
            {theme.showDimensionsVisual && (
              <div className="mb-3">
                <VisualDimensionIndicator
                  heightCm={product.heightCm}
                  widthCm={product.widthCm}
                  color={palette.primary}
                  textColor={palette.textPrimary}
                />
              </div>
            )}

            {/* Fragrances Badges */}
            {theme.showFragrances && product.fragrances && product.fragrances.length > 0 && (
              <div className="mb-2.5">
                <FragranceBadgeList
                  fragrances={product.fragrances}
                  color={palette.primary}
                />
              </div>
            )}

            {/* Available Colors Swatches */}
            {theme.showColorSwatches && product.colors && product.colors.length > 0 && (
              <div className="mb-2.5">
                <ColorSwatchList colors={product.colors} />
              </div>
            )}

            {/* Included Items Badges */}
            {(theme.showIncludes ?? true) && product.includes && product.includes.length > 0 && (
              <div className="mb-3">
                <IncludesBadgeList
                  includes={product.includes}
                  color={palette.primary}
                />
              </div>
            )}

            {/* Extra Specs: Burn Time / Wax Type */}
            {(product.burnTimeHours || product.waxType) && (
              <div
                className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t mt-auto mb-2"
                style={{ borderColor: `${palette.border}80` }}
              >
                {product.burnTimeHours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{product.burnTimeHours}h duración
                  </span>
                )}
                {product.waxType && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {product.waxType}
                  </span>
                )}
              </div>
            )}

            {/* Interactive WhatsApp Order Button (Omitted in PDF print) */}
            {!isPrintMode && contact.whatsapp && (
              <button
                type="button"
                onClick={() => handleWhatsAppOrder(product)}
                className="mt-2 w-full py-2 px-3 rounded-lg md:rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs hover:opacity-90 active:scale-98 print:hidden"
                style={{
                  backgroundColor: palette.primary,
                  color: '#FFFFFF',
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir esta vela por WhatsApp</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Page Footer */}
      <div
        className="relative z-10 pt-3 border-t flex justify-between items-center text-[10px] md:text-xs tracking-wider uppercase opacity-70"
        style={{ borderColor: palette.border }}
      >
        <span>{catalog.brandName}</span>
        <span>
          {contact.whatsapp ||
            contact.instagram ||
            (contact.website ? contact.website.replace(/^https?:\/\//, '') : '') ||
            contact.facebook ||
            ''}
        </span>
        <span>Página {pageNumber}</span>
      </div>
    </div>
  );
};
