"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Sidebar, type NavKey } from "@/components/dashboard/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatsCardsSkeleton, UploadCardSkeleton } from "@/components/dashboard/section-skeleton";
import { HistoryTable } from "@/components/dashboard/history-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loadHistory, saveHistory, saveStats, computeStatsFromHistory } from "@/lib/storage";
import type { HistoryEntry } from "@/types/detection";

export default function HistoryPage() {
  const router = useRouter();

  const [activeNav, setActiveNav] = React.useState<NavKey>("history");
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  React.useEffect(() => {
    setHistory(loadHistory());
    setLoading(false);
  }, []);

  const stats = React.useMemo(() => computeStatsFromHistory(history), [history]);

  const handleClearHistory = () => {
    const ok = window.confirm("Hapus semua riwayat deteksi? Tindakan ini tidak dapat dibatalkan.");
    if (!ok) return;
    setHistory([]);
    saveHistory([]);
    saveStats(computeStatsFromHistory([]));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header title="Riwayat Deteksi" onOpenMobileNav={() => setMobileOpen(true)} />


        <main className="flex-1 space-y-8 px-4 py-6 sm:px-6 lg:px-8">
          {/* Stat cards ringkasan seluruh riwayat */}
          <section aria-label="Statistik riwayat deteksi">
            {loading ? <StatsCardsSkeleton /> : <StatsCards {...stats} />}
          </section>

          {/* Tabel seluruh hasil deteksi */}
          <section aria-label="Tabel hasil deteksi">
            {loading ? (
              <UploadCardSkeleton />
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Semua Hasil Deteksi</CardTitle>
                    <CardDescription>
                      Data disimpan secara lokal di browser ini ({history.length} entri).
                    </CardDescription>
                  </div>
                  {history.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleClearHistory}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Riwayat
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <HistoryTable entries={history} onUploadFirst={() => router.push("/")} />
                </CardContent>
              </Card>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}