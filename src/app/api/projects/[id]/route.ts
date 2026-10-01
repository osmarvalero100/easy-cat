import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getProjectById, updateProject, deleteProject } from '@/lib/db';

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
    const project = await getProjectById(id, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: unknown) {
    console.error('Error fetching project:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener proyecto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, logoUrl, description, defaultCurrency, defaultContact } = body || {};

    const updated = await updateProject(id, user.id, {
      name,
      logoUrl,
      description,
      defaultCurrency,
      defaultContact,
    });

    if (!updated) {
      return NextResponse.json({ error: 'No se pudo actualizar el proyecto' }, { status: 404 });
    }

    const project = await getProjectById(id, user.id);
    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    console.error('Error updating project:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar proyecto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteProject(id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Proyecto no encontrado o no autorizado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Proyecto eliminado correctamente' });
  } catch (error: unknown) {
    console.error('Error deleting project:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar proyecto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
