'use client';

import React, { useState, useEffect } from 'react';
import { Catalog, Product, Project, User as UserType, hasCustomLogo, mergeContactWithProjectDefaults } from '../types/catalog';
import { INITIAL_CATALOG } from '../data/defaultCatalog';
import { saveCatalogToStorage, getCatalogFromStorage } from '../lib/storage';
import { HeaderNavbar } from '../components/shared/HeaderNavbar';
import { CatalogEditor } from '../components/editor/CatalogEditor';
import { CatalogPreview } from '../components/preview/CatalogPreview';
import { PdfExportModal } from '../components/shared/PdfExportModal';
import { ShareUrlModal } from '../components/shared/ShareUrlModal';
import { CatalogManagerModal } from '../components/shared/CatalogManagerModal';
import { ProjectSettingsModal } from '../components/shared/ProjectSettingsModal';
import { AISettingsModal } from '../components/shared/AISettingsModal';
import { AIAssistantModal } from '../components/ai/AIAssistantModal';
import { ProjectsDashboardView } from '../components/projects/ProjectsDashboardView';
import { SlidersHorizontal, Eye, Loader2, Clock, AlertTriangle, X, Save } from 'lucide-react';

export default function EasyCatMainPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // View state: 'dashboard' (projects list) vs 'studio' (editor + preview)
  const [currentView, setCurrentView] = useState<'dashboard' | 'studio'>('dashboard');

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Catalog state
  const [catalog, setCatalog] = useState<Catalog>(INITIAL_CATALOG);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastModifiedTime, setLastModifiedTime] = useState<number | null>(null);
  const [showInactivitySaveAlert, setShowInactivitySaveAlert] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('Guardado');

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCatalogManagerOpen, setIsCatalogManagerOpen] = useState<boolean>(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState<boolean>(false);
  const [isProjectSettingsNew, setIsProjectSettingsNew] = useState<boolean>(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiAssistantTab, setAiAssistantTab] = useState<'product' | 'intro' | 'extract'>('product');

  // Mobile tab state in Studio
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // 1. Initial Authentication & Projects Fetch
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const requestedSlug = urlParams.get('catalog');

    async function verifyAuthAndFetchProjects() {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          const currentUrl = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
          return;
        }

        const authData = await authRes.json();
        if (!authData?.authenticated || !authData?.user) {
          const currentUrl = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
          return;
        }

        setCurrentUser(authData.user);
        setIsAuthChecking(false);

        // Fetch projects
        const projRes = await fetch('/api/projects');
        if (projRes.ok) {
          const projData = await projRes.json();
          const userProjects: Project[] = projData.projects || [];
          setProjects(userProjects);

          if (requestedSlug) {
            // Direct catalog requested via query param
            await loadCatalogBySlug(requestedSlug, userProjects);
            setCurrentView('studio');
          } else if (userProjects.length === 1) {
            // Exactly one project, load its latest catalog directly
            const defaultProj = userProjects[0];
            setCurrentProject(defaultProj);
            await loadProjectCatalogs(defaultProj.id, defaultProj);
            setCurrentView('studio');
          } else {
            // Multiple or zero projects -> start on dashboard
            setCurrentView('dashboard');
          }
        }
      } catch (err) {
        console.error('Error verifying auth:', err);
        window.location.href = '/login';
      }
    }

    verifyAuthAndFetchProjects();
  }, []);

  // Helper to load catalogs of a project
  const loadProjectCatalogs = async (projectId: string, proj: Project) => {
    try {
      const res = await fetch(`/api/catalogs?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.catalogs || [];
        if (list.length > 0) {
          const catRes = await fetch(`/api/catalogs/${list[0].slug}`);
          if (catRes.ok) {
            const fullCat = await catRes.json();
            const effectiveLogo = (proj.logoUrl && hasCustomLogo(proj.logoUrl))
              ? proj.logoUrl
              : (hasCustomLogo(fullCat.brandLogo) ? fullCat.brandLogo : undefined);
            const effectiveContact = mergeContactWithProjectDefaults(fullCat.contact, proj.defaultContact);
            const catWithLogo = { ...fullCat, brandLogo: effectiveLogo, contact: effectiveContact };
            setCatalog(catWithLogo);
            saveCatalogToStorage(catWithLogo);
            setHasUnsavedChanges(false);
            return;
          }
        }
      }
      // If no catalog yet, create initial default for this project
      const initialForProj: Catalog = {
        ...INITIAL_CATALOG,
        id: `cat_${proj.slug}_${Date.now().toString(36)}`,
        projectId: proj.id,
        brandName: proj.name,
        brandLogo: (proj.logoUrl && hasCustomLogo(proj.logoUrl)) ? proj.logoUrl : undefined,
        contact: mergeContactWithProjectDefaults({}, proj.defaultContact),
        slug: `${proj.slug}-catalogo`,
      };
      setCatalog(initialForProj);
      saveCatalogToStorage(initialForProj);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error loading project catalogs:', err);
    }
  };

  const loadCatalogBySlug = async (slug: string, currentProjectsList: Project[]) => {
    try {
      const res = await fetch(`/api/catalogs/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          // Find matching project
          const match = currentProjectsList.find((p) => p.id === data.projectId);
          if (match) setCurrentProject(match);
          const effectiveLogo = (match?.logoUrl && hasCustomLogo(match.logoUrl))
            ? match.logoUrl
            : (hasCustomLogo(data.brandLogo) ? data.brandLogo : undefined);
          const effectiveContact = mergeContactWithProjectDefaults(data.contact, match?.defaultContact);
          const catWithLogo = { ...data, brandLogo: effectiveLogo, contact: effectiveContact };
          setCatalog(catWithLogo);
          saveCatalogToStorage(catWithLogo);
          setHasUnsavedChanges(false);
        }
      }
    } catch (err) {
      console.error('Error loading catalog by slug:', err);
    }
  };

  // Browser navigation warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Periodic reminder after 10 min of unsaved modifications
  useEffect(() => {
    if (!hasUnsavedChanges || !lastModifiedTime) {
      setShowInactivitySaveAlert(false);
      return;
    }
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const interval = setInterval(() => {
      if (hasUnsavedChanges && lastModifiedTime && Date.now() - lastModifiedTime >= TEN_MINUTES_MS) {
        setShowInactivitySaveAlert(true);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [hasUnsavedChanges, lastModifiedTime]);

  const handleCatalogChange = (updatedCatalog: Catalog) => {
    setCatalog(updatedCatalog);
    saveCatalogToStorage(updatedCatalog);
    setHasUnsavedChanges(true);
    setLastModifiedTime(Date.now());
  };

  const handleApplyIntroText = (intro: string) => {
    setCatalog((prev) => {
      const updated = { ...prev, introText: intro };
      saveCatalogToStorage(updated);
      return updated;
    });
    setHasUnsavedChanges(true);
    setLastModifiedTime(Date.now());
  };

  const handleAddExtractedProducts = (extracted: Partial<Product>[]) => {
    setCatalog((prev) => {
      const newProducts: Product[] = extracted.map((p, idx) => ({
        id: `candle_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: p.name || 'Nueva Vela Artesanal',
        sku: p.sku || `VEL-${Math.floor(100 + Math.random() * 900)}`,
        price: Number(p.price) || 35000,
        currency: p.currency || prev.theme?.currencySymbol || '$',
        description: p.description || '',
        heightCm: Number(p.heightCm) || 10,
        widthCm: Number(p.widthCm) || 7,
        fragrances: Array.isArray(p.fragrances) && p.fragrances.length > 0 ? p.fragrances : ['Vainilla Botánica'],
        colors:
          Array.isArray(p.colors) && p.colors.length > 0
            ? p.colors
            : [
                { name: 'Blanco Marfil', hex: '#FAF9F6' },
                { name: 'Cera Natural', hex: '#EBE5D8' },
              ],
        includes: Array.isArray(p.includes) && p.includes.length > 0 ? p.includes : ['Caja de regalo artesanal'],
        image: p.image || 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=80',
        burnTimeHours: Number(p.burnTimeHours) || 40,
        waxType: p.waxType || 'Cera de Soya',
        isSeasonalSpecial: Boolean(p.isSeasonalSpecial),
      }));

      const updated = {
        ...prev,
        products: [...prev.products, ...newProducts],
      };
      saveCatalogToStorage(updated);
      return updated;
    });
    setHasUnsavedChanges(true);
    setLastModifiedTime(Date.now());
  };

  const handleApplyDescription = (desc: string, fragrances?: string[]) => {
    setCatalog((prev) => {
      if (prev.products.length === 0) return prev;
      const updatedProducts = [...prev.products];
      updatedProducts[0] = {
        ...updatedProducts[0],
        description: desc,
        fragrances:
          fragrances && fragrances.length > 0 ? fragrances : updatedProducts[0].fragrances,
      };
      const updated = { ...prev, products: updatedProducts };
      saveCatalogToStorage(updated);
      return updated;
    });
    setHasUnsavedChanges(true);
    setLastModifiedTime(Date.now());
  };

  const handleSaveToDb = async () => {
    if (!currentUser) return;
    try {
      setSaveMessage('Guardando...');
      const catalogToSave = {
        ...catalog,
        projectId: currentProject?.id || catalog.projectId || 'default-project',
        brandName: currentProject?.name || catalog.brandName,
        brandLogo: (currentProject?.logoUrl && hasCustomLogo(currentProject.logoUrl))
          ? currentProject.logoUrl
          : (hasCustomLogo(catalog.brandLogo) ? catalog.brandLogo : undefined),
      };

      const res = await fetch('/api/catalogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catalogToSave),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Error al guardar el catálogo en la base de datos.');
        setSaveMessage('Error al guardar');
        return;
      }

      setIsSaved(true);
      setHasUnsavedChanges(false);
      setLastModifiedTime(null);
      setShowInactivitySaveAlert(false);
      setSaveMessage('Guardado');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving catalog:', err);
      alert('Error de conexión al guardar el catálogo.');
      setSaveMessage('Error');
    }
  };

  const handleSelectProjectFromDashboard = async (proj: Project) => {
    setCurrentProject(proj);
    await loadProjectCatalogs(proj.id, proj);
    setCurrentView('studio');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de eliminar este emprendimiento y todos sus catálogos? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = projects.filter((p) => p.id !== projectId);
        setProjects(updated);
        if (currentProject?.id === projectId) {
          setCurrentProject(updated[0] || null);
          if (updated.length === 0) setCurrentView('dashboard');
        }
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      window.location.href = '/login';
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-900 animate-spin" />
        <p className="text-stone-600 text-sm font-serif">Iniciando Easy Cat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* View Switch: Dashboard vs Studio */}
      {currentView === 'dashboard' ? (
        <ProjectsDashboardView
          user={currentUser!}
          projects={projects}
          onSelectProject={handleSelectProjectFromDashboard}
          onOpenCreateProject={() => {
            setIsProjectSettingsNew(true);
            setIsProjectSettingsOpen(true);
          }}
          onOpenEditProject={(proj) => {
            setCurrentProject(proj);
            setIsProjectSettingsNew(false);
            setIsProjectSettingsOpen(true);
          }}
          onDeleteProject={handleDeleteProject}
          onOpenAISettings={() => setIsAISettingsOpen(true)}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {/* Header Navbar without DB connection badge */}
          <HeaderNavbar
            catalog={catalog}
            currentProject={currentProject}
            user={currentUser}
            onLogout={handleLogout}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onSave={handleSaveToDb}
            onOpenCatalogManager={() => setIsCatalogManagerOpen(true)}
            onOpenProjectSettings={() => {
              setIsProjectSettingsNew(false);
              setIsProjectSettingsOpen(true);
            }}
            onOpenProjectsDashboard={() => setCurrentView('dashboard')}
            onOpenAIAssistant={() => {
              setAiAssistantTab('product');
              setIsAIAssistantOpen(true);
            }}
            onOpenAISettings={() => setIsAISettingsOpen(true)}
            isSaved={isSaved}
            hasUnsavedChanges={hasUnsavedChanges}
            saveMessage={saveMessage}
          />

          {/* Inactivity Unsaved Changes Alert Banner */}
          {showInactivitySaveAlert && (
            <div className="bg-amber-500 text-stone-900 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs sticky top-[53px] z-30">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-950" />
                <span>
                  Llevas más de 10 minutos con cambios sin guardar. ¡Guarda tu catálogo para no perder avances!
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveToDb}
                  className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guardar ahora</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInactivitySaveAlert(false)}
                  className="p-1 hover:bg-amber-600/30 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile View Toggle */}
          <div className="lg:hidden bg-stone-200 border-b border-stone-300 p-2 flex justify-center sticky top-[53px] z-20">
            <div className="inline-flex rounded-xl bg-white p-1 shadow-xs border border-stone-300">
              <button
                type="button"
                onClick={() => setMobileTab('editor')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  mobileTab === 'editor'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Editar Catálogo</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  mobileTab === 'preview'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vista Previa A4</span>
              </button>
            </div>
          </div>

          {/* Studio Workspace: Dual Columns */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Editor Panel */}
            <aside
              className={`w-full lg:w-[480px] xl:w-[520px] 2xl:w-[560px] bg-white border-r border-stone-200 flex flex-col shrink-0 ${
                mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <div className="flex-1 overflow-y-auto">
                <CatalogEditor
                  catalog={catalog}
                  onChange={handleCatalogChange}
                  onOpenAIIntro={() => {
                    setAiAssistantTab('intro');
                    setIsAIAssistantOpen(true);
                  }}
                  onOpenAIExtract={() => {
                    setAiAssistantTab('extract');
                    setIsAIAssistantOpen(true);
                  }}
                />
              </div>
            </aside>

            {/* Right: Realistic A4 Magazine Live Preview */}
            <main
              className={`flex-1 bg-stone-200/90 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center ${
                mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <div className="w-full max-w-[850px]">
                <CatalogPreview
                  catalog={catalog}
                  onChange={handleCatalogChange}
                />
              </div>
            </main>
          </div>
        </>
      )}

      {/* Modals */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        catalogTitle={catalog.title || 'Catalogo-Easy-Cat'}
      />

      <ShareUrlModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        catalog={catalog}
      />

      <CatalogManagerModal
        isOpen={isCatalogManagerOpen}
        onClose={() => setIsCatalogManagerOpen(false)}
        projectId={currentProject?.id || catalog.projectId || ''}
        currentProject={currentProject}
        currentCatalogId={catalog.id}
        onSelectCatalog={(selected) => {
          setCatalog(selected);
          saveCatalogToStorage(selected);
          setHasUnsavedChanges(false);
          setLastModifiedTime(null);
        }}
      />

      <ProjectSettingsModal
        isOpen={isProjectSettingsOpen}
        onClose={() => setIsProjectSettingsOpen(false)}
        project={isProjectSettingsNew ? null : currentProject}
        isNew={isProjectSettingsNew}
        onSaved={async (savedProj) => {
          // Refresh projects list
          const projRes = await fetch('/api/projects');
          if (projRes.ok) {
            const data = await projRes.json();
            setProjects(data.projects || []);
          }
          setCurrentProject(savedProj);
          // If in studio, update current catalog brandName/logo and default contact
          setCatalog((prev) => {
            const updated = {
              ...prev,
              projectId: savedProj.id,
              brandName: savedProj.name,
              brandLogo: (savedProj.logoUrl && hasCustomLogo(savedProj.logoUrl)) ? savedProj.logoUrl : undefined,
              contact: mergeContactWithProjectDefaults(prev.contact, savedProj.defaultContact),
            };
            saveCatalogToStorage(updated);
            return updated;
          });
        }}
      />

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        brandName={currentProject?.name || catalog.brandName}
        seasonTag={catalog.seasonTag}
        initialTab={aiAssistantTab}
        onApplyIntroText={handleApplyIntroText}
        onAddExtractedProducts={handleAddExtractedProducts}
        onApplyDescription={handleApplyDescription}
        onOpenAISettings={() => {
          setIsAIAssistantOpen(false);
          setIsAISettingsOpen(true);
        }}
      />
    </div>
  );
}
