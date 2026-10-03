import React from 'react';
import { Catalog, Project, hasCustomLogo, getBrandInitials } from '../../types/catalog';
import {
  FileDown,
  Share2,
  ExternalLink,
  Save,
  Check,
  FolderOpen,
  ChevronDown,
  User,
  LogOut,
  Building2,
  Sparkles,
  BookOpen,
  Settings,
} from 'lucide-react';

interface HeaderNavbarProps {
  catalog: Catalog;
  currentProject: Project | null;
  user?: { email: string; name?: string } | null;
  onLogout?: () => void;
  onOpenPdfModal: () => void;
  onOpenShareModal: () => void;
  onSave: () => void;
  onOpenCatalogManager: () => void;
  onOpenProjectSettings: () => void;
  onOpenProjectsDashboard: () => void;
  onOpenAIAssistant: () => void;
  onOpenAISettings: () => void;
  isSaved?: boolean;
  hasUnsavedChanges?: boolean;
  saveMessage?: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  catalog,
  currentProject,
  user,
  onLogout,
  onOpenPdfModal,
  onOpenShareModal,
  onSave,
  onOpenCatalogManager,
  onOpenProjectSettings,
  onOpenProjectsDashboard,
  onOpenAIAssistant,
  onOpenAISettings,
  isSaved = false,
  hasUnsavedChanges = false,
  saveMessage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Logo & Project Switcher */}
        <div className="flex items-center gap-3">
          {/* Easy Cat Logo */}
          <button
            type="button"
            onClick={onOpenProjectsDashboard}
            title="Ir a mis emprendimientos"
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-900 text-amber-50 p-1.5 flex items-center justify-center shadow-xs overflow-hidden border border-amber-800/80 group-hover:scale-105 transition-transform">
              <BookOpen className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-stone-100 group-hover:text-amber-400 transition-colors">
                  Easy Cat
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                  Editorial
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                Generador de Catálogos
              </p>
            </div>
          </button>

          {/* Project / Brand Selector */}
          <div className="flex items-center pl-2 sm:pl-3 border-l border-stone-800">
            <button
              type="button"
              onClick={onOpenProjectSettings}
              title="Configurar datos generales del emprendimiento (nombre, logo, contacto)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800/90 text-stone-200 hover:bg-stone-700/80 border border-stone-700/70 flex items-center gap-2 transition"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-amber-950/80 border border-amber-800/80 flex items-center justify-center shrink-0">
                {hasCustomLogo(currentProject?.logoUrl) ? (
                  <img src={currentProject!.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif font-bold text-[9px] text-amber-300 select-none">
                    {getBrandInitials(currentProject?.name || catalog.brandName)}
                  </span>
                )}
              </div>
              <span className="max-w-[110px] sm:max-w-[140px] truncate font-semibold">
                {currentProject?.name || catalog.brandName || 'Mi Emprendimiento'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
          </div>

          {/* Catalog Switcher Button */}
          <div className="relative">
            <button
              type="button"
              onClick={onOpenCatalogManager}
              title="Cambiar o crear catálogo para este emprendimiento"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800/60 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/50 flex items-center gap-1.5 transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="max-w-[110px] sm:max-w-[160px] truncate">
                {catalog.title || 'Catálogo Activo'}
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950/60 text-amber-400 font-mono hidden md:inline">
                {catalog.products.length} velas
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 ml-0.5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button Group */}
          <div className="flex items-center rounded-lg bg-stone-800 border border-amber-500/30 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={onOpenAIAssistant}
              title="Abrir Asistente Editorial con IA"
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-stone-750 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Asistente IA</span>
            </button>
            <button
              type="button"
              onClick={onOpenAISettings}
              title="Configurar claves de IA (OpenAI / Gemini / Claude)"
              className="px-2 py-1.5 text-stone-400 hover:text-amber-200 hover:bg-stone-750 border-l border-stone-700 transition"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={onSave}
            title="Guardar cambios del catálogo"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              isSaved
                ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                : hasUnsavedChanges
                ? 'bg-amber-600 text-white hover:bg-amber-500 ring-2 ring-amber-400/40'
                : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>{saveMessage || 'Guardado'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Guardar</span>
              </>
            )}
          </button>

          {/* View as customer */}
          <a
            href={`/c/${catalog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white flex items-center gap-1.5 border border-stone-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Vista Cliente</span>
          </a>

          {/* Share URL */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-2xs transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          {/* Generate PDF */}
          <button
            type="button"
            onClick={onOpenPdfModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF</span>
          </button>

          {/* User profile & Logout */}
          {user && (
            <div className="flex items-center gap-1 pl-2 border-l border-stone-800">
              <div
                className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700/60 text-xs text-stone-300"
                title={`Sesión iniciada como: ${user.email}`}
              >
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[100px] truncate font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
