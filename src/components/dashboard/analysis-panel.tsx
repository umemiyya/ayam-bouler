"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Clock,
  RotateCcw,
  Upload,
  ServerCrash,
  ImageOff,
  Bird,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDuration, cn } from "@/lib/utils";
import type { DetectionResult } from "@/types/detection";
import type { SelectedFile } from "./upload-zone";

interface AnalysisPanelProps {
  selected: SelectedFile | null;
  isProcessing: boolean;
  progress: number; // 0-100 estimated processing progress
  result: DetectionResult | null;
  onAnalyze: () => void;
  onRetry: () => void;
  onUploadAnother: () => void;
}

function BoundingBoxPreview({
  imageUrl,
  detections,
}: {
  imageUrl: string;
  detections: Extract<DetectionResult, { status: "success" }>["detections"];
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border-subtle bg-black/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Analyzed upload with detection boxes" className="block w-full" />
      {detections.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-sm border-2 border-accent shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.width}%`,
            height: `${d.height}%`,
          }}
        />
      ))}
    </div>
  );
}

const ESTIMATED_SECONDS = 6;

export function AnalysisPanel({
  selected,
  isProcessing,
  progress,
  result,
  onAnalyze,
  onRetry,
  onUploadAnother,
}: AnalysisPanelProps) {
  const disabledReason = !selected ? "Silakan unggah gambar terlebih dahulu." : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="flex-1 sm:flex-none sm:min-w-64"
          disabled={!selected || isProcessing}
          onClick={onAnalyze}
          variant={"outline"}
          aria-describedby={disabledReason ? "analyze-disabled-hint" : undefined}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sedang Menganalisis...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Analisis Ayam
            </>
          )}
        </Button>

        {isProcessing && (
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Memproses {Math.round(progress)}%</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Est. {ESTIMATED_SECONDS}s total
              </span>
            </div>
            <Progress value={progress} aria-label="Progress proses deteksi" />
          </div>
        )}
      </div>

      {disabledReason && !isProcessing && (
        <p id="analyze-disabled-hint" className="text-sm text-muted-2">
          {disabledReason}
        </p>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ResultView
              result={result}
              previewUrl={selected?.kind === "image" ? selected.previewUrl : null}
              onRetry={onRetry}
              onUploadAnother={onUploadAnother}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultView({
  result,
  previewUrl,
  onRetry,
  onUploadAnother,
}: {
  result: DetectionResult;
  previewUrl: string | null;
  onRetry: () => void;
  onUploadAnother: () => void;
}) {
  switch (result.status) {
    case "success":
      return <SuccessResult result={result} previewUrl={previewUrl} onUploadAnother={onUploadAnother} />;

    case "no_chickens":
      return (
        <EmptyCard
          icon={<Bird className="h-8 w-8" />}
          title="Tidak ada ayam yang terdeteksi."
          subtitle="Coba gunakan gambar lain atau sesuaikan sudut pengambilan gambar."
          actions={
            <>
              <Button variant="secondary" onClick={onUploadAnother}>
                <Upload className="h-4 w-4" /> Unggah Gambar Lain
              </Button>
              <Button variant="outline" onClick={onRetry}>
                <RotateCcw className="h-4 w-4" /> Coba Lagi
              </Button>
            </>
          }
        />
      );
    case "not_a_chicken":
      return (
        <EmptyCard
          tone="warning"
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Gambar Tidak Valid"
          subtitle="Gambar ini tidak termasuk ayam boiler. Pastikan Anda mengunggah gambar ayam boiler yang jelas!"
          detail={"."}
          actions={
            <>
              <Button variant="secondary" onClick={onUploadAnother}>
                <Upload className="h-4 w-4" /> Unggah Gambar Lain
              </Button>
              <Button variant="outline" onClick={onRetry}>
                <RotateCcw className="h-4 w-4" /> Coba Lagi
              </Button>
            </>
          }
        />
      );

    case "image_corrupted":
      return (
        <EmptyCard
          tone="danger"
          icon={<ImageOff className="h-8 w-8" />}
          title="The uploaded image cannot be processed."
          subtitle="The file may be corrupted or incomplete. Try re-exporting it and uploading again."
          actions={
            <Button variant="secondary" onClick={onUploadAnother}>
              <Upload className="h-4 w-4" /> Unggah Gambar Lain
            </Button>
          }
        />
      );

    case "timeout":
      return (
        <EmptyCard
          tone="warning"
          icon={<Clock className="h-8 w-8" />}
          title="Detection is taking longer than expected."
          subtitle="The AI service didn't respond in time. This usually clears up on retry."
          actions={
            <Button onClick={onRetry}>
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
          }
        />
      );

    case "network_error":
      return (
        <EmptyCard
          tone="danger"
          icon={<WifiOff className="h-8 w-8" />}
          title="Unable to connect to server."
          subtitle="Check your internet connection and Coba Lagi."
          actions={
            <Button onClick={onRetry}>
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
          }
        />
      );

    case "api_error":
      return (
        <EmptyCard
          tone="danger"
          icon={<ServerCrash className="h-8 w-8" />}
          title="AI service is currently unavailable."
          subtitle={result.message || "Please Coba Lagi in a moment."}
          actions={
            <Button onClick={onRetry}>
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
          }
        />
      );

    default:
      return null;
  }
}

function SuccessResult({
  result,
  previewUrl,
  onUploadAnother,
}: {
  result: Extract<DetectionResult, { status: "success" }>;
  previewUrl: string | null;
  onUploadAnother: () => void;
}) {
  const confidencePct = Math.round(result.confidence * 100);
  const isLowConfidence = result.confidence < 0.5;

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
      <div className="scan-grid relative flex flex-col items-center gap-2 border-b border-border-subtle px-6 py-8 text-center">
        <Badge variant="confirmed" className="mb-1">
          <CheckCircle2 className="h-3 w-3" /> Deteksi Berhasil
        </Badge>
        <p className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-foreground sm:text-6xl">
          {result.count.toLocaleString()}
        </p>
        <p className="text-sm text-muted">ayam terdeteksi</p>
      </div>

      {previewUrl && (
        <div className="border-b border-border-subtle p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-2">
            Pratinjau Bounding Box
          </p>
          <BoundingBoxPreview imageUrl={previewUrl} detections={result.detections} />
        </div>
      )}

      {isLowConfidence && (
        <div role="alert" className="flex items-start gap-2 border-b border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Confidence Rendah</p>
            <p className="mt-0.5 text-warning/90">
              Coba pencahayaan yang lebih baik, gambar dengan resolusi lebih tinggi, atau sudut kamera dari atas untuk hasil hitung yang lebih andal.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 divide-x divide-border-subtle border-b border-border-subtle">
        <Metric label="Confidence" value={`${confidencePct}%`} highlight={isLowConfidence} />
        <Metric label="Waktu Proses" value={formatDuration(result.processingTimeMs)} />
        <Metric label="Boxes Drawn" value={result.detections.length.toLocaleString()} />
      </div>

      <div className="px-4 py-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-2">
          Confidence Skore
        </p>
        <div className="flex items-center gap-3">
          <Progress value={confidencePct} className="h-2 flex-1" aria-label="Detection accuracy" />
          <span
            className={cn(
              "font-mono text-sm tabular-nums",
              isLowConfidence ? "text-warning" : "text-confirmed"
            )}
          >
            {confidencePct}%
          </span>
        </div>
      </div>

      <div className="flex justify-end border-t border-border-subtle px-4 py-3">
        <Button variant="secondary" size="sm" onClick={onUploadAnother}>
          <Upload className="h-4 w-4" /> Unggah Gambar Lain
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-2">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-lg font-semibold tabular-nums",
          highlight ? "text-warning" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyCard({
  icon,
  title,
  subtitle,
  detail,
  actions,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  detail?: string;
  actions: React.ReactNode;
  tone?: "neutral" | "warning" | "danger";
}) {
  const toneClasses = {
    neutral: "bg-surface-2 text-muted",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
  }[tone];

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border-subtle bg-surface px-6 py-10 text-center">
      <div className={cn("flex h-16 w-16 items-center justify-center rounded-full", toneClasses)}>
        {icon}
      </div>
      <div className="max-w-sm">
        <p className="font-display text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        {detail && <p className="mt-1 text-xs text-muted-2">{detail}</p>}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div>
    </div>
  );
}
