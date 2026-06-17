import { clsx } from "clsx";

/** Base shimmering block. Size it with className. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton rounded-xl", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-10 w-64" />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="mb-4 h-6 w-6 rounded-lg" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-6">
            <Skeleton className="mb-5 h-6 w-40" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsGridSkeleton({ title = "Flashcards" }: { title?: string }) {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-6">
            <Skeleton className="mb-4 h-7 w-7 rounded-lg" />
            <Skeleton className="h-6 w-36" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-2 h-4 w-80" />
      <Skeleton className="mt-6 h-12 w-full rounded-2xl" />
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {[3, 2, 2].map((count, col) => (
          <div key={col} className="card p-4">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="mb-6 h-10 w-40" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
        <div className="card h-fit p-3">
          <Skeleton className="mb-3 h-10 w-full rounded-2xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="mb-1 h-9 w-full rounded-xl" />
          ))}
        </div>
        <div className="card p-8">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="my-5 h-px w-full" />
          {["w-full", "w-11/12", "w-4/5", "w-full", "w-3/4", "w-5/6"].map((w, i) => (
            <Skeleton key={i} className={`mb-3 h-4 ${w}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AchievementsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-20" />
        </div>
        <Skeleton className="mt-5 h-2.5 w-full rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card grid place-items-center p-6">
            <Skeleton className="mb-3 h-12 w-12 rounded-2xl" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
            <Skeleton className="mt-3 h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
