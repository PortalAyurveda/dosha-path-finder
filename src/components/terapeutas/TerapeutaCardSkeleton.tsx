import { Skeleton } from "@/components/ui/skeleton";

const TerapeutaCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-5 pt-6 flex flex-col items-center">
    <div className="w-28 aspect-[4/5] shadow-therapist mb-4">
      <div className="therapist-portal-arch h-full w-full bg-muted/60 p-[3px]">
        <Skeleton className="therapist-portal-arch h-full w-full" />
      </div>
    </div>
    <Skeleton className="h-5 w-32 mb-2" />
    <Skeleton className="h-4 w-40 mb-3" />
    <div className="flex gap-1.5 mb-3">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-5/6 mb-1" />
    <Skeleton className="h-4 w-4/6 mb-4" />
    <Skeleton className="h-10 w-full rounded-md" />
  </div>
);

export default TerapeutaCardSkeleton;
