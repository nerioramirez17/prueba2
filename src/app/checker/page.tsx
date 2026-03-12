'use client';

import Link from 'next/link';
import { Shield, MailCheck, Bot, Send, ArrowLeft, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const WELCOME_MESSAGE = `Hola! Soy el asistente de seguridad de Cocos Capital 👋

Estoy aquí para ayudarte a validar si un mail que recibiste es legítimo o un intento de phishing.

**¿Cómo funciona?**
1. Copiá el contenido del mail sospechoso
2. Pegalo en el campo de abajo
3. Te voy a dar un análisis detallado

**Tipos de mails que analizo:**
• Mails de proveedores de pagos
• Comunicaciones de otras ALYCs
• Mails de bancos o billeteras
• Cualquier mail que te genere dudas

_El análisis con IA estará disponible próximamente._`;

const EXAMPLE_CASES = [
  {
    label: 'Proveedor de pagos',
    icon: '💳',
    description: 'Mail simulando ser de Mercado Pago, Naranja X, etc.',
  },
  {
    label: 'Otra ALYC',
    icon: '📈',
    description: 'Comunicación que aparenta ser de IOL, Bull Market, etc.',
  },
  {
    label: 'Banco o wallet',
    icon: '🏦',
    description: 'Mail de supuesto banco, Uala, Bnext u otra fintech.',
  },
  {
    label: 'Proveedor de servicios',
    icon: '⚙️',
    description: 'AWS, Google, Microsoft u otro proveedor tecnológico.',
  },
];

export default function CheckerPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Cocos Security</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MailCheck className="h-5 w-5 text-green-600" />
          <span className="text-sm font-semibold text-gray-800">Validador de Phishing</span>
          <span className="ml-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Herramienta Interna
          </span>
        </div>

        <div className="w-32" />
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Info */}
        <aside className="flex w-80 flex-shrink-0 flex-col gap-5 overflow-y-auto border-r border-gray-200 bg-white p-6">
          <div>
            <h2 className="mb-1 text-sm font-semibold text-gray-800">¿Para qué sirve?</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Esta herramienta te permite validar mails sospechosos que recibís en tu trabajo. Pegá el contenido del mail y el asistente va a analizar si es un intento de phishing.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-800">Casos frecuentes</h2>
            <div className="space-y-2">
              {EXAMPLE_CASES.map((c) => (
                <div
                  key={c.label}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{c.label}</p>
                    <p className="text-xs text-gray-400">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">Importante:</span> Si el mail pide credenciales o datos bancarios, no interactúes y reportalo al equipo de seguridad.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Podés reportar directamente al equipo de seguridad escribiendo a{' '}
                <span className="font-semibold">security@cocos-capital.com.ar</span>
              </p>
            </div>
          </div>
        </aside>

        {/* Right panel — Chat */}
        <div className="flex flex-1 flex-col">
          {/* Status banner */}
          <div className="flex items-center justify-center gap-2 bg-blue-50 px-4 py-2 text-xs text-blue-700 border-b border-blue-100">
            <Clock className="h-3.5 w-3.5" />
            El análisis automático con IA estará disponible próximamente. Por ahora podés reportar mails al equipo de seguridad.
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Bot welcome message */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-xl rounded-2xl rounded-tl-none bg-white p-4 shadow-sm border border-gray-100">
                <div className="mb-1 text-xs font-semibold text-blue-600">Asistente de Seguridad</div>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {`Hola! Soy el asistente de seguridad de Cocos Capital 👋\n\nEstoy aquí para ayudarte a validar si un mail que recibiste es legítimo o un intento de phishing.\n\n`}
                  <span className="font-semibold">¿Cómo funciona?</span>
                  {`\n1. Copiá el contenido del mail sospechoso\n2. Pegalo en el campo de abajo\n3. Te voy a dar un análisis detallado\n\n`}
                  <span className="font-semibold">Tipos de mails que analizo:</span>
                  {`\n• Mails de proveedores de pagos\n• Comunicaciones de otras ALYCs\n• Mails de bancos o billeteras\n• Cualquier mail que te genere dudas`}
                </div>
              </div>
            </div>

            {/* Mock "coming soon" indicator */}
            <div className="flex items-center gap-3 justify-center py-4">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-400">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Análisis IA en desarrollo
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <textarea
                disabled
                rows={3}
                placeholder="Próximamente podrás pegar el contenido del mail sospechoso aquí para analizarlo..."
                className="flex-1 resize-none bg-transparent text-sm text-gray-400 placeholder:text-gray-400 focus:outline-none cursor-not-allowed"
              />
              <button
                disabled
                className="flex h-9 w-9 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 text-gray-400"
                title="Próximamente disponible"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">
              El análisis automático estará disponible en la próxima versión
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
