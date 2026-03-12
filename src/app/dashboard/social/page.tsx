'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SeverityBadge } from '@/components/layout/ThreatBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, RefreshCw, AlertTriangle, Settings, Eye, Clock, Play, X as XIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  SocialScanResult,
  SocialPlatform,
  SocialProfile,
  PlatformResult,
  PlatformStatus,
} from '@/services/social.service';
import { USERNAME_VARIATIONS } from '@/services/social.service';

// ─── Platform display config ──────────────────────────────────────────────────

const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; emoji: string; color: string; textColor: string }
> = {
  x: { label: 'X (Twitter)', emoji: '𝕏', color: 'bg-sky-50', textColor: 'text-sky-700' },
  instagram: { label: 'Instagram', emoji: '📸', color: 'bg-pink-50', textColor: 'text-pink-600' },
  tiktok: { label: 'TikTok', emoji: '♪', color: 'bg-gray-100', textColor: 'text-gray-700' },
  facebook: { label: 'Facebook', emoji: 'f', color: 'bg-blue-50', textColor: 'text-blue-600' },
};

const PLATFORMS = Object.keys(PLATFORM_META) as SocialPlatform[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLastScan(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.floor(mins / 60)}h`;
}

function StatusChip({ status }: { status: PlatformStatus }) {
  const map: Record<PlatformStatus, { label: string; className: string }> = {
    ACTIVE: { label: 'API activa', className: 'bg-green-100 text-green-700' },
    LIMITED: { label: 'Limitado', className: 'bg-yellow-100 text-yellow-700' },
    UNCONFIGURED: { label: 'Sin configurar', className: 'bg-gray-100 text-gray-500' },
    MANUAL: { label: 'Manual', className: 'bg-orange-50 text-orange-600' },
  };
  const { label, className } = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

// ─── Platform card ─────────────────────────────────────────────────────────────

function PlatformCard({
  platform,
  result,
  loading,
}: {
  platform: SocialPlatform;
  result: PlatformResult | undefined;
  loading: boolean;
}) {
  const meta = PLATFORM_META[platform];
  const count = result?.profiles.length ?? null;

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${meta.color} ${meta.textColor}`}
          >
            {meta.emoji}
          </span>
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-gray-300" />
          ) : result?.status ? (
            <StatusChip status={result.status} />
          ) : null}
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-800">{meta.label}</p>
        <p className="text-xs text-gray-400">
          {loading
            ? '…'
            : count === null
              ? '—'
              : count === 0
                ? result?.status === 'MANUAL'
                  ? 'Verificar manualmente'
                  : result?.status === 'UNCONFIGURED'
                    ? 'API no configurada'
                    : 'Sin alertas'
                : `${count} sospechosa${count !== 1 ? 's' : ''}`}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Unconfigured / Manual notice ─────────────────────────────────────────────

