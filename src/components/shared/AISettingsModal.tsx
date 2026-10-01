import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Check, Loader2, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';

interface AISettingItem {
  id?: number;
  provider: string;
  apiKey: string;
  modelName?: string;
  isActive: boolean;
  hasKey?: boolean;
}

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettingItem[]>([]);
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'anthropic' | 'openrouter'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
      }
    } catch (err) {
      console.error('Error loading AI settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      setMessage(null);
      setApiKey('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessage({ text: 'Por favor ingresa la Clave API de tu suscripción.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
          modelName: modelName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Error al guardar clave de IA.', type: 'error' });
      } else {
        setMessage({ text: '¡Clave de IA configurada con éxito!', type: 'success' });
        setApiKey('');
        fetchSettings();
      }
    } catch (err) {
      console.error('Error saving AI setting:', err);
      setMessage({ text: 'Error de conexión con el servidor.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (providerToDelete: string) => {
    if (!confirm(`¿Eliminar la clave de ${providerToDelete}?`)) return;

    try {
      const res = await fetch(`/api/ai/settings?provider=${providerToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchSettings();
        setMessage({ text: 'Configuración eliminada.', type: 'success' });
      }
    } catch (err) {
      console.error('Error deleting AI key:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-5 border-b border-stone-200 bg-linear-to-r from-stone-900 to-stone-800 text-white">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif">
                Configuración de Inteligencia Artificial (BYOK)
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Conecta tu propia suscripción o clave API para generar descripciones, textos y catálogos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-700/60 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6 sm:py-7 space-y-6 overflow-y-auto flex-1">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              <span>{message.text}</span>
            </div>
          )}

          {/* Active Keys List */}
          <div>
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
              Tus Proveedores Conectados
            </h3>
            {isLoading ? (
              <div className="py-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Cargando configuración...</span>
              </div>
            ) : settings.length === 0 ? (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-center">
                <Key className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-stone-700">Sin suscripciones conectadas aún</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Agrega una clave abajo para activar el asistente de redacción y diseño con IA en tus catálogos.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {settings.map((item) => (
                  <div
                    key={item.provider}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                        {item.provider.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-stone-900 capitalize">{item.provider}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                            Activo
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 font-mono">{item.apiKey}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.provider)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar clave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Update Key Form */}
          <form onSubmit={handleSave} className="p-4.5 bg-stone-50/80 border border-stone-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Conectar o Actualizar Proveedor de IA</span>
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Proveedor
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 font-medium"
              >
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Flash / Pro)</option>
                <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
                <option value="openrouter">OpenRouter (Multi-modelos)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                  Clave API (API Key) *
                </label>
                <a
                  href={
                    provider === 'openai'
                      ? 'https://platform.openai.com/api-keys'
                      : provider === 'gemini'
                      ? 'https://aistudio.google.com/app/apikey'
                      : provider === 'anthropic'
                      ? 'https://console.anthropic.com/settings/keys'
                      : 'https://openrouter.ai/keys'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-700 hover:text-amber-800 flex items-center gap-1 font-medium underline"
                >
                  <span>Obtener clave</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === 'openai'
                    ? 'sk-...'
                    : provider === 'gemini'
                    ? 'AIzaSy...'
                    : 'Clave secreta...'
                }
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-900/30 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Modelo Opcional (deja vacío para el recomendado)
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={
                  provider === 'openai'
                    ? 'gpt-4o-mini'
                    : provider === 'gemini'
                    ? 'gemini-1.5-flash'
                    : 'Predeterminado'
                }
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-900/30 transition"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tu clave se guarda segura en tu base de datos Easy Cat</span>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-amber-400" />
                    <span>Guardar Clave</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
