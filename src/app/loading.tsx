import { Package, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted/60 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl h-12 w-12" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-pulse">
          <div className="h-6 w-40 bg-muted rounded mb-6" />
          <div className="h-[250px] w-full bg-muted/30 rounded-xl" />
        </div>
        
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-border/50 last:border-0 last:pb-0">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted/60 rounded" />
                </div>
                <div className="h-5 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
