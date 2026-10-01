import React, { useState } from 'react';
import { Project, User } from '@/types/catalog';
import {
  Building2,
  Plus,
  ArrowRight,
  Settings,
  Trash2,
  BookOpen,
  Sparkles,
  Layers,
  Globe,
  Phone,
  AtSign,
  LogOut,
} from 'lucide-react';

interface ProjectsDashboardViewProps {
  user: User;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenCreateProject: () => void;
  onOpenEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenAISettings: () => void;
  onLogout: () => void;
}

export const ProjectsDashboardView: React.FC<ProjectsDashboardViewProps> = ({
  user,
  projects,
  onSelectProject,
  onOpenCreateProject,
  onOpenEditProject,
  onDeleteProject,
  onOpenAISettings,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-900 text-amber-50 p-2 flex items-center justify-center shadow-md">
              <BookOpen className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black uppercase tracking-wider font-serif">Easy Cat</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                  Proyectos
                </span>
              </div>
              <p className="text-xs text-stone-400">Panel de Emprendimientos y Marcas</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={onOpenAISettings}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-amber-300 hover:text-amber-200 hover:bg-stone-700/80 border border-amber-500/30 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Suscripción IA</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 text-xs text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium">{user.name || user.email}</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-xl transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Tus Emprendimientos
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Cada emprendimiento tiene su propia marca, logo, catálogos de temporada y configuraciones independientes.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateProject}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Crear Emprendimiento</span>
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800 font-serif">
              Aún no tienes emprendimientos registrados
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Crea tu primer emprendimiento o marca para comenzar a generar catálogos de alta gama para tus clientes.
            </p>
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="mt-5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Crear mi primer Emprendimiento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md hover:border-amber-900/30 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Brand Logo & Name */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {proj.logoUrl ? (
                        <img
                          src={proj.logoUrl}
                          alt={proj.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-stone-300" />
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onOpenEditProject(proj)}
                        className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
                        title="Configurar marca y logo"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Eliminar emprendimiento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-stone-900 group-hover:text-amber-900 transition-colors">
                    {proj.name}
                  </h3>

                  {proj.description && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {proj.description}
                    </p>
                  )}

                  {/* Badges / Stats */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Layers className="w-3 h-3 text-stone-500" />
                      <span>{proj.catalogCount || 0} catálogos</span>
                    </span>
                    <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                      Moneda: {proj.defaultCurrency || '$'}
                    </span>
                  </div>

                  {/* Contact Summary */}
                  {(proj.defaultContact?.whatsapp || proj.defaultContact?.instagram) && (
                    <div className="flex items-center space-x-3 mt-3 text-[11px] text-stone-400">
                      {proj.defaultContact?.whatsapp && (
                        <span className="flex items-center gap-1 truncate">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{proj.defaultContact.whatsapp}</span>
                        </span>
                      )}
                      {proj.defaultContact?.instagram && (
                        <span className="flex items-center gap-1 truncate">
                          <AtSign className="w-3 h-3 text-pink-600" />
                          <span>{proj.defaultContact.instagram}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-500">
                    Abrir catálogo en edición
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectProject(proj)}
                    className="px-4 py-2 bg-stone-900 group-hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
                  >
                    <span>Entrar al Estudio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
