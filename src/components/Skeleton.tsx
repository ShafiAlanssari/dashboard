export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 p-3 border border-gray-100 rounded-lg">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
      تعذّر تحميل البيانات: {message}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-brand">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
