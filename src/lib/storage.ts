import type { HistoryEntry } from "@/types/detection";

const HISTORY_KEY = "flockvision:history";
const STATS_KEY = "flockvision:stats";

export type DetectionStats = {
  imagesProcessed: number;
  totalChickensCounted: number;
  avgChickensPerImage: number;
  todaysUploads: number;
};

/** Ambil riwayat deteksi yang tersimpan di localStorage. Aman dipanggil di SSR (return []). */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // storage penuh / tidak tersedia (mis. private mode) — abaikan diam-diam
  }
}

export function loadStats(): DetectionStats | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    return raw ? (JSON.parse(raw) as DetectionStats) : null;
  } catch {
    return null;
  }
}

export function saveStats(stats: DetectionStats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function clearStoredData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
  window.localStorage.removeItem(STATS_KEY);
}

/** Hitung ulang stat cards langsung dari riwayat — dipakai di halaman /history agar selalu akurat. */
export function computeStatsFromHistory(history: HistoryEntry[]): DetectionStats {
  const successEntries = history.filter((h) => h.status === "success" && h.count != null);
  const totalChickensCounted = successEntries.reduce((sum, h) => sum + (h.count ?? 0), 0);
  const avgChickensPerImage = successEntries.length
    ? Math.round(totalChickensCounted / successEntries.length)
    : 0;
  const todayStr = new Date().toDateString();
  const todaysUploads = history.filter((h) => new Date(h.date).toDateString() === todayStr).length;

  return {
    imagesProcessed: history.length,
    totalChickensCounted,
    avgChickensPerImage,
    todaysUploads,
  };
}