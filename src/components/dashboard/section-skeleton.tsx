import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}

export function UploadCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
