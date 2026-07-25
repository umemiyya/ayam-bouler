'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, UserCircle2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/features/logout-button';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  title: string;
  items: NavItem[];
  username?: string;
}

export function SidebarNav({ title, items, username }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold leading-none">SkinAI</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <UserCircle2 className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="truncate text-sm font-medium">{username || 'Pengguna'}</span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}