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
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  seasonTag?: string;
  currentProduct?: Product | null;
  initialTab?: 'product' | 'intro' | 'extract' | 'cover';
  onApplyDescription?: (desc: string, fragrances?: string[]) => void;
  onApplyIntroText?: (intro: string) => void;
  onAddExtractedProducts?: (products: Partial<Product>[]) => void;
  onApplyCoverImage?: (imageUrl: string) => void;
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
  onApplyCoverImage,
  onOpenAISettings,
}) => {
  const [activeTab, setActiveTab] = useState<'product' | 'intro' | 'extract' | 'cover'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAIConfig, setActiveAIConfig] = useState<{ provider: string; modelName?: string } | null>(null);

  // Form states
  const [productName, setProductName] = useState(currentProduct?.name || '');
  const [fragranceNotes, setFragranceNotes] = useState(currentProduct?.fragrances?.join(', ') || '');
  const [waxMaterial, setWaxMaterial] = useState(currentProduct?.waxType || 'Cera de Soya');
  const [coverIdea, setCoverIdea] = useState('');
  const [isCoverImageLoading, setIsCoverImageLoading] = useState(true);
  const [coverImageError, setCoverImageError] = useState(false);

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
      setIsCoverImageLoading(true);
      setCoverImageError(false);

      // Load active AI config
      fetch('/api/ai/settings')
        .then((res) => res.json())
        .then((data) => {
          const active = (data.settings || []).find((s: any) => s.isActive) || data.settings?.[0];
          if (active) {
            setActiveAIConfig({ provider: active.provider, modelName: active.modelName });
          } else {
            setActiveAIConfig(null);
          }
        })
        .catch(() => {});
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
    setIsCoverImageLoading(true);
    setCoverImageError(false);

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
    } else if (activeTab === 'cover') {
      task = 'cover_image';
      payload = {
        brandName,
        seasonTag,
        userIdea: coverIdea.trim(),
        seed: Math.floor(Math.random() * 10000000),
      };
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, payload }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Failed to parse generate response JSON:', jsonErr);
      }

      if (!res.ok) {
        if (data?.code === 'NO_AI_CONFIGURED') {
          setErrorMsg('No tienes ninguna clave de IA conectada. Configura tu suscripción primero.');
        } else {
          setErrorMsg(data?.error || `Error del servidor (${res.status}): No se pudo procesar la generación con IA.`);
        }
        setIsLoading(false);
        return;
      }

      if (!data?.result) {
        setErrorMsg('El proveedor de IA no devolvió un resultado válido.');
        setIsLoading(false);
        return;
      }

      setGeneratedResult(data.result);
    } catch (err: any) {
      console.error('AI generation error:', err);
      setErrorMsg(err?.message ? `Error de conexión: ${err.message}` : 'Error de conexión al generar con IA.');
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
    } else if (activeTab === 'cover' && onApplyCoverImage) {
      if (generatedResult.imageUrl) {
        onApplyCoverImage(generatedResult.imageUrl);
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
            {activeAIConfig && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-stone-800/90 border border-stone-700 rounded-xl text-xs text-stone-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold capitalize text-white">
                  {activeAIConfig.provider === 'gemini'
                    ? 'Gemini'
                    : activeAIConfig.provider === 'openai'
                    ? 'OpenAI'
                    : activeAIConfig.provider === 'anthropic'
                    ? 'Claude'
                    : 'OpenRouter'}
                </span>
                <span className="text-amber-300/80 font-mono text-[11px]">
                  ({activeAIConfig.modelName || 'Predeterminado'})
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={onOpenAISettings}
              title="Configurar claves y modelo de IA"
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
        <div className="flex border-b border-stone-200 bg-stone-50 px-7 sm:px-8 pt-4 gap-4 sm:gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('cover');
              setGeneratedResult(null);
            }}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap relative ${
              activeTab === 'cover'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Foto de Portada ✨
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('product');
              setGeneratedResult(null);
            }}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap relative ${
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
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap relative ${
              activeTab === 'intro'
                ? 'text-amber-900 border-b-2 border-amber-900'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Manifiesto Editorial
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('extract');
              setGeneratedResult(null);
            }}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap relative ${
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
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <span className="block leading-relaxed">{errorMsg}</span>
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={onOpenAISettings}
                    className="inline-flex items-center gap-1 font-bold underline text-amber-900 hover:text-amber-950 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-700" />
                    <span>Cambiar modelo o editar clave en Configuración de IA →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cover' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Concepto o Estilo Visual Deseado
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Kinfolk · Editorial de Lujo · 35mm
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={coverIdea}
                  onChange={(e) => setCoverIdea(e.target.value)}
                  placeholder="Ej: Bodegón de velas artesanales sobre pedestal de mármol travertino con hojas de eucalipto seco, iluminación natural suave matutina..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 leading-relaxed"
                />
              </div>

              {/* Inspiration Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Inspiración rápida (haz clic para usar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🕯️ Mármol & Minimalismo', idea: 'Velas artesanales sobre pedestal de mármol travertino con luz tenue cálida y sombras suaves estilo Kinfolk' },
                    { label: '🌿 Botánico & Eucalipto', idea: 'Bodegón de velas de soya con ramas de eucalipto seco, cerámica rústica y tela de lino lavado' },
                    { label: '✨ Penumbra & Calidez', idea: 'Velas encendidas en penumbra con atmósfera íntima, destellos dorados y luz de llama acogedora' },
                    { label: '🍂 Otoño Acogedor', idea: 'Velas en tonos terracota y miel con hojas secas otoñales, frutos y madera envejecida' },
                    { label: '🎄 Festivo & Navidad', idea: 'Velas aromáticas con ramas de pino, canela en rama y frutos secos en ambiente festivo elegante' },
                    { label: '🤍 Pastel & Baby Shower', idea: 'Velas delicadas en tonos marfil y pastel con flores secas blancas y luz suave matutina' },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverIdea(chip.idea)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-amber-100/70 hover:text-amber-900 text-stone-700 border border-stone-200/80 transition cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context metadata badge */}
              <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200/60">
                <span className="font-semibold text-stone-700">Contexto aplicado:</span>
                <span>Marca: <strong className="text-stone-800">{brandName}</strong></span>
                {seasonTag && (
                  <>
                    <span>·</span>
                    <span>Colección: <strong className="text-stone-800">{seasonTag}</strong></span>
                  </>
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
                    {activeTab === 'cover'
                      ? 'Generar Foto de Portada con IA'
                      : activeTab === 'product'
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
                  {activeTab === 'cover' ? 'Aplicar como Portada' : 'Aplicar al Catálogo'}
                </button>
              </div>

              {activeTab === 'cover' && generatedResult.imageUrl && (
                <div className="space-y-3">
                  <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-amber-300/80 bg-stone-900 shadow-md flex items-center justify-center">
                    {isCoverImageLoading && !coverImageError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/90 text-stone-200 z-10 space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                        <span className="text-xs font-medium text-stone-300">
                          Cargando fotografía editorial...
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          1200 × 700 px · Alta Resolución
                        </span>
                      </div>
                    )}

                    {coverImageError ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-stone-300 z-10">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                        <p className="text-xs font-semibold text-stone-200">
                          Retraso al conectar con el servidor de renderizado
                        </p>
                        <p className="text-[11px] text-stone-400 max-w-xs">
                          La imagen se está procesando. Puedes reintentar la vista previa o dar clic en "Confirmar y Aplicar Portada".
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImageError(false);
                            setIsCoverImageLoading(true);
                          }}
                          className="mt-1 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium border border-stone-700 transition"
                        >
                          Reintentar carga de vista previa
                        </button>
                      </div>
                    ) : (
                      <img
                        src={generatedResult.imageUrl}
                        alt="Portada generada"
                        referrerPolicy="no-referrer"
                        onLoad={() => setIsCoverImageLoading(false)}
                        onError={() => {
                          setIsCoverImageLoading(false);
                          setCoverImageError(true);
                        }}
                        className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
                          isCoverImageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                    )}

                    {!isCoverImageLoading && !coverImageError && generatedResult.engine && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white/90 border border-white/20 z-20">
                        {generatedResult.engine}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 bg-white/80 p-3 rounded-xl border border-amber-200/60">
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{generatedResult.conceptTitle || 'Composición Editorial'}</span>
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed italic">
                      "{generatedResult.aestheticSummary}"
                    </p>
                  </div>

                  {generatedResult.promptUsed && (
                    <details className="text-[11px] text-stone-500 bg-stone-100/80 p-2.5 rounded-xl cursor-pointer border border-stone-200/60">
                      <summary className="font-semibold text-stone-700 hover:text-stone-900">
                        Ver dirección de arte y prompt fotográfico
                      </summary>
                      <p className="mt-1.5 font-mono text-[10px] text-stone-600 leading-normal select-all bg-white p-2 rounded border border-stone-200">
                        {generatedResult.promptUsed}
                      </p>
                    </details>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Generar otra variación</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApply}
                      className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirmar y Aplicar Portada</span>
                    </button>
                  </div>
                </div>
              )}

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
