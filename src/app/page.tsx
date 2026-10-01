import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Award,
  ShoppingCart,
  PlusCircle,
  BarChart,
  ChevronRight
} from "lucide-react";
import db from "@/lib/db";
import { startOfDay, startOfMonth, format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";

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

  const topItems = await db.transactionItem.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true,
    },
    where: {
      productId: { not: null },
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 5,
  });

  const productIds = topItems
    .map(item => item.productId)
    .filter((id): id is number => id !== null);

  const productsMap = await db.product.findMany({
    where: { id: { in: productIds } },
  });

  const topSellingProducts = topItems.map(item => {
    const product = productsMap.find(p => p.id === item.productId);
    return {
      id: item.productId,
      name: product?.name || "Produk",
      price: product?.price ? Number(product.price) : 0,
      imageUrl: product?.imageUrl || null,
      totalSold: item._sum.quantity || 0,
    };
  }).filter(p => p.name !== "Produk");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* ── Welcome Header & Quick Action Launcher ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-float-in">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            {format(now, "EEEE, d MMMM yyyy", { locale: id })}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Selamat Datang di Blok M Studio! 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ringkasan performa penjualan dan aktivitas kasir toko Anda hari ini.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/pos">
            <Button className="rounded-xl shadow-md shadow-primary/20 font-semibold gap-2 h-10 px-4">
              <ShoppingCart className="h-4 w-4" />
              <span>Buka Kasir POS</span>
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="rounded-xl border-border/70 hover:bg-muted font-medium gap-1.5 h-10">
              <Package className="h-4 w-4" />
              <span>Katalog Produk</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="rounded-xl border-border/70 hover:bg-muted font-medium gap-1.5 h-10">
              <BarChart className="h-4 w-4" />
              <span>Laporan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Primary KPI Metrics ── */}
      <div className="grid gap-3.5 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        {/* Pendapatan Bulan Ini */}
        <Card className="stat-card-indigo animate-float-in rounded-3xl border border-border/60 shadow-xs overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bulan Ini
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Rp {monthRevenue.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="success" className="text-[10px] font-bold gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                  {monthTransactions.length} Transaksi
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaksi Hari Ini */}
        <Card className="stat-card-emerald animate-float-in-delay-1 rounded-3xl border border-border/60 shadow-xs overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Hari Ini
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {todayTransactions.length} Pesanan
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-medium truncate">
                Rp {todayRevenue.toLocaleString("id-ID")} hari ini
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Produk */}
        <Card className="stat-card-amber animate-float-in-delay-2 rounded-3xl border border-border/60 shadow-xs overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Katalog Produk
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {totalProducts} Item
              </p>
              <Link href="/products" className="text-xs text-primary hover:underline mt-2 inline-block font-semibold">
                Lihat Katalog &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Status Sistem */}
        <Card className="stat-card-rose animate-float-in-delay-3 rounded-3xl border border-border/60 shadow-xs overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status Sistem
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Kasir Siap
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Printer & Barcode Siap Digunakan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Transaksi Terakhir & Produk Terlaris ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Transaksi Terakhir */}
        <Card className="rounded-3xl border border-border/60 shadow-xs animate-float-in overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="text-base font-extrabold text-foreground">Transaksi Terakhir Hari Ini</h2>
              </div>
              <Link href="/transactions" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                Lihat Semua <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {todayTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingBag className="h-10 w-10 opacity-20 mb-2 stroke-[1.2]" />
                <p className="text-sm font-semibold text-foreground">Belum Ada Transaksi Hari Ini</p>
                <p className="text-xs text-muted-foreground mt-1">Transaksi penjualan hari ini akan muncul di sini</p>
                <Link href="/pos" className="mt-4">
                  <Button size="sm" className="rounded-xl text-xs font-semibold">
                    Mulai Transaksi Baru
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTransactions.slice(0, 5).map((trx: any) => (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors border border-border/40"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {trx.receiptNumber}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {format(new Date(trx.createdAt), "HH:mm 'WIB'")} • {trx.items.reduce((s: number, i: any) => s + i.quantity, 0)} item
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-foreground">
                      Rp {Number(trx.totalAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produk Terlaris */}
        <Card className="rounded-3xl border border-border/60 shadow-xs animate-float-in-delay-1 overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <h2 className="text-base font-extrabold text-foreground">Produk Paling Laris</h2>
              </div>
              <Link href="/products" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                Katalog <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {topSellingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-10 w-10 opacity-20 mb-2 stroke-[1.2]" />
                <p className="text-sm font-semibold text-foreground">Belum Ada Data Penjualan</p>
                <p className="text-xs text-muted-foreground mt-1">Data produk terlaris akan otomatis terhitung</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topSellingProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors border border-border/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                        #{idx + 1}
                      </div>

                      {product.imageUrl ? (
                        <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-border/60 shrink-0 bg-muted">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-xl border border-dashed border-border/70 bg-muted/50 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[160px] sm:max-w-xs">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Rp {product.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary" className="font-extrabold text-[11px] shrink-0">
                      {product.totalSold} terjual
                    </Badge>
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
