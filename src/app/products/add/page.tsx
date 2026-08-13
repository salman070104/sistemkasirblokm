"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createProduct } from "../../actions/product";
import { compressImage } from "@/lib/image-compression";
import { ArrowLeft, Loader2, ImagePlus, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      // Compress image if present
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        const compressedImage = await compressImage(imageFile);
        formData.set("image", compressedImage);
      }

      const result = await createProduct(formData);
      
      if (result.success) {
        router.push("/products");
      } else {
        alert(result.error || "Gagal menyimpan produk");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 animate-float-in">
        <Link href="/products">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tambah Produk Baru</h2>
          <p className="text-muted-foreground mt-1">
            Isi detail produk untuk menambahkannya ke inventaris.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm animate-float-in-delay-1">
        <CardContent className="p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Foto Produk</Label>
              <div className="flex items-start gap-5">
                <label htmlFor="image" className="cursor-pointer group">
                  {imagePreview ? (
                    <div className="relative h-28 w-28 rounded-2xl border-2 border-primary/30 overflow-hidden shadow-lg shadow-primary/10 group-hover:border-primary/50 transition-colors">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 flex flex-col items-center justify-center transition-all">
                      <ImagePlus className="h-7 w-7 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                      <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">Upload</span>
                    </div>
                  )}
                </label>
                <Input 
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="flex-1 text-sm text-muted-foreground pt-2">
                  <p className="font-medium text-foreground">Klik area untuk mengunggah foto</p>
                  <p className="mt-1">Format: JPG, PNG, WebP. Maks 5MB</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Nama Produk <span className="text-destructive">*</span></Label>
                <Input id="name" name="name" required placeholder="Contoh: Kopi Susu" className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-semibold">SKU / Barcode</Label>
                <Input id="sku" name="sku" placeholder="Contoh: KS-001" className="rounded-xl h-11 font-mono" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold">Harga Jual (Rp) <span className="text-destructive">*</span></Label>
                <Input id="price" name="price" type="number" required placeholder="Contoh: 15000" min="0" className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-semibold">Stok Awal <span className="text-destructive">*</span></Label>
                <Input id="stock" name="stock" type="number" required placeholder="Contoh: 100" min="0" className="rounded-xl h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">Deskripsi Produk</Label>
              <Input id="description" name="description" placeholder="Keterangan opsional..." className="rounded-xl h-11" />
            </div>

            <div className="flex justify-end pt-4 border-t border-border/60">
              <div className="flex gap-3">
                <Link href="/products">
                  <Button type="button" variant="outline" className="rounded-xl">Batal</Button>
                </Link>
                <Button type="submit" disabled={loading} className="rounded-xl shadow-lg shadow-primary/20 px-6">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Produk
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
