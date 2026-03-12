'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SeverityBadge, StatusBadge } from '@/components/layout/ThreatBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Shield, ShieldAlert, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const mockUrls = [
  {
    id: '1',
    url: 'https://cocoscapital-login.net/auth/verify',
    pageTitle: 'Cocos Capital - Verificación de cuenta',
    isSafe: false,
    vtScore: 18,
    vtTotal: 75,
    status: 'CONFIRMED' as const,
    severity: 'CRITICAL' as const,
    analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '2',
    url: 'https://bit.ly/cocos-promo-especial',
    pageTitle: 'Promoción exclusiva Cocos Capital',
    isSafe: false,
    vtScore: 9,
    vtTotal: 75,
    status: 'ANALYZING' as const,
    severity: 'HIGH' as const,
    analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '3',
    url: 'http://cocos-inversion.com.mx/register',
    pageTitle: 'Registrate en Cocos',
    isSafe: false,
    vtScore: 22,
    vtTotal: 75,
    status: 'CONFIRMED' as const,
    severity: 'CRITICAL' as const,
    analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '4',
    url: 'https://cocos-referidos.netlify.app',
    pageTitle: 'Programa de referidos Cocos',
    isSafe: false,
    vtScore: 3,
    vtTotal: 75,
    status: 'DETECTED' as const,
    severity: 'MEDIUM' as const,
    analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
  },
];

export default function PhishingPage() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | { safe: boolean; vtScore: number; title: string }>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setAnalyzing(true);
    setResult(null);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    setResult({ safe: false, vtScore: 14, title: 'Página sospechosa detectada' });
    setAnalyzing(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="URL Analyzer" subtitle="Análisis de URLs sospechosas de phishing" />
      <div className="flex-1 space-y-6 p-6">
        {/* URL input */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Analizar URL sospechosa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="https://ejemplo-sospechoso.com/login"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!url || analyzing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analizando...
                  </span>
                ) : (
                  'Analizar'
                )}
              </Button>
            </div>

            {/* Result */}
            {result && (
              <div
                className={`flex items-start gap-3 rounded-lg p-4 ${
                  result.safe ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {result.safe ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                )}
                <div>
                  <p className="font-semibold">
                    {result.safe ? '✓ URL segura' : '⚠ URL maliciosa detectada'}
                  </p>
                  <p className="mt-1 text-sm">
                    VirusTotal: <strong>{result.vtScore}/75</strong> motores detectaron amenazas
                  </p>
                  <p className="text-sm">Título: {result.title}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Analizadas (30d)', value: 89, icon: <Shield className="h-4 w-4 text-blue-600" /> },
            { label: 'Maliciosas', value: 34, icon: <ShieldAlert className="h-4 w-4 text-red-600" /> },
            { label: 'En revisión', value: 5, icon: <AlertTriangle className="h-4 w-4 text-yellow-600" /> },
            { label: 'Falsos positivos', value: 12, icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
          ].map((item) => (
            <Card key={item.label} className="border border-gray-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* History table */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Historial de análisis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">URL</TableHead>
                  <TableHead className="text-xs">Título</TableHead>
                  <TableHead className="text-xs">VirusTotal</TableHead>
                  <TableHead className="text-xs">Severidad</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Analizado</TableHead>
                  <TableHead className="text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUrls.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50">
                    <TableCell>
                      <p className="max-w-xs truncate text-sm font-mono text-gray-800">{u.url}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{u.pageTitle}</TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-semibold ${
                          u.vtScore > 10 ? 'text-red-600' : u.vtScore > 3 ? 'text-orange-600' : 'text-green-600'
                        }`}
                      >
                        {u.vtScore}/{u.vtTotal}
                      </span>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={u.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDateTime(u.analyzedAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
