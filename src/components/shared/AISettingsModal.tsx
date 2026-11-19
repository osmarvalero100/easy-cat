import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Key,
  Check,
  Loader2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Pencil,
  RotateCcw,
  Play,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export interface AISettingItem {
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
  onSaved?: () => void;
}

interface ModelPreset {
  value: string;
  label: string;
  recommended?: boolean;
  warning?: string;
}

const PROVIDER_PRESETS: Record<string, ModelPreset[]> = {
  gemini: [
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Recomendado - Rápido y estable)', recommended: true },
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (Ultra rápido y económico)' },
    { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
    { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Alta demanda frecuente de Google)', warning: 'Google suele reportar alta demanda temporal en este modelo.' },
    { value: 'custom', label: 'Otro modelo personalizado...' },
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Recomendado - Excelente velocidad y costo)', recommended: true },
    { value: 'gpt-4o', label: 'GPT-4o (Máxima calidad editorial)' },
    { value: 'custom', label: 'Otro modelo personalizado...' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recomendado - Estilo literario refinado)', recommended: true },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Rápido y conciso)' },
    { value: 'custom', label: 'Otro modelo personalizado...' },
  ],
  openrouter: [
    { value: 'openai/gpt-4o-mini', label: 'OpenAI: GPT-4o Mini (Recomendado)', recommended: true },
    { value: 'google/gemini-2.0-flash-001', label: 'Google: Gemini 2.0 Flash' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Anthropic: Claude 3.5 Sonnet' },
    { value: 'custom', label: 'Otro modelo personalizado...' },
  ],
};

