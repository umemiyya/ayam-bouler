// "use client";

// import * as React from "react";
// import { motion } from "framer-motion";
// import { ImageIcon, Bird, TrendingUp, CalendarClock } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import { cn } from "@/lib/utils";

// interface StatCardDef {
//   label: string;
//   value: string;
//   delta?: string;
//   icon: React.ElementType;
//   accent: string;
// }

// interface StatsCardsProps {
//   imagesProcessed: number;
//   totalChickensCounted: number;
//   avgChickensPerImage: number;
//   todaysUploads: number;
// }

// export function StatsCards({
//   imagesProcessed,
//   totalChickensCounted,
//   avgChickensPerImage,
//   todaysUploads,
// }: StatsCardsProps) {
//   const stats: StatCardDef[] = [
//   {
//     label: "Gambar Diproses",
//     value: imagesProcessed.toLocaleString(),
//     delta: " ",
//     icon: ImageIcon,
//     accent: "text-accent bg-accent-soft",
//   },
//   {
//     label: "Total Ayam Terhitung",
//     value: totalChickensCounted.toLocaleString(),
//     delta: " ",
//     icon: Bird,
//     accent: "text-confirmed bg-confirmed-soft",
//   },
//   {
//     label: "Rata-rata per Gambar",
//     value: avgChickensPerImage.toLocaleString(),
//     delta: " ",
//     icon: TrendingUp,
//     accent: "text-[#7c9cbf] bg-[#7c9cbf1a]",
//   },
//   {
//     label: "Unggahan Hari Ini",
//     value: todaysUploads.toLocaleString(),
//     delta: " ",
//     icon: CalendarClock,
//     accent: "text-warning bg-warning-soft",
//   },
// ];

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//       {stats.map((stat, i) => (
//         <motion.div
//           key={stat.label}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
//         >
//           <Card className="viewfinder group p-5 transition-shadow hover:shadow-[0_0_0_1px_var(--border-strong)]">
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-wide text-muted-2">
//                   {stat.label}
//                 </p>
//                 <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
//                   {stat.value}
//                 </p>
//               </div>
//               <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", stat.accent)}>
//                 <stat.icon className="h-4.5 w-4.5" aria-hidden="true" />
//               </div>
//             </div>
//             {stat.delta && (
//               <p className="mt-3 text-xs text-muted-2">{stat.delta}</p>
//             )}
//           </Card>
//         </motion.div>
//       ))}
//     </div>
//   );
// }


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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        icon={TrendingUp}
        iconBg="#3b82f6"
        label="Rata-rata Akurasi"
        value={`${avgChickensPerImage}%`}
        suffix="Akurasi Model"
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