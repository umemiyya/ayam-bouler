"use client";

import * as React from "react";
import { format } from "date-fns";
import { Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AuditLogEntry, AuditSeverity } from "@/types/admin";
import { cn } from "@/lib/utils";

const SEVERITY_META: Record<AuditSeverity, { icon: React.ElementType; className: string }> = {
  info: { icon: Info, className: "text-muted bg-surface-2" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning-soft" },
  critical: { icon: ShieldAlert, className: "text-danger bg-danger-soft" },
};

export function AuditLogPanel({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Recent admin and system actions across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {entries.map((entry, i) => {
            const meta = SEVERITY_META[entry.severity];
            const Icon = meta.icon;
            return (
              <li key={entry.id} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", meta.className)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {i < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-border-subtle" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{entry.actor}</span> {entry.action}
                    {entry.target && (
                      <>
                        {" "}
                        <span className="font-mono text-xs text-muted">{entry.target}</span>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-2">
                    {format(new Date(entry.timestamp), "MMM d, HH:mm")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}