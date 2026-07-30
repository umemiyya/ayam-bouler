"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sidebar, type NavKey } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatsCardsSkeleton, UploadCardSkeleton } from "@/components/dashboard/section-skeleton";
import { UploadZone, type SelectedFile } from "@/components/dashboard/upload-zone";
import { DetectionSettingsPanel } from "@/components/dashboard/detection-settings";
import { AnalysisPanel } from "@/components/dashboard/analysis-panel";
import { HistoryTable } from "@/components/dashboard/history-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateMockHistory, mockStats } from "@/lib/mock-data";
import { loadHistory, saveHistory, loadStats, saveStats } from "@/lib/storage";
import type { DetectionResult, DetectionSettings, HistoryEntry } from "@/types/detection";

const NAV_TITLES: Record<NavKey, string> = {
  dashboard: "Dashboard",
  upload: "Upload Detection",
  history: "Detection History",
  deteksi: "Deteksi",
  settings: "Settings",
  help: "Help",
};

const DEFAULT_SETTINGS: DetectionSettings = {
  confidenceThreshold: 90,
  modelVersion: "flock-vision-v3",
  mode: "accurate",
  countMethod: "bounding_box",
};

export default function AdminDashboardPage() {
  // Layout / navigation state
  const [activeNav, setActiveNav] = React.useState<NavKey>("dashboard");
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  // Upload / detection state
  const [selected, setSelected] = React.useState<SelectedFile | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<DetectionSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<DetectionResult | null>(null);

  // History + stats state — sumber kebenaran awal adalah localStorage, mock data hanya dipakai
  // sebagai seed pertama kali (biar halaman /history tidak kosong sama sekali saat demo).
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [stats, setStats] = React.useState(mockStats);

  const uploadSectionRef = React.useRef<HTMLDivElement>(null);
  const progressTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Dipakai untuk mencegah penulisan ke localStorage sebelum data awal selesai dimuat
  // (kalau tidak, render pertama akan menimpa data tersimpan dengan array kosong).
  const hasHydratedRef = React.useRef(false);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const storedHistory = loadHistory();
      const storedStats = loadStats();

      if (storedHistory.length > 0) {
        setHistory(storedHistory);
        if (storedStats) setStats(storedStats);
      } else {
        const seeded = generateMockHistory();
        setHistory(seeded);
        setStats(mockStats);
        saveHistory(seeded);
        saveStats(mockStats);
      }

      hasHydratedRef.current = true;
      setInitialLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  // Persist otomatis setiap kali riwayat atau stats berubah (setelah hidrasi awal selesai)
  React.useEffect(() => {
    if (!hasHydratedRef.current) return;
    saveHistory(history);
  }, [history]);

  React.useEffect(() => {
    if (!hasHydratedRef.current) return;
    saveStats(stats);
  }, [stats]);

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
      setUploadError("Please upload an image first.");
      return;
    }
    if (selected.kind === "video") {
      // The current /api/detect route analyzes a single still frame.
      setUploadError("Video analysis requires a frame to be extracted first — please upload a still image.");
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setProgress(8);

    // Smoothly animate progress while we wait on the server response,
    // capping short of 100% until we actually have a result.
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
      const isNetwork = err instanceof TypeError; // fetch throws TypeError on network failure
      const finalResult: DetectionResult = isAbort
        ? { status: "timeout" }
        : isNetwork
          ? { status: "network_error" }
          : { status: "api_error", message: "Terdapat kesalahan!." };

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
        return { status: "not_a_chicken", reason: data.reason ?? "This does not appear to be a chicken image.", processingTimeMs };
      case "too_large":
      case "image_corrupted":
        return { status: "image_corrupted" };
      case "unsupported_type":
        return { status: "api_error", message: "This file type is not supported." };
      case "timeout":
        return { status: "timeout" };
      case "network_error":
        return { status: "network_error" };
      default:
        return { status: "api_error", message: data.message || "Terdapat kesalahan." };
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
          ? "#e3a53c"
          : finalResult.status === "no_chickens"
            ? "#5d6b76"
            : "#e0685f",
    };
    setHistory((h) => [entry, ...h]);

    if (finalResult.status === "success") {
      toast.success("Image analyzed successfully.", {
        description: `${finalResult.count.toLocaleString()} chickens detected at ${Math.round(finalResult.confidence * 100)}% confidence.`,
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
      toast.warning("No chickens detected.", {
        description: "Try another image or adjust the camera angle.",
      });
    } else {
      const message =
        finalResult.status === "not_a_chicken"
          ? "Tidak ada ayam boiler pada gambar!"
          : finalResult.status === "timeout"
            ? "Detection is taking longer than expected."
            : finalResult.status === "network_error"
              ? "Unable to connect to server."
              : finalResult.status === "image_corrupted"
                ? "The uploaded image cannot be processed."
                : finalResult.status === "api_error"
                  ? finalResult.message || "Terdapat kesalahan."
                  : "Detection failed.";
      toast.error("Detection failed.", { description: message });
    }
  }

  return (
    <div className="flex min-h-screen bg-background">

      <div className="flex min-h-screen flex-1 flex-col">
        <Header title={NAV_TITLES[activeNav]} onOpenMobileNav={() => setMobileOpen(true)} />

        <main className="flex-1 space-y-8 px-4 py-6 sm:px-6 lg:px-8">
          {/* Section 1 — Stats */}
          <section className="hidden" aria-label="Key statistics">
            {initialLoading ? <StatsCardsSkeleton /> : <StatsCards {...stats} />}
          </section>

          {/* Section 2 & 3 — Upload + Settings */}
          <section ref={uploadSectionRef} aria-label="Upload and detection settings" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {initialLoading ? (
                <UploadCardSkeleton />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Detection</CardTitle>
                    <CardDescription>
                      Upload a broiler chicken image or video to run AI-powered counting.
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

                    {/* Section 4 — Process button + results */}
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

            <div>
              {initialLoading ? (
                <UploadCardSkeleton />
              ) : (
                <DetectionSettingsPanel settings={settings} onChange={setSettings} disabled={isProcessing} />
              )}
            </div>
          </section>

          {/* Detection history (ringkasan terbaru saja — riwayat lengkap ada di /history) */}
          <section aria-label="Detection history">
            <HistoryTable entries={history.slice(0, 10)} onUploadFirst={scrollToUpload} />
          </section>
        </main>
      </div>
    </div>
  );
}