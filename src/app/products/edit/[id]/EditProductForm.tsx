"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { ProductForm, ProductFormData } from "../../ProductForm";

interface EditProductFormProps {
  product: ProductFormData;
}

export default function EditProductForm({ product }: EditProductFormProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3.5 animate-float-in">
        <Link href="/products">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/70 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Edit Produk
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Perbarui data untuk <span className="font-bold text-foreground">{product.name}</span>
          </p>
        </div>
      </div>

      <Card className="rounded-3xl border-border/60 shadow-xs animate-float-in-delay-1 overflow-hidden">
        <CardContent className="p-5 sm:p-8">
          <ProductForm initialData={product} />
        </CardContent>
      </Card>
    </div>
  );
}
