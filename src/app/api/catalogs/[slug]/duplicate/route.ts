import { NextResponse } from 'next/server';
import { duplicateCatalog } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para duplicar un catálogo.' },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const body = await request.json();
    const { newTitle, newSlug } = body || {};

    if (!newTitle || !newSlug) {
      return NextResponse.json(
        { error: 'Debes proporcionar un nuevo título y un enlace (slug) para el catálogo duplicado.' },
        { status: 400 }
      );
    }

    const duplicated = await duplicateCatalog(slug, newTitle, newSlug, user.id);

    return NextResponse.json({
      success: true,
      catalog: duplicated,
    });
  } catch (error: unknown) {
    console.error('Error duplicating catalog:', error);
    const message = error instanceof Error ? error.message : 'Error al duplicar catálogo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
