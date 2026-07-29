"use client";

import * as React from "react";
import { Gauge, Cpu, Zap, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CountMethod, DetectionMode, DetectionSettings, ModelVersion } from "@/types/detection";

interface DetectionSettingsPanelProps {
  settings: DetectionSettings;
  onChange: (settings: DetectionSettings) => void;
  disabled?: boolean;
}

const MODEL_OPTIONS: { value: ModelVersion; label: string; hint: string }[] = [
  {
    value: "flock-vision-v3",
    label: "FlockVision v3",
    hint: "Paling akurat, versi terbaru",
  },
  {
    value: "flock-vision-v2",
    label: "FlockVision v2",
    hint: "Stabil dan telah teruji di produksi",
  },
  {
    value: "flock-vision-lite",
    label: "FlockVision Lite",
    hint: "Paling cepat dengan kebutuhan komputasi lebih rendah",
  },
];

export function DetectionSettingsPanel({
  settings,
  onChange,
  disabled,
}: DetectionSettingsPanelProps) {
  const update = <K extends keyof DetectionSettings>(
    key: K,
    value: DetectionSettings[K]
  ) => onChange({ ...settings, [key]: value });

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* <ScanLine className="h-4.5 w-4.5 text-accent" /> */}
          Pengaturan Deteksi
        </CardTitle>
        <CardDescription>
          Sesuaikan cara model membaca setiap file yang diunggah.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label
              htmlFor="confidence-slider"
              className="flex items-center gap-1.5 text-sm"
            >
              <Gauge className="h-3.5 w-3.5 text-muted-2" />
              Ambang Batas Kepercayaan
            </Label>

            <span className="font-mono text-sm tabular-nums text-accent">
              {settings.confidenceThreshold}%
            </span>
          </div>

          <Slider
            id="confidence-slider"
            min={0}
            max={100}
            step={1}
            disabled={disabled}
            value={[settings.confidenceThreshold]}
            onValueChange={([v]) => update("confidenceThreshold", v)}
            aria-label="Persentase ambang batas kepercayaan"
          />

          <p className="mt-1.5 text-xs text-muted-2">
            Deteksi dengan nilai kepercayaan di bawah ambang ini tidak akan
            dihitung.
          </p>
        </div>

        <div className="hidden">
          <Label
            htmlFor="model-version"
            className="mb-2 flex items-center gap-1.5 text-sm"
          >
            <Cpu className="h-3.5 w-3.5 text-muted-2" />
            Versi Model
          </Label>

          <Select
            value={settings.modelVersion}
            onValueChange={(v) => update("modelVersion", v as ModelVersion)}
            disabled={disabled}
          >
            <SelectTrigger className="hidden" id="model-version" aria-label="Versi model">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {MODEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-xs text-muted-2">
                      {opt.hint}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden">
          <Label className="mb-2 flex items-center gap-1.5 text-sm">
            <Zap className="h-3.5 w-3.5 text-muted-2" />
            Mode Deteksi
          </Label>

          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Mode deteksi"
          >
            {(["fast", "accurate"] as DetectionMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={settings.mode === mode}
                disabled={disabled}
                onClick={() => update("mode", mode)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
                  settings.mode === mode
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border-strong bg-surface-2 text-muted hover:text-foreground"
                )}
              >
                {mode === "fast" ? "Cepat" : "Akurat"}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden">
          <Label className="mb-2 block text-sm">
            Metode Perhitungan
          </Label>

          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Metode perhitungan"
          >
            {(
              [
                {
                  value: "bounding_box",
                  label: "Kotak Pembatas",
                },
                {
                  value: "segmentation",
                  label: "Segmentasi",
                },
              ] as { value: CountMethod; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={settings.countMethod === opt.value}
                disabled={disabled}
                onClick={() => update("countMethod", opt.value)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
                  settings.countMethod === opt.value
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border-strong bg-surface-2 text-muted hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}