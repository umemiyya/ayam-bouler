import type { HistoryEntry } from "@/types/detection";

/**
 * Lapisan penyimpanan lokal (localStorage) untuk riwayat deteksi & statistik.
 * Semua fungsi di sini aman dipanggil di server (SSR) — akan no-op/return
 * nilai default kalau `window` belum tersedia.
 */

const HISTORY_KEY = "chicken-detector:history";
const STATS_KEY = "chicken-detector:stats";

// Batasi jumlah entri yang disimpan supaya localStorage (biasanya ~5MB)
// tidak penuh kalau user melakukan ratusan/ribuan deteksi.
const MAX_HISTORY_ENTRIES = 500;

export interface DetectionStats {
  // Nama field ini SENGAJA disamakan persis dengan props yang dibutuhkan
  // komponen <StatsCards />, karena dipakai lewat spread: {...stats}
  imagesProcessed: number;
  totalChickensCounted: number;
  avgChickensPerImage: number;
  todaysUploads: number;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/** Ambil seluruh riwayat deteksi dari localStorage. */
export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(HISTORY_KEY);
  const parsed = safeParse<HistoryEntry[]>(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Simpan riwayat deteksi ke localStorage.
 * Mengembalikan `true` jika berhasil, `false` jika gagal
 * (mis. quota localStorage penuh, mode privat browser, dsb).
 */
export function saveHistory(entries: HistoryEntry[]): boolean {
  if (!isBrowser()) return false;
  try {
    const trimmed = entries.slice(0, MAX_HISTORY_ENTRIES);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
}

/** Ambil statistik ringkasan yang sudah tersimpan (cache). */
export function loadStats(): DetectionStats {
  if (!isBrowser()) return computeStatsFromHistory([]);
  const raw = window.localStorage.getItem(STATS_KEY);
  return safeParse<DetectionStats>(raw, computeStatsFromHistory([]));
}

/** Simpan statistik ringkasan ke localStorage. */
export function saveStats(stats: DetectionStats): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return true;
  } catch {
    return false;
  }
}

/** Hapus semua riwayat & statistik (mis. untuk tombol "Bersihkan Riwayat"). */
export function clearHistory(): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
    window.localStorage.removeItem(STATS_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hitung ulang statistik ringkasan dari daftar riwayat deteksi.
 * Hanya entri dengan status "success" yang dihitung ke total ayam / rata-rata,
 * karena entri gagal/tidak ada ayam tidak punya `count` yang valid.
 */
export function computeStatsFromHistory(entries: HistoryEntry[]): DetectionStats {
  const imagesProcessed = entries.length;

  const successfulEntries = entries.filter(
    (e): e is HistoryEntry & { count: number } => e.status === "success" && e.count !== null
  );

  const totalChickensCounted = successfulEntries.reduce((sum, e) => sum + e.count, 0);

  const avgChickensPerImage =
    successfulEntries.length > 0
      ? Math.round((totalChickensCounted / successfulEntries.length) * 10) / 10
      : 0;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysUploads = entries.filter(
    (e) => new Date(e.date).getTime() >= startOfToday.getTime()
  ).length;

  return {
    imagesProcessed,
    totalChickensCounted,
    avgChickensPerImage,
    todaysUploads,
  };
}