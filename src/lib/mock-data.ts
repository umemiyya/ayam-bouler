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
  imagesProcessed: 100,
  totalChickensCounted: 10_652,
  avgChickensPerImage: 120,
  todaysUploads: 3,
};