function PlatformNotice({
  platform,
  result,
}: {
  platform: SocialPlatform;
  result: PlatformResult;
}) {
  const meta = PLATFORM_META[platform];

  if (result.status === 'UNCONFIGURED') {
    const isPlanRequired = result.error === 'PLAN_REQUIRED';
    const isInvalidToken = result.error === 'INVALID_TOKEN';
    const noToken = !result.error || result.error === '';

    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <Settings className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {meta.label} —{' '}
              {isPlanRequired
                ? 'plan de pago requerido'
                : isInvalidToken
                  ? 'token inválido'
                  : 'API no configurada'}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {isPlanRequired ? (
                <>
                  El endpoint de búsqueda de usuarios requiere el plan{' '}
                  <strong>Basic ($100/mes)</strong> de X API. El tier gratuito no incluye user lookup.{' '}
                  <a
                    href="https://developer.x.com/en/portal/products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Ver planes →
                  </a>
                </>
              ) : isInvalidToken ? (
                <>
                  El token configurado devuelve 401/403. Verificá que{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">
                    TWITTER_BEARER_TOKEN
                  </code>{' '}
                  sea correcto en tu archivo{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">.env</code>.
                </>
              ) : (
                <>
                  Agregá{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">
                    TWITTER_BEARER_TOKEN
                  </code>{' '}
                  en tu archivo{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">.env</code>.{' '}
                  <a
                    href="https://developer.x.com/en/portal/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Obtener token →
                  </a>
                </>
              )}
            </p>
            {(isPlanRequired || noToken) && (
              <p className="mt-2 text-xs text-gray-400">
                Mientras tanto, verificá las cuentas manualmente:
                <span className="ml-1 inline-flex flex-wrap gap-1">
                  {USERNAME_VARIATIONS.slice(0, 5).map((u) => (
                    <a
                      key={u}
                      href={`https://x.com/${u}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      @{u}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ))}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'MANUAL') {
    return (
      <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-orange-800">
              {meta.label} — verificación manual requerida
            </p>
            <p className="mt-0.5 text-xs text-orange-600">
              {meta.label} no ofrece una API pública para búsqueda de usuarios. Revisá las
              siguientes variantes de username manualmente:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.manualCheckUrls?.slice(0, 10).map(({ username, url }) => (
                <a
                  key={username}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2 py-0.5 text-xs text-orange-700 hover:bg-orange-50"
                >
                  @{username}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Profiles table ────────────────────────────────────────────────────────────

function ProfilesTable({ profiles }: { profiles: SocialProfile[] }) {
  if (profiles.length === 0) return null;

  return (
    <>
      {/* Mobile: card list */}
      <div className="block md:hidden divide-y divide-gray-100">
        {profiles.map((a) => {
          const meta = PLATFORM_META[a.platform];
          return (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3">
              <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-sm font-bold ${meta.color} ${meta.textColor}`}>
                {meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">@{a.username}</p>
                {a.bio && <p className="truncate text-xs text-gray-500">{a.bio}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={a.severity} />
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${a.riskScore >= 75 ? 'bg-red-500' : a.riskScore >= 55 ? 'bg-orange-500' : a.riskScore >= 35 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${a.riskScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{a.riskScore}</span>
                  </div>
                </div>
              </div>
              <a href={a.profileUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">Plataforma</TableHead>
              <TableHead className="text-xs">Usuario</TableHead>
              <TableHead className="text-xs">Bio detectada</TableHead>
              <TableHead className="text-xs">Risk Score</TableHead>
              <TableHead className="text-xs">Severidad</TableHead>
              <TableHead className="text-xs"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((a) => {
              const meta = PLATFORM_META[a.platform];
              return (
                <TableRow key={a.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${meta.color} ${meta.textColor}`}
                      >
                        {meta.emoji}
                      </span>
                      <span className="text-sm text-gray-700">{meta.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900">@{a.username}</p>
                    {a.displayName && (
                      <p className="text-xs text-gray-500">{a.displayName}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-xs text-gray-500">{a.bio ?? '—'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            a.riskScore >= 75
                              ? 'bg-red-500'
                              : a.riskScore >= 55
                                ? 'bg-orange-500'
                                : a.riskScore >= 35
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                          }`}
                          style={{ width: `${a.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-gray-700">
                        {a.riskScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={a.severity} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={a.profileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

// ─── Schedule info types ──────────────────────────────────────────────────────

interface ScheduleInfo {
  intervalHours: number | null;
  isScheduled: boolean;
  nextRunAt: string | null;
  lastRun: {
    status: string;
    startedAt: string;
    finishedAt: string | null;
    threatsFound: number;
  } | null;
}

const INTERVAL_OPTIONS = [
  { label: 'Cada 1 hora', value: '1' },
  { label: 'Cada 6 horas', value: '6' },
  { label: 'Cada 12 horas', value: '12' },
  { label: 'Cada 24 horas', value: '24' },
  { label: 'Cada 48 horas', value: '48' },
  { label: 'Cada semana', value: '168' },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [data, setData] = useState<SocialScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleInfo | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<string>('12');

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/social');
      if (!res.ok) throw new Error('Error al obtener cuentas');
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch('/api/social/schedule', { signal: controller.signal });
      if (res.ok) {
        const info: ScheduleInfo = await res.json();
        setSchedule(info);
        if (info.intervalHours) setSelectedInterval(String(info.intervalHours));
      }
    } catch {
      // ignore — schedule info is non-critical (Redis may not be running)
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    scan();
    fetchSchedule();
  }, [scan, fetchSchedule]);

  const postSchedule = useCallback(async (body: object) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch('/api/social/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  const handleRunNow = useCallback(async () => {
    setScheduleLoading(true);
    try {
      await postSchedule({ action: 'run_now' });
      await fetchSchedule();
    } finally {
      setScheduleLoading(false);
    }
  }, [postSchedule, fetchSchedule]);

  const handleActivateSchedule = useCallback(async () => {
    setScheduleLoading(true);
    try {
      await postSchedule({ action: 'set_interval', intervalHours: parseInt(selectedInterval, 10) });
      await fetchSchedule();
    } finally {
      setScheduleLoading(false);
    }
  }, [selectedInterval, postSchedule, fetchSchedule]);

  const handleDisableSchedule = useCallback(async () => {
    setScheduleLoading(true);
    try {
      await postSchedule({ action: 'disable' });
      await fetchSchedule();
    } finally {
      setScheduleLoading(false);
    }
  }, [postSchedule, fetchSchedule]);

  const allProfiles = data
    ? PLATFORMS.flatMap((p) => data.platforms[p]?.profiles ?? []).sort(
        (a, b) => b.riskScore - a.riskScore,
      )
    : [];

  const stats = data?.stats;

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Social Media Monitor"
        subtitle="Detección de cuentas fraudulentas en redes sociales"
      />
      <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6">

        {/* Per-platform cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PLATFORMS.map((p) => (
            <PlatformCard
              key={p}
              platform={p}
              result={data?.platforms[p]}
              loading={loading}
            />
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            {
              label: 'Cuentas detectadas',
              value: loading ? '…' : String(stats?.total ?? 0),
              color: 'text-red-600',
            },
            {
              label: 'Críticas / altas',
              value: loading
                ? '…'
                : String((stats?.bySeverity.critical ?? 0) + (stats?.bySeverity.high ?? 0)),
              color: 'text-orange-600',
            },
            {
              label: 'Plataformas activas',
              value: loading
                ? '…'
                : String(
                    PLATFORMS.filter(
                      (p) =>
                        data?.platforms[p]?.status === 'ACTIVE' ||
                        data?.platforms[p]?.status === 'LIMITED',
                    ).length,
                  ),
              color: 'text-blue-600',
            },
          ].map((s) => (
            <Card key={s.label} className="border border-gray-200">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Scheduled scanning config */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Clock className="h-4 w-4 text-gray-500" />
              Escaneo Automático
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              {/* Interval selector — only updates local state, saved via "Activar" */}
              <Select
                value={selectedInterval}
                onValueChange={setSelectedInterval}
                disabled={scheduleLoading}
              >
                <SelectTrigger className="w-44 text-xs">
                  <SelectValue placeholder="Seleccionar intervalo" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Activate / update schedule */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleActivateSchedule}
                disabled={scheduleLoading}
                className="gap-1.5 text-xs"
              >
                {scheduleLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {schedule?.isScheduled ? 'Actualizar' : 'Activar'}
              </Button>

              {/* Disable button (only if scheduled) */}
              {schedule?.isScheduled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisableSchedule}
                  disabled={scheduleLoading}
                  className="gap-1.5 text-xs text-red-600 hover:text-red-700"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Desactivar
                </Button>
              )}

              {/* Run now button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunNow}
                disabled={scheduleLoading}
                className="gap-1.5 text-xs"
              >
                <Play className="h-3.5 w-3.5" />
                Ejecutar ahora
              </Button>

              {/* Status info */}
              <div className="ml-auto flex flex-col items-end gap-0.5 text-right">
                {schedule?.isScheduled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Activo — cada {schedule.intervalHours}h
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Sin programar
                  </span>
                )}
                {schedule?.nextRunAt && (
                  <span className="text-xs text-gray-400">
                    Próximo: {new Date(schedule.nextRunAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                  </span>
                )}
                {schedule?.lastRun && (
                  <span className="text-xs text-gray-400">
                    Último: {formatLastScan(schedule.lastRun.startedAt)}
                    {schedule.lastRun.threatsFound > 0 && (
                      <span className="ml-1 font-medium text-orange-500">
                        +{schedule.lastRun.threatsFound} nuevas
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform notices (unconfigured / manual) */}
        {!loading && data && (
          <div className="space-y-3">
            {PLATFORMS.map((p) => {
              const result = data.platforms[p];
              if (!result) return null;
              if (result.status !== 'UNCONFIGURED' && result.status !== 'MANUAL') return null;
              return <PlatformNotice key={p} platform={p} result={result} />;
            })}
          </div>
        )}

        {/* Detected accounts table */}
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Cuentas Detectadas
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
                {loading ? 'Escaneando…' : 'Ver resultados'}
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
                Escaneando plataformas…
              </div>
            )}

            {!loading && !error && allProfiles.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-gray-400">
                <Eye className="h-6 w-6 text-gray-300" />
                <p>No se detectaron cuentas sospechosas en las plataformas escaneadas.</p>
                <p className="text-xs text-gray-300">
                  TikTok y Facebook requieren verificación manual (ver avisos arriba).
                </p>
              </div>
            )}

            {allProfiles.length > 0 && (
              <ProfilesTable profiles={allProfiles} />
            )}

            <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
              X escaneado via oEmbed público (gratuito, sin token) · Instagram, TikTok y Facebook requieren verificación manual.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
