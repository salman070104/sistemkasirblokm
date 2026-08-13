export default function POSLoading() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden animate-pulse">
      {/* Product Grid Area Skeleton */}
      <div className="flex-1 flex flex-col bg-muted/20">
        <div className="p-3 lg:p-4 border-b bg-background">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex-1 h-10 lg:h-11 bg-muted rounded-xl" />
            <div className="h-10 w-20 lg:h-11 lg:w-24 bg-muted rounded-xl" />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3 lg:p-4 pb-24 lg:pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl lg:rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col h-[180px] lg:h-[220px]">
                <div className="h-24 sm:h-28 lg:h-32 w-full bg-muted/50" />
                <div className="p-2 lg:p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted/60 rounded" />
                  </div>
                  <div className="h-5 w-2/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Area Skeleton */}
      <div className="hidden lg:flex w-[380px] xl:w-[420px] flex-col bg-card border-l border-border/60 shadow-2xl z-20">
        <div className="p-5 border-b border-border/60">
          <div className="h-7 w-32 bg-muted rounded mb-2" />
          <div className="h-4 w-48 bg-muted/60 rounded" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-16 w-16 bg-muted rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted/60 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-border/60 bg-muted/10 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
          <div className="h-12 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
