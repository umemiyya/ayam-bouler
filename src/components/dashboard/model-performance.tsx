"use client";

import * as React from "react";
import { Activity, Target, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelMetric } from "@/lib/mock-data";

const icons = [Activity, Target, RotateCcw];

export function ModelPerformance({ metrics }: { metrics: ModelMetric[] }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">Performa Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((m, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={m.label} className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="w-24 shrink-0 text-sm text-zinc-300">{m.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${m.value * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-medium text-white">
                {m.value.toFixed(2)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}