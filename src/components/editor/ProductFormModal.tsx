import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, CandleColor } from '../../types/catalog';
import { VisualDimensionIndicator } from '../preview/VisualDimensionIndicator';
import { X, Upload, Plus, Trash2, Sparkles, Image as ImageIcon, PackageCheck, Check } from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  currencySymbol?: string;
  suggestedFragrances?: string[];
  suggestedIncludes?: string[];
}

const DEFAULT_SUGGESTED_INCLUDES = [
  'Caja de regalo',
  'Tarjeta dedicatoria',
  'Fósforos artesanales',
  'Tapa de madera',
  'Bolsa de lienzo',
  'Instrucciones de cuidado',
];

const SAMPLE_GALLERY_IMAGES = [
  { label: 'Vela Pino & Navidad', url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vela Canela Especiada', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vela Tazón Cerámica', url: 'https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vela Romántica Rosa', url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vela Escultural Minimal', url: 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vela Floral Lavanda', url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80' },
  { label: 'Velas Cónicas Festivas', url: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vela Frasco Ámbar', url: 'https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=800&q=80' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  currencySymbol = '$',
  suggestedFragrances = [],
  suggestedIncludes = [],
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<Product>(
    product
      ? { ...product, includes: product.includes || [] }
      : {
          id: `candle-${Date.now()}`,
          name: '',
          sku: `VEL-${Math.floor(100 + Math.random() * 900)}`,
          price: 35000,
          currency: currencySymbol,
          description: '',
          heightCm: 10,
          widthCm: 7,
          fragrances: ['Vainilla', 'Canela'],
          colors: [
            { name: 'Blanco Marfil', hex: '#FAF9F6' },
            { name: 'Cera Natural', hex: '#EBE5D8' },
          ],
          includes: ['Caja de regalo', 'Tarjeta dedicatoria'],
          image: SAMPLE_GALLERY_IMAGES[0].url,
          burnTimeHours: 40,
          waxType: 'Cera de Soya 100% Ecológica',
          isSeasonalSpecial: true,
        }
  );

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        includes: product.includes || [],
      });
    } else {
      setFormData({
        id: `candle-${Date.now()}`,
        name: '',
        sku: `VEL-${Math.floor(100 + Math.random() * 900)}`,
        price: 35000,
        currency: currencySymbol,
        description: '',
        heightCm: 10,
        widthCm: 7,
        fragrances: ['Vainilla', 'Canela'],
        colors: [
          { name: 'Blanco Marfil', hex: '#FAF9F6' },
          { name: 'Cera Natural', hex: '#EBE5D8' },
        ],
        includes: ['Caja de regalo', 'Tarjeta dedicatoria'],
        image: SAMPLE_GALLERY_IMAGES[0].url,
        burnTimeHours: 40,
        waxType: 'Cera de Soya 100% Ecológica',
        isSeasonalSpecial: true,
      });
    }
  }, [product, isOpen, currencySymbol]);

  const [newFragrance, setNewFragrance] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2D4A3E');
  const [newIncludeItem, setNewIncludeItem] = useState('');
  const [showGallery, setShowGallery] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setFormData((prev) => ({
          ...prev,
          image: uploadEvent.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddFragrance = (fragranceToAdd?: string) => {
    const frag = fragranceToAdd || newFragrance.trim();
    if (!frag) return;
    if (!formData.fragrances.includes(frag)) {
      setFormData((prev) => ({
        ...prev,
        fragrances: [...prev.fragrances, frag],
      }));
    }
    if (!fragranceToAdd) setNewFragrance('');
  };

  const handleRemoveFragrance = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fragrances: prev.fragrances.filter((_, i) => i !== index),
    }));
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleAddInclude = (itemToAdd?: string) => {
    const item = (itemToAdd || newIncludeItem).trim();
    if (!item) return;
    const current = formData.includes || [];
    if (!current.includes(item)) {
      setFormData((prev) => ({
        ...prev,
        includes: [...(prev.includes || []), item],
      }));
    }
    if (!itemToAdd) setNewIncludeItem('');
  };

  const handleRemoveInclude = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includes: (prev.includes || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200 z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {product ? 'Editar Vela' : 'Nueva Vela Artesanal'}
            </h2>
            <p className="text-xs text-stone-500">
              Configura nombre, medidas visuales, precio, fragancias, colores y qué incluye.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info: Name, SKU, Price */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Nombre de la Vela *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Vela Botánica Pino Nevado"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Código / SKU
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="NV-01"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none uppercase font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Precio ({currencySymbol}) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Descripción Corta & Sensorial
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe los ingredientes, mecha crepitante, notas de aroma o inspiración artesanal..."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Dimensions Section (Alto y Ancho con Diagrama Visual) */}
          <div className="p-4 rounded-xl border bg-stone-50/70">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Dimensiones Parametrizadas & Silueta Visual
              </span>
              <span className="text-[11px] text-stone-500">
                Se actualiza en vivo para el cliente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  ↕ Alto (cm)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-bold border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <span className="text-xs text-stone-500 font-mono">cm</span>
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  ↔ Ancho / Diámetro (cm)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="40"
                    step="0.5"
                    value={formData.widthCm}
                    onChange={(e) => setFormData({ ...formData, widthCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-bold border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <span className="text-xs text-stone-500 font-mono">cm</span>
                </div>
              </div>

              <div className="md:col-span-4 flex justify-center bg-white p-2 rounded-lg border border-stone-200">
                {/* Live Visual Dimension Preview */}
                <VisualDimensionIndicator
                  heightCm={formData.heightCm}
                  widthCm={formData.widthCm}
                  color="#1F392B"
                />
              </div>
            </div>
          </div>

          {/* Image Selection & Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Fotografía de la Vela
              </label>
              <button
                type="button"
                onClick={() => setShowGallery(!showGallery)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                {showGallery ? 'Ocultar Galería de Muestra' : 'Elegir de Galería de Muestra'}
              </button>
            </div>

            {/* Gallery Picker */}
            {showGallery && (
              <div className="p-3 mb-3 bg-stone-100 rounded-lg border border-stone-200">
                <p className="text-xs text-stone-600 mb-2 font-medium">
                  Selecciona una imagen de estudio profesional para tu vela:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {SAMPLE_GALLERY_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: img.url });
                        setShowGallery(false);
                      }}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        formData.image === img.url
                          ? 'border-emerald-600 ring-2 ring-emerald-500'
                          : 'border-transparent hover:opacity-80'
                      }`}
                      title={img.label}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden border bg-stone-100 flex-shrink-0">
                <img
                  src={formData.image || SAMPLE_GALLERY_IMAGES[0].url}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 border border-stone-300 rounded-lg text-xs font-medium cursor-pointer hover:bg-stone-50 shadow-2xs">
                  <Upload className="w-4 h-4 text-stone-500" />
                  <span>Subir Imagen de tu Vela (JPG, PNG, WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-stone-500">
                  O puedes pegar una URL de imagen directa en el campo o usar las fotos de muestra.
                </p>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://ejemplo.com/mivela.jpg"
                  className="w-full px-3 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fragrances Tag Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Fragancias y Notas Olfativas
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.fragrances.map((frag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {frag}
                  <button
                    type="button"
                    onClick={() => handleRemoveFragrance(idx)}
                    className="text-emerald-600 hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFragrance}
                onChange={(e) => setNewFragrance(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFragrance();
                  }
                }}
                placeholder="Agregar fragancia (ej. Canela Bourbon, Vainilla Francesa...)"
                className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddFragrance()}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors"
              >
                Agregar
              </button>
            </div>

            {/* Quick Suggestions */}
            {suggestedFragrances.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-400">Sugerencias:</span>
                {suggestedFragrances.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddFragrance(sug)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Variations Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Colores Disponibles de la Vela / Envase
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.colors.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-stone-200 bg-white shadow-2xs text-xs"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-stone-700 font-medium">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(idx)}
                    className="text-stone-400 hover:text-rose-600 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded-md border border-stone-300 p-0.5 cursor-pointer"
                title="Seleccionar color"
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Nombre del color (ej. Verde Abeto, Rosa Palo, Marfil)"
                className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir Color
              </button>
            </div>
          </div>

          {/* Section: Incluye */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-800" />
              Incluye
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Elementos y accesorios incluidos con este producto (ej. empaque, cerillos, tarjetas).
            </p>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {(formData.includes || []).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs"
                >
                  <Check className="w-3 h-3 text-amber-600" />
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveInclude(idx)}
                    className="text-amber-700 hover:text-rose-600 ml-0.5 transition-colors"
                    title="Eliminar elemento"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(!formData.includes || formData.includes.length === 0) && (
                <span className="text-xs text-stone-400 italic py-0.5">
                  No hay elementos agregados en "Incluye".
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newIncludeItem}
                onChange={(e) => setNewIncludeItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInclude();
                  }
                }}
                placeholder="Agregar elemento (ej. Caja de regalo, Fósforos artesanales, Tarjeta dedicatoria...)"
                className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddInclude()}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            {/* Quick Suggestions for Incluye */}
            {(suggestedIncludes.length > 0 ? suggestedIncludes : DEFAULT_SUGGESTED_INCLUDES).length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-400">Sugerencias:</span>
                {(suggestedIncludes.length > 0 ? suggestedIncludes : DEFAULT_SUGGESTED_INCLUDES).map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddInclude(sug)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Additional details: Duration, wax type & Seasonal Badge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Duración Estimada (Horas)
              </label>
              <input
                type="number"
                min="1"
                value={formData.burnTimeHours || ''}
                onChange={(e) => setFormData({ ...formData, burnTimeHours: Number(e.target.value) })}
                placeholder="45"
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Tipo de Cera / Material
              </label>
              <input
                type="text"
                value={formData.waxType || ''}
                onChange={(e) => setFormData({ ...formData, waxType: e.target.value })}
                placeholder="Cera de Soya 100%"
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSeasonalSpecial || false}
                  onChange={(e) => setFormData({ ...formData, isSeasonalSpecial: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-stone-700">
                  Marcar como "Edición Especial"
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border rounded-lg bg-white hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-all"
          >
            {product ? 'Guardar Cambios' : 'Agregar Vela al Catálogo'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
