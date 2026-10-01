import React, { useState, useEffect } from 'react';
import { Catalog, SeasonKey } from '@/types/catalog';
import { SEASONAL_PRESETS } from '@/data/seasonalThemes';
import {
  X,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';

interface CatalogListItem {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  seasonTag: string;
  brandName: string;
  coverImage: string;
  productCount: number;
  updatedAt: string;
}

interface CatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentCatalogId: string;
  onSelectCatalog: (catalog: Catalog) => void;
}

export const CatalogManagerModal: React.FC<CatalogManagerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentCatalogId,
  onSelectCatalog,
}) => {
  const [catalogs, setCatalogs] = useState<CatalogListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // New Catalog Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newSeason, setNewSeason] = useState<SeasonKey>('navidad');
  const [newSlug, setNewSlug] = useState('');

  const fetchCatalogs = async () => {
    setIsLoading(true);
    try {
      const url = projectId ? `/api/catalogs?projectId=${projectId}` : '/api/catalogs';
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCatalogs(data.catalogs || []);
      }
    } catch (err) {
      console.error('Error fetching catalogs list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCatalogs();
      setIsCreating(false);
    }
  }, [isOpen, projectId]);

  const handleCreateCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setActionLoadingId('new');
    try {
      const preset = SEASONAL_PRESETS[newSeason] || SEASONAL_PRESETS.navidad;
      const cleanSlug = (newSlug.trim() || newTitle.trim())
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const newCatalog: Partial<Catalog> = {
        id: `cat_${cleanSlug}_${Date.now().toString(36)}`,
        projectId,
        slug: cleanSlug,
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || preset.defaultSubtitle,
        seasonTag: preset.name,
        editionYear: new Date().getFullYear().toString(),
        brandName: 'Mi Marca',
        coverImage: preset.defaultCoverImage,
        introText: 'Bienvenidos a nuestra colección.',
        theme: preset.theme,
        products: [],
        contact: { whatsapp: '' },
      };

      const res = await fetch('/api/catalogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCatalog),
      });

      if (res.ok) {
        const fullCatRes = await fetch(`/api/catalogs/${cleanSlug}`);
        if (fullCatRes.ok) {
          const loaded = await fullCatRes.json();
          onSelectCatalog(loaded);
          onClose();
        }
      } else {
        alert('Error al crear el catálogo.');
      }
    } catch (err) {
      console.error('Error creating catalog:', err);
      alert('Error de conexión.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSelect = async (slug: string) => {
    setActionLoadingId(slug);
    try {
      const res = await fetch(`/api/catalogs/${slug}`);
      if (res.ok) {
        const fullCat = await res.json();
        onSelectCatalog(fullCat);
        onClose();
      }
    } catch (err) {
      console.error('Error loading catalog:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicate = async (sourceSlug: string, sourceTitle: string) => {
    const defaultNewTitle = `${sourceTitle} (Copia)`;
    const newTitlePrompt = prompt('Nombre para el nuevo catálogo duplicado:', defaultNewTitle);
    if (!newTitlePrompt || !newTitlePrompt.trim()) return;

    const baseSlug = newTitlePrompt
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newSlugPrompt = prompt('URL amigable (slug) para el enlace del cliente:', baseSlug);
    if (!newSlugPrompt || !newSlugPrompt.trim()) return;

    setActionLoadingId(`dup-${sourceSlug}`);
    try {
      const res = await fetch(`/api/catalogs/${sourceSlug}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newTitle: newTitlePrompt.trim(),
          newSlug: newSlugPrompt.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.catalog) {
          await fetchCatalogs();
          onSelectCatalog(data.catalog);
          onClose();
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Error al duplicar catálogo');
      }
    } catch (err) {
      console.error('Error duplicating catalog:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar el catálogo "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setActionLoadingId(`del-${slug}`);
    try {
      const res = await fetch(`/api/catalogs/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCatalogs();
      } else {
        alert('Error al eliminar el catálogo.');
      }
    } catch (err) {
      console.error('Error deleting catalog:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-7 sm:px-8 pt-7 sm:pt-8 pb-5 border-b border-stone-200/90 bg-stone-50/90">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-900 text-amber-50 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                Mis Catálogos
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Crea, duplica colecciones de temporada o cambia de catálogo activo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isCreating && (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Nuevo Catálogo</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-7 sm:p-8 overflow-y-auto flex-1">
          {isCreating ? (
            <form onSubmit={handleCreateCatalog} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Crear Nuevo Catálogo o Colección</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Título de la Colección *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]+/g, '-')
                      );
                    }
                  }}
                  placeholder="Ej. Colección Otoño Cálido 2026"
                  className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Subtítulo Editorial
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Ej. Velas Botánicas & Aromas de Cosecha"
                  className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Temporada / Preset Visual
                  </label>
                  <select
                    value={newSeason}
                    onChange={(e) => setNewSeason(e.target.value as SeasonKey)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 font-medium"
                  >
                    {Object.entries(SEASONAL_PRESETS).map(([key, p]) => (
                      <option key={key} value={key}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Enlace de Compartir (slug)
                  </label>
                  <div className="flex items-center">
                    <span className="text-[11px] text-stone-400 bg-stone-100 border border-r-0 border-stone-200 px-2 py-2 rounded-l-xl">
                      /c/
                    </span>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      placeholder="mi-catalogo-2026"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-r-xl text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={actionLoadingId === 'new'}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                >
                  {actionLoadingId === 'new' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Crear e Ingresar al Editor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : isLoading ? (
            <div className="py-12 text-center text-xs text-stone-400 flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
              <span>Cargando tus catálogos...</span>
            </div>
          ) : catalogs.length === 0 ? (
            <div className="py-12 text-center">
              <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No hay catálogos aún</p>
              <p className="text-xs text-stone-400 mt-1">Crea tu primer catálogo con el botón de arriba.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalogs.map((item) => {
                const isActive = item.id === currentCatalogId;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all relative ${
                      isActive
                        ? 'border-amber-700 bg-amber-50/30 ring-2 ring-amber-700/20'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                            {item.seasonTag || 'Catálogo'}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> En Edición
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold font-serif text-stone-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">/c/{item.slug}</p>
                        <p className="text-[11px] text-stone-400 mt-1.5">
                          {item.productCount} productos · Actualizado {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {item.coverImage && (
                        <div className="w-14 h-18 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                          <img
                            src={item.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-stone-100 mt-3 pt-2.5">
                      <a
                        href={`/c/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver online</span>
                      </a>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item.slug, item.title)}
                          disabled={actionLoadingId === `dup-${item.slug}`}
                          className="px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg flex items-center gap-1 transition"
                          title="Duplicar catálogo"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Duplicar</span>
                        </button>

                        {catalogs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.slug, item.title)}
                            disabled={actionLoadingId === `del-${item.slug}`}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Eliminar catálogo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSelect(item.slug)}
                            disabled={actionLoadingId === item.slug}
                            className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
