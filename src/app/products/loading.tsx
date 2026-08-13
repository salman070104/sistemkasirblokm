export default function ProductsLoading() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted/60 rounded" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-xl" />
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10">
          <div className="h-10 w-full md:w-1/3 bg-muted rounded-xl" />
        </div>
        
        <div className="p-0">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-border/50 bg-muted/5">
            <div className="col-span-2 lg:col-span-3 h-4 bg-muted rounded" />
            <div className="col-span-1 h-4 bg-muted rounded" />
            <div className="col-span-1 h-4 bg-muted rounded" />
            <div className="col-span-1 h-4 bg-muted rounded" />
            <div className="col-span-1 lg:hidden h-4 bg-muted rounded" />
          </div>
          
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b border-border/50 items-center">
              <div className="col-span-2 lg:col-span-3 flex items-center gap-3">
                <div className="h-12 w-12 bg-muted rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted/60 rounded" />
                </div>
              </div>
              <div className="col-span-1 h-4 w-16 bg-muted rounded" />
              <div className="col-span-1 h-6 w-16 bg-muted rounded-full" />
              <div className="col-span-2 lg:col-span-1 flex justify-end gap-2">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="h-8 w-8 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
