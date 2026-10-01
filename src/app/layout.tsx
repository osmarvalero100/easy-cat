import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Easy Cat | Generador Editorial de Catálogos de Alta Gama',
  description: 'Crea, personaliza y comparte catálogos editoriales y de temporada para tus marcas y emprendimientos con exportación a PDF y enlace para clientes.',
  icons: {
    icon: '/gaos-candles.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-stone-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
