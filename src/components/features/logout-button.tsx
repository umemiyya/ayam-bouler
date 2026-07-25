'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/app/actions/auth';

interface LogoutButtonProps {
  /** 'link' = teks kecil di sidebar, 'button' = tombol penuh (mis. di halaman profil) */
  variant?: 'link' | 'button';
  className?: string;
}

export function LogoutButton({ variant = 'link', className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutAction();
    } catch (err: any) {
      // logoutAction memanggil redirect(), yang melempar NEXT_REDIRECT — itu normal.
      if (!err?.digest?.startsWith?.('NEXT_REDIRECT')) {
        setIsLoading(false);
      }
    }
  };

  if (variant === 'button') {
    return (
      <Button variant="destructive" onClick={handleLogout} disabled={isLoading} className={className}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        Keluar
      </Button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50',
        className
      )}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Keluar
    </button>
  );
}