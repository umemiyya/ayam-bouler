"use client";

import * as React from "react";
import {
  LayoutDashboard,
  UploadCloud,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Bird,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavKey =
  | "dashboard"
  | "upload"
  | "history"
  | "analytics"
  | "settings"
  | "help";

const NAV_ITEMS: { key: NavKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  // { key: "upload", label: "Upload Detection", icon: UploadCloud },
  // { key: "history", label: "Detection History", icon: History },
  // { key: "analytics", label: "Analytics", icon: BarChart3 },
  // { key: "settings", label: "Settings", icon: Settings },
  // { key: "help", label: "Help", icon: HelpCircle },
];

interface SidebarProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  active,
  onNavigate,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const content = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 border-b border-border-subtle px-4",
          collapsed && "justify-center px-0"
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold leading-tight">
              Detaksi
            </p>
            <p className="truncate text-[11px] text-muted-2">Menghitung Jumlah Ayam</p>
          </div>
        )}
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Primary"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onNavigate(item.key);
                onCloseMobile();
              }}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
              )}
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border-subtle p-3">
        <button
          type="button"
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "flex hidden w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            "hidden w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:flex",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-border-subtle bg-surface transition-[width] duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
      >
        <div
          onClick={onCloseMobile}
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-64 bg-surface shadow-xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
