import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ authenticated: false, error: 'No autenticado' }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al verificar sesión';
    return NextResponse.json({ authenticated: false, error: message }, { status: 500 });
  }
}
