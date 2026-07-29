"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sidebar, type NavKey } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatsCardsSkeleton, UploadCardSkeleton } from "@/components/dashboard/section-skeleton";
import { UploadZone, type SelectedFile } from "@/components/dashboard/upload-zone";
// import { DetectionSettingsPanel } from "@/components/dashboard/detection-settings";
import { AnalysisPanel } from "@/components/dashboard/analysis-panel";
import { HistoryTable } from "@/components/dashboard/history-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateMockHistory, mockStats, mockDistribution, mockModelPerformance } from "@/lib/mock-data";
import type { DetectionResult, DetectionSettings, HistoryEntry } from "@/types/detection";
import { useRouter } from "next/navigation";

import { HeroBanner } from "@/components/dashboard/hero-banner";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DistributionChart } from "@/components/dashboard/distribution-chart";
import { ModelPerformance } from "@/components/dashboard/model-performance";
import { AboutSystem } from "@/components/dashboard/about-system";

export default function AdminDashboardPage() {
  
  const [navTitles, setNavTitles] = React.useState<Record<NavKey, string>>({
    dashboard: "Dashboard",
    upload: "Unggah Deteksi",
    history: "Riwayat Deteksi",
    analytics: "Analitik",
    settings: "Pengaturan",
    help: "Bantuan",
  });

  // Warna thumbnail per status — sebelumnya hardcode di dalam fungsi,
  // sekarang jadi state agar bisa dikustomisasi (mis. mode gelap/terang).
const [statusColors, setStatusColors] = React.useState({
  success: "#22c55e",
  no_chickens: "#5d6b76",
  failed: "#ef4444",
});

  // Layout / state navigasi
  const [activeNav, setActiveNav] = React.useState<NavKey>("dashboard");
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  // State unggah / deteksi
  const [selected, setSelected] = React.useState<SelectedFile | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Pengaturan deteksi default — dipindah menjadi state di dalam komponen
  // (sebelumnya konstanta DEFAULT_SETTINGS di luar komponen / hardcode).
  const [settings, setSettings] = React.useState<DetectionSettings>({
    confidenceThreshold: 50,
    modelVersion: "flock-vision-v3",
    mode: "accurate",
    countMethod: "bounding_box",
  });

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<DetectionResult | null>(null);

  // State riwayat + statistik (diisi dengan data mock yang realistis)
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [stats, setStats] = React.useState(mockStats);

  const uploadSectionRef = React.useRef<HTMLDivElement>(null);
  const progressTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setHistory(generateMockHistory());
      setInitialLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const scrollToUpload = () => {
    setActiveNav("upload");
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetForNewUpload = () => {
    setResult(null);
    setUploadError(null);
  };

  const handleSelect = (file: SelectedFile | null) => {
    setSelected(file);
    resetForNewUpload();
  };

  const handleUploadAnother = () => {
    if (selected) URL.revokeObjectURL(selected.previewUrl);
    setSelected(null);
    resetForNewUpload();
  };

  const runAnalysis = async () => {
    if (!selected) {
      setUploadError("Silakan unggah gambar terlebih dahulu.");
      return;
    }
    if (selected.kind === "video") {
      // Endpoint /api/detect saat ini hanya menganalisis satu frame gambar diam.
      setUploadError("Analisis video memerlukan pengambilan frame terlebih dahulu — silakan unggah gambar diam.");
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setProgress(8);

    // Animasikan progres secara halus selagi menunggu respons server,
    // dibatasi tidak sampai 100% sebelum hasil benar-benar diterima.
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.random() * 9 : p));
    }, 350);

    const formData = new FormData();
    formData.append("file", selected.file);
    formData.append("confidenceThreshold", String(settings.confidenceThreshold));
    formData.append("countMethod", settings.countMethod);
    formData.append("modelVersion", settings.modelVersion);
    formData.append("mode", settings.mode);

    const startedAt = Date.now();

    try {
      const controller = new AbortController();
      const res = await fetch("/api/detect", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      let data: {
        success: boolean;
        status: DetectionResult["status"] | "no_file" | "unsupported_type" | "too_large";
        message?: string;
        reason?: string;
        count?: number;
        confidence?: number;
        detections?: DetectionResult extends { status: "success"; detections: infer D } ? D : never;
        processingTimeMs?: number;
      };

      try {
        data = await res.json();
        console.log(data)
      } catch {
        throw new Error("bad_json");
      }

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(100);

      const elapsed = Date.now() - startedAt;
      const finalResult = mapApiResponseToResult(data, elapsed);
      setResult(finalResult);
      applyResultSideEffects(finalResult, selected.file.name);
    } catch (err) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(100);

      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const isNetwork = err instanceof TypeError; // fetch melempar TypeError saat gagal jaringan
      const finalResult: DetectionResult = isAbort
        ? { status: "timeout" }
        : isNetwork
          ? { status: "network_error" }
          : { status: "api_error", message: "Layanan sedang tidak tersedia." };

      setResult(finalResult);
      applyResultSideEffects(finalResult, selected.file.name);
    } finally {
      setIsProcessing(false);
    }
  };

  function mapApiResponseToResult(
    data: {
      success: boolean;
      status: string;
      message?: string;
      reason?: string;
      count?: number;
      confidence?: number;
      detections?: DetectionResult extends { status: "success"; detections: infer D } ? D : never;
      processingTimeMs?: number;
    },
    fallbackElapsed: number
  ): DetectionResult {
    const processingTimeMs = data.processingTimeMs ?? fallbackElapsed;

    switch (data.status) {
      case "success":
        return {
          status: "success",
          count: data.count ?? 0,
          confidence: data.confidence ?? 0,
          detections: data.detections ?? [],
          processingTimeMs,
        };
      case "no_chickens":
        return { status: "no_chickens", processingTimeMs };
      case "not_a_chicken":
        return {
          status: "not_a_chicken",
          reason: data.reason ?? "Gambar ini tampaknya bukan gambar ayam.",
          processingTimeMs,
        };
      case "too_large":
      case "image_corrupted":
        return { status: "image_corrupted" };
      case "unsupported_type":
        return { status: "api_error", message: "Jenis file ini tidak didukung." };
      case "timeout":
        return { status: "timeout" };
      case "network_error":
        return { status: "network_error" };
      default:
        return { status: "api_error", message: data.message || "Layanan AI sedang tidak tersedia." };
    }
  }

  function applyResultSideEffects(finalResult: DetectionResult, filename: string) {
    const entry: HistoryEntry = {
      id: `det-${Date.now()}`,
      date: new Date().toISOString(),
      filename,
      count: finalResult.status === "success" ? finalResult.count : null,
      confidence: finalResult.status === "success" ? finalResult.confidence : null,
      durationMs:
        "processingTimeMs" in finalResult && finalResult.processingTimeMs ? finalResult.processingTimeMs : 0,
      status:
        finalResult.status === "success"
          ? "success"
          : finalResult.status === "no_chickens"
            ? "no_chickens"
            : finalResult.status === "not_a_chicken" || finalResult.status === "image_corrupted"
              ? "invalid"
              : "failed",
      thumbnailColor:
        finalResult.status === "success"
          ? statusColors.success
          : finalResult.status === "no_chickens"
            ? statusColors.no_chickens
            : statusColors.failed,
    };
    setHistory((h) => [entry, ...h]);

    if (finalResult.status === "success") {
      toast.success("Gambar berhasil dianalisis.", {
        description: `${finalResult.count.toLocaleString("id-ID")} ekor ayam terdeteksi dengan tingkat keyakinan ${Math.round(finalResult.confidence * 100)}%.`,
      });
      setStats((s) => ({
        imagesProcessed: s.imagesProcessed + 1,
        totalChickensCounted: s.totalChickensCounted + finalResult.count,
        avgChickensPerImage: Math.round(
          (s.avgChickensPerImage * s.imagesProcessed + finalResult.count) / (s.imagesProcessed + 1)
        ),
        todaysUploads: s.todaysUploads + 1,
      }));
    } else if (finalResult.status === "no_chickens") {
      toast.warning("Tidak ada ayam yang terdeteksi.", {
        description: "Coba gambar lain atau sesuaikan sudut kamera.",
      });
    } else {
      const message =
        finalResult.status === "not_a_chicken"
          ? "Gambar ini tidak mengandung ayam boiler."
          : finalResult.status === "timeout"
            ? "Proses deteksi memakan waktu lebih lama dari perkiraan."
            : finalResult.status === "network_error"
              ? "Tidak dapat terhubung ke server."
              : finalResult.status === "image_corrupted"
                ? "Gambar yang diunggah tidak dapat diproses."
                : finalResult.status === "api_error"
                  ? finalResult.message || "Layanan sedang tidak tersedia."
                  : "Deteksi gagal.";
      toast.error("Deteksi gagal.", { description: message });
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
    <Sidebar
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      mobileOpen={mobileOpen}
      onCloseMobile={() => setMobileOpen(false)}
    />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header title={navTitles[activeNav]} onOpenMobileNav={() => setMobileOpen(true)} />
          <div className="p-6">
            <HeroBanner />
          </div>

        <main className="flex-1 space-y-8 px-4 py-6 sm:px-6 lg:px-8">
            <section aria-label="Statistik utama">
              {initialLoading ? <StatsCardsSkeleton /> : <StatsCards {...stats} />}
            </section>

          {/* Bagian 2 & 3 — Unggah + Pengaturan */}
          <div className="grid grid-cols-1 gap-6">
            <section
              ref={uploadSectionRef}
              aria-label="Unggah dan pengaturan deteksi"
              className="grid grid-cols-1 gap-4"
            >
            <div className="">
              {initialLoading ? (
                <UploadCardSkeleton />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Unggah Deteksi</CardTitle>
                    <CardDescription>
                      Unggah gambar atau video ayam broiler untuk menjalankan penghitungan berbasis AI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <UploadZone
                      selected={selected}
                      onSelect={handleSelect}
                      uploadProgress={null}
                      disabled={isProcessing}
                      error={uploadError}
                      onErrorChange={setUploadError}
                    />

                    {/* Bagian 4 — Tombol proses + hasil */}
                    <AnalysisPanel
                      selected={selected}
                      isProcessing={isProcessing}
                      progress={progress}
                      result={result}
                      onAnalyze={runAnalysis}
                      onRetry={runAnalysis}
                      onUploadAnother={handleUploadAnother}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
           {/* <section className="flex flex-col gap-6">
              <DistributionChart data={mockDistribution} />
              <ModelPerformance metrics={mockModelPerformance} />
              
            </section> */}
          </div>

            {/* Riwayat deteksi */}
            <section aria-label="Riwayat deteksi" className="grid gap-6 grid-cols-3">
              <div className="col-span-2">
                <HistoryTable entries={history} onUploadFirst={scrollToUpload} />
              </div>
              <div className="col-span-1">
              <AboutSystem />
              </div>
            </section>
          </main>
      </div>
    </div>
  );
}