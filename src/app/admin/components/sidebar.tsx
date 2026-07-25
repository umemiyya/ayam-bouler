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
    <aside className="flex h-screen w-64 shrink-0 fixed flex-col border-r border-[#80775C]/20 bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FAE8B4] bg-[#FAE8B4]/40">
          <ScanFace className="h-5 w-5 text-[#80775C]" />
        </div>
        <span className="text-sm font-bold text-[#80775C]">DeepShield AI</span>
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
                  ? 'bg-[#80775C] text-white'
                  : 'text-[#80775C]/70 hover:bg-[#80775C]/5 hover:text-[#80775C]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 text-[11px] font-mono uppercase tracking-[0.2em] text-[#80775C]/60">
        Panel Admin
      </div>
    </aside>
  );
}