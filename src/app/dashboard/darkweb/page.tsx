'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ScannerControls } from '@/components/modules/ScannerControls';
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
import { Search, Database, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const mockBreaches = [
  {
    id: '1',
    email: 'carlos.rodriguez@cocos-capital.com.ar',
    breachName: 'LinkedIn 2024',
    breachDate: new Date('2024-08-15'),
    dataClasses: ['Emails', 'Contraseñas', 'Nombres'],
    severity: 'CRITICAL' as const,
    status: 'CONFIRMED' as const,
    notified: true,
  },
  {
    id: '2',
    email: 'maria.gonzalez@cocos-capital.com.ar',
    breachName: 'Trello Breach 2023',
    breachDate: new Date('2023-11-20'),
    dataClasses: ['Emails', 'Nombres de usuario'],
    severity: 'MEDIUM' as const,
    status: 'RESOLVED' as const,
    notified: true,
  },
  {
    id: '3',
    email: 'juan.perez@cocos-capital.com.ar',
    breachName: 'Combolist Argentina 2025',
    breachDate: new Date('2025-01-05'),
    dataClasses: ['Emails', 'Contraseñas (hash)', 'Teléfonos'],
    severity: 'CRITICAL' as const,
    status: 'DETECTED' as const,
    notified: false,
  },
  {
    id: '4',
    email: 'soporte@cocos-capital.com.ar',
    breachName: 'Canva 2023',
    breachDate: new Date('2023-06-01'),
    dataClasses: ['Emails', 'Nombres', 'Países'],
    severity: 'LOW' as const,
    status: 'RESOLVED' as const,
    notified: true,
  },
  {
    id: '5',
    email: 'desarrollo@cocos-capital.com.ar',
    breachName: 'GitHub Token Leak 2025',
    breachDate: new Date('2025-02-18'),
    dataClasses: ['Tokens de acceso', 'Emails', 'Repositorios privados'],
    severity: 'CRITICAL' as const,
    status: 'CONFIRMED' as const,
    notified: false,
  },
];

export default function DarkWebPage() {
  const [emailSearch, setEmailSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<null | { found: boolean; count: number }>(null);

  const handleSearch = async () => {
    if (!emailSearch) return;
    setSearching(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSearchResult({ found: true, count: 3 });
    setSearching(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Dark Web Monitor"
        subtitle="Monitoreo de filtraciones de credenciales corporativas"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Emails comprometidos', value: 1234, color: 'text-red-600', icon: <Mail className="h-4 w-4 text-red-600" /> },
            { label: 'Filtraciones activas', value: 8, color: 'text-orange-600', icon: <AlertTriangle className="h-4 w-4 text-orange-600" /> },
            { label: 'Emails monitoreados', value: 847, color: 'text-blue-600', icon: <Database className="h-4 w-4 text-blue-600" /> },
            { label: 'Resueltas', value: 23, color: 'text-green-600', icon: <ShieldCheck className="h-4 w-4 text-green-600" /> },
          ].map((s) => (
            <Card key={s.label} className="border border-gray-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString('es-AR')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Email search */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Buscar email en filtraciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="nombre@cocos-capital.com.ar"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!emailSearch || searching}
                variant="outline"
              >
                {searching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                    Buscando...
                  </span>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
            {searchResult && (
              <div className={`flex items-center gap-3 rounded-lg p-4 ${searchResult.found ? 'bg-red-50' : 'bg-green-50'}`}>
                {searchResult.found ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className={`font-semibold ${searchResult.found ? 'text-red-800' : 'text-green-800'}`}>
                    {searchResult.found
                      ? `⚠ Email encontrado en ${searchResult.count} filtraciones`
                      : '✓ Email no encontrado en filtraciones conocidas'}
                  </p>
                  {searchResult.found && (
                    <p className="text-sm text-red-600">Se recomienda cambio de contraseña inmediato y activar 2FA.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breaches table */}
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Filtraciones Detectadas
            </CardTitle>
            <ScannerControls module="HIBP" lastScan="hace 6 horas" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Filtración</TableHead>
                  <TableHead className="text-xs">Fecha filtración</TableHead>
                  <TableHead className="text-xs">Datos expuestos</TableHead>
                  <TableHead className="text-xs">Severidad</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Notificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBreaches.map((b) => (
                  <TableRow key={b.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{b.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-800">{b.breachName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(b.breachDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {b.dataClasses.slice(0, 2).map((dc) => (
                          <span
                            key={dc}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {dc}
                          </span>
                        ))}
                        {b.dataClasses.length > 2 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            +{b.dataClasses.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={b.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell>
                      {b.notified ? (
                        <span className="text-xs text-green-600">✓ Sí</span>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-orange-600 border-orange-200">
                          Notificar
                        </Button>
                      )}
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
