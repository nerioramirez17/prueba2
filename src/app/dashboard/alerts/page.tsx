import { Header } from '@/components/layout/Header';
import { SeverityBadge } from '@/components/layout/ThreatBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, XCircle, Slack, Mail, Webhook } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const mockAlerts = [
  {
    id: '1',
    message: '🚨 CRÍTICA: Dominio phishing cocos-cap1tal.com detectado (risk score: 92)',
    channel: 'SLACK',
    status: 'SENT',
    severity: 'CRITICAL' as const,
    sentAt: new Date(Date.now() - 1000 * 60 * 30),
    threat: 'cocos-cap1tal.com',
  },
  {
    id: '2',
    message: '⚠️ ALTA: Nueva URL maliciosa detectada: cocoscapital-login.net',
    channel: 'SLACK',
    status: 'SENT',
    severity: 'HIGH' as const,
    sentAt: new Date(Date.now() - 1000 * 60 * 120),
    threat: 'cocoscapital-login.net',
  },
  {
    id: '3',
    message: '📧 Resumen semanal de amenazas: 12 nuevas, 5 resueltas',
    channel: 'EMAIL',
    status: 'SENT',
    severity: 'MEDIUM' as const,
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    threat: 'Reporte semanal',
  },
  {
    id: '4',
    message: '🔴 CRÍTICA: 1.234 emails @cocos-capital.com.ar en filtración "Combolist AR 2025"',
    channel: 'SLACK',
    status: 'FAILED',
    severity: 'CRITICAL' as const,
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    threat: 'Dark web breach',
  },
  {
    id: '5',
    message: '⚠️ ALTA: 3 nuevas cuentas falsas en Instagram (@CocosCapital_Oficial)',
    channel: 'EMAIL',
    status: 'SENT',
    severity: 'HIGH' as const,
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    threat: '@CocosCapital_Oficial',
  },
  {
    id: '6',
    message: 'Webhook: Nuevo takedown request enviado a GoDaddy para cocos-cap1tal.com',
    channel: 'WEBHOOK',
    status: 'SENT',
    severity: 'HIGH' as const,
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    threat: 'Takedown GoDaddy',
  },
];

const channelIcon = {
  SLACK: <Slack className="h-4 w-4 text-purple-600" />,
  EMAIL: <Mail className="h-4 w-4 text-blue-600" />,
  WEBHOOK: <Webhook className="h-4 w-4 text-gray-600" />,
};

export default function AlertsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Alertas & Notificaciones"
        subtitle="Historial de alertas enviadas y configuración de canales"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Channel status */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              name: 'Slack',
              icon: <Slack className="h-5 w-5 text-purple-600" />,
              status: 'Activo',
              channel: '#security-alerts',
              bg: 'bg-purple-50',
            },
            {
              name: 'Email',
              icon: <Mail className="h-5 w-5 text-blue-600" />,
              status: 'Activo',
              channel: 'security@cocos-capital.com.ar',
              bg: 'bg-blue-50',
            },
            {
              name: 'Webhook',
              icon: <Webhook className="h-5 w-5 text-gray-600" />,
              status: 'Inactivo',
              channel: 'No configurado',
              bg: 'bg-gray-100',
            },
          ].map((ch) => (
            <Card key={ch.name} className="border border-gray-200">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${ch.bg}`}>
                  {ch.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{ch.name}</p>
                  <p className="text-xs text-gray-500">{ch.channel}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      ch.status === 'Activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {ch.status}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Configurar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Enviadas (30d)', value: 47, color: 'text-blue-600' },
            { label: 'Fallidas', value: 3, color: 'text-red-600' },
            { label: 'Pendientes', value: 2, color: 'text-yellow-600' },
          ].map((s) => (
            <Card key={s.label} className="border border-gray-200">
              <CardContent className="flex items-center gap-3 p-4">
                <Bell className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert timeline */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Timeline de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {channelIcon[alert.channel as keyof typeof channelIcon]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{alert.message}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <SeverityBadge severity={alert.severity} />
                      <span className="text-xs text-gray-400">
                        {formatDateTime(alert.sentAt)}
                      </span>
                      <span className="text-xs text-gray-400">via {alert.channel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.status === 'SENT' ? (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Enviada
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <XCircle className="h-3.5 w-3.5" />
                        Fallida
                      </div>
                    )}
                    {alert.status === 'FAILED' && (
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Reintentar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
