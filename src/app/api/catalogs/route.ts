import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { saveCatalog, getPool, initDatabase } from '@/lib/db';
import { Catalog } from '@/types/catalog';
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await initDatabase();
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let query = `
      SELECT c.id, c.project_id, c.slug, c.title, c.season_tag, c.brand_name, c.cover_image, c.updated_at,
             COUNT(p.id) as product_count
      FROM catalogs c
      LEFT JOIN products p ON c.id = p.catalog_id
      WHERE c.user_id = ?
    `;
    const params: any[] = [user.id];

    if (projectId) {
      query += ' AND c.project_id = ?';
      params.push(projectId);
    }

    query += ' GROUP BY c.id ORDER BY c.updated_at DESC';

    const [rows] = await pool.query<mysql.RowDataPacket[]>(query, params);

    const catalogs = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      slug: r.slug,
      title: r.title,
      seasonTag: r.season_tag,
      brandName: r.brand_name,
      coverImage: r.cover_image,
      productCount: Number(r.product_count || 0),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));

    return NextResponse.json({ catalogs });
  } catch (error: unknown) {
    console.error('Error fetching catalogs:', error);
    const message = error instanceof Error ? error.message : 'Error al listar catálogos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado. Inicia sesión para guardar.' }, { status: 401 });
    }

    const catalog: Catalog = await request.json();
    if (!catalog || !catalog.id || !catalog.slug) {
      return NextResponse.json({ error: 'Datos de catálogo incompletos.' }, { status: 400 });
    }

    await saveCatalog(catalog, user.id);

    return NextResponse.json({
      success: true,
      message: 'Catálogo guardado exitosamente en Easy Cat',
      slug: catalog.slug,
      id: catalog.id,
    });
  } catch (error: unknown) {
    console.error('Error saving catalog:', error);
    const message = error instanceof Error ? error.message : 'Error al guardar catálogo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
