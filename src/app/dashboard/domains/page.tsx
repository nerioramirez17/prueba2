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
import { ExternalLink, MoreHorizontal, Globe2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const mockDomains = [
  {
    id: '1',
    domain: 'cocos-cap1tal.com',
    registrar: 'GoDaddy Inc.',
    country: '🇺🇸 US',
    registrationDate: new Date('2024-11-15'),
    riskScore: 92,
    severity: 'CRITICAL' as const,
    status: 'CONFIRMED' as const,
    similarityScore: 0.95,
    ip: '185.220.101.45',
  },
  {
    id: '2',
    domain: 'cocoscapital-inversiones.com',
    registrar: 'Namecheap Inc.',
    country: '🇺🇸 US',
    registrationDate: new Date('2024-12-01'),
    riskScore: 78,
    severity: 'HIGH' as const,
    status: 'ANALYZING' as const,
    similarityScore: 0.87,
    ip: '104.21.55.88',
  },
  {
    id: '3',
    domain: 'cocos-capital.net',
    registrar: 'Network Solutions',
    country: '🇨🇳 CN',
    registrationDate: new Date('2025-01-08'),
    riskScore: 65,
    severity: 'HIGH' as const,
    status: 'DETECTED' as const,
    similarityScore: 0.82,
    ip: '103.114.162.200',
  },
  {
    id: '4',
    domain: 'cocos-inversiones.com.ar',
    registrar: 'NIC Argentina',
    country: '🇦🇷 AR',
    registrationDate: new Date('2025-02-14'),
    riskScore: 45,
    severity: 'MEDIUM' as const,
    status: 'DETECTED' as const,
    similarityScore: 0.74,
    ip: '190.220.45.12',
  },
  {
    id: '5',
    domain: 'cocoscap.com',
    registrar: 'Cloudflare Registrar',
    country: '🇺🇸 US',
    registrationDate: new Date('2024-09-20'),
    riskScore: 30,
    severity: 'LOW' as const,
    status: 'FALSE_POSITIVE' as const,
    similarityScore: 0.61,
    ip: '172.67.204.14',
  },
  {
    id: '6',
    domain: 'cocos-trading.com',
    registrar: 'GoDaddy Inc.',
    country: '🇺🇸 US',
    registrationDate: new Date('2025-03-01'),
    riskScore: 82,
    severity: 'HIGH' as const,
    status: 'TAKEDOWN_REQUESTED' as const,
    similarityScore: 0.79,
    ip: '3.94.211.2',
  },
];

function RiskScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-red-500' : score >= 60 ? 'bg-orange-500' : score >= 40 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-gray-700">{score}</span>
    </div>
  );
}

export default function DomainsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Domain Watchdog"
        subtitle="Monitoreo de dominios similares a cocos-capital.com.ar"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total monitoreados', value: 156, color: 'text-gray-900' },
            { label: 'Riesgo alto/crítico', value: 23, color: 'text-red-600' },
            { label: 'Nuevos esta semana', value: 8, color: 'text-orange-600' },
            { label: 'Takedowns activos', value: 3, color: 'text-blue-600' },
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
            <ScannerControls module="Dominios" lastScan="hace 2 horas" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Dominio</TableHead>
                  <TableHead className="text-xs">Registrar</TableHead>
                  <TableHead className="text-xs">País</TableHead>
                  <TableHead className="text-xs">Registrado</TableHead>
                  <TableHead className="text-xs">Risk Score</TableHead>
                  <TableHead className="text-xs">Severidad</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDomains.map((d) => (
                  <TableRow key={d.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{d.domain}</p>
                          <p className="text-xs text-gray-400">{d.ip}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{d.registrar}</TableCell>
                    <TableCell className="text-sm">{d.country}</TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(d.registrationDate)}</TableCell>
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
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
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
