'use client';

import { User as UserIcon, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/features/logout-button';
import type { UserRole } from '@/types/auth';

interface ProfilClientProps {
  username: string;
  role: UserRole;
  createdAt: string;
}

export function ProfilClient({ username, role, createdAt }: ProfilClientProps) {

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="mt-1 text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-8 w-8 text-primary" />
          </span>
          <div>
            <CardTitle>{username}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Akun Dibuat Pada</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Total Scan Dilakukan</p>
            <p className="text-lg font-semibold">{history.length}</p>
          </div>
        </CardContent>
      </Card>

      <LogoutButton variant="button" />
    </div>
  );
}