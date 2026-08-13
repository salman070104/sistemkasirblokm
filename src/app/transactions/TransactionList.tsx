"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Receipt, Eye } from "lucide-react";

export default function TransactionList({ transactions }: { transactions: any[] }) {
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

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
              <TableHead className="font-semibold">Aksi</TableHead>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setSelectedTrx(trx);
                        setIsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
