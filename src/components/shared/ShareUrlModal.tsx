import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Catalog } from '../../types/catalog';
import { Share2, Copy, Check, ExternalLink, MessageCircle, X, Globe, Sparkles } from 'lucide-react';

interface ShareUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Catalog;
}

export const ShareUrlModal: React.FC<ShareUrlModalProps> = ({
  isOpen,
  onClose,
  catalog,
}) => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const cleanUrl = `${origin}/c/${catalog.slug || 'velas'}`;
      setShareUrl(cleanUrl);
    }
  }, [catalog]);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Te invito a conocer nuestro catálogo interactivo "${catalog.title}":\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-200 z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">Enlace Público de tu Catálogo</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                MySQL Cloud
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Enlace limpio y permanente. Cualquier cambio que guardes se actualizará automáticamente en vivo.
            </p>
          </div>
        </div>

        {/* URL Box */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-stone-700">
            URL Limpia para Clientes
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-stone-50 border border-stone-300 rounded-xl">
            <Globe className="w-4 h-4 text-emerald-600 ml-2 shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-2 py-1.5 text-xs bg-transparent border-none text-stone-800 focus:outline-hidden font-mono truncate font-medium"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-black flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span>Identificador / Slug: <strong className="font-mono text-emerald-800">{catalog.slug || 'velas'}</strong></span>
            <span className="text-[10px] text-stone-400">Modificable en «Portada & Datos»</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {/* Open preview button */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Vista Cliente</span>
            </a>

            {/* WhatsApp direct share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Los clientes abren el enlace directamente en su celular o laptop sin instalar nada, exploran tus velas con medidas exactas y fotos HD, y te envían el pedido por WhatsApp con un solo botón.
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
