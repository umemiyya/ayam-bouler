import type { HistoryEntry } from "@/types/detection";

/** Realistic seed data for the detection history table until it fills
 * up with real runs. Timestamps are relative to "now" so the table
 * always reads as current, regardless of when the demo is viewed. */
export function generateMockHistory(): HistoryEntry[] {
  const now = Date.now();
  const hour = 1000 * 60 * 60;

  const rows: Omit<HistoryEntry, "id" | "date">[] = [
  ];

  return rows.map((row, i) => ({
    ...row,
    id: `det-${now}-${i}`,
    date: new Date(now - i * hour * 3.2).toISOString(),
  }));
}

export const mockStats = {
  imagesProcessed: 12,
  totalChickensCounted: 124,
  avgChickensPerImage: 91,
  todaysUploads: 3,
};

export type DistributionSlice = {
  label: string;
  value: number; // persentase
  color: string;
};

export const mockDistribution: DistributionSlice[] = [
  { label: "0 - 50 ekor", value: 25, color: "#22c55e" },
  { label: "51 - 100 ekor", value: 35, color: "#3b82f6" },
  { label: "101 - 150 ekor", value: 28, color: "#eab308" },
  { label: "> 150 ekor", value: 12, color: "#ef4444" },
];

export type ModelMetric = {
  label: string;
  value: number; // 0-1
};

export const mockModelPerformance: ModelMetric[] = [
  { label: "mAP@0.50", value: 0.78 },
  { label: "Precision", value: 0.89 },
  { label: "Recall", value: 0.86 },
];