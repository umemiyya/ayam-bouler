"use client";

import * as React from "react";
import { Video, Bird, TrendingUp, Calendar, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatsCardsProps = {
  imagesProcessed: number;
  totalChickensCounted: number;
  avgChickensPerImage: number;
  todaysUploads: number;
};

function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  suffix,
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-5 w-5 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-400">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-white">{value}</p>
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          </div>
          {suffix && <p className="text-xs text-zinc-500">{suffix}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({
  imagesProcessed,
  totalChickensCounted,
  avgChickensPerImage,
  todaysUploads,
}: StatsCardsProps) {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={Video}
        iconBg="#22c55e"
        label="Total Analisis"
        value={imagesProcessed.toLocaleString("id-ID")}
        suffix="Gambar telah dianalisis"
      />
      <StatCard
        icon={Bird}
        iconBg="#22c55e"
        label="Total Ayam Terdeteksi"
        value={totalChickensCounted.toLocaleString("id-ID")}
        suffix="Ekor keseluruhan"
      />
      <StatCard
        icon={Calendar}
        iconBg="#8b5cf6"
        label="Analisis Terakhir"
        value={today}
        suffix={`${todaysUploads} unggahan hari ini`}
      />
    </div>
  );
}