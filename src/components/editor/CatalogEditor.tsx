import React, { useState } from 'react';
import { Catalog, Product, SeasonKey } from '../../types/catalog';
import { ThemeCustomizer } from './ThemeCustomizer';
import { ProductListEditor } from './ProductListEditor';
import { BrandContactEditor } from './BrandContactEditor';
import { SAMPLE_CANDLES } from '../../data/defaultCatalog';
import { SEASONAL_PRESETS } from '../../data/seasonalThemes';
import { Palette, Flame, BookOpen } from 'lucide-react';

interface CatalogEditorProps {
  catalog: Catalog;
  onChange: (updatedCatalog: Catalog) => void;
}

export const CatalogEditor: React.FC<CatalogEditorProps> = ({
  catalog,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'products' | 'brand'>('products');

  const handleApplyPresetSamples = (season: SeasonKey) => {
    const presetName = SEASONAL_PRESETS[season]?.name || season;
    const samples = SAMPLE_CANDLES[season] || SAMPLE_CANDLES.navidad;
    if (
      confirm(
        `¿Deseas reemplazar las velas actuales por la colección de muestra de "${presetName}"?`
      )
    ) {
      onChange({
        ...catalog,
        products: samples,
      });
    }
  };

  const handleProductsChange = (products: Product[]) => {
    onChange({
      ...catalog,
      products,
    });
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 border-r border-stone-200">
      {/* Editor Tabs Navigation */}
      <div className="flex items-center border-b border-stone-200 bg-white px-3 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Velas & Productos</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-mono">
            {catalog.products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'theme'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Diseño & Temporada</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'brand'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Portada & Datos</span>
        </button>
      </div>

      {/* Editor Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'products' && (
          <ProductListEditor
            catalog={catalog}
            onChange={handleProductsChange}
            onUpdateCatalog={onChange}
          />
        )}

        {activeTab === 'theme' && (
          <ThemeCustomizer
            catalog={catalog}
            onChange={onChange}
            onApplyPresetSamples={handleApplyPresetSamples}
          />
        )}

        {activeTab === 'brand' && (
          <BrandContactEditor
            catalog={catalog}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
};
