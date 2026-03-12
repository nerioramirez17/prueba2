'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Globe, Users, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Dominios', href: '/dashboard/domains', icon: Globe },
  { name: 'Social', href: '/dashboard/social', icon: Users },
  { name: 'Config', href: '/dashboard/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#1e2a4a] bg-[#0f1629] md:hidden safe-area-bottom">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-white' : 'text-slate-500'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive ? 'text-blue-400' : '')} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
