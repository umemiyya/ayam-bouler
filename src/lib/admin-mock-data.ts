import type {
  AdminTeamMember,
  AuditLogEntry,
  ServiceStatus,
  ApiUsagePoint,
  AdminOverviewStats,
} from "@/types/admin";

export const adminOverviewStats: AdminOverviewStats = {
  totalUsers: 14,
  activeSessions: 6,
  apiCallsToday: 842,
  storageUsedGb: 68.4,
  storageLimitGb: 200,
};

export function generateTeamMembers(): AdminTeamMember[] {
  const now = Date.now();
  const min = 1000 * 60;
  return [
    { id: "u1", name: "Pri", email: "pri@flockcount.ai", role: "owner", status: "active", lastActive: new Date(now - 4 * min).toISOString(), housesAssigned: 6 },
    { id: "u2", name: "Dewi Anggraini", email: "dewi@flockcount.ai", role: "admin", status: "active", lastActive: new Date(now - 22 * min).toISOString(), housesAssigned: 4 },
    { id: "u3", name: "Budi Santoso", email: "budi@flockcount.ai", role: "operator", status: "active", lastActive: new Date(now - 55 * min).toISOString(), housesAssigned: 3 },
    { id: "u4", name: "Rian Hidayat", email: "rian@flockcount.ai", role: "operator", status: "invited", lastActive: new Date(now - 60 * min * 26).toISOString(), housesAssigned: 0 },
    { id: "u5", name: "Sri Wulandari", email: "sri@flockcount.ai", role: "viewer", status: "active", lastActive: new Date(now - 60 * min * 3).toISOString(), housesAssigned: 2 },
    { id: "u6", name: "Agus Prasetyo", email: "agus@flockcount.ai", role: "operator", status: "suspended", lastActive: new Date(now - 60 * min * 24 * 9).toISOString(), housesAssigned: 0 },
  ];
}

export function generateAuditLog(): AuditLogEntry[] {
  const now = Date.now();
  const min = 1000 * 60;
  return [
    { id: "a1", timestamp: new Date(now - 6 * min).toISOString(), actor: "pri@flockcount.ai", action: "Updated confidence threshold", target: "Detection settings", severity: "info" },
    { id: "a2", timestamp: new Date(now - 40 * min).toISOString(), actor: "dewi@flockcount.ai", action: "Invited team member", target: "rian@flockcount.ai", severity: "info" },
    { id: "a3", timestamp: new Date(now - 90 * min).toISOString(), actor: "system", action: "Anthropic API latency spike detected", target: "flock-vision-v3", severity: "warning" },
    { id: "a4", timestamp: new Date(now - 60 * min * 5).toISOString(), actor: "budi@flockcount.ai", action: "Exported detection report", target: "house-3-cam-north-0630.jpg", severity: "info" },
    { id: "a5", timestamp: new Date(now - 60 * min * 9).toISOString(), actor: "pri@flockcount.ai", action: "Suspended team member", target: "agus@flockcount.ai", severity: "critical" },
    { id: "a6", timestamp: new Date(now - 60 * min * 27).toISOString(), actor: "system", action: "Model updated", target: "flock-vision-v3", severity: "info" },
  ];
}

export const serviceStatuses: ServiceStatus[] = [
  { name: "Anthropic Vision API", status: "operational", latencyMs: 1840, uptimePct: 99.97 },
  { name: "Detection API (/api/detect)", status: "operational", latencyMs: 210, uptimePct: 99.99 },
  { name: "Auth (Clerk)", status: "operational", latencyMs: 95, uptimePct: 100 },
  { name: "Media storage", status: "degraded", latencyMs: 640, uptimePct: 99.42 },
];

export const apiUsageSeries: ApiUsagePoint[] = [
  { date: "Mon", calls: 620, errors: 4 },
  { date: "Tue", calls: 712, errors: 2 },
  { date: "Wed", calls: 588, errors: 6 },
  { date: "Thu", calls: 843, errors: 3 },
  { date: "Fri", calls: 901, errors: 1 },
  { date: "Sat", calls: 455, errors: 0 },
  { date: "Sun", calls: 398, errors: 1 },
];