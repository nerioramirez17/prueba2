import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentThreats } from '@/components/dashboard/RecentThreats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Link2, Users, Database } from 'lucide-react';

const moduleStats = [
  { name: 'Domain Watchdog', icon: Globe, active: 12, total: 156, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'URL Analyzer', icon: Link2, active: 5, total: 89, color: 'text-red-600', bg: 'bg-red-50' },
  { name: 'Social Monitor', icon: Users, active: 4, total: 23, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Dark Web', icon: Database, active: 2, total: 11, color: 'text-gray-600', bg: 'bg-gray-100' },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header
        title="Dashboard"
        subtitle="Resumen de amenazas y actividad del sistema"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <StatsCards />

        {/* Module summary + Recent threats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Module overview */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Resumen por Módulo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {moduleStats.map((mod) => (
                <div key={mod.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${mod.bg}`}>
                      <mod.icon className={`h-4 w-4 ${mod.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{mod.name}</p>
                      <p className="text-xs text-gray-400">{mod.total} monitoreados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-bold text-red-600">
                      {mod.active}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent threats takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentThreats />
          </div>
        </div>

        {/* Severity breakdown */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Distribución por Severidad (últimos 30 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Crítica', count: 7, color: 'bg-red-500', textColor: 'text-red-600', percent: 15 },
                { label: 'Alta', count: 12, color: 'bg-orange-500', textColor: 'text-orange-600', percent: 26 },
                { label: 'Media', count: 18, color: 'bg-yellow-500', textColor: 'text-yellow-600', percent: 39 },
                { label: 'Baja', count: 9, color: 'bg-green-500', textColor: 'text-green-600', percent: 20 },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{item.percent}% del total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
