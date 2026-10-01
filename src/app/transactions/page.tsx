import db from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import TransactionList from "./TransactionList";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const totalRevenue = transactions.reduce((acc, trx) => acc + Number(trx.totalAmount), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-float-in">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Riwayat Transaksi
            </h1>
            <Badge variant="secondary" className="font-bold text-xs">
              {transactions.length} Transaksi
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Daftar seluruh nota penjualan dan riwayat transaksi kasir yang tercatat.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Total Omzet Tercatat
            </span>
            <span className="text-base sm:text-lg font-black text-primary">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
}
