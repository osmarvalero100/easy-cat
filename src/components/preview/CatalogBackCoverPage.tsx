import React, { useState, useEffect } from 'react';
import { Catalog, hasCustomLogo, getBrandInitials } from '../../types/catalog';
import { MessageCircle, AtSign, MapPin, HeartHandshake, Sparkles, Globe, Music2, Pin, Share2, Edit2, Check } from 'lucide-react';

interface CatalogBackCoverPageProps {
  catalog: Catalog;
  pageNumber: number;
  isPrintMode?: boolean;
  onUpdateFooterText?: (newFooter: string) => void;
}

export const CatalogBackCoverPage: React.FC<CatalogBackCoverPageProps> = ({
  catalog,
  pageNumber,
  isPrintMode = false,
  onUpdateFooterText,
}) => {
  const { theme, contact } = catalog;
  const { palette } = theme;

  const [isEditingFooter, setIsEditingFooter] = useState(false);
  const defaultFooter = `© ${catalog.editionYear || '2026'} ${catalog.brandName || 'GAOS Candles'} · Hecho con amor artesanal`;
  const currentFooter = catalog.footerText ?? defaultFooter;
  const [tempFooter, setTempFooter] = useState(currentFooter);

  useEffect(() => {
    if (!isEditingFooter) {
      setTempFooter(currentFooter);
    }
  }, [currentFooter, isEditingFooter]);

  const phoneOnly = contact.whatsapp?.replace(/[^0-9]/g, '') || '';

  const hasWhatsapp = Boolean(contact.whatsapp?.trim());
  const hasWebsite = Boolean(contact.website?.trim());
  const hasInstagram = Boolean(contact.instagram?.trim());
  const hasFacebook = Boolean(contact.facebook?.trim());
  const hasTiktok = Boolean(contact.tiktok?.trim());
  const hasPinterest = Boolean(contact.pinterest?.trim());
  const validCustomSocials = (contact.customSocials || []).filter(
    (s) => s.url && s.url.trim()
  );
  const hasLocation = Boolean(contact.location?.trim());

  const totalChannels =
    (hasWhatsapp ? 1 : 0) +
    (hasWebsite ? 1 : 0) +
    (hasInstagram ? 1 : 0) +
    (hasFacebook ? 1 : 0) +
    (hasTiktok ? 1 : 0) +
    (hasPinterest ? 1 : 0) +
    validCustomSocials.length;

  return (
    <div
      className={`catalog-page relative w-full min-h-0 md:aspect-[1/1.414] mx-auto p-6 sm:p-8 md:p-16 flex flex-col justify-between overflow-visible md:overflow-hidden ${
        isPrintMode ? 'shadow-none rounded-none aspect-[1/1.414] overflow-hidden' : 'shadow-xl rounded-sm'
      } print:shadow-none print:m-0 print:rounded-none print:aspect-[1/1.414] print:overflow-hidden`}
      style={{
        backgroundColor: palette.background,
        color: palette.textPrimary,
      }}
    >
      {/* Decorative frame */}
      <div
        className="absolute inset-4 sm:inset-6 pointer-events-none border opacity-30"
        style={{ borderColor: palette.primary }}
      />

      {/* Top Header */}
      <div className="relative z-10 text-center pt-2 sm:pt-4 flex flex-col items-center">
        <div
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2.5 shadow-sm overflow-hidden border"
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
              className="w-full h-full object-contain p-1 rounded-full"
            />
          ) : (
            <span
              className="font-serif font-bold text-lg sm:text-xl md:text-2xl tracking-wider select-none"
              style={{ color: palette.primary }}
            >
              {getBrandInitials(catalog.brandName)}
            </span>
          )}
        </div>
        <span
          className="text-xs font-semibold tracking-[0.25em] uppercase block mb-1"
          style={{ color: palette.secondary }}
        >
          {catalog.brandName}
        </span>
        <h2
          className="font-serif text-xl sm:text-2xl md:text-4xl font-normal uppercase tracking-wide"
          style={{ color: palette.primary }}
        >
          ¿CÓMO REALIZAR TU PEDIDO?
        </h2>
        <div
          className="w-14 sm:w-16 h-[1px] mx-auto my-2 sm:my-3"
          style={{ backgroundColor: palette.secondary }}
        />
      </div>

      {/* Center Cards: How to order, Care Tips, & Contact */}
      <div className="relative z-10 max-w-lg mx-auto w-full flex flex-col gap-4 sm:gap-6 my-auto py-2 sm:py-4">
        {/* Step-by-step box */}
        <div
          className="p-4 sm:p-5 rounded-md border bg-white/70 backdrop-blur-xs shadow-2xs"
          style={{ borderColor: palette.border }}
        >
          <h3
            className="font-serif text-sm sm:text-base font-semibold uppercase tracking-wider mb-2.5 sm:mb-3 flex items-center gap-2"
            style={{ color: palette.primary }}
          >
            <Sparkles className="w-4 h-4" /> Pasos para Ordenar
          </h3>
          <ol className="space-y-2 sm:space-y-2.5 text-xs leading-relaxed" style={{ color: palette.textSecondary }}>
            <li className="flex items-start gap-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ backgroundColor: palette.primary }}
              >
                1
              </span>
              <span>Elige tus velas favoritas y verifica las medidas y aromas disponibles.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ backgroundColor: palette.primary }}
              >
                2
              </span>
              <span>Escríbenos por WhatsApp con los nombres de referencia y cantidad deseada.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ backgroundColor: palette.primary }}
              >
                3
              </span>
              <span>Confirmamos tu pedido, método de pago y fecha estimada de entrega o envío.</span>
            </li>
          </ol>
        </div>

        {/* Contact Links */}
        {(totalChannels > 0 || hasLocation) && (
          <div
            className="p-4 sm:p-5 rounded-md border bg-white/70 backdrop-blur-xs shadow-2xs flex flex-col gap-3"
            style={{ borderColor: palette.border }}
          >
            <h3
              className="font-serif text-sm sm:text-base font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-2"
              style={{ color: palette.primary }}
            >
              <HeartHandshake className="w-4 h-4" /> Canales de Atención Directa
            </h3>

            <div className={totalChannels >= 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
              {hasWhatsapp && (
                <a
                  href={`https://wa.me/${phoneOnly}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-sm transition-all hover:bg-black/5"
                  style={{ color: palette.textPrimary }}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">WhatsApp Pedidos</span>
                    <span className="font-semibold text-xs truncate">{contact.whatsapp}</span>
                  </div>
                </a>
              )}

              {hasWebsite && (
                <a
                  href={contact.website!.startsWith('http') ? contact.website! : `https://${contact.website!}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-sm transition-all hover:bg-black/5"
                  style={{ color: palette.textPrimary }}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: palette.primary }}
                  >
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">Sitio Web</span>
                    <span className="font-semibold text-xs truncate">{contact.website!.replace(/^https?:\/\//, '')}</span>
                  </div>
                </a>
              )}

              {hasInstagram && (
                <a
                  href={contact.instagram!.startsWith('http') ? contact.instagram! : `https://instagram.com/${contact.instagram!.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-sm transition-all hover:bg-black/5"
                  style={{ color: palette.textPrimary }}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: '#E1306C' }}
                  >
                    <AtSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">Instagram</span>
                    <span className="font-semibold text-xs truncate">{contact.instagram}</span>
                  </div>
                </a>
              )}

              {hasFacebook && (
                <a
                  href={contact.facebook!.startsWith('http') ? contact.facebook! : `https://facebook.com/${contact.facebook!.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-sm transition-all hover:bg-black/5"
                  style={{ color: palette.textPrimary }}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: '#1877F2' }}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">Facebook</span>
                    <span className="font-semibold text-xs truncate">{contact.facebook}</span>
                  </div>
                </a>
              )}

              {hasTiktok && (
                <a
                  href={contact.tiktok!.startsWith('http') ? contact.tiktok! : `https://tiktok.com/@${contact.tiktok!.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-sm transition-all hover:bg-black/5"
                  style={{ color: palette.textPrimary }}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0 bg-stone-900"
                  >
                    <Music2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">TikTok</span>
                    <span className="font-semibold text-xs truncate">{contact.tiktok}</span>
                  </div>
                </a>
              )}

              {hasPinterest && (
                <a
                  href={contact.pinterest!.startsWith('http') ? contact.pinterest! : `https://pinterest.com/${contact.pinterest!.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-sm transition-all hover:bg-black/5"
                  style={{ color: palette.textPrimary }}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: '#E60023' }}
                  >
                    <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">Pinterest</span>
                    <span className="font-semibold text-xs truncate">{contact.pinterest}</span>
                  </div>
                </a>
              )}

              {validCustomSocials.map((s, idx) => {
                const isUrl = s.url.startsWith('http://') || s.url.startsWith('https://');
                const href = isUrl ? s.url : `https://${s.url}`;
                return (
                  <a
                    key={s.id || idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-sm transition-all hover:bg-black/5"
                    style={{ color: palette.textPrimary }}
                  >
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: palette.secondary || '#4b5563' }}
                    >
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">
                        {s.name?.trim() || 'Red Social'}
                      </span>
                      <span className="font-semibold text-xs truncate">{s.url}</span>
                    </div>
                  </a>
                );
              })}
            </div>

            {hasLocation && (
              <div className="flex items-center gap-2.5 px-2 pt-1 text-xs opacity-80 border-t border-black/5" style={{ color: palette.textSecondary }}>
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: palette.secondary }} />
                <span className="truncate">{contact.location}</span>
              </div>
            )}
          </div>
        )}

        {contact.deliveryNotes && (
          <p className="text-center text-[11px] leading-relaxed italic opacity-80 max-w-sm mx-auto" style={{ color: palette.textSecondary }}>
            * {contact.deliveryNotes}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="relative z-10 pt-3 sm:pt-4 border-t text-center text-[10px] md:text-xs tracking-wider uppercase opacity-70"
        style={{ borderColor: palette.border }}
      >
        {isEditingFooter && onUpdateFooterText && !isPrintMode ? (
          <div className="flex items-center justify-center gap-1.5 my-1">
            <input
              type="text"
              value={tempFooter}
              autoFocus
              onChange={(e) => setTempFooter(e.target.value)}
              onBlur={() => {
                setIsEditingFooter(false);
                if (tempFooter.trim() && tempFooter !== currentFooter) {
                  onUpdateFooterText(tempFooter.trim());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingFooter(false);
                  if (tempFooter.trim() && tempFooter !== currentFooter) {
                    onUpdateFooterText(tempFooter.trim());
                  }
                } else if (e.key === 'Escape') {
                  setIsEditingFooter(false);
                  setTempFooter(currentFooter);
                }
              }}
              className="text-[10px] md:text-xs tracking-wider uppercase px-2 py-0.5 rounded border border-emerald-600 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs max-w-md w-full text-center"
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsEditingFooter(false);
                if (tempFooter.trim() && tempFooter !== currentFooter) {
                  onUpdateFooterText(tempFooter.trim());
                }
              }}
              className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-800"
              title="Guardar pie de página"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="group relative inline-flex items-center justify-center gap-1.5">
            <p
              className={onUpdateFooterText && !isPrintMode ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
              onClick={() => {
                if (onUpdateFooterText && !isPrintMode) {
                  setTempFooter(currentFooter);
                  setIsEditingFooter(true);
                }
              }}
              title={onUpdateFooterText && !isPrintMode ? 'Clic para editar pie de página' : undefined}
            >
              {currentFooter}
            </p>
            {onUpdateFooterText && !isPrintMode && (
              <button
                type="button"
                onClick={() => {
                  setTempFooter(currentFooter);
                  setIsEditingFooter(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-all print:hidden"
                title="Editar pie de página"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        <p className="mt-1">Página {pageNumber}</p>
      </div>
    </div>
  );
};
