"use client";

import * as React from "react";
import { format } from "date-fns";
import { MoreHorizontal, ShieldCheck, UserPlus, Ban, Trash2, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { AdminRole, AdminTeamMember, AdminUserStatus } from "@/types/admin";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
};

const STATUS_VARIANT: Record<AdminUserStatus, "confirmed" | "warning" | "danger"> = {
  active: "confirmed",
  invited: "warning",
  suspended: "danger",
};

export function TeamTable({ members }: { members: AdminTeamMember[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team & Roles</CardTitle>
          <CardDescription>Everyone with access to FlockCount AI.</CardDescription>
        </div>
        <Button size="sm">
          <UserPlus className="h-4 w-4" /> Invite member
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Houses Assigned</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                      <p className="truncate text-xs text-muted-2">{m.email}</p>
                    </div>
                    {m.role === "owner" && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={m.role === "owner" || m.role === "admin" ? "default" : "neutral"}>
                    {ROLE_LABEL[m.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[m.status]} className="capitalize">
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono tabular-nums">{m.housesAssigned}</TableCell>
                <TableCell className="whitespace-nowrap text-muted">
                  {format(new Date(m.lastActive), "MMM d, HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${m.name}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <RefreshCcw className="h-4 w-4" /> Change role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(m.status === "suspended" && "text-confirmed focus:text-confirmed focus:bg-confirmed-soft")}
                      >
                        <Ban className="h-4 w-4" /> {m.status === "suspended" ? "Reinstate" : "Suspend"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger-soft">
                        <Trash2 className="h-4 w-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}