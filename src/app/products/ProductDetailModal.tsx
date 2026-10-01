"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Barcode, 
  Copy, 
  Check, 
  Edit, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Tag, 
  Layers 
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export type ProductDetail = {
  id: number;
  name: string;
  description?: string | null;
  sku?: string | null;
  price: number;
  buyPrice?: number | null;
  category?: { id: number; name: string } | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

interface ProductDetailModalProps {
  product: ProductDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: ProductDetail) => void;
  onDelete?: (product: ProductDetail) => void;
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  const [copiedSku, setCopiedSku] = useState(false);

  if (!product) return null;

  const categoryName = product.category?.name || product.categoryName;
  const priceNum = Number(product.price);
  const buyPriceNum = product.buyPrice ? Number(product.buyPrice) : null;
  const profit = buyPriceNum !== null ? priceNum - buyPriceNum : null;
  const margin = buyPriceNum !== null && priceNum > 0 ? Math.round((profit! / priceNum) * 100) : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Detail Produk
            </span>
            {categoryName && (
              <Badge variant="secondary" className="font-semibold text-xs">
                {categoryName}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight mt-1 text-foreground">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        {/* Product Image / Banner */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-muted/50 border border-border/60 my-2">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
              <Package className="h-16 w-16 mb-2 stroke-[1.2]" />
              <span className="text-xs font-medium">Foto Produk Belum Diunggah</span>
            </div>
          )}
        </div>

        {/* Pricing & Margin Highlight */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">Harga Jual</span>
            <span className="text-lg font-black text-primary">
              Rp {priceNum.toLocaleString("id-ID")}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">Harga Modal / Beli</span>
            {buyPriceNum ? (
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-foreground">
                  Rp {buyPriceNum.toLocaleString("id-ID")}
                </span>
                {margin !== null && (
                  <Badge variant="success" className="text-[10px] block w-fit font-bold">
                    Untung Rp {profit?.toLocaleString("id-ID")} ({margin}%)
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Belum diisi</span>
            )}
          </div>
        </div>

        {/* SKU & Barcode */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background text-xs">
          <div className="flex items-center gap-2">
            <Barcode className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">SKU / Barcode:</span>
            <span className="font-mono font-bold text-foreground">
              {product.sku || "Belum ada SKU"}
            </span>
          </div>
          {product.sku && (
            <button
              onClick={() => copyToClipboard(product.sku!)}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              {copiedSku ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Salin</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="space-y-1 text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
              Keterangan / Spesifikasi
            </span>
            <p className="p-3 rounded-xl bg-muted/20 border border-border/50 text-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(product);
              }}
              className="rounded-xl text-destructive hover:bg-destructive/10 text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </Button>
          )}

          {onEdit && (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(product);
              }}
              className="rounded-xl text-xs gap-1.5 font-semibold"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Produk
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
