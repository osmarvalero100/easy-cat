import React, { useState, useEffect } from 'react';
import { Product, SeasonKey } from '@/types/catalog';
import {
  X,
  Sparkles,
  Wand2,
  FileText,
  ListPlus,
  Loader2,
  Check,
  AlertCircle,
  Settings,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  seasonTag?: string;
  currentProduct?: Product | null;
  initialTab?: 'product' | 'intro' | 'extract';
  onApplyDescription?: (desc: string, fragrances?: string[]) => void;
  onApplyIntroText?: (intro: string) => void;
  onAddExtractedProducts?: (products: Partial<Product>[]) => void;
  onOpenAISettings: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  brandName,
  seasonTag,
  currentProduct,
  initialTab = 'product',
  onApplyDescription,
  onApplyIntroText,
  onAddExtractedProducts,
  onOpenAISettings,
}) => {
  const [activeTab, setActiveTab] = useState<'product' | 'intro' | 'extract'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [productName, setProductName] = useState(currentProduct?.name || '');
  const [fragranceNotes, setFragranceNotes] = useState(currentProduct?.fragrances?.join(', ') || '');
  const [waxMaterial, setWaxMaterial] = useState(currentProduct?.waxType || 'Cera de Soya');

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setProductName(currentProduct?.name || '');
      setFragranceNotes(currentProduct?.fragrances?.join(', ') || '');
      setWaxMaterial(currentProduct?.waxType || 'Cera de Soya');
      setErrorMsg(null);
      setGeneratedResult(null);
    }
  }, [isOpen, initialTab, currentProduct]);

  const [introPhilosophy, setIntroPhilosophy] = useState('');
  const [rawTextExtract, setRawTextExtract] = useState('');

  // Result preview
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedResult(null);

    let task = 'product_description';
    let payload: any = {};

    if (activeTab === 'product') {
      task = 'product_description';
      payload = {
        name: productName || currentProduct?.name || 'Vela Artesanal',
        fragrances: fragranceNotes ? fragranceNotes.split(',').map((s) => s.trim()) : currentProduct?.fragrances,
        waxType: waxMaterial,
        brandName,
      };
    } else if (activeTab === 'intro') {
      task = 'intro_text';
      payload = {
        brandName,
        seasonTag,
        philosophy: introPhilosophy,
      };
    } else if (activeTab === 'extract') {
      task = 'batch_extract';
      payload = {
        rawText: rawTextExtract,
      };
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'NO_AI_CONFIGURED') {
          setErrorMsg('No tienes ninguna clave de IA conectada. Configura tu suscripción primero.');
        } else {
          setErrorMsg(data.error || 'Ocurrió un error al generar con IA.');
        }
        setIsLoading(false);
        return;
      }

      setGeneratedResult(data.result);
    } catch (err) {
      console.error('AI generation error:', err);
      setErrorMsg('Error de conexión al generar con IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;

    if (activeTab === 'product' && onApplyDescription) {
      onApplyDescription(
        generatedResult.description,
        generatedResult.suggestedFragrances
      );
    } else if (activeTab === 'intro' && onApplyIntroText) {
      onApplyIntroText(generatedResult.introText);
    } else if (activeTab === 'extract' && onAddExtractedProducts) {
      if (Array.isArray(generatedResult.products)) {
        onAddExtractedProducts(generatedResult.products);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-7 sm:px-8 pt-7 sm:pt-8 pb-5 border-b border-stone-200 bg-linear-to-r from-stone-900 via-stone-850 to-stone-800 text-white">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif">Asistente Editorial con IA</h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Redacta descripciones sensoriales, textos de portada o extrae productos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenAISettings}
              title="Configurar claves de IA"
              className="px-3 py-1.5 text-xs text-stone-300 hover:text-white hover:bg-stone-700/60 rounded-xl flex items-center gap-1.5 transition border border-stone-700"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Configuración</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-700/60 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-7 sm:px-8 pt-4 gap-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('product');
              setGeneratedResult(null);
            }}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'product'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Descripción Sensorial
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('intro');
              setGeneratedResult(null);
            }}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'intro'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Manifiesto & Portada
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('extract');
              setGeneratedResult(null);
            }}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === 'extract'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Extractor de Productos
          </button>
        </div>

        {/* Body */}
        <div className="px-7 sm:px-8 pt-7 pb-7 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {errorMsg.includes('Configura tu suscripción') && (
                  <button
                    type="button"
                    onClick={onOpenAISettings}
                    className="block font-bold underline text-amber-800 mt-1"
                  >
                    Conectar clave de OpenAI / Gemini / Claude aquí →
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'product' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre de la Vela o Producto
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej. Cilindro Botánico Manzana & Canela"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Notas olfativas o Aromas clave
                </label>
                <input
                  type="text"
                  value={fragranceNotes}
                  onChange={(e) => setFragranceNotes(e.target.value)}
                  placeholder="Ej. Canela en rama, manzana horneada, nuez moscada"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Material o Cera
                </label>
                <input
                  type="text"
                  value={waxMaterial}
                  onChange={(e) => setWaxMaterial(e.target.value)}
                  placeholder="Ej. Cera de soya 100% con mecha de madera crepitante"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                />
              </div>
            </div>
          )}

          {activeTab === 'intro' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Filosofía o Enfoque de tu Emprendimiento
                </label>
                <textarea
                  rows={3}
                  value={introPhilosophy}
                  onChange={(e) => setIntroPhilosophy(e.target.value)}
                  placeholder="Ej. Crear momentos de paz y calidez con ingredientes 100% naturales, aromas orgánicos y diseño minimalista nórdico."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                />
              </div>
            </div>
          )}

          {activeTab === 'extract' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pega aquí tu lista desordenada (WhatsApp, Excel, bloc de notas)
                </label>
                <textarea
                  rows={5}
                  value={rawTextExtract}
                  onChange={(e) => setRawTextExtract(e.target.value)}
                  placeholder="Ej:&#10;1. Vela Vainilla Silvestre $35.000 alto 12cm x 7cm con cera vegetal&#10;2. Cirio Nochebuena $45.000 15x8cm aromas a pino y cedro"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-900/30"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Generando con IA...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  <span>
                    {activeTab === 'product'
                      ? 'Generar Descripción Sensorial'
                      : activeTab === 'intro'
                      ? 'Redactar Manifiesto Editorial'
                      : 'Estructurar y Extraer Productos'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Display */}
          {generatedResult && (
            <div className="p-4 bg-amber-50/60 border border-amber-200/90 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-700" />
                  <span>Resultado Generado</span>
                </span>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-3 py-1 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  Aplicar al Catálogo
                </button>
              </div>

              {activeTab === 'product' && (
                <div className="space-y-2 text-xs">
                  <p className="font-serif italic text-stone-800 text-sm leading-relaxed">
                    "{generatedResult.description}"
                  </p>
                  {generatedResult.suggestedFragrances && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {generatedResult.suggestedFragrances.map((f: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'intro' && (
                <p className="font-serif italic text-stone-800 text-sm leading-relaxed">
                  "{generatedResult.introText}"
                </p>
              )}

              {activeTab === 'extract' && Array.isArray(generatedResult.products) && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-stone-700">
                    Se encontraron {generatedResult.products.length} productos listos para añadir:
                  </p>
                  <ul className="text-xs text-stone-600 list-disc list-inside space-y-1">
                    {generatedResult.products.map((p: any, i: number) => (
                      <li key={i}>
                        <span className="font-bold">{p.name}</span> — ${p.price?.toLocaleString()} ({p.heightCm}x{p.widthCm}cm)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
