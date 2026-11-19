import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getAISettingsByUserId, saveAISettings, deleteAISettings, setActiveAIProvider } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const settings = await getAISettingsByUserId(user.id);
    // Mask sensitive keys for client display
    const masked = settings.map((s) => ({
      id: s.id,
      provider: s.provider,
      apiKey: s.apiKey.length > 8 ? `${s.apiKey.slice(0, 4)}••••${s.apiKey.slice(-4)}` : '••••••••',
      modelName: s.modelName,
      isActive: s.isActive,
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
    const { provider, apiKey, modelName, isActive } = body || {};

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor es obligatorio' }, { status: 400 });
    }

    const existingSettings = await getAISettingsByUserId(user.id);
    const existing = existingSettings.find((s) => s.provider === provider);

    const hasNewKey = Boolean(apiKey && apiKey.trim());
    if (!hasNewKey && !existing) {
      return NextResponse.json({ error: 'Por favor ingresa la Clave API de tu suscripción' }, { status: 400 });
    }

    // Determine target model name
    let targetModel = modelName !== undefined ? modelName.trim() : existing?.modelName;
    if (targetModel === '') {
      targetModel = undefined;
    }

    await saveAISettings(
      user.id,
      provider,
      hasNewKey ? apiKey.trim() : undefined,
      targetModel,
      isActive !== undefined ? Boolean(isActive) : true
    );

    return NextResponse.json({
      success: true,
      message: existing ? 'Configuración de IA actualizada con éxito' : 'Clave de IA configurada con éxito',
    });
  } catch (error: unknown) {
    console.error('Error saving AI settings:', error);
    const message = error instanceof Error ? error.message : 'Error al guardar configuración de IA';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

    const success = await setActiveAIProvider(user.id, provider);
    if (!success) {
      return NextResponse.json({ error: 'No se encontró el proveedor especificado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Proveedor ${provider} activado como predeterminado` });
  } catch (error: unknown) {
    console.error('Error activating AI provider:', error);
    const message = error instanceof Error ? error.message : 'Error al activar proveedor';
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