const DEFAULT_RECOMMENDED_MODELS: Record<string, string> = {
  gemini: 'gemini-3-flash-preview',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20241022',
  openrouter: 'openai/gpt-4o-mini',
};

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [settings, setSettings] = useState<AISettingItem[]>([]);
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'anthropic' | 'openrouter'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('gemini-3-flash-preview');
  const [customModel, setCustomModel] = useState<string>('');
  const [editingProvider, setEditingProvider] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; ok: boolean; message: string } | null>(null);
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
      setTestResult(null);
      resetForm('gemini');
    }
  }, [isOpen]);

  // Adjust preset when provider changes
  const handleProviderChange = (newProvider: 'openai' | 'gemini' | 'anthropic' | 'openrouter') => {
    setProvider(newProvider);
    const existing = settings.find((s) => s.provider === newProvider);
    if (existing) {
      startEditing(existing);
    } else {
      setEditingProvider(null);
      setApiKey('');
      const defaultMod = DEFAULT_RECOMMENDED_MODELS[newProvider] || 'custom';
      setSelectedPreset(defaultMod);
      setCustomModel('');
    }
  };

  const startEditing = (item: AISettingItem) => {
    setEditingProvider(item.provider);
    setProvider(item.provider as any);
    setApiKey(''); // Leave empty to preserve current key
    setMessage(null);
    setTestResult(null);

    const presets = PROVIDER_PRESETS[item.provider] || [];
    const isPreset = item.modelName ? presets.some((p) => p.value === item.modelName) : false;

    if (item.modelName && isPreset) {
      setSelectedPreset(item.modelName);
      setCustomModel('');
    } else if (item.modelName) {
      setSelectedPreset('custom');
      setCustomModel(item.modelName);
    } else {
      setSelectedPreset(DEFAULT_RECOMMENDED_MODELS[item.provider] || 'custom');
      setCustomModel('');
    }
  };

  const resetForm = (targetProvider: 'openai' | 'gemini' | 'anthropic' | 'openrouter' = 'gemini') => {
    setEditingProvider(null);
    setProvider(targetProvider);
    setApiKey('');
    setSelectedPreset(DEFAULT_RECOMMENDED_MODELS[targetProvider] || 'custom');
    setCustomModel('');
  };

  if (!isOpen) return null;

  const getEffectiveModelName = (): string => {
    if (selectedPreset === 'custom') {
      return customModel.trim();
    }
    return selectedPreset.trim();
  };

  const isEditingExisting = Boolean(editingProvider && settings.some((s) => s.provider === editingProvider));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditingExisting && !apiKey.trim()) {
      setMessage({ text: 'Por favor ingresa la Clave API de tu suscripción.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setTestResult(null);

    const effectiveModel = getEffectiveModelName();

    try {
      const res = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim() || undefined,
          modelName: effectiveModel || undefined,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Error al guardar la configuración de IA.', type: 'error' });
      } else {
        setMessage({
          text: isEditingExisting
            ? `¡Configuración y modelo de ${provider.toUpperCase()} actualizados con éxito!`
            : `¡Proveedor ${provider.toUpperCase()} conectado con éxito!`,
          type: 'success',
        });
        setApiKey('');
        await fetchSettings();
        if (onSaved) onSaved();
      }
    } catch (err) {
      console.error('Error saving AI setting:', err);
      setMessage({ text: 'Error de conexión con el servidor al guardar configuración.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = async (providerToActivate: string) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/ai/settings?provider=${providerToActivate}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        await fetchSettings();
        setMessage({ text: `Proveedor ${providerToActivate.toUpperCase()} activado como predeterminado.`, type: 'success' });
        if (onSaved) onSaved();
      }
    } catch (err) {
      console.error('Error activating AI provider:', err);
    }
  };

  const handleDelete = async (providerToDelete: string) => {
    if (!confirm(`¿Estás seguro de eliminar la conexión y clave de ${providerToDelete.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`/api/ai/settings?provider=${providerToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (editingProvider === providerToDelete) {
          resetForm('gemini');
        }
        await fetchSettings();
        setMessage({ text: `Conexión de ${providerToDelete.toUpperCase()} eliminada.`, type: 'success' });
        if (onSaved) onSaved();
      }
    } catch (err) {
      console.error('Error deleting AI key:', err);
    }
  };

  const handleTestConnection = async (item: AISettingItem) => {
    setTestingProvider(item.provider);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'product_description',
          payload: {
            name: 'Vela de Prueba',
            fragrances: ['Lavanda'],
            waxType: 'Cera vegetal',
            brandName: 'Test Brand',
          },
          provider: item.provider,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok && data?.result) {
        setTestResult({
          provider: item.provider,
          ok: true,
          message: `Conexión exitosa con ${item.provider.toUpperCase()} (Modelo: ${item.modelName || 'Predeterminado'}). La IA responde perfectamente.`,
        });
      } else {
        setTestResult({
          provider: item.provider,
          ok: false,
          message: data?.error || `Error ${res.status}: No se pudo comunicar con el proveedor.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        provider: item.provider,
        ok: false,
        message: err?.message || 'Error de red al probar conexión con IA.',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 sm:px-8 pt-7 sm:pt-8 pb-5 border-b border-stone-200 bg-linear-to-r from-stone-900 to-stone-800 text-white">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif">
                Configuración del Asistente de IA (BYOK)
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Edita tus conexiones, cambia el modelo o actualiza tus claves API de IA
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
        <div className="px-7 sm:px-8 pt-6 pb-7 space-y-6 overflow-y-auto flex-1">
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

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
                testResult.ok
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border border-rose-300 text-rose-800'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">
                  {testResult.ok ? 'Prueba Exitosa' : 'Fallo en la Prueba de Conexión'}
                </span>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Active Keys List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Tus Conexiones de IA
              </h3>
              <span className="text-[11px] text-stone-400 font-medium">
                {settings.length} {settings.length === 1 ? 'proveedor' : 'proveedores'}
              </span>
            </div>

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
              <div className="space-y-2.5">
                {settings.map((item) => (
                  <div
                    key={item.provider}
                    className={`p-3.5 bg-stone-50 border rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.isActive
                        ? 'border-amber-400/80 bg-amber-50/20 shadow-xs'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          item.isActive ? 'bg-amber-900 text-white' : 'bg-stone-800 text-white'
                        }`}
                      >
                        {item.provider.slice(0, 2)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-stone-900 capitalize">
                            {item.provider === 'gemini'
                              ? 'Google Gemini'
                              : item.provider === 'openai'
                              ? 'OpenAI'
                              : item.provider === 'anthropic'
                              ? 'Anthropic Claude'
                              : 'OpenRouter'}
                          </span>
                          {item.isActive ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                              Activo / Predeterminado
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetActive(item.provider)}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium transition"
                              title="Hacer este proveedor el activo"
                            >
                              Hacer Activo
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-mono text-stone-400">{item.apiKey}</span>
                          <span className="text-stone-300">•</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                            <Cpu className="w-2.5 h-2.5 text-amber-700" />
                            <span>{item.modelName || 'Predeterminado'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestConnection(item)}
                        disabled={testingProvider === item.provider}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition flex items-center space-x-1 disabled:opacity-50"
                        title="Probar conexión con esta IA"
                      >
                        {testingProvider === item.provider ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        ) : (
                          <Play className="w-3 h-3 text-amber-700 fill-amber-700" />
                        )}
                        <span className="text-[11px]">Probar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
                          editingProvider === item.provider
                            ? 'bg-amber-900 text-white'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                        title="Editar modelo o clave de este proveedor"
                      >
                        <Pencil className="w-3 h-3" />
                        <span className="text-[11px]">Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.provider)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar conexión"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Update Key Form */}
          <form onSubmit={handleSave} className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {isEditingExisting
                    ? `Editar Configuración (${provider.toUpperCase()})`
                    : 'Conectar Nuevo Proveedor de IA'}
                </span>
              </h3>

              {isEditingExisting && (
                <button
                  type="button"
                  onClick={() => resetForm('gemini')}
                  className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Cancelar edición</span>
                </button>
              )}
            </div>

            {isEditingExisting && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>
                  Editando conexión activa de <strong>{provider.toUpperCase()}</strong>. Puedes cambiar el modelo directamente sin necesidad de volver a ingresar la clave API.
                </span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Proveedor de IA
              </label>
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 font-medium"
              >
                <option value="gemini">Google Gemini (Gemini 3 Flash / 3.1 Lite)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
                <option value="openrouter">OpenRouter (Multi-modelos)</option>
              </select>
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                  Modelo de Inteligencia Artificial
                </label>
                <span className="text-[10px] text-stone-400">Selecciona o personaliza</span>
              </div>

              <select
                value={selectedPreset}
                onChange={(e) => {
                  setSelectedPreset(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomModel('');
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 font-medium"
              >
                {(PROVIDER_PRESETS[provider] || []).map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>

              {/* Show warning if model has known spikes */}
              {PROVIDER_PRESETS[provider]?.find((p) => p.value === selectedPreset)?.warning && (
                <p className="text-[11px] text-amber-700 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                  ⚠️ {PROVIDER_PRESETS[provider]?.find((p) => p.value === selectedPreset)?.warning}
                </p>
              )}

              {/* Custom Model Input */}
              {selectedPreset === 'custom' && (
                <div className="pt-1">
                  <label className="block text-[10px] text-stone-500 font-medium mb-1">
                    Escribe el identificador exacto del modelo:
                  </label>
                  <input
                    type="text"
                    required
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder={
                      provider === 'gemini'
                        ? 'Ej. gemini-3-flash-preview o gemini-3.1-flash-lite'
                        : provider === 'openai'
                        ? 'Ej. gpt-4o-mini'
                        : 'Identificador del modelo...'
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-900/30 transition"
                  />
                </div>
              )}
            </div>

            {/* API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                  Clave API (API Key) {isEditingExisting ? '(Opcional al editar)' : '*'}
                </label>
                <a
                  href={
                    provider === 'gemini'
                      ? 'https://aistudio.google.com/app/apikey'
                      : provider === 'openai'
                      ? 'https://platform.openai.com/api-keys'
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
                required={!isEditingExisting}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  isEditingExisting
                    ? '•••••••••••••••• (deja en blanco para conservar tu clave actual)'
                    : provider === 'gemini'
                    ? 'AIzaSy... o tu clave de Google'
                    : provider === 'openai'
                    ? 'sk-...'
                    : 'Clave secreta...'
                }
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-900/30 transition"
              />
              {isEditingExisting && (
                <p className="text-[10px] text-stone-400 mt-1">
                  Tu clave API actual ya está guardada de forma segura. Solo escribe aquí si deseas sustituirla por una nueva.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Tus claves se guardan encriptadas en Easy Cat</span>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50 shrink-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEditingExisting ? 'Guardar Cambios' : 'Conectar Clave'}</span>
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
