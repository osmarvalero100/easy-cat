import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, Catalog, ProductGroup } from '../../types/catalog';
import { ProductFormModal, DiscountScopeAction } from './ProductFormModal';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  Loader2,
  Layers,
  FolderPlus,
  Check,
  X,
  MoveRight,
  BadgePercent,
  Tag,
  Percent,
  Globe,
} from 'lucide-react';
import { SEASONAL_PRESETS } from '../../data/seasonalThemes';
import { normalizeProductGroups, getGroupedProducts } from '../../lib/catalogGroups';

interface ProductListEditorProps {
  catalog: Catalog;
  onChange: (products: Product[]) => void;
  onUpdateCatalog?: (catalog: Catalog) => void;
  onOpenAIExtract?: () => void;
  onSave?: () => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
}

export const ProductListEditor: React.FC<ProductListEditorProps> = ({
  catalog,
  onChange,
  onUpdateCatalog,
  onOpenAIExtract,
  onSave,
  hasUnsavedChanges = false,
  isSaving = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalDefaultGroupId, setModalDefaultGroupId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Group creation state
  const [isAddingGroup, setIsAddingGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupSubtitle, setNewGroupSubtitle] = useState<string>('');

  // Editing existing group state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [tempGroupName, setTempGroupName] = useState<string>('');
  const [tempGroupSubtitle, setTempGroupSubtitle] = useState<string>('');

  // Filter view by group (null = show all)
  const [selectedFilterGroupId, setSelectedFilterGroupId] = useState<string | null>(null);

  const currentGroups = normalizeProductGroups(catalog);
  const groupedProducts = getGroupedProducts(catalog);

  const handleOpenNew = (groupId?: string) => {
    setEditingProduct(null);
    setModalDefaultGroupId(groupId || (currentGroups[0]?.id));
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalDefaultGroupId(product.groupId || currentGroups[0]?.id);
    setIsModalOpen(true);
  };

  const syncCatalog = (newProducts: Product[], newGroups?: ProductGroup[]) => {
    const groupsToSave = newGroups ?? currentGroups;
    if (onUpdateCatalog) {
      onUpdateCatalog({
        ...catalog,
        productGroups: groupsToSave,
        products: newProducts,
        featuredSectionTitle: groupsToSave[0]?.name || catalog.featuredSectionTitle,
        regularSectionTitle: groupsToSave[1]?.name || catalog.regularSectionTitle,
      });
    } else {
      onChange(newProducts);
    }
  };

  // Quick discount modal state
  const [discountModalTarget, setDiscountModalTarget] = useState<'catalog' | string | null>(null);
  const [quickDiscountPercent, setQuickDiscountPercent] = useState<number>(20);
  const [quickDiscountLabel, setQuickDiscountLabel] = useState<string>('');

  const handleApplyQuickDiscount = (target: 'catalog' | string, percent: number, label?: string) => {
    const isCatalog = target === 'catalog';
    const updatedProducts = catalog.products.map((p) => {
      const matches = isCatalog || (p.groupId === target);
      if (!matches) return p;

      const basePrice = (p.originalPrice && p.originalPrice > p.price) ? p.originalPrice : p.price;
      const discounted = Math.max(0, Math.round(basePrice * (1 - percent / 100)));
      return {
        ...p,
        price: discounted,
        originalPrice: basePrice,
        discountLabel: label?.trim() || undefined,
      };
    });
    syncCatalog(updatedProducts);
    setDiscountModalTarget(null);
  };

  const handleRemoveQuickDiscount = (target: 'catalog' | string) => {
    const isCatalog = target === 'catalog';
    const updatedProducts = catalog.products.map((p) => {
      const matches = isCatalog || (p.groupId === target);
      if (!matches) return p;

      const restoredPrice = (p.originalPrice && p.originalPrice > p.price) ? p.originalPrice : p.price;
      return {
        ...p,
        price: restoredPrice,
        originalPrice: undefined,
        discountLabel: undefined,
      };
    });
    syncCatalog(updatedProducts);
    setDiscountModalTarget(null);
  };

  const handleSaveProduct = (
    savedProduct: Product,
    discountAction?: DiscountScopeAction
  ) => {
    const finalProduct: Product = {
      ...savedProduct,
      groupId: savedProduct.groupId || currentGroups[0]?.id || 'group-1',
    };

    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = catalog.products.map((p) => (p.id === finalProduct.id ? finalProduct : p));
    } else {
      updatedProducts = [...catalog.products, finalProduct];
    }

    if (discountAction && discountAction.scope !== 'single') {
      const isCatalog = discountAction.scope === 'catalog';
      const targetGroupId = discountAction.targetGroupId || finalProduct.groupId;

      updatedProducts = updatedProducts.map((p) => {
        if (p.id === finalProduct.id) {
          return finalProduct;
        }

        const matchesScope = isCatalog || (p.groupId === targetGroupId);
        if (!matchesScope) {
          return p;
        }

        if (discountAction.removeDiscount || discountAction.percent <= 0) {
          const restoredPrice = (p.originalPrice && p.originalPrice > p.price) ? p.originalPrice : p.price;
          return {
            ...p,
            price: restoredPrice,
            originalPrice: undefined,
            discountLabel: undefined,
          };
        }

        const basePrice = (p.originalPrice && p.originalPrice > p.price) ? p.originalPrice : p.price;
        let newPrice = basePrice;
        if (discountAction.discountType === 'percentage' || !discountAction.fixedDiscount) {
          newPrice = Math.max(0, Math.round(basePrice * (1 - discountAction.percent / 100)));
        } else {
          newPrice = Math.max(0, basePrice - discountAction.fixedDiscount);
        }

        return {
          ...p,
          price: newPrice,
          originalPrice: basePrice,
          discountLabel: discountAction.label || p.discountLabel || undefined,
        };
      });
    }

    syncCatalog(updatedProducts);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta vela del catálogo?')) {
      const updated = catalog.products.filter((p) => p.id !== id);
      syncCatalog(updated);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const copy: Product = {
      ...product,
      id: `candle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${product.name} (Copia)`,
      sku: `${product.sku || 'CP'}-B`,
      fragrances: Array.isArray(product.fragrances) ? [...product.fragrances] : [],
      colors: Array.isArray(product.colors) ? product.colors.map((c) => ({ ...c })) : [],
      includes: Array.isArray(product.includes) ? [...product.includes] : [],
      groupId: product.groupId || currentGroups[0]?.id,
    };
    syncCatalog([...catalog.products, copy]);
  };

  const handleMoveProductWithinGroup = (
    groupProducts: Product[],
    indexInGroup: number,
    direction: 'up' | 'down'
  ) => {
    const targetIndexInGroup = direction === 'up' ? indexInGroup - 1 : indexInGroup + 1;
    if (targetIndexInGroup < 0 || targetIndexInGroup >= groupProducts.length) return;

    const reorderedGroup = [...groupProducts];
    const [moved] = reorderedGroup.splice(indexInGroup, 1);
    reorderedGroup.splice(targetIndexInGroup, 0, moved);

    const updatedCatalogProducts: Product[] = [];
    groupedProducts.forEach((item) => {
      if (item.group.id === (groupProducts[0]?.groupId || '')) {
        updatedCatalogProducts.push(...reorderedGroup);
      } else {
        updatedCatalogProducts.push(...item.products);
      }
    });

    syncCatalog(updatedCatalogProducts);
  };

  const handleMoveProductToGroup = (productId: string, targetGroupId: string) => {
    const updatedProducts = catalog.products.map((p) =>
      p.id === productId ? { ...p, groupId: targetGroupId } : p
    );
    syncCatalog(updatedProducts);
  };

  // Group Management Handlers
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: ProductGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newGroupName.trim(),
      subtitle: newGroupSubtitle.trim() || undefined,
    };

    const updatedGroups = [...currentGroups, newGroup];
    syncCatalog(catalog.products, updatedGroups);

    setNewGroupName('');
    setNewGroupSubtitle('');
    setIsAddingGroup(false);
  };

  const handleStartEditGroup = (group: ProductGroup) => {
    setEditingGroupId(group.id);
    setTempGroupName(group.name);
    setTempGroupSubtitle(group.subtitle || '');
  };

  const handleSaveEditGroup = (groupId: string) => {
    if (!tempGroupName.trim()) return;

    const updatedGroups = currentGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            name: tempGroupName.trim(),
            subtitle: tempGroupSubtitle.trim() || undefined,
          }
        : g
    );

    syncCatalog(catalog.products, updatedGroups);
    setEditingGroupId(null);
  };

  const handleMoveGroup = (groupIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentGroups.length) return;

    const reorderedGroups = [...currentGroups];
    const [moved] = reorderedGroups.splice(groupIndex, 1);
    reorderedGroups.splice(targetIndex, 0, moved);

    const updatedProducts: Product[] = [];
    reorderedGroups.forEach((group) => {
      const prods = catalog.products.filter(
        (p) => (p.groupId || currentGroups[0].id) === group.id
      );
      updatedProducts.push(...prods);
    });

    syncCatalog(updatedProducts, reorderedGroups);
  };

  const handleDeleteGroup = (group: ProductGroup) => {
    if (currentGroups.length <= 1) {
      alert('Debes tener al menos una agrupación de productos para tu catálogo.');
      return;
    }

    const fallbackGroup = currentGroups.find((g) => g.id !== group.id) || currentGroups[0];
    const groupProducts = catalog.products.filter(
      (p) => (p.groupId || currentGroups[0].id) === group.id
    );

    const confirmMsg =
      groupProducts.length > 0
        ? `¿Deseas eliminar la agrupación "${group.name}"? Sus ${groupProducts.length} velas se moverán a la agrupación "${fallbackGroup.name}".`
        : `¿Deseas eliminar la agrupación vacía "${group.name}"?`;

    if (confirm(confirmMsg)) {
      const updatedProducts = catalog.products.map((p) =>
        (p.groupId || currentGroups[0].id) === group.id
          ? { ...p, groupId: fallbackGroup.id }
          : p
      );

      const updatedGroups = currentGroups.filter((g) => g.id !== group.id);
      syncCatalog(updatedProducts, updatedGroups);

      if (selectedFilterGroupId === group.id) {
        setSelectedFilterGroupId(null);
      }
    }
  };

  const suggestedFragrances =
    SEASONAL_PRESETS[catalog.theme.season]?.sampleFragrances || [];
  const suggestedIncludes =
    SEASONAL_PRESETS[catalog.theme.season]?.sampleIncludes || [];

  const visibleGroupedProducts = selectedFilterGroupId
    ? groupedProducts.filter((item) => item.group.id === selectedFilterGroupId)
    : groupedProducts;

  return (
    <div className="space-y-4">
      {/* Top Header with title and main CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-800" />
            <span>Agrupaciones & Velas ({catalog.products.length})</span>
          </h3>
          <p className="text-xs text-stone-500">
            Cada agrupación tiene sus propias páginas A4 con su propio título editorial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAIExtract && (
            <button
              type="button"
              onClick={onOpenAIExtract}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-amber-300 hover:text-amber-200 hover:bg-stone-800 border border-amber-500/30 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Extraer productos automáticamente desde un texto o lista desordenada con IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Extraer con IA</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDiscountModalTarget('catalog')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold transition-all border border-rose-200 cursor-pointer"
            title="Gestionar descuentos en todo el catálogo"
          >
            <BadgePercent className="w-3.5 h-3.5 text-rose-600" />
            <span>Descuento Global</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingGroup(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-all border border-stone-200 cursor-pointer"
            title="Crear nueva agrupación de velas"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nueva Agrupación</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenNew()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Vela</span>
          </button>
        </div>
      </div>

      {/* Notice & Quick Save if changes pending */}
      {hasUnsavedChanges && onSave && (
        <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-300 rounded-xl text-xs gap-2">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Tienes cambios pendientes sin guardar en la base de datos MySQL.</span>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar en BD</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Group Creation Inline Card */}
      {isAddingGroup && (
        <div className="p-4 bg-emerald-50/70 border-2 border-emerald-600/60 rounded-xl space-y-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-emerald-700" />
              <span>Crear Nueva Agrupación de Productos</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingGroup(false)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-emerald-950 uppercase mb-1">
                Título de la Agrupación (Título de la Página) *
              </label>
              <input
                type="text"
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ej. Velas Esculturales & Geométricas, Difusores & Melts..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGroup();
                  if (e.key === 'Escape') setIsAddingGroup(false);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-950 uppercase mb-1">
                Subtítulo o Descripción de la Sección (Opcional)
              </label>
              <input
                type="text"
                value={newGroupSubtitle}
                onChange={(e) => setNewGroupSubtitle(e.target.value)}
                placeholder="Ej. Cera de soya 100% y formas orgánicas para decorar"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGroup();
                }}
                className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-stone-700 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingGroup(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Crear Agrupación
            </button>
          </div>
        </div>
      )}

      {/* Filter Chips Bar (When multiple groups exist) */}
      {currentGroups.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilterGroupId(null)}
            className={`px-2.5 py-1 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
              selectedFilterGroupId === null
                ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todas ({catalog.products.length})
          </button>
          {groupedProducts.map((item) => (
            <button
              key={item.group.id}
              type="button"
              onClick={() => setSelectedFilterGroupId(item.group.id)}
              className={`px-2.5 py-1 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                selectedFilterGroupId === item.group.id
                  ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{item.group.name}</span>
              <span className="opacity-70 font-mono">({item.products.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Groupings Container */}
      {visibleGroupedProducts.map((groupItem, groupIndex) => {
        const { group, products: groupProducts } = groupItem;
        const pageCount = Math.ceil(groupProducts.length / 2) || 1;
        const isEditingThisGroup = editingGroupId === group.id;

        return (
          <div
            key={group.id}
            className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-3 transition-all hover:border-stone-300"
          >
            {/* Group Header */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
              {/* Group Title / Reorder */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Reorder Group Buttons */}
                <div className="flex flex-col gap-0.5 text-stone-400 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveGroup(groupIndex, 'up')}
                    disabled={groupIndex === 0}
                    className="p-1 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                    title="Mover agrupación arriba"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveGroup(groupIndex, 'down')}
                    disabled={groupIndex === currentGroups.length - 1}
                    className="p-1 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                    title="Mover agrupación abajo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Group Title and Info */}
                <div className="min-w-0 flex-1">
                  {isEditingThisGroup ? (
                    <div className="space-y-1.5 p-2 bg-stone-50 rounded-lg border border-emerald-300">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-600 uppercase mb-0.5">
                          Título de la Agrupación (Página A4)
                        </label>
                        <input
                          type="text"
                          value={tempGroupName}
                          autoFocus
                          onChange={(e) => setTempGroupName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditGroup(group.id);
                            if (e.key === 'Escape') setEditingGroupId(null);
                          }}
                          className="w-full px-2.5 py-1 text-xs bg-white border rounded font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-600 uppercase mb-0.5">
                          Subtítulo (Opcional)
                        </label>
                        <input
                          type="text"
                          value={tempGroupSubtitle}
                          onChange={(e) => setTempGroupSubtitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditGroup(group.id);
                            if (e.key === 'Escape') setEditingGroupId(null);
                          }}
                          placeholder="Subtítulo de la sección"
                          className="w-full px-2.5 py-1 text-xs bg-white border rounded text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingGroupId(null)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:text-stone-900 rounded"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditGroup(group.id)}
                          className="px-2.5 py-0.5 bg-emerald-800 text-white text-xs font-bold rounded flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Guardar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 tracking-wide truncate" title={group.name}>
                          {group.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleStartEditGroup(group)}
                          className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors shrink-0"
                          title="Editar título de página"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      {group.subtitle && (
                        <p className="text-[11px] text-stone-500 line-clamp-1">
                          {group.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Group Meta & Action Buttons */}
              {!isEditingThisGroup && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                    {groupProducts.length} {groupProducts.length === 1 ? 'vela' : 'velas'} · {pageCount} {pageCount === 1 ? 'pág. A4' : 'págs. A4'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setDiscountModalTarget(group.id)}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                    title={`Gestionar descuentos en "${group.name}"`}
                  >
                    <BadgePercent className="w-3 h-3 text-rose-600" />
                    <span>Dcto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenNew(group.id)}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1 border border-stone-200 transition-colors cursor-pointer"
                    title={`Agregar vela directamente en "${group.name}"`}
                  >
                    <Plus className="w-3 h-3 text-emerald-800" />
                    <span>Vela</span>
                  </button>

                  {currentGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(group)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar esta agrupación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Products inside this Group */}
            {groupProducts.length === 0 ? (
              <div className="text-center py-6 px-4 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                <p className="text-xs text-stone-500 font-medium mb-2">
                  No hay velas asignadas a "{group.name}" todavía.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenNew(group.id)}
                  className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  Agregar vela a esta agrupación
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {groupProducts.map((prod, indexInGroup) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-stone-50/70 hover:bg-white border border-stone-200 hover:border-stone-300 rounded-xl shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                  >
                    {/* Top Row: Reorder + Thumbnail + Details + Action Buttons */}
                    <div className="flex items-start gap-3">
                      {/* Reorder inside group */}
                      <div className="flex flex-col gap-0.5 text-stone-400 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveProductWithinGroup(groupProducts, indexInGroup, 'up')}
                          disabled={indexInGroup === 0}
                          className="p-1 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                          title="Mover arriba en esta agrupación"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProductWithinGroup(groupProducts, indexInGroup, 'down')}
                          disabled={indexInGroup === groupProducts.length - 1}
                          className="p-1 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                          title="Mover abajo en esta agrupación"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Thumbnail: Clean, unobstructed, fixed size */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-stone-200 bg-white shrink-0 shadow-2xs relative">
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=600&q=80'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info & Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate" title={prod.name}>
                              {prod.name}
                            </h5>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              {prod.originalPrice && prod.originalPrice > prod.price ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] line-through text-stone-400 font-medium">
                                    {catalog.theme.currencySymbol}{prod.originalPrice.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-rose-700">
                                    {catalog.theme.currencySymbol}{prod.price.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                                    -{Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-emerald-800">
                                  {catalog.theme.currencySymbol}{prod.price.toLocaleString()}
                                </span>
                              )}
                              {prod.sku && (
                                <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
                                  {prod.sku}
                                </span>
                              )}
                              {prod.isSeasonalSpecial && (
                                <span className="text-[9px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  Especial
                                </span>
                              )}
                              {prod.originalPrice && prod.originalPrice > prod.price && prod.discountLabel && (
                                <span className="text-[9px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  {prod.discountLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons: Edit, Duplicate, Delete */}
                          <div className="flex items-center gap-0.5 shrink-0 bg-white p-0.5 rounded-lg border border-stone-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleEdit(prod)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                              title="Editar vela"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateProduct(prod)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                              title="Duplicar vela"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Eliminar vela"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Dimensions & Fragrance Badges Row */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-white text-stone-700 px-2 py-0.5 rounded-md border border-stone-200 font-semibold shadow-2xs">
                            <span className="text-emerald-700 font-bold">↕</span>
                            <span>{prod.heightCm} cm</span>
                            <span className="text-stone-300">×</span>
                            <span className="text-emerald-700 font-bold">↔</span>
                            <span>{prod.widthCm} cm</span>
                          </span>

                          {prod.fragrances && prod.fragrances.length > 0 && (
                            <span className="truncate max-w-[150px] text-[10px] text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                              {prod.fragrances.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Move to Group Selector (when multiple groups exist) */}
                    {currentGroups.length > 1 && (
                      <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-xs gap-2">
                        <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1 shrink-0">
                          <MoveRight className="w-3 h-3 text-stone-400" />
                          <span>Mover a:</span>
                        </span>
                        <select
                          value={prod.groupId || group.id}
                          onChange={(e) => handleMoveProductToGroup(prod.id, e.target.value)}
                          className="flex-1 max-w-[240px] px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-600 text-stone-800 font-medium shadow-2xs cursor-pointer truncate"
                          title="Cambiar agrupación de esta vela"
                        >
                          {currentGroups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal for adding/editing product */}
      <ProductFormModal
        key={editingProduct ? editingProduct.id : `new-candle-modal-${modalDefaultGroupId}`}
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        currencySymbol={catalog.theme.currencySymbol}
        suggestedFragrances={suggestedFragrances}
        suggestedIncludes={suggestedIncludes}
        groups={currentGroups}
        defaultGroupId={modalDefaultGroupId}
        allProducts={catalog.products}
      />

      {/* Quick Discount Modal for Group or Catalog */}
      {discountModalTarget !== null && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setDiscountModalTarget(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 space-y-5 z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <BadgePercent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {discountModalTarget === 'catalog'
                      ? 'Descuento Global en Todo el Catálogo'
                      : `Descuento para "${currentGroups.find((g) => g.id === discountModalTarget)?.name || 'este grupo'}"`}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {discountModalTarget === 'catalog'
                      ? `Aplica a las ${catalog.products.length} velas del catálogo`
                      : `Aplica a las ${catalog.products.filter((p) => (p.groupId || currentGroups[0]?.id) === discountModalTarget).length} velas de este grupo`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDiscountModalTarget(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Porcentaje de Descuento (%)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={quickDiscountPercent}
                      onChange={(e) => setQuickDiscountPercent(Math.max(1, Math.min(99, Number(e.target.value))))}
                      className="w-full px-3 py-2 text-sm font-bold border rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white pr-8 text-rose-700"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-stone-400 font-mono">%</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setQuickDiscountPercent(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        quickDiscountPercent === pct
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Etiqueta Promocional (Opcional)
                </label>
                <input
                  type="text"
                  value={quickDiscountLabel}
                  onChange={(e) => setQuickDiscountLabel(e.target.value)}
                  placeholder={`Ej. -${quickDiscountPercent}% OFF, OFERTA, LIQUIDACIÓN`}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>¿Cómo se reflejará?</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  El precio regular se mostrará como precio anterior tachado (ej. ~~$50.000~~), y el nuevo precio calculado con el {quickDiscountPercent}% de descuento se mostrará destacado.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleApplyQuickDiscount(discountModalTarget, quickDiscountPercent, quickDiscountLabel)}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BadgePercent className="w-4 h-4" />
                <span>Aplicar {quickDiscountPercent}% de Descuento</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveQuickDiscount(discountModalTarget)}
                  className="flex-1 py-2 px-3 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Quitar Descuentos
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountModalTarget(null)}
                  className="py-2 px-4 text-xs font-medium text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
