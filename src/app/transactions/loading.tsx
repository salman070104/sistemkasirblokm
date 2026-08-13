export default function TransactionsLoading() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted/60 rounded" />
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-0">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 p-4 border-b border-border/50 bg-muted/5">
            <div className="col-span-2 h-4 bg-muted rounded" />
            <div className="col-span-1 h-4 bg-muted rounded hidden md:block" />
            <div className="col-span-1 h-4 bg-muted rounded hidden md:block" />
            <div className="col-span-1 h-4 bg-muted rounded" />
            <div className="col-span-1 h-4 bg-muted rounded text-right" />
          </div>
          
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 md:grid-cols-6 gap-4 p-4 border-b border-border/50 items-center">
              <div className="col-span-2 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted/60 rounded" />
              </div>
              <div className="col-span-1 hidden md:block">
                <div className="h-6 w-16 bg-muted rounded-full" />
              </div>
              <div className="col-span-1 hidden md:block">
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
              <div className="col-span-1 h-4 w-24 bg-muted rounded" />
              <div className="col-span-1 flex justify-end">
                <div className="h-8 w-20 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
