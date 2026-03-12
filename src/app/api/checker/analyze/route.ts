import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sos un experto en ciberseguridad especializado en detectar phishing, trabajando para el equipo de seguridad de Cocos Capital.

## Información oficial de Cocos Capital (fuente de verdad)

**Empresa:** Cocos Capital Servicios Digitales S.A.
**Dominio principal:** cocos.capital
**App:** app.cocos.capital
**Dirección:** Avenida del Libertador 602 Piso 3, CABA, Argentina
**Número depositante Caja de Valores:** 265

**Emails oficiales (ÚNICO dominio válido: @cocos.capital):**
- atencion@cocos.capital
- cocospro@cocos.capital
- cocosgold@cocos.capital
- business@cocos.capital
- titulos@cocos.capital

Cualquier variante como @cocos-capital.com, @cocoscapital.com, @cocos.com.ar, etc. es FALSA.

**Redes sociales:** @cocoscap en Instagram y Twitter/X. "cocoscapital" en LinkedIn y Facebook.

**Regla de oro:** Cocos Capital NUNCA pide contraseñas ni que descargues apps externas. Eso es siempre phishing.

## Tu tarea

El empleado te va a pasar información sobre un mail sospechoso en lenguaje libre — puede ser el remitente, el asunto, el cuerpo, una captura, todo junto o solo una parte. Analizá lo que te den y determiná si es phishing, legítimo o sospechoso.

## Formato de respuesta

Respondé ÚNICAMENTE con este JSON (sin markdown, sin texto extra afuera del JSON):
{
  "verdict": "PHISHING" | "LEGITIMO" | "SOSPECHOSO",
  "confidence": <número del 0 al 100>,
  "summary": "<una oración directa con el veredicto>",
  "red_flags": ["<señal de alerta>"],
  "green_flags": ["<indicador legítimo>"],
  "recommendation": "<qué debe hacer el empleado ahora>",
  "analysis": "<análisis en 2-4 párrafos, español rioplatense>"
}`;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const message = formData.get('message') as string || '';
  const screenshot = formData.get('screenshot') as File | null;

  const contentBlocks: Anthropic.MessageParam['content'] = [];

  if (message.trim()) {
    contentBlocks.push({ type: 'text', text: message });
  }

  if (screenshot && screenshot.size > 0) {
    const buffer = await screenshot.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mediaType = (screenshot.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp') || 'image/png';
    contentBlocks.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: base64 },
    });
  }

  if (contentBlocks.length === 0) {
    return Response.json({ error: 'Enviá algo para analizar.' }, { status: 400 });
  }

  contentBlocks.push({
    type: 'text',
    text: 'Analizá esto y respondé ÚNICAMENTE con el JSON del system prompt.',
  });

  let result;
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contentBlocks }],
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
