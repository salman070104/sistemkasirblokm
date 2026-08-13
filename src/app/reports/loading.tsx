export default function ReportsLoading() {
  return (
    <div className="p-4 lg:p-8 space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted/60 rounded" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl h-12 w-12 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
        <div className="h-6 w-40 bg-muted rounded mb-6" />
        <div className="h-[300px] w-full bg-muted/30 rounded-xl" />
      </div>
      
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-9 w-32 bg-muted rounded-lg" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-border/50 items-center">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
