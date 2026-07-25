/** Types for the /admin panel — operational data about the platform
 * itself (team, system health, usage, audit trail), distinct from the
 * chicken-detection dashboard's domain types in detection.ts. */

export type AdminRole = "owner" | "admin" | "operator" | "viewer";
export type AdminUserStatus = "active" | "invited" | "suspended";

export interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastActive: string; // ISO string
  housesAssigned: number;
}

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  actor: string; // email
  action: string;
  target?: string;
  severity: AuditSeverity;
}

export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  latencyMs: number;
  uptimePct: number;
}

export interface ApiUsagePoint {
  date: string; // short label, e.g. "Mon"
  calls: number;
  errors: number;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeSessions: number;
  apiCallsToday: number;
  storageUsedGb: number;
  storageLimitGb: number;
}