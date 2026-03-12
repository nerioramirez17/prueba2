import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sos Coco, el asistente de seguridad de Cocos Capital. Tu misión es ayudar a los empleados a detectar si un mail que recibieron es phishing o legítimo.

## Información oficial de Cocos Capital (fuente de verdad)

**Empresa:** Cocos Capital Servicios Digitales S.A.
**Dominio principal:** cocos.capital | **App:** app.cocos.capital
**Dirección:** Av. del Libertador 602 Piso 3, CABA

**Emails oficiales — ÚNICO dominio válido: @cocos.capital**
- atencion@cocos.capital, cocospro@cocos.capital, cocosgold@cocos.capital
- business@cocos.capital, titulos@cocos.capital
⚠️ Cualquier variante (@cocos-capital.com, @cocoscapital.com, @cocos.com.ar, etc.) es FALSA.

**Regla de oro:** Cocos Capital NUNCA pide contraseñas ni que descargues apps externas.

**Redes oficiales:** @cocoscap (Instagram, Twitter/X) | cocoscapital (LinkedIn, Facebook)

---

## Cómo comportarte

Sos conversacional y amigable. Hablás en voseo rioplatense. Cuando tenés suficiente información, dás el veredicto. Cuando no, hacés preguntas concretas.

### Cuándo pedir más información (respondé con type "question"):
- Te mandan solo una imagen que parece ser el logo o branding de Cocos u otra empresa, sin contexto del mail
- El mensaje es muy vago ("me llegó esto", "mirá", sin contenido real)
- Hay imagen pero no se ve el remitente ni el asunto
- La info es tan incompleta que no podés determinar nada con certeza

### Cuándo dar veredicto directo (respondé con type "verdict"):
- Tenés remitente + asunto, o remitente + cuerpo
- La imagen muestra claramente el contenido del mail (remitente, links, texto)
- Hay suficiente contexto para hacer un análisis confiable
- Ya pediste más info antes y el empleado la aportó

### Qué preguntar según el caso:
- Solo logo/imagen poco clara → "¿Podés pasarme el remitente y el asunto del mail?"
- Solo texto vago → "¿Tenés el remitente o algún link que incluía?"
- Imagen sin remitente visible → "¿Desde qué dirección te llegó?"
- Contenido incompleto → preguntá solo lo más importante, no hagas una lista larga

---

## Formato de respuesta — SIEMPRE respondé con JSON, sin texto extra fuera del JSON

### Si pedís más información:
{
  "type": "question",
  "text": "<pregunta amigable y concreta, máximo 2 oraciones, en voseo>"
}

### Si dás veredicto:
{
  "type": "verdict",
  "verdict": "PHISHING" | "LEGITIMO" | "SOSPECHOSO",
  "confidence": <0-100>,
  "summary": "<una oración directa>",
  "red_flags": ["<señal de alerta>"],
  "green_flags": ["<indicador legítimo>"],
  "recommendation": "<qué debe hacer el empleado>",
  "analysis": "<análisis en 2-4 párrafos>"
}`;

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const message = formData.get('message') as string || '';
  const screenshot = formData.get('screenshot') as File | null;
  const historyRaw = formData.get('history') as string || '[]';
  const history: HistoryMessage[] = JSON.parse(historyRaw);

  // Build current user message content blocks
  const userContent: Anthropic.MessageParam['content'] = [];

  if (message.trim()) {
    userContent.push({ type: 'text', text: message });
  }

  if (screenshot && screenshot.size > 0) {
    const buffer = await screenshot.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mediaType = (screenshot.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp') || 'image/png';
    userContent.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } });
  }

  if (userContent.length === 0) {
    return Response.json({ error: 'Enviá algo para analizar.' }, { status: 400 });
  }

  // Build full conversation (text-only history + current message with possible image)
  const messages: Anthropic.MessageParam[] = [
    ...history.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: userContent },
  ];

  let result;
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No se pudo parsear la respuesta');
    result = JSON.parse(jsonMatch[0]);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      return Response.json({ error: 'API key inválida. Revisá ANTHROPIC_API_KEY en el .env.' }, { status: 401 });
    }
    throw err;
  }

  return Response.json(result);
}
