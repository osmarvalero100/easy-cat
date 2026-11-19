import React from 'react';
import { Catalog, hasCustomLogo, getBrandInitials } from '../../types/catalog';
import { Flame } from 'lucide-react';

interface CatalogCoverPageProps {
  catalog: Catalog;
  isPrintMode?: boolean;
}

export const CatalogCoverPage: React.FC<CatalogCoverPageProps> = ({
  catalog,
  isPrintMode = false,
}) => {
  const { theme, contact } = catalog;
  const { palette } = theme;

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
      {/* Subtle Frame / Border Accents */}
      <div
        className="absolute inset-3 sm:inset-5 pointer-events-none border opacity-40 print:inset-4"
        style={{ borderColor: palette.primary }}
      />
      <div
        className="absolute inset-5 sm:inset-7 pointer-events-none border opacity-15 print:inset-6"
        style={{ borderColor: palette.secondary }}
      />

      {/* Top Header / Brand Logo & Season Badge */}
      <div className="relative z-10 flex flex-col items-center text-center pt-1 sm:pt-2">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-2 shadow-sm overflow-hidden border transition-all shrink-0"
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
              className="font-serif font-bold text-2xl sm:text-3xl tracking-wider select-none"
              style={{ color: palette.primary }}
            >
              {getBrandInitials(catalog.brandName)}
            </span>
          )}
        </div>

        <p
          className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase"
          style={{ color: palette.primary }}
        >
          {catalog.brandName || 'COLECCIÓN ARTESANAL'} · {catalog.editionYear || '2026'}
        </p>

        {catalog.seasonTag && (
          <span
            className="mt-1.5 inline-block px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] uppercase tracking-widest font-medium"
            style={{
              backgroundColor: `${palette.secondary}20`,
              color: palette.primary,
              border: `1px solid ${palette.secondary}35`,
            }}
          >
            {catalog.seasonTag}
          </span>
        )}
      </div>

      {/* Hero Featured Photography */}
      <div className="relative z-10 my-3 sm:my-4 flex flex-col items-center justify-center w-full min-h-0 shrink-0">
        <div
          className="cover-hero-img-container w-full h-[220px] sm:h-[260px] md:h-[300px] overflow-hidden rounded-sm shadow-md border"
          style={{ borderColor: `${palette.border}` }}
        >
          <img
            src={catalog.coverImage}
            alt={catalog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>

      {/* Title & Editorial Description */}
      <div className="relative z-10 text-center flex flex-col items-center max-w-xl mx-auto pb-2 sm:pb-3">
        <h1
          className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-wide uppercase leading-tight mb-1.5 md:mb-2"
          style={{ color: palette.primary }}
        >
          {catalog.title}
        </h1>

        <p
          className="font-serif italic text-sm sm:text-base md:text-lg opacity-85 mb-1.5 sm:mb-2"
          style={{ color: palette.textSecondary }}
        >
          {catalog.subtitle}
        </p>

        <div
          className="w-20 sm:w-24 h-[1px] my-1.5 sm:my-2"
          style={{ backgroundColor: palette.secondary }}
        />

        <p
          className="text-xs md:text-sm leading-relaxed max-w-md opacity-80"
          style={{ color: palette.textSecondary }}
        >
          {catalog.introText}
        </p>
      </div>

      {/* Bottom Footer Details */}
      <div
        className="relative z-10 pt-3 sm:pt-4 border-t flex justify-between items-center text-[10px] md:text-xs tracking-wider uppercase opacity-70"
        style={{ borderColor: `${palette.border}` }}
      >
        <span>
          {contact.instagram ||
            contact.website?.replace(/^https?:\/\//, '') ||
            contact.facebook ||
            contact.tiktok ||
            ''}
        </span>
        <span>{contact.whatsapp || ''}</span>
        <span>Página 1</span>
      </div>
    </div>
  );
};
