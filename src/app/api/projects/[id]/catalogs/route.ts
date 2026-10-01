import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getCatalogsByProjectId } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const catalogs = await getCatalogsByProjectId(id, user.id);
    return NextResponse.json({ catalogs });
  } catch (error: unknown) {
    console.error('Error fetching project catalogs:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener catálogos del proyecto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
