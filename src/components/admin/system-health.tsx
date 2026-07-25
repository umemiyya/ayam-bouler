"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ServiceStatus, ApiUsagePoint } from "@/types/admin";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  ServiceStatus["status"],
  { label: string; icon: React.ElementType; variant: "confirmed" | "warning" | "danger" }
> = {
  operational: { label: "Operational", icon: CheckCircle2, variant: "confirmed" },
  degraded: { label: "Degraded", icon: AlertTriangle, variant: "warning" },
  outage: { label: "Outage", icon: XCircle, variant: "danger" },
};

export function SystemHealthPanel({ services }: { services: ServiceStatus[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Live status of every service the dashboard depends on.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.map((s) => {
          const meta = STATUS_META[s.status];
          const Icon = meta.icon;
          return (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4.5 w-4.5",
                    meta.variant === "confirmed" && "text-confirmed",
                    meta.variant === "warning" && "text-warning",
                    meta.variant === "danger" && "text-danger"
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-2">
                    {s.latencyMs}ms avg · {s.uptimePct.toFixed(2)}% uptime (30d)
                  </p>
                </div>
              </div>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ApiUsageChart({ points }: { points: ApiUsagePoint[] }) {
  const max = Math.max(...points.map((p) => p.calls));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-accent" />
          API Usage — Last 7 Days
        </CardTitle>
        <CardDescription>Detection requests sent to the Anthropic API.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-3">
          {points.map((p) => (
            <div key={p.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-t-sm bg-accent-soft"
                  style={{ height: `${Math.max(6, (p.calls / max) * 100)}%` }}
                >
                  <div
                    className="w-full rounded-t-sm bg-accent"
                    style={{ height: p.errors > 0 ? `${Math.min(100, (p.errors / p.calls) * 100 * 6)}%` : "0%" }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-muted-2">{p.date}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-2">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-accent-soft" /> Total calls
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-accent" /> Errors
          </span>
        </div>
      </CardContent>
    </Card>
  );
}