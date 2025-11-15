// client/src/components/UI/Skeleton.jsx

export function Skeleton({ className = '', variant = 'default' }) {
  const variants = {
    default: 'h-4 w-full',
    title: 'h-8 w-3/4',
    text: 'h-3 w-full',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-lg',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div
      className={`
        animate-pulse bg-slate-200 dark:bg-slate-700 rounded
        ${variants[variant]}
        ${className}
      `}
    />
  );
}

export function MentionSkeleton() {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton variant="text" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton variant="title" className="mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <Skeleton variant="title" className="mb-6" />
      <div className="h-64 flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            style={{ height: `${Math.random() * 100}%` }}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
}