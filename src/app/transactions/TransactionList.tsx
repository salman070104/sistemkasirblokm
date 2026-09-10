"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Receipt, Eye, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { deleteTransaction } from "../actions/transaction";

export default function TransactionList({ transactions }: { transactions: any[] }) {
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [trxToDelete, setTrxToDelete] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [restoreStock, setRestoreStock] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!trxToDelete) return;
    setIsDeleting(true);

    const res = await deleteTransaction(trxToDelete.id, restoreStock);
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
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-x-auto animate-float-in-delay-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">No. Struk</TableHead>
              <TableHead className="font-semibold">Waktu Transaksi</TableHead>
              <TableHead className="font-semibold">Total Item</TableHead>
              <TableHead className="font-semibold">Total Belanja</TableHead>
              <TableHead className="font-semibold text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-40">
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
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">Rp {Number(trx.totalAmount).toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5 pr-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 rounded-xl h-8 px-3 text-xs font-medium"
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
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
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

      {/* DIALOG DETAIL TRANSAKSI */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              {selectedTrx && (
                <div className="flex justify-between items-center mt-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{selectedTrx.receiptNumber}</span>
                  <span className="text-xs">{format(new Date(selectedTrx.createdAt), "d MMM yyyy, HH:mm", { locale: id })}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrx && (
            <div className="mt-4 space-y-4">
              <div className="max-h-[260px] overflow-y-auto space-y-3 pr-2">
                {selectedTrx.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.product?.name || "Produk Dihapus"}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="font-medium">
                      Rp {(item.quantity * Number(item.price)).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Belanja</span>
                  <span className="font-bold text-base">Rp {Number(selectedTrx.totalAmount).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uang Tunai</span>
                  <span className="font-medium">Rp {Number(selectedTrx.cashAmount).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kembalian</span>
                  <span className="font-medium text-emerald-600">Rp {Number(selectedTrx.changeAmount).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
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
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="rounded-xl">
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG KONFIRMASI HAPUS TRANSAKSI */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Hapus Transaksi?</DialogTitle>
                <DialogDescription className="text-xs">
                  Tindakan ini akan menghapus data penjualan dari sistem.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {trxToDelete && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 p-3.5 rounded-xl text-xs space-y-1.5 border border-border/60 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Struk:</span>
                  <span className="font-bold">{trxToDelete.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Nilai:</span>
                  <span className="font-bold text-destructive">
                    Rp {Number(trxToDelete.totalAmount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Opsi Kembalikan Stok */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-primary/20 bg-primary/5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={restoreStock}
                  onChange={(e) => setRestoreStock(e.target.checked)}
                  className="mt-0.5 rounded accent-primary h-4 w-4"
                />
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Kembalikan stok produk otomatis</span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Centang ini jika transaksi tadi merupakan uji coba, agar stok barang tidak berkurang di inventaris.
                  </p>
                </div>
              </label>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
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
              {isDeleting ? "Menghapus..." : "Ya, Hapus Transaksi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
