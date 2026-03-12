'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ScannerControls } from '@/components/modules/ScannerControls';
import { SeverityBadge, StatusBadge } from '@/components/layout/ThreatBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe2, RefreshCw } from 'lucide-react';
import type { DomainsResponse, ScannedDomain } from '@/app/api/domains/route';

function RiskScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-red-500'
      : score >= 60
        ? 'bg-orange-500'
        : score >= 40
          ? 'bg-yellow-500'
          : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-gray-700">{score}</span>
    </div>
  );
}

function formatCertDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatLastScan(isoDate: string | null): string {
  if (!isoDate) return 'nunca';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `hace ${hrs}h`;
}

export default function DomainsPage() {
  const [data, setData] = useState<DomainsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/domains');
      if (!res.ok) throw new Error('Error al obtener dominios');
      const json: DomainsResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scan();
  }, [scan]);

  const stats = data?.stats;
  const domains: ScannedDomain[] = data?.domains ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Domain Watchdog"
        subtitle="Monitoreo de dominios similares a cocos-capital.com.ar"
      />
      <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Total detectados',
              value: loading ? '…' : String(stats?.total ?? 0),
              color: 'text-gray-900',
            },
            {
              label: 'Riesgo alto/crítico',
              value: loading ? '…' : String(stats?.highCritical ?? 0),
              color: 'text-red-600',
            },
            {
              label: 'Nuevos esta semana',
              value: loading ? '…' : String(stats?.newThisWeek ?? 0),
              color: 'text-orange-600',
            },
          ].map((item) => (
            <Card key={item.label} className="border border-gray-200">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main table */}
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Dominios Detectados
            </CardTitle>
            <div className="flex items-center gap-3">
              {data?.scannedAt && (
                <span className="text-xs text-gray-400">
                  Último escaneo: {formatLastScan(data.scannedAt)}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={scan}
                disabled={loading}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Escaneando…' : 'Escanear ahora'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="px-6 py-4 text-sm text-red-600">{error}</div>
            )}

            {loading && !data && (
              <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Consultando Certificate Transparency Logs…
              </div>
            )}

            {!loading && !error && domains.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">
                No se encontraron dominios sospechosos.
              </div>
            )}

            {domains.length > 0 && (
              <>
                {/* Mobile: card list */}
                <div className="block md:hidden divide-y divide-gray-100">
                  {domains.map((d) => (
                    <div key={d.id} className="flex items-start gap-3 px-4 py-3">
                      <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{d.domain}</p>
                        {d.ip && <p className="text-xs text-gray-400">{d.ip}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={d.severity} />
                          <StatusBadge status={d.status} />
                          <RiskScoreBar score={d.riskScore} />
                        </div>
                      </div>
                      <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Dominio</TableHead>
                        <TableHead className="text-xs">Emisor del cert.</TableHead>
                        <TableHead className="text-xs">Fecha cert.</TableHead>
                        <TableHead className="text-xs">Risk Score</TableHead>
                        <TableHead className="text-xs">Severidad</TableHead>
                        <TableHead className="text-xs">Estado</TableHead>
                        <TableHead className="text-xs"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {domains.map((d) => (
                        <TableRow key={d.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe2 className="h-4 w-4 shrink-0 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{d.domain}</p>
                                {d.ip && (
                                  <p className="text-xs text-gray-400">{d.ip}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-xs text-gray-500">
                            {d.issuer
                              ? d.issuer.match(/O=([^,]+)/)?.[1] ?? d.issuer
                              : '—'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatCertDate(d.certDate)}
                          </TableCell>
                          <TableCell>
                            <RiskScoreBar score={d.riskScore} />
                          </TableCell>
                          <TableCell>
                            <SeverityBadge severity={d.severity} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={d.status} />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <a
                                href={`https://${d.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
