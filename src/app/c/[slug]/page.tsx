import type { Metadata, ResolvingMetadata } from 'next';
import { getCatalogByIdOrSlug } from '@/lib/db';
import { DEFAULT_CATALOG_LOGO } from '@/types/catalog';
import { CustomerCatalogView } from './CustomerCatalogView';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Server-side metadata generator for the public customer catalog page (/c/[slug]).
 * - Title: [Nombre de tu Marca / Taller] concatenado con [Título Principal del Catálogo]
 * - Meta description: [Texto Editorial de Bienvenida / Filosofía de Marca]
 */
export async function generateMetadata(
  { params }: PageProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  let catalog = null;
  if (slug) {
    try {
      catalog = await getCatalogByIdOrSlug(slug);
    } catch (err) {
      console.error('Error fetching catalog for metadata:', err);
    }
  }

  const brandName = catalog?.brandName?.trim() || '';
  const title = catalog?.title?.trim() || '';
  const htmlTitle = [brandName, title].filter(Boolean).join(' - ') || 'Catálogo de Velas Artesanales';
  const description = catalog?.introText?.trim() || '';

  return {
    title: htmlTitle,
    description: description || undefined,
    openGraph: {
      title: htmlTitle,
      description: description || undefined,
      images: catalog?.coverImage ? [catalog.coverImage] : [DEFAULT_CATALOG_LOGO],
    },
    twitter: {
      card: 'summary_large_image',
      title: htmlTitle,
      description: description || undefined,
      images: catalog?.coverImage ? [catalog.coverImage] : [DEFAULT_CATALOG_LOGO],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  let initialCatalog = null;
  if (slug) {
    try {
      initialCatalog = await getCatalogByIdOrSlug(slug);
    } catch (err) {
      console.error('Error fetching initial catalog for page:', err);
    }
  }

  return <CustomerCatalogView initialCatalog={initialCatalog} slug={slug} />;
}
