import db from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-float-in">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Riwayat Transaksi</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{transactions.length} transaksi tercatat</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-x-auto animate-float-in-delay-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">No. Struk</TableHead>
              <TableHead className="font-semibold">Waktu Transaksi</TableHead>
              <TableHead className="font-semibold">Total Item</TableHead>
              <TableHead className="font-semibold">Total Belanja</TableHead>
              <TableHead className="font-semibold">Uang Tunai</TableHead>
              <TableHead className="font-semibold">Kembalian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-40">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Receipt className="h-12 w-12 opacity-20 mb-3" />
                    <p className="font-medium">Belum ada transaksi</p>
                    <p className="text-sm mt-1">Transaksi akan muncul setelah Anda melakukan penjualan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((trx: any) => (
                <TableRow key={trx.id} className="table-row-hover">
                  <TableCell>
                    <span className="font-mono text-xs bg-primary/5 text-primary px-2.5 py-1 rounded-lg font-semibold">
                      {trx.receiptNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{format(new Date(trx.createdAt), "d MMMM yyyy", { locale: id })}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(trx.createdAt), "HH:mm 'WIB'")}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted px-2 py-1 rounded-lg">
                        {trx.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} item
                      </span>
                      <div className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1 max-w-[200px]">
                        {trx.items.map((i: any) => `${i.product?.name} (${i.quantity}x)`).join(", ")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">Rp {Number(trx.totalAmount).toLocaleString("id-ID")}</TableCell>
                  <TableCell className="font-medium">Rp {Number(trx.cashAmount).toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <span className="text-emerald-600 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg text-xs">
                      Rp {Number(trx.changeAmount).toLocaleString("id-ID")}
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
