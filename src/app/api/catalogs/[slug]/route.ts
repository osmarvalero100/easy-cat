import { NextResponse } from 'next/server';
import { getCatalogByIdOrSlug, saveCatalog, deleteCatalog } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug no proporcionado' }, { status: 400 });
    }

    const catalog = await getCatalogByIdOrSlug(slug);
    if (!catalog) {
      return NextResponse.json({ error: 'Catálogo no encontrado' }, { status: 404 });
    }

    const user = await getAuthenticatedUser(request);
    const isOwner = Boolean(user && catalog.userId && user.id === catalog.userId);

    return NextResponse.json({
      ...catalog,
      isOwner,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para editar este catálogo.' },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const catalog = await request.json();

    if (!catalog) {
      return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });
    }

    if (!catalog.slug) {
      catalog.slug = slug;
    }

    await saveCatalog(catalog, user.id);
    return NextResponse.json({ success: true, catalog });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar catálogo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para eliminar este catálogo.' },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const cat = await getCatalogByIdOrSlug(slug, user.id);
    if (!cat) {
      return NextResponse.json(
        { error: 'Catálogo no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    const deleted = await deleteCatalog(cat.id, user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'No se pudo eliminar el catálogo' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Catálogo eliminado correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar catálogo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
