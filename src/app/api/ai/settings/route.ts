import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getAISettingsByUserId, saveAISettings, deleteAISettings } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const settings = await getAISettingsByUserId(user.id);
    // Mask sensitive keys for client display
    const masked = settings.map((s) => ({
      ...s,
      apiKey: s.apiKey.length > 8 ? `${s.apiKey.slice(0, 4)}...${s.apiKey.slice(-4)}` : '••••••••',
      hasKey: Boolean(s.apiKey),
    }));

    return NextResponse.json({ settings: masked });
  } catch (error: unknown) {
    console.error('Error fetching AI settings:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener configuración de IA';
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
    const { provider, apiKey, modelName } = body || {};

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Proveedor y Clave API son obligatorios' }, { status: 400 });
    }

    await saveAISettings(user.id, provider, apiKey.trim(), modelName);

    return NextResponse.json({ success: true, message: 'Clave API guardada exitosamente' });
  } catch (error: unknown) {
    console.error('Error saving AI settings:', error);
    const message = error instanceof Error ? error.message : 'Error al guardar configuración de IA';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor no especificado' }, { status: 400 });
    }

    await deleteAISettings(user.id, provider);
    return NextResponse.json({ success: true, message: 'Configuración de IA eliminada' });
  } catch (error: unknown) {
    console.error('Error deleting AI settings:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar configuración';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
