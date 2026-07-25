"use client";

import * as React from "react";
import { Bell, Menu, Search, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "../features/logout-button";
import { ProfilClient } from "../features/profil-client";

interface HeaderProps {
  title: string;
  onOpenMobileNav: () => void;
  notificationCount?: number;
}

export function Header({ title, onOpenMobileNav, notificationCount = 3 }: HeaderProps) {

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-subtle bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
          <Input
            type="search"
            placeholder="Search detections, files..."
            aria-label="Search"
            className="w-48 pl-8 lg:w-64"
          />
        </div>
        <div>
          {/* <ProfilClient username={} /> */}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
