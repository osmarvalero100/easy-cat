import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getProjectsByUserId, createProject } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const projects = await getProjectsByUserId(user.id);
    return NextResponse.json({ projects });
  } catch (error: unknown) {
    console.error('Error fetching projects:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener proyectos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, logoUrl, description, defaultCurrency, defaultContact } = body || {};

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre del emprendimiento es obligatorio.' }, { status: 400 });
    }

    const project = await createProject(user.id, {
      name: name.trim(),
      logoUrl,
      description,
      defaultCurrency,
      defaultContact,
    });

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    console.error('Error creating project:', error);
    const message = error instanceof Error ? error.message : 'Error al crear proyecto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
