"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar, type NavKey } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, LayersIcon, ZapIcon, ScanEyeIcon, DatabaseIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// GANTI angka-angka di bawah ini dengan data dataset asli yang dipakai untuk
// melatih model deteksi ayam Anda. Nilai saat ini hanyalah contoh placeholder.
// ---------------------------------------------------------------------------
const DATASET_STATS = {
  totalImages: 12450,
  totalAnnotations: 184300,
  classes: 1, // "chicken"
  avgObjectsPerImage: 14.8,
};

const DATASET_SPLIT = [
  { label: "Training", percentage: 70, count: 1400, color: "bg-[#e3a53c]" },
  { label: "Validation", percentage: 20, count: 400, color: "bg-[#5d8fe0]" },
  { label: "Testing", percentage: 10, count: 200, color: "bg-[#5d6b76]" },
];

const PIPELINE_STEPS = [
  {
    icon: ImageIcon,
    title: "1. Input & Preprocessing",
    description:
      "Gambar yang diunggah diubah ukurannya (resize) dan dinormalisasi ke resolusi tetap sebelum masuk ke backbone jaringan.",
  },
  {
    icon: LayersIcon,
    title: "2. Backbone — Ekstraksi Fitur",
    description:
      "Backbone menyusun fitur gambar secara bertingkat, dari tepi dan tekstur sederhana di lapisan awal hingga pola bentuk ayam yang lebih kompleks di lapisan dalam.",
  },
  {
    icon: ZapIcon,
    title: "3. Area Attention",
    description:
      "YOLOv12 memakai mekanisme Area Attention yang membagi peta fitur menjadi beberapa area sehingga model tetap punya jangkauan pandang luas tanpa biaya komputasi kuadratik dari attention biasa. Menstabilkan proses training dan menggabungkan fitur antar lapisan secara efisien. FlashAttention dipakai agar operasi attention ini tetap cepat di GPU.",
  },
  {
    icon: ScanEyeIcon,
    title: "4. Head — Prediksi Bounding Box",
    description:
      "Head mengubah fitur yang telah diproses menjadi prediksi akhir: koordinat kotak pembatas (bounding box) untuk tiap ayam beserta skor kepercayaan (confidence).",
  },
  {
    icon: DatabaseIcon,
    title: "5. Post-processing",
    description:
      "Prediksi yang tumpang tindih disaring dengan Non-Max Suppression berdasarkan ambang batas confidence yang diatur di panel pengaturan, menghasilkan jumlah ayam akhir.",
  },
];

export default function HowItWorksPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = React.useState<NavKey>("help");
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex min-h-screen flex-1 flex-col">
        <Header title="Cara Kerja Algoritma" onOpenMobileNav={() => setMobileOpen(true)} />

        <main className="flex-1 space-y-8 px-4 py-6 sm:px-6 lg:px-8">
          {/* Intro */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>YOLOv12 — Attention-Centric Object Detection</CardTitle>
                <Badge>Model Deteksi</Badge>
              </div>
              <CardDescription>
                Sistem ini menghitung jumlah ayam broiler dalam gambar menggunakan YOLOv12, versi YOLO
                (You Only Look Once) yang untuk pertama kalinya membangun arsitektur di sekitar mekanisme
                attention, bukan hanya CNN, tanpa mengorbankan kecepatan deteksi secara real-time.
              </CardDescription>
            </CardHeader>
          </Card>

                    <Card>
            <CardHeader>
              <CardTitle>Pembagian Dataset</CardTitle>
              <CardDescription>
                Dataset dibagi menjadi tiga bagian agar performa model bisa diukur secara objektif pada
                data yang belum pernah dilihat saat training.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex h-4 w-full overflow-hidden rounded-full">
                {DATASET_SPLIT.map((part) => (
                  <div
                    key={part.label}
                    className={part.color}
                    style={{ width: `${part.percentage}%` }}
                    title={`${part.label}: ${part.percentage}%`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {DATASET_SPLIT.map((part) => (
                  <div key={part.label} className="flex items-center gap-3 rounded-lg border p-4">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${part.color}`} />
                    <div>
                      <p className="text-sm font-medium">{part.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {part.percentage}% &middot; {part.count.toLocaleString("id-ID")} gambar
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline langkah demi langkah */}
          <section aria-label="Alur kerja algoritma" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PIPELINE_STEPS.map((step) => (
              <Card key={step.title}>
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div className="mt-1 rounded-md bg-muted p-2">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription className="mt-1">{step.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </section>

          {/* Statistik dataset */}
          <section aria-label="Statistik dataset" className="grid hidden grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock label="Total Gambar" value={DATASET_STATS.totalImages.toLocaleString("id-ID")} />
            <StatBlock label="Total Anotasi" value={DATASET_STATS.totalAnnotations.toLocaleString("id-ID")} />
            <StatBlock label="Jumlah Kelas" value={String(DATASET_STATS.classes)} sub="chicken" />
            <StatBlock label="Rata-rata Objek / Gambar" value={DATASET_STATS.avgObjectsPerImage.toFixed(1)} />
          </section>

          {/* Pembagian dataset train/val/test */}
        </main>
      </div>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}