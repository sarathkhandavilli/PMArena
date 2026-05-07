import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in pb-10 w-full">
      <header className="space-y-3">
        <Skeleton className="h-8 w-64 bg-white/10" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </header>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[104px] w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <Skeleton className="h-40 w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
            <Skeleton className="h-32 w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <Skeleton className="h-[400px] w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in pb-10 w-full">
      <header className="flex justify-between items-center">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-32 bg-white/10 rounded-lg" />
      </header>
      
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 bg-white/5 rounded-lg border border-white/10" />
        <Skeleton className="h-10 w-32 bg-white/5 rounded-lg border border-white/10" />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0F1B2D]/50 overflow-hidden">
        <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 gap-4">
          <Skeleton className="h-4 w-1/4 bg-white/10" />
          <Skeleton className="h-4 w-1/4 bg-white/10" />
          <Skeleton className="h-4 w-1/4 bg-white/10" />
          <Skeleton className="h-4 w-1/4 bg-white/10" />
        </div>
        <div className="p-4 space-y-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-1/4 bg-white/5" />
              <Skeleton className="h-8 w-1/4 bg-white/5" />
              <Skeleton className="h-8 w-1/4 bg-white/5" />
              <Skeleton className="h-8 w-1/4 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InnerProblemPageSkeleton() {
  return (
    <div className="flex-1 flex overflow-hidden w-full bg-[#0A111C]">
      <div className="w-1/2 border-r border-white/10 p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
            <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
          </div>
        </div>
        <div className="space-y-3 mt-8">
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-5/6 bg-white/5" />
          <Skeleton className="h-4 w-4/5 bg-white/5" />
          <Skeleton className="h-4 w-full bg-white/5" />
        </div>
      </div>
      <div className="w-1/2 p-4">
        <Skeleton className="h-full w-full bg-[#0F1B2D] rounded-lg border border-white/10" />
      </div>
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-48 w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in pb-10 w-full">
      <header className="space-y-3">
        <Skeleton className="h-8 w-64 bg-white/10" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </header>
      <Skeleton className="h-[400px] w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A111C]">
      {/* Simple sidebar + content skeleton for protected routes */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-white/10 bg-[#0F1B2D] p-4 hidden md:block">
          <Skeleton className="h-8 w-32 bg-white/10 mb-8" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function PerformanceSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in pb-10 w-full">
      <header className="space-y-3">
        <Skeleton className="h-8 w-64 bg-white/10" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </header>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[104px] w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
        </div>
      </div>
    </div>
  );
}

export function SubmissionsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 w-full">
      <header className="mb-8 space-y-3">
        <Skeleton className="h-8 w-64 bg-white/10" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </header>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[90px] w-full bg-[#0F1B2D] rounded-xl border border-white/5" />
        ))}
      </div>
    </div>
  );
}
