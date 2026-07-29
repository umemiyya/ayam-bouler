'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScanFace, Database, History, Users, GitBranch } from 'lucide-react';

const menuItems = [
  { label: 'Deteksi', href: '/admin', icon: Database },
  { label: 'History', href: '/admin/history', icon: History },
  { label: 'Cara Kerja', href: '/admin/how-it-works', icon: GitBranch },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 fixed flex-col border-r border-border-subtle bg-surface">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="text-sm font-bold text-accent">Ayam Boiler</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted hover:bg-surface-2 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-2">
        Panel Admin
      </div>
    </aside>
  );
}