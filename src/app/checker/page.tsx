'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, MailCheck, ArrowLeft, Send, AlertTriangle,
  CheckCircle2, HelpCircle, Loader2, ImagePlus, X,
  ChevronDown, ChevronUp,
} from 'lucide-react';

type Verdict = 'PHISHING' | 'LEGITIMO' | 'SOSPECHOSO';

interface AnalysisResult {
  verdict: Verdict;
  confidence: number;
  summary: string;
  red_flags: string[];
  green_flags: string[];
  recommendation: string;
  analysis: string;
}

interface Message {
  role: 'user' | 'assistant';
  text?: string;
  imagePreview?: string;
  result?: AnalysisResult;
  question?: string;
  error?: string;
}

const verdictConfig = {
  PHISHING: {
    label: 'PHISHING',
    border: 'border-red-300',
    bg: 'bg-red-50',
    badge: 'bg-red-600 text-white',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    barColor: 'bg-red-500',
  },
  LEGITIMO: {
    label: 'LEGÍTIMO',
    border: 'border-green-300',
    bg: 'bg-green-50',
    badge: 'bg-green-600 text-white',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    barColor: 'bg-green-500',
  },
  SOSPECHOSO: {
    label: 'SOSPECHOSO',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: 'bg-amber-500 text-white',
    icon: HelpCircle,
    iconColor: 'text-amber-500',
    barColor: 'bg-amber-500',
  },
};

function ResultCard({ result }: { result: AnalysisResult }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = verdictConfig[result.verdict];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4 max-w-xl`}>
      {/* Verdict + confidence */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
          <span className={`rounded-full px-3 py-0.5 text-xs font-bold tracking-wide ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-600">{result.confidence}% confianza</span>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/60">
        <div className={`h-full rounded-full ${cfg.barColor} transition-all`} style={{ width: `${result.confidence}%` }} />
      </div>

      <p className="mb-3 text-sm font-medium text-gray-800">{result.summary}</p>

      {/* Recommendation */}
      <div className="mb-3 rounded-xl bg-white/70 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Qué hacer</p>
        <p className="text-sm text-gray-800">{result.recommendation}</p>
      </div>

      {/* Flags */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {result.red_flags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-600 mb-1">⚠ Señales de alerta</p>
            <ul className="space-y-0.5">
              {result.red_flags.map((f, i) => <li key={i} className="text-xs text-gray-700">• {f}</li>)}
            </ul>
          </div>
        )}
        {result.green_flags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-700 mb-1">✓ Indicadores OK</p>
            <ul className="space-y-0.5">
              {result.green_flags.map((f, i) => <li key={i} className="text-xs text-gray-700">• {f}</li>)}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Ocultar análisis' : 'Ver análisis completo'}
      </button>

      {expanded && (
        <div className="mt-2 rounded-xl bg-white/70 p-3">
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{result.analysis}</p>
        </div>
      )}
    </div>
  );
}

export default function CheckerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const canSend = (input.trim() || screenshot) && !loading;

  const handleFile = (file: File) => {
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const buildHistory = (msgs: Message[]) => {
    return msgs.map(m => ({
      role: m.role,
      content: m.role === 'user'
        ? [m.imagePreview ? '[imagen adjunta]' : '', m.text || ''].filter(Boolean).join(' ')
        : m.question || m.result?.summary || m.error || '',
    })).filter(m => m.content.trim());
  };

  const handleSend = async () => {
    if (!canSend) return;

    const userMsg: Message = {
      role: 'user',
      text: input.trim() || undefined,
      imagePreview: screenshotPreview || undefined,
    };

    // Capture current state before updating
    const currentScreenshot = screenshot;
    const history = buildHistory(messages);

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setScreenshot(null);
    setScreenshotPreview(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('message', userMsg.text || '');
      if (currentScreenshot) fd.append('screenshot', currentScreenshot);
      fd.append('history', JSON.stringify(history));

      const res = await fetch('/api/checker/analyze', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', error: data.error }]);
      } else if (data.type === 'question') {
        setMessages(prev => [...prev, { role: 'assistant', question: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', result: data }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', error: 'Error de conexión. Intentá de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) handleFile(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 shadow-sm">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" />
          Inicio
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Validador de Phishing</span>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            IA Activa
          </span>
        </div>
        <div className="w-20" />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-5">

          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
                <MailCheck className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-gray-800">¿Recibiste un mail sospechoso?</h2>
              <p className="max-w-sm text-sm text-gray-500">
                Pegá el remitente, el asunto, el cuerpo del mail, o adjuntá una captura. Con cualquiera de esas cosas te digo si es phishing.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  'De: soporte@cocos-capital.net\nAsunto: Tu cuenta fue suspendida',
                  'Te mando un mail raro de MercadoPago pidiendo validar mi cuenta',
                  '"Hacé clic acá para desbloquear tu inversión"',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setInput(example)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left max-w-xs"
                  >
                    {example.length > 60 ? example.slice(0, 60) + '…' : example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="max-w-xl">
                {msg.role === 'user' && (
                  <div className="rounded-2xl rounded-tr-none bg-blue-600 px-4 py-3 text-sm text-white">
                    {msg.imagePreview && (
                      <img src={msg.imagePreview} alt="" className="mb-2 max-h-40 rounded-lg object-cover" />
                    )}
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                    {!msg.text && msg.imagePreview && <p className="opacity-70 text-xs">Captura adjunta</p>}
                  </div>
                )}

                {msg.role === 'assistant' && msg.question && (
                  <div className="rounded-2xl rounded-tl-none border border-gray-200 bg-white px-4 py-3 shadow-sm text-sm text-gray-800">
                    {msg.question}
                  </div>
                )}

                {msg.role === 'assistant' && msg.result && (
                  <ResultCard result={msg.result} />
                )}

                {msg.role === 'assistant' && msg.error && (
                  <div className="rounded-2xl rounded-tl-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {msg.error}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando...
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          {/* Screenshot preview */}
          {screenshotPreview && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1.5 pr-2">
              <img src={screenshotPreview} alt="" className="h-10 rounded object-cover" />
              <span className="text-xs text-gray-500 max-w-32 truncate">{screenshot?.name}</span>
              <button
                onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              title="Adjuntar captura"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Pegá el mail, el remitente, el asunto… lo que tengas"
              className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              style={{ maxHeight: '160px' }}
            />

            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-xs text-gray-400">Enter para enviar · Shift+Enter para nueva línea</p>
        </div>
      </div>
    </div>
  );
}
