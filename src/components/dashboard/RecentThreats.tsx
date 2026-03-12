import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeverityBadge, StatusBadge } from '@/components/layout/ThreatBadge';
import { formatRelativeTime } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Globe, Link2, Users, Database } from 'lucide-react';

const mockThreats = [
  {
    id: '1',
    type: 'DOMAIN',
    title: 'cocos-cap1tal.com',
    severity: 'CRITICAL' as const,
    status: 'CONFIRMED' as const,
    detectedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: 'PHISHING_URL',
    title: 'https://cocoscapital-login.net/auth',
    severity: 'HIGH' as const,
    status: 'ANALYZING' as const,
    detectedAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: '3',
    type: 'SOCIAL_MEDIA',
    title: '@CocosCapital_Oficial (Instagram)',
    severity: 'HIGH' as const,
    status: 'TAKEDOWN_REQUESTED' as const,
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '4',
    type: 'DARK_WEB',
    title: 'Filtración: 1.200 emails @cocos-capital.com.ar',
    severity: 'CRITICAL' as const,
    status: 'DETECTED' as const,
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: '5',
    type: 'DOMAIN',
    title: 'cocos-inversiones.com',
    severity: 'MEDIUM' as const,
    status: 'DETECTED' as const,
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

const typeIcon = {
  DOMAIN: <Globe className="h-4 w-4 text-blue-500" />,
  PHISHING_URL: <Link2 className="h-4 w-4 text-red-500" />,
  SOCIAL_MEDIA: <Users className="h-4 w-4 text-purple-500" />,
  DARK_WEB: <Database className="h-4 w-4 text-gray-500" />,
};

const typeLabel = {
  DOMAIN: 'Dominio',
  PHISHING_URL: 'URL',
  SOCIAL_MEDIA: 'Redes',
  DARK_WEB: 'Dark Web',
};

export function RecentThreats() {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">
          Amenazas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-500">Tipo</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Amenaza</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Severidad</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Estado</TableHead>
              <TableHead className="text-xs font-medium text-gray-500">Detectada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockThreats.map((threat) => (
              <TableRow key={threat.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {typeIcon[threat.type as keyof typeof typeIcon]}
                    <span className="text-xs text-gray-500">
                      {typeLabel[threat.type as keyof typeof typeLabel]}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="max-w-xs truncate text-sm font-medium text-gray-900 block">
                    {threat.title}
                  </span>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={threat.severity} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={threat.status} />
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatRelativeTime(threat.detectedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
