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
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    barColor: 'bg-red-500',
    barBg: 'bg-red-500/20',
  },
  LEGITIMO: {
    label: 'LEGÍTIMO',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    barColor: 'bg-emerald-500',
    barBg: 'bg-emerald-500/20',
  },
  SOSPECHOSO: {
    label: 'SOSPECHOSO',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    icon: HelpCircle,
    iconColor: 'text-amber-400',
    barColor: 'bg-amber-500',
    barBg: 'bg-amber-500/20',
  },
};

function ResultCard({ result }: { result: AnalysisResult }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = verdictConfig[result.verdict];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 max-w-xl backdrop-blur-sm`}>
      {/* Verdict + confidence */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
          <span className={`rounded-full px-3 py-0.5 text-xs font-bold tracking-widest uppercase ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400">{result.confidence}% confianza</span>
      </div>

      <div className={`mb-3 h-1 overflow-hidden rounded-full ${cfg.barBg}`}>
        <div className={`h-full rounded-full ${cfg.barColor} transition-all`} style={{ width: `${result.confidence}%` }} />
      </div>

      <p className="mb-3 text-sm font-medium text-white/90">{result.summary}</p>

      {/* Recommendation */}
      <div className="mb-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Qué hacer</p>
        <p className="text-sm text-slate-300">{result.recommendation}</p>
      </div>

      {/* Flags */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {result.red_flags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-400 mb-1 uppercase tracking-wide">⚠ Alertas</p>
            <ul className="space-y-0.5">
              {result.red_flags.map((f, i) => <li key={i} className="text-xs text-slate-400">• {f}</li>)}
            </ul>
          </div>
        )}
        {result.green_flags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-400 mb-1 uppercase tracking-wide">✓ OK</p>
            <ul className="space-y-0.5">
              {result.green_flags.map((f, i) => <li key={i} className="text-xs text-slate-400">• {f}</li>)}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Ocultar análisis' : 'Ver análisis completo'}
      </button>

      {expanded && (
        <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{result.analysis}</p>
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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="flex h-screen flex-col bg-[#0f1629]">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
        }}
      />

      {/* Header */}
      <header className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 bg-[#0f1629]/80 px-5 backdrop-blur-sm">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold text-white">Validador de Phishing</span>
        <div className="w-8" />
      </header>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-5">

          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-8 md:py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/30">
                <MailCheck className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white">
                Leé lo que viene<br />
                <span className="text-blue-400">después del @</span>
              </h2>
              <p className="max-w-sm text-sm text-slate-400 leading-relaxed">
                Pegá el remitente, el asunto o el cuerpo del mail, o adjuntá una captura. Si genera dudas, no hagas clic.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['@cocos.capital', '@cocoscrypto.com', '@mailing.cocos.capital'].map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-600">dominios oficiales de Cocos</p>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="max-w-xl">
                {msg.role === 'user' && (
                  <div className="rounded-2xl rounded-tr-none bg-blue-600 px-4 py-3 text-sm text-white shadow-lg shadow-blue-600/20">
                    {msg.imagePreview && (
                      <img src={msg.imagePreview} alt="" className="mb-2 max-h-40 rounded-lg object-cover" />
                    )}
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                    {!msg.text && msg.imagePreview && <p className="opacity-70 text-xs">Captura adjunta</p>}
                  </div>
                )}

                {msg.role === 'assistant' && msg.question && (
                  <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-sm">
                    {msg.question}
                  </div>
                )}

                {msg.role === 'assistant' && msg.result && (
                  <ResultCard result={msg.result} />
                )}

                {msg.role === 'assistant' && msg.error && (
                  <div className="rounded-2xl rounded-tl-none border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {msg.error}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-slate-400">
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
      <div className="relative flex-shrink-0 border-t border-white/10 bg-[#0f1629]/80 px-4 py-3 pb-safe backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          {/* Screenshot preview */}
          {screenshotPreview && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1.5 pr-2">
              <img src={screenshotPreview} alt="" className="h-10 rounded object-cover" />
              <span className="text-xs text-slate-400 max-w-32 truncate">{screenshot?.name}</span>
              <button
                onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
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
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
              style={{ maxHeight: '160px' }}
            />

            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-600 shadow-lg shadow-blue-600/20 disabled:shadow-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-xs text-slate-700">Enter para enviar · Shift+Enter para nueva línea</p>
        </div>
      </div>
    </div>
  );
}
