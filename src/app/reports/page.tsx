import db from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BarChart, TrendingUp, Calendar, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const transactions = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true
    }
  });

  // Group by date
  const dailyData: Record<string, {
    date: Date,
    totalRevenue: number,
    totalTransactions: number,
    totalItems: number
  }> = {};

  transactions.forEach((trx: any) => {
    const dateKey = format(new Date(trx.createdAt), "yyyy-MM-dd");
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: new Date(trx.createdAt),
        totalRevenue: 0,
        totalTransactions: 0,
        totalItems: 0,
      };
    }

    dailyData[dateKey].totalTransactions += 1;
    dailyData[dateKey].totalRevenue += Number(trx.totalAmount);
    dailyData[dateKey].totalItems += trx.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  });

  const sortedDailyData = Object.values(dailyData).sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalRevenue = sortedDailyData.reduce((s, d) => s + d.totalRevenue, 0);
  const totalTransactions = sortedDailyData.reduce((s, d) => s + d.totalTransactions, 0);
  const totalItems = sortedDailyData.reduce((s, d) => s + d.totalItems, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-float-in">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Laporan Penjualan</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Rekap penjualan harian toko Anda</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 animate-float-in-delay-1">
        <Card className="stat-card-indigo">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.52_0.2_260)] text-white shadow-lg shadow-[oklch(0.52_0.2_260_/_0.3)]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Pendapatan</p>
              <p className="text-xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-emerald">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Transaksi</p>
              <p className="text-xl font-bold">{totalTransactions}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-amber">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Hari Aktif</p>
              <p className="text-xl font-bold">{sortedDailyData.length} Hari</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-x-auto animate-float-in-delay-2">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Tanggal</TableHead>
              <TableHead className="font-semibold">Jumlah Transaksi</TableHead>
              <TableHead className="font-semibold">Item Terjual</TableHead>
              <TableHead className="text-right font-semibold">Total Pendapatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDailyData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-40">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <BarChart className="h-12 w-12 opacity-20 mb-3" />
                    <p className="font-medium">Belum ada data penjualan</p>
                    <p className="text-sm mt-1">Data akan muncul setelah transaksi pertama Anda</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedDailyData.map((data, idx) => (
                <TableRow key={idx} className="table-row-hover">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm">{format(data.date, "d MMMM yyyy", { locale: id })}</p>
                      <p className="text-xs text-muted-foreground">{format(data.date, "EEEE", { locale: id })}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/5 text-primary px-2.5 py-1 rounded-lg">
                      {data.totalTransactions} Transaksi
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted px-2.5 py-1 rounded-lg">
                      {data.totalItems} Item
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-primary text-sm">
                      Rp {data.totalRevenue.toLocaleString("id-ID")}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
