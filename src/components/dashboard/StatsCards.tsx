import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  iconBg: string;
}

const stats: Stat[] = [
  {
    label: 'Amenazas Activas',
    value: 23,
    change: '+5 esta semana',
    trend: 'up',
    icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
    iconBg: 'bg-red-100',
  },
  {
    label: 'En Análisis',
    value: 8,
    change: '3 críticas pendientes',
    trend: 'neutral',
    icon: <Clock className="h-5 w-5 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
  },
  {
    label: 'Resueltas (30d)',
    value: 47,
    change: '+12 vs mes anterior',
    trend: 'up',
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    iconBg: 'bg-green-100',
  },
  {
    label: 'Dominios Monitoreados',
    value: 156,
    change: 'Último scan: hace 2h',
    trend: 'neutral',
    icon: <AlertTriangle className="h-5 w-5 text-blue-600" />,
    iconBg: 'bg-blue-100',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {stat.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-red-500" />}
              {stat.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-green-500" />}
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
