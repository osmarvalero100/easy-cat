import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getAISettingsByUserId } from '@/lib/db';

interface GenerateRequest {
  task: 'product_description' | 'batch_extract' | 'intro_text' | 'suggest_palette';
  payload: any;
  provider?: string;
  model?: string;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { task, payload, provider: requestedProvider } = body || {};

    const configuredSettings = await getAISettingsByUserId(user.id);
    if (!configuredSettings || configuredSettings.length === 0) {
      return NextResponse.json(
        {
          error: 'No tienes ninguna clave de IA configurada. Ve a Configuración de IA para conectar tu clave de OpenAI, Gemini o Claude.',
          code: 'NO_AI_CONFIGURED',
        },
        { status: 400 }
      );
    }

    // Pick provider
    const setting = requestedProvider
      ? configuredSettings.find((s) => s.provider === requestedProvider && s.isActive)
      : configuredSettings.find((s) => s.isActive) || configuredSettings[0];

    if (!setting) {
      return NextResponse.json(
        { error: `No se encontró clave activa para el proveedor ${requestedProvider || 'predeterminado'}.` },
        { status: 400 }
      );
    }

    // Build system prompt and user prompt based on task
    let systemPrompt = '';
    let userPrompt = '';

    if (task === 'product_description') {
      systemPrompt =
        'Eres un redactor editorial de lujo especializado en catálogos y marcas artesanales (estilo Kinfolk, Cereal, Vogue Living). Escribe descripciones sensoriales, evocadoras y concisas (máximo 45 palabras) ideales para diagramación A4 sin romper el diseño.';
      userPrompt = `Genera una descripción sensorial y elegante para este producto:
Nombre: ${payload.name}
Aromas / Notas olfativas: ${(payload.fragrances || []).join(', ') || 'No especificado'}
Tipo de cera / Material: ${payload.waxType || 'Cera vegetal'}
Estilo de la marca: ${payload.brandName || 'Artesanal y Botánico'}

Responde en formato JSON con la siguiente estructura exacta:
{
  "description": "Texto sensorial elegante de max 45 palabras",
  "suggestedFragrances": ["nota 1", "nota 2", "nota 3"],
  "burnTimeHours": 45
}`;
    } else if (task === 'intro_text') {
      systemPrompt =
        'Eres el director creativo de una editorial de diseño y marcas artesanales. Redactas manifiestos de bienvenida y notas del fundador.';
      userPrompt = `Escribe un texto editorial de bienvenida y manifiesto para la portada/página introductoria de este catálogo:
Marca: ${payload.brandName}
Temporada o Colección: ${payload.seasonTag || payload.title}
Enfoque: ${payload.philosophy || 'Velas vertidas a mano, ingredientes puros, calidez y memoria sensorial'}

Responde en formato JSON con:
{
  "introText": "Texto editorial de 60 a 90 palabras, poético, profesional y acogedor"
}`;
    } else if (task === 'batch_extract') {
      systemPrompt =
        'Eres un extractor estructurado de datos de catálogo comercial. Analizas texto desordenado (de WhatsApp, notas o listas de precios) y extraes productos limpios en formato JSON.';
      userPrompt = `Extrae la lista de productos del siguiente texto:
"""
${payload.rawText}
"""

Responde únicamente un JSON con la estructura:
{
  "products": [
    {
      "name": "Nombre limpio del producto",
      "price": 35000,
      "description": "Breve descripción",
      "heightCm": 10,
      "widthCm": 7,
      "fragrances": ["Aroma 1", "Aroma 2"]
    }
  ]
}`;
    } else {
      return NextResponse.json({ error: 'Tarea de IA no reconocida' }, { status: 400 });
    }

    let aiResultText = '';

    // Provider call
    if (setting.provider === 'openai' || setting.provider === 'openrouter') {
      const endpoint =
        setting.provider === 'openrouter'
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';

      const model = setting.modelName || (setting.provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${setting.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error de ${setting.provider}: ${errText}`);
      }

      const data = await res.json();
      aiResultText = data.choices?.[0]?.message?.content || '{}';
    } else if (setting.provider === 'gemini') {
      const model = setting.modelName || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${setting.apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANTE: Responde ÚNICAMENTE un JSON válido.` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error de Google Gemini: ${errText}`);
      }

      const data = await res.json();
      aiResultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    } else {
      throw new Error(`Proveedor de IA '${setting.provider}' aún no implementado.`);
    }

    let parsedResult = {};
    try {
      parsedResult = JSON.parse(aiResultText);
    } catch {
      parsedResult = { raw: aiResultText };
    }

    return NextResponse.json({ success: true, result: parsedResult });
  } catch (error: unknown) {
    console.error('Error generating with AI:', error);
    const message = error instanceof Error ? error.message : 'Error al procesar con IA';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
