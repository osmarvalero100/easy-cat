import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, CandleColor, ProductGroup } from '../../types/catalog';
import { VisualDimensionIndicator } from '../preview/VisualDimensionIndicator';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  PackageCheck,
  Check,
  Loader2,
  Layers,
  Tag,
  Percent,
  BadgePercent,
  Globe,
  Pause,
} from 'lucide-react';

export interface DiscountScopeAction {
  scope: 'single' | 'group' | 'catalog';
  percent: number;
  fixedDiscount?: number;
  discountType: 'percentage' | 'fixedPrice';
  targetGroupId?: string;
  label?: string;
  removeDiscount?: boolean;
}

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, discountAction?: DiscountScopeAction) => void;
  currencySymbol?: string;
  suggestedFragrances?: string[];
  suggestedIncludes?: string[];
  groups?: ProductGroup[];
  defaultGroupId?: string;
  allProducts?: Product[];
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
  { label: 'Vela Pino & Navidad', url: 'https://images.unsplash.com/photo-1637870103286-29728821676b?auto=format&fit=crop&w=800&q=80' },
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
  groups = [],
  defaultGroupId,
  allProducts = [],
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateUniqueId = () => `candle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const resolvedInitialGroupId =
    product?.groupId ||
    defaultGroupId ||
    (groups && groups.length > 0 ? groups[0].id : undefined);

  // Discount state
  const hasInitialDiscount = Boolean(product?.originalPrice && product.originalPrice > product.price);
  const initialRegularPrice = hasInitialDiscount ? (product?.originalPrice || 35000) : (product?.price || 35000);
  const initialDiscountedPrice = hasInitialDiscount ? product!.price : Math.round(initialRegularPrice * 0.8);
  const initialDiscountPercent = hasInitialDiscount
    ? Math.max(1, Math.min(99, Math.round(((initialRegularPrice - product!.price) / initialRegularPrice) * 100)))
    : 20;

  const [regularPrice, setRegularPrice] = useState<number>(initialRegularPrice);
  const [hasDiscount, setHasDiscount] = useState<boolean>(hasInitialDiscount);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixedPrice'>('percentage');
  const [discountPercent, setDiscountPercent] = useState<number>(initialDiscountPercent);
  const [discountedPrice, setDiscountedPrice] = useState<number>(initialDiscountedPrice);
  const [discountLabel, setDiscountLabel] = useState<string>(product?.discountLabel || '');
  const [discountScope, setDiscountScope] = useState<'single' | 'group' | 'catalog'>('single');

  const [formData, setFormData] = useState<Product>(
    product
      ? {
          ...product,
          isSoldOut: Boolean(product.isSoldOut),
          isPaused: Boolean(product.isPaused),
          includes: product.includes || [],
          groupId: resolvedInitialGroupId,
        }
      : {
          id: generateUniqueId(),
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
          isSoldOut: false,
          isPaused: false,
          groupId: resolvedInitialGroupId,
        }
  );

  useEffect(() => {
    const hasInitDiscount = Boolean(product?.originalPrice && product.originalPrice > product.price);
    const regPrice = hasInitDiscount ? (product?.originalPrice || 35000) : (product ? product.price : 35000);
    const discPrice = hasInitDiscount ? product!.price : Math.round(regPrice * 0.8);
    const discPct = hasInitDiscount
      ? Math.max(1, Math.min(99, Math.round(((regPrice - product!.price) / regPrice) * 100)))
      : 20;

    setRegularPrice(regPrice);
    setHasDiscount(hasInitDiscount);
    setDiscountType('percentage');
    setDiscountPercent(discPct);
    setDiscountedPrice(discPrice);
    setDiscountLabel(product?.discountLabel || '');
    setDiscountScope('single');

    if (product) {
      setFormData({
        ...product,
        isSoldOut: Boolean(product.isSoldOut),
        isPaused: Boolean(product.isPaused),
        price: hasInitDiscount ? product.price : regPrice,
        includes: product.includes || [],
        groupId: product.groupId || defaultGroupId || (groups && groups.length > 0 ? groups[0].id : undefined),
      });
    } else {
      setFormData({
        id: generateUniqueId(),
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
        isSoldOut: false,
        isPaused: false,
        groupId: defaultGroupId || (groups && groups.length > 0 ? groups[0].id : undefined),
      });
    }
  }, [product, isOpen, currencySymbol, defaultGroupId, groups]);

  const handleRegularPriceChange = (val: number) => {
    const safeVal = Math.max(0, val);
    setRegularPrice(safeVal);
    if (hasDiscount) {
      if (discountType === 'percentage') {
        setDiscountedPrice(Math.max(0, Math.round(safeVal * (1 - discountPercent / 100))));
      } else {
        if (discountedPrice >= safeVal) {
          setDiscountedPrice(Math.max(0, Math.round(safeVal * 0.8)));
        }
      }
    }
  };

  const handleToggleDiscount = (enabled: boolean) => {
    setHasDiscount(enabled);
    if (enabled) {
      setDiscountedPrice(Math.max(0, Math.round(regularPrice * (1 - discountPercent / 100))));
    }
  };

  const handleDiscountPercentChange = (pct: number) => {
    const safePct = Math.max(1, Math.min(99, pct));
    setDiscountPercent(safePct);
    setDiscountedPrice(Math.max(0, Math.round(regularPrice * (1 - safePct / 100))));
  };

  const handleDiscountedPriceChange = (val: number) => {
    const safeVal = Math.max(0, val);
    setDiscountedPrice(safeVal);
    if (regularPrice > 0 && safeVal < regularPrice) {
      const calcPct = Math.round(((regularPrice - safeVal) / regularPrice) * 100);
      setDiscountPercent(Math.max(1, Math.min(99, calcPct)));
    }
  };

  const [newFragrance, setNewFragrance] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2D4A3E');
  const [newIncludeItem, setNewIncludeItem] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAIDescription = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'product_description',
          payload: {
            name: formData.name || 'Vela Artesanal',
            fragrances: formData.fragrances,
            waxType: formData.waxType || 'Cera de Soya',
            brandName: 'Artesanal',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'NO_AI_CONFIGURED') {
          setAiError('No tienes una clave de IA configurada. Ve a Asistente IA > Configuración.');
        } else {
          setAiError(data.error || 'Error al generar descripción con IA.');
        }
        return;
      }

      if (data.result?.description) {
        setFormData((prev) => ({
          ...prev,
          description: data.result.description,
          fragrances:
            (!prev.fragrances || prev.fragrances.length === 0) && data.result.suggestedFragrances
              ? data.result.suggestedFragrances
              : prev.fragrances,
        }));
      }
    } catch {
      setAiError('Error de conexión con la IA.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const [showGallery, setShowGallery] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({
            ...prev,
            image: compressedDataUrl,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            image: result,
          }));
        }
      };
      img.onerror = () => {
        setFormData((prev) => ({
          ...prev,
          image: result,
        }));
      };
      img.src = result;
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

    const finalSellingPrice = hasDiscount ? Math.max(0, discountedPrice) : Math.max(0, regularPrice);
    const finalOriginalPrice = hasDiscount && regularPrice > discountedPrice ? Math.max(0, regularPrice) : undefined;
    const finalDiscountLabel = hasDiscount && discountLabel.trim() ? discountLabel.trim() : undefined;

    const sanitizedProduct: Product = {
      ...formData,
      name: formData.name.trim(),
      sku: (formData.sku || '').trim(),
      price: finalSellingPrice,
      originalPrice: finalOriginalPrice,
      discountLabel: finalDiscountLabel,
      heightCm: Number.isFinite(Number(formData.heightCm)) ? Math.max(0, Number(formData.heightCm)) : 0,
      widthCm: Number.isFinite(Number(formData.widthCm)) ? Math.max(0, Number(formData.widthCm)) : 0,
      burnTimeHours: (formData.burnTimeHours != null && Number.isFinite(Number(formData.burnTimeHours))) ? Math.max(0, Number(formData.burnTimeHours)) : undefined,
      fragrances: Array.isArray(formData.fragrances) ? formData.fragrances : [],
      colors: Array.isArray(formData.colors) ? formData.colors : [],
      includes: Array.isArray(formData.includes) ? formData.includes : [],
    };

    onSave(sanitizedProduct, {
      scope: discountScope,
      percent: hasDiscount ? discountPercent : 0,
      fixedDiscount: hasDiscount ? Math.max(0, regularPrice - discountedPrice) : 0,
      discountType,
      targetGroupId: sanitizedProduct.groupId,
      label: finalDiscountLabel,
      removeDiscount: !hasDiscount,
    });
    onClose();
  };

  const currentGroupId = formData.groupId || groups[0]?.id;
  const currentGroup = groups.find((g) => g.id === currentGroupId);
  const currentGroupName = currentGroup?.name || 'Grupo actual';
  const groupProductsCount = (allProducts || []).filter((p) => (p.groupId || groups[0]?.id) === currentGroupId).length;
  const totalProductsCount = (allProducts || []).length;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl max-h-[86vh] my-auto flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200 z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-5 border-b border-stone-200 bg-stone-50/90">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
              {product ? 'Editar Vela' : 'Nueva Vela Artesanal'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Configura nombre, precio, descuentos especiales, silueta visual, fragancias y colores.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center justify-between">
                <span>Precio Base ({currencySymbol}) *</span>
                {hasDiscount && (
                  <span className="text-[10px] text-rose-600 font-semibold lowercase">
                    (tachado)
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={regularPrice}
                onChange={(e) => handleRegularPriceChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: DESCUENTOS ESPECIALES & OFERTAS (PRECIO TACHADO)     */}
          {/* ============================================================== */}
          <div className={`p-4 rounded-xl border transition-all duration-200 ${
            hasDiscount
              ? 'bg-gradient-to-br from-rose-50/70 via-amber-50/30 to-stone-50 border-rose-300 shadow-xs'
              : 'bg-stone-50/70 border-stone-200'
          }`}>
            {/* Section Header with Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200/80">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${hasDiscount ? 'bg-rose-600 text-white shadow-xs' : 'bg-stone-200 text-stone-600'}`}>
                  <BadgePercent className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Descuento Especial & Precio Anterior Tachado
                    </span>
                    {hasDiscount && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-2xs">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Muestra el precio anterior tachado ({currencySymbol}{regularPrice.toLocaleString()}) para resaltar la rebaja especial.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => handleToggleDiscount(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 shadow-inner"></div>
                <span className="ml-2 text-xs font-bold text-stone-700">
                  {hasDiscount ? 'Descuento Activado' : 'Activar Descuento'}
                </span>
              </label>
            </div>

            {/* Discount Configuration Body (Expanded when active) */}
            {hasDiscount && (
              <div className="pt-3 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Left Column: Mode, Inputs & Chips */}
                  <div className="md:col-span-7 space-y-3">
                    {/* Mode Selector */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Método de Descuento
                      </label>
                      <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('percentage');
                            setDiscountedPrice(Math.max(0, Math.round(regularPrice * (1 - discountPercent / 100))));
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            discountType === 'percentage'
                              ? 'bg-white text-stone-900 shadow-2xs font-bold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Percent className="w-3.5 h-3.5 text-rose-600" />
                          <span>Porcentaje (%)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType('fixedPrice')}
                          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            discountType === 'fixedPrice'
                              ? 'bg-white text-stone-900 shadow-2xs font-bold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Precio Final Fijo ({currencySymbol})</span>
                        </button>
                      </div>
                    </div>

                    {/* If Percentage */}
                    {discountType === 'percentage' ? (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                          Porcentaje de Descuento
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={discountPercent}
                              onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                              className="w-full px-3 py-2 text-sm font-bold border rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white pr-8 text-rose-700"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-bold text-stone-400 font-mono">%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[10, 15, 20, 25, 30, 50].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handleDiscountPercentChange(pct)}
                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  discountPercent === pct
                                    ? 'bg-rose-600 text-white shadow-2xs scale-105'
                                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* If Fixed Discounted Price */
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                          Nuevo Precio de Venta con Descuento ({currencySymbol})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={discountedPrice}
                          onChange={(e) => handleDiscountedPriceChange(Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm font-bold border rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white text-emerald-800"
                        />
                        <p className="text-[10px] text-stone-500">
                          El precio regular ({currencySymbol}{regularPrice.toLocaleString()}) aparecerá tachado en el catálogo.
                        </p>
                      </div>
                    )}

                    {/* Promotional Tag / Badge */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Insignia / Etiqueta Promocional (Opcional)
                      </label>
                      <input
                        type="text"
                        value={discountLabel}
                        onChange={(e) => setDiscountLabel(e.target.value)}
                        placeholder={`Ej. -${discountPercent}% OFF, OFERTA ESPECIAL, LIQUIDACIÓN`}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Strikethrough Preview Card */}
                  <div className="md:col-span-5 bg-white p-3.5 rounded-xl border border-rose-200/90 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                      Vista Previa de Precios en el Catálogo
                    </span>

                    <div className="p-3 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-center space-y-1.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-rose-600 text-white uppercase shadow-xs mb-1">
                        {discountLabel.trim() || `-${discountPercent}% OFF`}
                      </span>

                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xs line-through text-stone-400 font-serif">
                          Antes: {currencySymbol}{regularPrice.toLocaleString()}
                        </span>
                        <span className="text-lg font-serif font-bold text-stone-900">
                          Ahora: <span className="text-rose-700">{currencySymbol}{discountedPrice.toLocaleString()}</span>
                        </span>
                      </div>

                      <div className="pt-1.5 border-t border-stone-200 text-[11px] font-medium text-emerald-700">
                        Ahorro cliente: {currencySymbol}{(Math.max(0, regularPrice - discountedPrice)).toLocaleString()} ({discountPercent}%)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scope Selector */}
                <div className="pt-3 border-t border-stone-200/80 space-y-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-stone-600" />
                      <span>Ámbito de Aplicación (¿A qué productos se aplica?)</span>
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Elige si este descuento especial se aplica solo a esta vela, a todas las de este grupo o a todo el catálogo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Option 1: Solo este producto */}
                    <button
                      type="button"
                      onClick={() => setDiscountScope('single')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        discountScope === 'single'
                          ? 'bg-white border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                          : 'bg-white/80 border-stone-200 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                          <Tag className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="radio"
                          name="discountScope"
                          checked={discountScope === 'single'}
                          onChange={() => setDiscountScope('single')}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-900 block">Solo este producto</span>
                      <span className="text-[10px] text-stone-500 leading-tight mt-0.5">
                        Aplica únicamente a esta vela
                      </span>
                    </button>

                    {/* Option 2: A todo el grupo actual */}
                    <button
                      type="button"
                      onClick={() => setDiscountScope('group')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        discountScope === 'group'
                          ? 'bg-white border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                          : 'bg-white/80 border-stone-200 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                          <Layers className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="radio"
                          name="discountScope"
                          checked={discountScope === 'group'}
                          onChange={() => setDiscountScope('group')}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-900 block truncate" title={currentGroupName}>
                        A todo este grupo
                      </span>
                      <span className="text-[10px] text-stone-500 leading-tight mt-0.5 truncate">
                        {currentGroupName} ({groupProductsCount} {groupProductsCount === 1 ? 'vela' : 'velas'})
                      </span>
                    </button>

                    {/* Option 3: A todo el catálogo */}
                    <button
                      type="button"
                      onClick={() => setDiscountScope('catalog')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        discountScope === 'catalog'
                          ? 'bg-white border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                          : 'bg-white/80 border-stone-200 hover:bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                          <Globe className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="radio"
                          name="discountScope"
                          checked={discountScope === 'catalog'}
                          onChange={() => setDiscountScope('catalog')}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-900 block">Todo el catálogo</span>
                      <span className="text-[10px] text-stone-500 leading-tight mt-0.5">
                        Todas las páginas ({totalProductsCount} velas)
                      </span>
                    </button>
                  </div>

                  {discountScope !== 'single' && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        {discountScope === 'group'
                          ? `Al guardar, el ${discountPercent}% de descuento se aplicará a todas las ${groupProductsCount} velas de "${currentGroupName}".`
                          : `Al guardar, el ${discountPercent}% de descuento se aplicará a todas las ${totalProductsCount} velas del catálogo completo.`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If discount is turned OFF, but user wants to remove discounts from the whole group or catalog */}
            {!hasDiscount && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-stone-500 text-[11px]">
                  Sin descuento activo en esta vela.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Deseas remover los descuentos de todas las velas en "${currentGroupName}"?`)) {
                        onSave(
                          {
                            ...formData,
                            price: regularPrice,
                            originalPrice: undefined,
                            discountLabel: undefined,
                          },
                          {
                            scope: 'group',
                            percent: 0,
                            targetGroupId: currentGroupId,
                            discountType: 'percentage',
                            removeDiscount: true,
                          }
                        );
                        onClose();
                      }
                    }}
                    className="text-[11px] text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                  >
                    Quitar descuentos a este grupo
                  </button>
                  <span className="text-stone-300">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Deseas remover los descuentos de todo el catálogo completo?')) {
                        onSave(
                          {
                            ...formData,
                            price: regularPrice,
                            originalPrice: undefined,
                            discountLabel: undefined,
                          },
                          {
                            scope: 'catalog',
                            percent: 0,
                            discountType: 'percentage',
                            removeDiscount: true,
                          }
                        );
                        onClose();
                      }
                    }}
                    className="text-[11px] text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                  >
                    Quitar a todo el catálogo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group / Page Association */}
          {groups && groups.length > 0 && (
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Agrupación / Título de Página *</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Determina en qué página A4 aparecerá esta vela
                </span>
              </div>
              <select
                value={formData.groupId || groups[0]?.id || ''}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium text-stone-800 shadow-2xs"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} {g.subtitle ? `· ${g.subtitle}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Descripción Corta & Sensorial
              </label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={isGeneratingAI}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2 py-0.5 rounded-md flex items-center gap-1 transition disabled:opacity-50"
                title="Generar redacción evocadora y notas de aroma con IA"
              >
                {isGeneratingAI ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-600" />
                )}
                <span>Redactar con IA</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe los ingredientes, mecha crepitante, notas de aroma o inspiración artesanal..."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            {aiError && (
              <p className="text-[11px] text-rose-600 mt-1">{aiError}</p>
            )}
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
                <VisualDimensionIndicator
                  heightCm={formData.heightCm}
                  widthCm={formData.widthCm}
                  color="#1F392B"
                />
              </div>
            </div>
          </div>

          {/* Fragrances Tag Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Notas Aromáticas / Fragancias
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-stone-50 border rounded-lg min-h-[42px]">
              {formData.fragrances.map((frag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-900 border border-emerald-200"
                >
                  {frag}
                  <button
                    type="button"
                    onClick={() => handleRemoveFragrance(idx)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.fragrances.length === 0 && (
                <span className="text-xs text-stone-400 italic">Sin fragancias agregadas</span>
              )}
            </div>

            {/* Input to add new fragrance */}
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
                placeholder="Escribe un aroma y presiona Enter (ej. Pino Silvestre, Canela)..."
                className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddFragrance()}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            {/* Quick Suggestions for Season */}
            {suggestedFragrances.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-400">Sugerencias de temporada:</span>
                {suggestedFragrances.map((frag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddFragrance(frag)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                  >
                    + {frag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colors List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Colores Disponibles
            </label>
            <div className="space-y-2 mb-2">
              {formData.colors.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-stone-50 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-stone-300 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-medium text-stone-800">{c.name}</span>
                    <span className="text-[10px] text-stone-400 font-mono uppercase">{c.hex}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(idx)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add color */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Nombre del color (ej. Verde Bosque, Rojo Rubí)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>

          {/* Image Upload & Unsplash Previews */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Fotografía de la Vela *
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-lg border-2 border-stone-200 overflow-hidden bg-stone-100 flex-shrink-0">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowGallery(!showGallery)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>{showGallery ? 'Ocultar Galería' : 'Elegir de Galería Muestra'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  Sube una foto de alta calidad (JPG, PNG). Se optimizará y comprimirá automáticamente para el catálogo.
                </p>
              </div>
            </div>

            {/* Gallery Picker */}
            {showGallery && (
              <div className="mt-3 p-3 bg-stone-50 border rounded-xl space-y-2">
                <p className="text-xs font-semibold text-stone-600">
                  Selecciona una imagen de estudio profesional:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_GALLERY_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: sample.url });
                        setShowGallery(false);
                      }}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-emerald-600 transition-all text-left"
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white p-1 truncate">
                        {sample.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What's included (Packaging & Extras) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-700" />
              ¿Qué incluye este producto? (Empaque & Presentación)
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-stone-50 border rounded-lg min-h-[42px]">
              {(formData.includes || []).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
                >
                  <Check className="w-3 h-3 text-amber-700" />
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveInclude(idx)}
                    className="hover:text-red-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(!formData.includes || formData.includes.length === 0) && (
                <span className="text-xs text-stone-400 italic">Sin extras añadidos</span>
              )}
            </div>

            {/* Input to add new include item */}
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
                placeholder="Ej. Caja de regalo kraft, Fósforos botánicos, Tapa de madera..."
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

          {/* Additional details: Duration & wax type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
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
          </div>

          {/* Disponibilidad y Estados del Producto */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-600" />
              <span>Disponibilidad & Estado en Catálogo</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción Agotado */}
              <label
                className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  formData.isSoldOut
                    ? 'bg-stone-900/5 border-stone-800 ring-1 ring-stone-800'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.isSoldOut || false}
                  onChange={(e) => setFormData({ ...formData, isSoldOut: e.target.checked })}
                  className="mt-0.5 rounded text-stone-900 focus:ring-stone-800 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900">
                      Marcar como Agotado
                    </span>
                    {formData.isSoldOut && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-stone-900 text-white uppercase">
                        Agotado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                    Se muestra en el catálogo con aviso de sin stock y permite a los clientes consultar disponibilidad por WhatsApp.
                  </p>
                </div>
              </label>

              {/* Opción Pausa */}
              <label
                className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  formData.isPaused
                    ? 'bg-amber-500/10 border-amber-600 ring-1 ring-amber-600'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.isPaused || false}
                  onChange={(e) => setFormData({ ...formData, isPaused: e.target.checked })}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900">
                      Pausar Producto
                    </span>
                    {formData.isPaused && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase flex items-center gap-0.5">
                        <Pause className="w-2.5 h-2.5" />
                        Oculto
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                    Si el producto no tiene unidades, ocúltalo temporalmente del catálogo y del PDF sin necesidad de borrarlo.
                  </p>
                </div>
              </label>
            </div>

            {/* Opción Edición Especial */}
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={formData.isSeasonalSpecial || false}
                  onChange={(e) => setFormData({ ...formData, isSeasonalSpecial: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-stone-700">
                  Destacar como "Edición Especial" de temporada
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 sm:py-5 border-t border-stone-200 bg-stone-50/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-sm transition"
          >
            {product ? 'Guardar Cambios' : 'Agregar Vela al Catálogo'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
