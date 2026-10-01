import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    let token: string | undefined;

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    if (match) {
      token = match[1];
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value;
    }

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Sesión cerrada correctamente' });
    response.cookies.delete('auth_token');
    return response;
  } catch (error: unknown) {
    console.error('Error during logout:', error);
    const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
