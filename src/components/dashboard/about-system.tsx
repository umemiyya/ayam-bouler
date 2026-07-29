"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AboutSystem() {
  return (
    <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">Tentang Sistem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-md text-sm text-zinc-400">
          Sistem ini dibangun untuk membantu peternak melakukan identifikasi
          dan perhitungan ayam broiler secara otomatis menggunakan algoritma{" "}
          <span className="text-emerald-400">YOLO v12</span> yang akurat dan
          efisien.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
            Next.js
          </Badge>
          <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
            YOLOv12
          </Badge>
          <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
            PyTorch
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}