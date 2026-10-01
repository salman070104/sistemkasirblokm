"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Receipt, 
  Eye, 
  Trash2, 
  AlertTriangle, 
  Search, 
  X, 
  Copy, 
  Check, 
  Calendar, 
  ShoppingBag,
  Loader2
} from "lucide-react";
import { deleteTransaction } from "../actions/transaction";

export default function TransactionList({ transactions }: { transactions: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [trxToDelete, setTrxToDelete] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const router = useRouter();

  const handleCopy = (e: React.MouseEvent, idVal: number, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(idVal);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter((trx) => {
      const matchReceipt = trx.receiptNumber?.toLowerCase().includes(q);
      const matchTotal = trx.totalAmount?.toString().includes(q);
      const matchItems = trx.items?.some((i: any) =>
        i.product?.name?.toLowerCase().includes(q)
      );
      return matchReceipt || matchTotal || matchItems;
    });
  }, [transactions, search]);

  const handleDelete = async () => {
    if (!trxToDelete) return;
    setIsDeleting(true);

    const res = await deleteTransaction(trxToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setIsDeleteOpen(false);
      setIsOpen(false);
      setTrxToDelete(null);
      router.refresh();
    } else {
      alert(res.error || "Gagal menghapus transaksi");
    }
  };

  return (
    <>
      {/* ── Search & Filter Bar ── */}
      <div className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-float-in">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari No. Struk atau nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-xl bg-muted/30 border-border/70 text-sm focus:bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-center">
          <span>Menampilkan</span>
          <Badge variant="outline" className="font-bold text-foreground">
            {filteredTransactions.length} dari {transactions.length}
          </Badge>
          <span>Transaksi</span>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-xs overflow-x-auto animate-float-in-delay-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-bold text-xs uppercase tracking-wider">No. Struk</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Waktu Transaksi</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Total Item</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Total Belanja</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-48">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Receipt className="h-12 w-12 opacity-20 mb-3 stroke-[1.2]" />
                    <p className="font-bold text-sm text-foreground">
                      {search ? "Transaksi Tidak Ditemukan" : "Belum Ada Transaksi"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search ? "Coba gunakan kata kunci nomor struk yang berbeda" : "Transaksi akan otomatis tercatat saat kasir memproses pesanan"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((trx: any) => (
                <TableRow
                  key={trx.id}
                  onClick={() => {
                    setSelectedTrx(trx);
                    setIsOpen(true);
                  }}
                  className="table-row-hover cursor-pointer"
                >
                  <TableCell>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, trx.id, trx.receiptNumber)}
                      title="Klik untuk salin no struk"
                      className="font-mono text-xs bg-muted/60 hover:bg-muted text-foreground px-2 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedId === trx.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-muted-foreground opacity-60" />
                          <span>{trx.receiptNumber}</span>
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-foreground">
                        {format(new Date(trx.createdAt), "d MMMM yyyy", { locale: id })}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(trx.createdAt), "HH:mm 'WIB'")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted px-2.5 py-1 rounded-lg">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                      {trx.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} item
                    </span>
                  </TableCell>
                  <TableCell className="font-extrabold text-sm sm:text-base text-primary">
                    Rp {Number(trx.totalAmount).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 pr-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-xl h-8 px-3 text-xs font-semibold"
                        onClick={() => {
                          setSelectedTrx(trx);
                          setIsOpen(true);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        title="Hapus transaksi ini"
                        onClick={() => {
                          setTrxToDelete(trx);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── DIALOG DETAIL TRANSAKSI ── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                Rincian Nota Transaksi
              </span>
              {selectedTrx && (
                <span className="text-xs text-muted-foreground font-mono">
                  {format(new Date(selectedTrx.createdAt), "d MMM yyyy, HH:mm", { locale: id })}
                </span>
              )}
            </div>
            <DialogTitle className="text-lg font-extrabold text-foreground mt-1">
              {selectedTrx?.receiptNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedTrx && (
            <div className="space-y-4 pt-2">
              <div className="max-h-[280px] overflow-y-auto space-y-2.5 pr-1 divide-y divide-border/40">
                {selectedTrx.items.map((item: any) => (
                  <div key={item.id} className="pt-2 flex justify-between items-start text-xs">
                    <div className="pr-2">
                      <p className="font-bold text-foreground text-sm">
                        {item.product?.name || "Produk Dihapus"}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="font-bold text-foreground shrink-0 text-sm">
                      Rp {(item.quantity * Number(item.price)).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Belanja</span>
                  <span className="font-extrabold text-base text-primary">
                    Rp {Number(selectedTrx.totalAmount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Tunai Diterima</span>
                  <span className="font-medium text-foreground">
                    Rp {Number(selectedTrx.cashAmount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Kembalian</span>
                  <span>Rp {Number(selectedTrx.changeAmount).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 text-xs gap-1.5 rounded-xl"
                  onClick={() => {
                    setTrxToDelete(selectedTrx);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Transaksi
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="rounded-xl font-semibold">
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── DIALOG KONFIRMASI HAPUS TRANSAKSI ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Hapus Transaksi?</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Tindakan ini akan menghapus data penjualan dari riwayat sistem.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {trxToDelete && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1.5 font-mono my-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Struk:</span>
                <span className="font-bold text-foreground">{trxToDelete.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Nilai:</span>
                <span className="font-bold text-destructive">
                  Rp {Number(trxToDelete.totalAmount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl gap-1.5 font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Ya, Hapus Transaksi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
