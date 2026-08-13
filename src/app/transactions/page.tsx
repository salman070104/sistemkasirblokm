import db from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText, Receipt } from "lucide-react";

import TransactionList from "./TransactionList";

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

      <TransactionList transactions={transactions} />
    </div>
  );
}
