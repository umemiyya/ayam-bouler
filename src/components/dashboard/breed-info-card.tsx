import Image from "next/image";
import { Check } from "lucide-react";

export function BreedInfoCard() {
  return (
    <div className="space-y-3">
      {/* Card utama — gambar + deskripsi */}
      <div className="viewfinder overflow-hidden rounded-lg border border-border-subtle bg-surface-2">
        <div className="relative h-28 w-full">
          <Image
            src="/hero-chickens.avif"
            alt="Ayam Broiler Cobb 500"
            fill
            className="object-cover"
          />
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent">
            <Check className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
        </div>

        <div className="space-y-1.5 p-3">
          <p className="text-sm font-semibold text-foreground">
            Ayam Broiler <span className="text-muted-2">(Cobb 500)</span>
          </p>
          <p className="text-xs leading-relaxed text-muted">
            Sistem identifikasi dan perhitungan ayam broiler menggunakan
            algoritma <span className="text-accent">YOLO v12</span> yang akurat
            dan efisien.
          </p>
        </div>
      </div>

      {/* Dua gambar kecil sejajar */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative h-20 bg-white/85 rounded-xl">
          <Image
            src="/handayani.png"
            alt="Detail ayam broiler 1"
            fill
            className="object-contain p-1.5"
          />
        </div>
        <div className="relative h-20 bg-white/85 rounded-xl">
          <Image
            src="/bulukumba.png"
            alt="Detail ayam broiler 2"
            fill
            className="object-contain p-1.5"
          />
        </div>
      </div>
    </div>
  );
}