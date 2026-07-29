"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DistributionSlice } from "@/lib/mock-data";

export function DistributionChart({ data }: { data: DistributionSlice[] }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base text-white">Distribusi Jumlah Ayam</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((slice) => (
                  <Cell key={slice.label} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex-1 space-y-2">
          {data.map((slice) => (
            <li key={slice.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-300">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                />
                {slice.label}
              </span>
              <span className="font-medium text-white">{slice.value}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}