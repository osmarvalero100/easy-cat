import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { exportCatalogToPdfFile, printBrowserCatalog } from '../../lib/pdfGenerator';
import { FileDown, Printer, X, Check, Loader2, Sparkles } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogTitle: string;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  catalogTitle,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsGenerating(false);
      setProgressStatus('');
    }
  }, [isOpen]);

  const cleanFilename = `${catalogTitle.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim() || 'Catalogo'}.pdf`;

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      setIsSuccess(false);
      await exportCatalogToPdfFile('catalog-pages-container', cleanFilename, (status) => {
        setProgressStatus(status);
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar el PDF. Puedes utilizar la opción "Imprimir / Guardar como PDF" como alternativa directa.');
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      printBrowserCatalog();
    }, 200);
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
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-200 z-[10000]"
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
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Exportar Catálogo en PDF</h3>
            <p className="text-xs text-stone-500">Elige cómo deseas generar tu catálogo para clientes</p>
          </div>
        </div>

        {isGenerating ? (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-800">{progressStatus || 'Generando documento PDF...'}</p>
            <p className="text-xs text-stone-500">Por favor espera un momento mientras procesamos las páginas en alta resolución.</p>
          </div>
        ) : isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-stone-900">¡PDF Descargado con Éxito!</p>
            <p className="text-xs text-stone-500">Tu archivo ya está listo para imprimir o compartir con tus clientes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Direct Download Option */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full p-4 rounded-xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group flex items-start gap-3.5 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900">Descarga Directa (.PDF)</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    1 Clic
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Genera automáticamente un archivo PDF A4 listo para guardar y compartir.
                </p>
              </div>
            </button>

            {/* Native Browser Print Option */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full p-4 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-left transition-all group flex items-start gap-3.5 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900">Imprimir / Calidad Editorial</h4>
                  <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-medium">
                    Vectorial
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Abre la ventana de impresión del navegador. Ideal para imprentas con textos 100% nítidos.
                </p>
              </div>
            </button>
          </div>
        )}

        <div className="mt-5 pt-3 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
