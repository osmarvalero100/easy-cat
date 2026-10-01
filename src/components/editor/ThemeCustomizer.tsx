import React, { useState } from 'react';
import { Catalog, SeasonKey } from '../../types/catalog';
import { SEASONAL_PRESETS } from '../../data/seasonalThemes';
import { Palette, Sparkles, Check, Type, Ruler, Tag, Filter } from 'lucide-react';

interface ThemeCustomizerProps {
  catalog: Catalog;
  onChange: (updatedCatalog: Catalog) => void;
  onApplyPresetSamples?: (season: SeasonKey) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  catalog,
  onChange,
  onApplyPresetSamples,
}) => {
  const { theme } = catalog;
  const [activeCategory, setActiveCategory] = useState<'all' | 'eventos' | 'temporadas' | 'estilo'>('all');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'eventos', label: 'Eventos & Celebraciones' },
    { id: 'temporadas', label: 'Temporadas' },
    { id: 'estilo', label: 'Estilos' },
  ] as const;

  const filteredPresets = Object.values(SEASONAL_PRESETS).filter((preset) => {
    if (activeCategory === 'all') return true;
    return preset.category === activeCategory;
  });

  const handleSelectSeason = (seasonKey: SeasonKey) => {
    const preset = SEASONAL_PRESETS[seasonKey];
    if (!preset) return;

    const prevPreset = SEASONAL_PRESETS[catalog.theme.season];
    const isTitleDefault =
      !catalog.title ||
      catalog.title === prevPreset?.defaultTitle ||
      catalog.title === 'COLECCIÓN BOTÁNICA NAVIDEÑA' ||
      catalog.title === 'COLECCIÓN NAVIDEÑA';

    const isSubtitleDefault =
      !catalog.subtitle ||
      catalog.subtitle === prevPreset?.defaultSubtitle ||
      catalog.subtitle === 'Velas Aromáticas Vertidas a Mano · Edición Especial Festiva' ||
      catalog.subtitle === 'Velas Botánicas & Aromáticas de Temporada';

    const isCoverDefault =
      !catalog.coverImage ||
      catalog.coverImage === prevPreset?.defaultCoverImage ||
      catalog.coverImage === 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=1200&q=80';

    const isSlugDefault =
      !catalog.slug ||
      catalog.slug === 'velas-navidad-2026' ||
      catalog.slug === `velas-${prevPreset?.id || ''}-2026` ||
      catalog.slug.startsWith('velas-');

    const updated: Catalog = {
      ...catalog,
      slug: isSlugDefault ? `velas-${preset.id.replace(/_/g, '-')}-${catalog.editionYear || '2026'}` : catalog.slug,
      title: isTitleDefault ? preset.defaultTitle : catalog.title,
      subtitle: isSubtitleDefault ? preset.defaultSubtitle : catalog.subtitle,
      seasonTag: preset.name,
      coverImage: isCoverDefault ? preset.defaultCoverImage : catalog.coverImage,
      theme: {
        ...preset.theme,
        currencySymbol: catalog.theme.currencySymbol,
        showDimensionsVisual: catalog.theme.showDimensionsVisual,
        showFragrances: catalog.theme.showFragrances,
        showColorSwatches: catalog.theme.showColorSwatches,
      },
    };

    onChange(updated);
  };

  const handleColorChange = (key: keyof typeof theme.palette, value: string) => {
    onChange({
      ...catalog,
      theme: {
        ...theme,
        palette: {
          ...theme.palette,
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Seasonal Presets Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Colecciones y Diseños Temáticos
          </label>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredPresets.map((preset) => {
            const isSelected = theme.season === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectSeason(preset.id)}
                className={`relative p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-700 ring-2 ring-emerald-600/30 bg-emerald-50/40 shadow-xs'
                    : 'border-stone-200 hover:border-stone-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-stone-900">
                    {preset.badge}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 leading-snug line-clamp-2 mb-2">
                  {preset.description}
                </p>

                {/* Color preview dots for this preset */}
                <div className="flex items-center gap-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.palette.primary }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.palette.secondary }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.palette.accent }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.palette.background }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {onApplyPresetSamples && (
          <button
            type="button"
            onClick={() => onApplyPresetSamples(theme.season)}
            className="w-full py-2 px-3 rounded-lg border border-dashed border-emerald-600 text-emerald-800 text-xs font-semibold hover:bg-emerald-50/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cargar velas de ejemplo de este tema ({SEASONAL_PRESETS[theme.season]?.name})
          </button>
        )}
      </div>

      {/* Custom Color Parameterization */}
      <div className="space-y-3 pt-4 border-t">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-emerald-700" />
          Parametrización de Colores del Catálogo
        </label>
        <p className="text-xs text-stone-500">
          Personaliza los tonos para que hagan juego perfecto con tu marca artesanal:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Primary Color */}
          <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-700">Primario</span>
              <input
                type="color"
                value={theme.palette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-6 h-6 rounded-md border p-0 cursor-pointer"
              />
            </div>
            <span className="block font-mono text-[10px] text-stone-400 uppercase">
              {theme.palette.primary}
            </span>
          </div>

          {/* Secondary Color */}
          <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-700">Secundario</span>
              <input
                type="color"
                value={theme.palette.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-6 h-6 rounded-md border p-0 cursor-pointer"
              />
            </div>
            <span className="block font-mono text-[10px] text-stone-400 uppercase">
              {theme.palette.secondary}
            </span>
          </div>

          {/* Accent Color */}
          <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-700">Acento (Precios)</span>
              <input
                type="color"
                value={theme.palette.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-6 h-6 rounded-md border p-0 cursor-pointer"
              />
            </div>
            <span className="block font-mono text-[10px] text-stone-400 uppercase">
              {theme.palette.accent}
            </span>
          </div>

          {/* Paper / Canvas Background Color */}
          <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-700">Fondo Lienzo</span>
              <input
                type="color"
                value={theme.palette.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-6 h-6 rounded-md border p-0 cursor-pointer"
              />
            </div>
            <span className="block font-mono text-[10px] text-stone-400 uppercase">
              {theme.palette.background}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Toggles & Display Options */}
      <div className="space-y-3 pt-4 border-t">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Ruler className="w-4 h-4 text-emerald-700" />
          Elementos Visuales en Cada Vela
        </label>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer hover:bg-stone-50">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-stone-800">
                Mostrar Indicador Visual de Dimensiones (Alto ↕ y Ancho ↔)
              </span>
              <span className="text-[11px] text-stone-500">
                Dibuja una silueta gráfica proporcional de la vela con sus cotas en cm.
              </span>
            </div>
            <input
              type="checkbox"
              checked={theme.showDimensionsVisual}
              onChange={(e) =>
                onChange({
                  ...catalog,
                  theme: { ...theme, showDimensionsVisual: e.target.checked },
                })
              }
              className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer hover:bg-stone-50">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-stone-800">
                Mostrar Etiquetas de Fragancias y Notas Aromáticas
              </span>
              <span className="text-[11px] text-stone-500">
                Insignias visuales de los aromas disponibles para cada vela.
              </span>
            </div>
            <input
              type="checkbox"
              checked={theme.showFragrances}
              onChange={(e) =>
                onChange({
                  ...catalog,
                  theme: { ...theme, showFragrances: e.target.checked },
                })
              }
              className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer hover:bg-stone-50">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-stone-800">
                Mostrar Círculos de Colores Disponibles
              </span>
              <span className="text-[11px] text-stone-500">
                Muestras de color (swatches) para vela, cera y contenedor.
              </span>
            </div>
            <input
              type="checkbox"
              checked={theme.showColorSwatches}
              onChange={(e) =>
                onChange({
                  ...catalog,
                  theme: { ...theme, showColorSwatches: e.target.checked },
                })
              }
              className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer hover:bg-stone-50">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-stone-800">
                Mostrar Sección "Incluye"
              </span>
              <span className="text-[11px] text-stone-500">
                Muestra los accesorios y empaques incluidos con la vela en el catálogo.
              </span>
            </div>
            <input
              type="checkbox"
              checked={theme.showIncludes ?? true}
              onChange={(e) =>
                onChange({
                  ...catalog,
                  theme: { ...theme, showIncludes: e.target.checked },
                })
              }
              className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* Currency Symbol */}
      <div className="pt-4 border-t flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
            Símbolo de Moneda
          </label>
          <span className="text-[11px] text-stone-500">
            Aparece junto a los precios en el catálogo y PDF
          </span>
        </div>
        <div className="flex items-center gap-2">
          {['$', 'COP $', 'USD $', '€', 'MXN $'].map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() =>
                onChange({
                  ...catalog,
                  theme: { ...theme, currencySymbol: sym },
                })
              }
              className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                theme.currencySymbol === sym
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
