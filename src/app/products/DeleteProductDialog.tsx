"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2, Package, AlertCircle } from "lucide-react";
import Image from "next/image";
import { deleteProduct } from "../actions/product";
import { useRouter } from "next/navigation";

type ProductToDelete = {
  id: number;
  name: string;
  sku?: string | null;
  price: number;
  imageUrl?: string | null;
};

interface DeleteProductDialogProps {
  product: ProductToDelete | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteProductDialog({ product, open, onOpenChange, onSuccess }: DeleteProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  if (!product) return null;

  const handleDelete = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await deleteProduct(product.id);
      if (result.success) {
        onOpenChange(false);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setErrorMessage(result.error || "Gagal menghapus produk");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Terjadi kesalahan sistem saat menghapus produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!loading) {
        setErrorMessage(null);
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Hapus Produk?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Konfirmasi penghapusan data produk dari sistem kasir
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Product Preview Card */}
        <div className="my-3 p-3.5 rounded-xl border border-border/70 bg-muted/30 flex items-center gap-3.5">
          {product.imageUrl ? (
            <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-border/60 shrink-0 bg-muted">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-14 w-14 rounded-xl border border-dashed border-border/80 bg-muted/60 flex items-center justify-center shrink-0">
              <Package className="h-6 w-6 text-muted-foreground/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate text-foreground">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              {product.sku ? (
                <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {product.sku}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">Tanpa SKU</span>
              )}
              <span className="text-xs font-bold text-primary">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Error Notification if Cannot Delete */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Tidak dapat menghapus</p>
              <p className="text-destructive/90 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl font-semibold gap-1.5 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Hapus Produk
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
