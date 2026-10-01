"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteProductDialog } from "./DeleteProductDialog";

interface DeleteProductButtonProps {
  productId: number;
  productName?: string;
  sku?: string | null;
  price?: number;
  imageUrl?: string | null;
  className?: string;
}

export function DeleteProductButton({ 
  productId, 
  productName = "Produk", 
  sku = null, 
  price = 0, 
  imageUrl = null,
  className
}: DeleteProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        type="button" 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        variant="ghost" 
        size="icon" 
        className={className || "text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8"}
        title="Hapus produk"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteProductDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        product={{
          id: productId,
          name: productName,
          sku,
          price,
          imageUrl,
        }}
      />
    </>
  );
}
