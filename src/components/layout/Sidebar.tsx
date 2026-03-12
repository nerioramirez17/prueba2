'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  Link2,
  Users,
  Database,
  Bell,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Dominios', href: '/dashboard/domains', icon: Globe },
  { name: 'URLs Phishing', href: '/dashboard/phishing', icon: Link2 },
  { name: 'Redes Sociales', href: '/dashboard/social', icon: Users },
  { name: 'Dark Web', href: '/dashboard/darkweb', icon: Database },
  { name: 'Alertas', href: '/dashboard/alerts', icon: Bell },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#0f1629] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[#1e2a4a] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Cocos Security</p>
          <p className="text-xs text-slate-400">Anti-Phishing Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Módulos
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#1e2a4a] text-white'
                  : 'text-slate-400 hover:bg-[#1a2340] hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
              {item.name === 'Alertas' && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e2a4a] p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">Juan Díaz</p>
            <p className="truncate text-xs text-slate-400">ADMIN</p>
          </div>
          <button className="text-slate-400 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
