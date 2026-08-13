import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, TrendingUp, ArrowUpRight, Clock } from "lucide-react";
import db from "@/lib/db";
import { startOfDay, startOfMonth, format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const today = startOfDay(now);
  const thisMonth = startOfMonth(now);

  const totalProducts = await db.product.count();

  const todayTransactions = await db.transaction.findMany({
    where: { createdAt: { gte: today } },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const todayRevenue = todayTransactions.reduce(
    (sum, trx) => sum + Number(trx.totalAmount), 0
  );

  const monthTransactions = await db.transaction.findMany({
    where: { createdAt: { gte: thisMonth } },
  });

  const monthRevenue = monthTransactions.reduce(
    (sum, trx) => sum + Number(trx.totalAmount), 0
  );

  const lowStockProducts = await db.product.findMany({
    where: { stock: { lte: 5 } },
    orderBy: { stock: "asc" },
    take: 5,
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="animate-float-in">
        <p className="text-sm font-medium text-muted-foreground">
          {format(now, "EEEE, d MMMM yyyy", { locale: id })}
        </p>
        <h2 className="text-3xl font-bold tracking-tight mt-1">
          Selamat Datang! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Berikut ringkasan aktivitas toko Anda hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Pendapatan Bulan Ini */}
        <Card className="stat-card-indigo animate-float-in overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Pendapatan Bulan Ini</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.52_0.2_260)] text-white shadow-lg shadow-[oklch(0.52_0.2_260_/_0.3)]">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight">
                Rp {monthRevenue.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3" />
                  {monthTransactions.length} transaksi
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaksi Hari Ini */}
        <Card className="stat-card-emerald animate-float-in-delay-1 overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Transaksi Hari Ini</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight">
                {todayTransactions.length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Rp {todayRevenue.toLocaleString("id-ID")} pendapatan hari ini
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Produk */}
        <Card className="stat-card-amber animate-float-in-delay-2 overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Produk</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight">
                {totalProducts}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Barang aktif di inventaris
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="stat-card-rose animate-float-in-delay-3 overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Performa</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight">Stabil</p>
              <p className="text-xs text-muted-foreground mt-2">
                Sistem berjalan normal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Transaksi Terakhir */}
        <Card className="animate-float-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Transaksi Terakhir</h3>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            {todayTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <ShoppingBag className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm">Belum ada transaksi hari ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTransactions.slice(0, 5).map((trx: any) => (
                  <div key={trx.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{trx.receiptNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(trx.createdAt), "HH:mm")} • {trx.items.reduce((s: number, i: any) => s + i.quantity, 0)} item
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      Rp {Number(trx.totalAmount).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stok Menipis */}
        <Card className="animate-float-in-delay-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Stok Menipis</h3>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Package className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm">Semua produk stoknya aman</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      product.stock === 0
                        ? "bg-red-500/10 text-red-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {product.stock === 0 ? "Habis" : `Sisa ${product.stock}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
