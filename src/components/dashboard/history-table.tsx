"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Inbox,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { HistoryEntry, HistoryStatus } from "@/types/detection";
import { formatDuration, cn } from "@/lib/utils";

const PAGE_SIZE = 6;

type SortKey = "date" | "count" | "confidence" | "durationMs";

const STATUS_LABEL: Record<HistoryStatus, string> = {
  success: "Berhasil",
  failed: "Gagal",
  no_chickens: "Tidak Ada Ayam",
  invalid: "Tidak Valid",
};

const STATUS_VARIANT: Record<HistoryStatus, "confirmed" | "danger" | "neutral" | "warning"> = {
  success: "confirmed",
  failed: "danger",
  no_chickens: "neutral",
  invalid: "warning",
};

interface HistoryTableProps {
  entries: HistoryEntry[];
  onUploadFirst: () => void;
}

export function HistoryTable({ entries, onUploadFirst }: HistoryTableProps) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<HistoryStatus | "all">("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    let rows = entries;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((r) => r.filename.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === "count") cmp = (a.count ?? -1) - (b.count ?? -1);
      else if (sortKey === "confidence") cmp = (a.confidence ?? -1) - (b.confidence ?? -1);
      else cmp = a.durationMs - b.durationMs;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [entries, query, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  if (entries.length === 0) {
    return (
      <Card>
  <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted">
      <Inbox className="h-8 w-8" />
    </div>

    <div>
      <p className="font-display text-base font-semibold">
        Belum Ada Riwayat Deteksi
      </p>

      <p className="mt-1 text-sm text-muted">
        Lakukan analisis pertama untuk mulai membangun riwayat deteksi.
      </p>
    </div>

    <Button onClick={onUploadFirst} className="mt-2">
      <Upload className="h-4 w-4" />
      Unggah Gambar Pertama
    </Button>
  </CardContent>
</Card>
    );
  }

  return (
<Card>
  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <CardTitle>Riwayat Deteksi</CardTitle>
      <CardDescription>Semua hasil analisis tersimpan serta dapat dicari dan diurutkan.</CardDescription>
    </div>

    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="hidden">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />

        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama file..."
          aria-label="Cari riwayat deteksi berdasarkan nama file"
          className="w-full pl-8 sm:w-52"
        />
      </div>

      <Select
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v as HistoryStatus | "all");
          setPage(1);
        }}
      >
        <SelectTrigger className="w-full hidden sm:w-40" aria-label="Filter berdasarkan status">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>

        <SelectContent className="hidden">
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="success">Berhasil</SelectItem>
          <SelectItem value="no_chickens">Tidak Ada Ayam</SelectItem>
          <SelectItem value="invalid">Tidak Valid</SelectItem>
          <SelectItem value="failed">Gagal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardHeader>

  <CardContent className="p-0">
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead
            label="Tanggal"
            sortKey="date"
            active={sortKey}
            dir={sortDir}
            onClick={toggleSort}
          />

          <TableHead>Nama File</TableHead>

          <SortableHead
            label="Jumlah Ayam"
            sortKey="count"
            active={sortKey}
            dir={sortDir}
            onClick={toggleSort}
          />

          <SortableHead
            label="Kepercayaan"
            sortKey="confidence"
            active={sortKey}
            dir={sortDir}
            onClick={toggleSort}
          />

          <SortableHead
            label="Durasi"
            sortKey="durationMs"
            active={sortKey}
            dir={sortDir}
            onClick={toggleSort}
          />

          <TableHead>Status</TableHead>
          {/* <TableHead className="text-right">Aksi</TableHead> */}
        </TableRow>
      </TableHeader>

      <TableBody>
        {pageRows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="py-10 text-center text-sm text-muted"
            >
              Tidak ada data yang sesuai dengan pencarian atau filter.
            </TableCell>
          </TableRow>
        ) : (
          pageRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-muted">
                {format(new Date(row.date), "MMM d, HH:mm")}
              </TableCell>

              <TableCell className="max-w-[220px]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: row.thumbnailColor }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-mono text-xs sm:text-sm">
                    {row.filename}
                  </span>
                </div>
              </TableCell>

              <TableCell className="font-mono tabular-nums">
                {row.count !== null ? row.count.toLocaleString() : "—"}
              </TableCell>

              <TableCell className="font-mono tabular-nums">
                {row.confidence !== null
                  ? `${Math.round(row.confidence * 100)}%`
                  : "—"}
              </TableCell>

              <TableCell className="font-mono tabular-nums text-muted">
                {row.durationMs > 0
                  ? formatDuration(row.durationMs)
                  : "—"}
              </TableCell>

              <TableCell>
                <Badge variant={STATUS_VARIANT[row.status]}>
                  {STATUS_LABEL[row.status]}
                </Badge>
              </TableCell>

              <TableCell className="hidden text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Aksi untuk ${row.filename}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4" />
                      Lihat Detail
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Download className="h-4 w-4" />
                      Ekspor Laporan
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger-soft">
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </CardContent>

  <div className="flex items-center justify-between border-t border-border-subtle px-5 py-3">
    <p className="text-xs text-muted-2">
      Halaman {currentPage} dari {totalPages} • {filtered.length} hasil
    </p>

    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
</Card>
  );
}

function SortableHead({
  label,
  sortKey,
  active,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: "asc" | "desc";
  onClick: (key: SortKey) => void;
}) {
  const isActive = active === sortKey;
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={cn(
          "flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground",
          isActive && "text-accent"
        )}
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", isActive && dir === "asc" && "rotate-180")} />
      </button>
    </TableHead>
  );
}
