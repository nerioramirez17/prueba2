import { Header } from '@/components/layout/Header';
import { ScannerControls } from '@/components/modules/ScannerControls';
import { SeverityBadge, StatusBadge } from '@/components/layout/ThreatBadge';
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
import { ExternalLink, Flag, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const platformStats = [
  { name: 'Instagram', handle: '@cocoscapital_oficial', fake: 4, verified: false, color: 'bg-pink-50', textColor: 'text-pink-600', emoji: '📸' },
  { name: 'X (Twitter)', handle: '@CocosCapital', fake: 2, verified: true, color: 'bg-sky-50', textColor: 'text-sky-600', emoji: '𝕏' },
  { name: 'LinkedIn', handle: 'Cocos Capital', fake: 1, verified: false, color: 'bg-blue-50', textColor: 'text-blue-600', emoji: 'in' },
  { name: 'Facebook', handle: 'Cocos Capital AR', fake: 3, verified: false, color: 'bg-indigo-50', textColor: 'text-indigo-600', emoji: 'f' },
  { name: 'TikTok', handle: '@cocos.capital', fake: 2, verified: false, color: 'bg-gray-100', textColor: 'text-gray-600', emoji: '♪' },
];

const mockAccounts = [
  {
    id: '1',
    platform: 'Instagram',
    username: '@CocosCapital_Oficial',
    displayName: 'Cocos Capital (Oficial)',
    followers: 12400,
    bio: 'Inversiones en Argentina 🇦🇷 Descargá la app y empezá a invertir. Link en bio 👇',
    severity: 'HIGH' as const,
    status: 'TAKEDOWN_REQUESTED' as const,
    reportedAt: new Date('2025-03-01'),
  },
  {
    id: '2',
    platform: 'Instagram',
    username: '@cocos.capital.app',
    displayName: 'Cocos Capital App',
    followers: 3200,
    bio: 'La app de inversiones más fácil de Argentina. Registrate gratis.',
    severity: 'HIGH' as const,
    status: 'CONFIRMED' as const,
    reportedAt: new Date('2025-03-05'),
  },
  {
    id: '3',
    platform: 'Facebook',
    username: 'Cocos Capital Inversiones',
    displayName: 'Cocos Capital Inversiones AR',
    followers: 8700,
    bio: 'Plataforma de inversiones. Soporte: cocoscapital-ar.com',
    severity: 'CRITICAL' as const,
    status: 'CONFIRMED' as const,
    reportedAt: new Date('2025-02-28'),
  },
  {
    id: '4',
    platform: 'X (Twitter)',
    username: '@CocosCapital_AR',
    displayName: 'Cocos Capital AR 🇦🇷',
    followers: 1890,
    bio: 'Inversiones para todos los argentinos. DM para consultas.',
    severity: 'MEDIUM' as const,
    status: 'ANALYZING' as const,
    reportedAt: new Date('2025-03-08'),
  },
  {
    id: '5',
    platform: 'TikTok',
    username: '@cocos.inversiones',
    displayName: 'Cocos Inversiones',
    followers: 25600,
    bio: 'Tips de inversión en Argentina 🚀 App link en bio',
    severity: 'HIGH' as const,
    status: 'DETECTED' as const,
    reportedAt: new Date('2025-03-10'),
  },
];

export default function SocialPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Social Media Monitor"
        subtitle="Detección de cuentas falsas en redes sociales"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Platform cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {platformStats.map((p) => (
            <Card key={p.name} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${p.color} ${p.textColor}`}>
                    {p.emoji}
                  </span>
                  {p.fake > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                      {p.fake}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500">{p.handle}</p>
                {p.verified && (
                  <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                    ✓ Verificada
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Cuentas falsas activas', value: 12, color: 'text-red-600' },
            { label: 'Reportes enviados', value: 8, color: 'text-orange-600' },
            { label: 'Eliminadas (30d)', value: 5, color: 'text-green-600' },
          ].map((s) => (
            <Card key={s.label} className="border border-gray-200">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Cuentas Reportadas
            </CardTitle>
            <ScannerControls module="Redes" lastScan="hace 30 minutos" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Plataforma</TableHead>
                  <TableHead className="text-xs">Usuario</TableHead>
                  <TableHead className="text-xs">Seguidores</TableHead>
                  <TableHead className="text-xs">Bio</TableHead>
                  <TableHead className="text-xs">Severidad</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Reportada</TableHead>
                  <TableHead className="text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAccounts.map((a) => (
                  <TableRow key={a.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{a.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900">{a.username}</p>
                      <p className="text-xs text-gray-500">{a.displayName}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {a.followers.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate text-xs text-gray-500">{a.bio}</p>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={a.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDate(a.reportedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Flag className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
