'use client';

export function DashboardClient({ username }: { username: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Halo, {username} 👋</h1>
        <p className="mt-1 text-muted-foreground">Berikut ringkasan aktivitas analisis kulit Anda.</p>
      </div>
    </div>
  );
}