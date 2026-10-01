"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createProduct, updateProduct } from "../actions/product";
import { compressImage } from "@/lib/image-compression";
import { 
  Loader2, 
  ImagePlus, 
  Trash2, 
  Sparkles, 
  Barcode, 
  Tag, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Plus
} from "lucide-react";
import Image from "next/image";

const POPULAR_CATEGORIES = [
  "Percetakan",
  "Digital Printing",
  "Spanduk & Banner",
  "Stiker & Label",
  "Jilid & Finishing",
  "Merchandise",
  "Undangan & Kartu",
  "ATK & Lainnya",
];

export type ProductFormData = {
  id?: number;
  name: string;
  description?: string | null;
  sku?: string | null;
  price: number;
  buyPrice?: number | null;
  categoryName?: string | null;
  imageUrl?: string | null;
};

interface ProductFormProps {
  initialData?: ProductFormData;
  existingCategories?: Array<{ id?: number; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function ProductForm({
  initialData,
  existingCategories = [],
  onSuccess,
  onCancel,
  isModal = false,
}: ProductFormProps) {
  const router = useRouter();
  const fileInputId = useId();
  const isEditing = Boolean(initialData?.id);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : "");
  const [buyPrice, setBuyPrice] = useState<string>(initialData?.buyPrice ? String(initialData.buyPrice) : "");
  const [category, setCategory] = useState(initialData?.categoryName || "");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Image states
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [newImageSelected, setNewImageSelected] = useState(false);

  // Quick Category Picker
  const mergedCategories = Array.from(
    new Set([
      ...POPULAR_CATEGORIES,
      ...existingCategories.map((c) => c.name),
      ...(initialData?.categoryName ? [initialData.categoryName] : []),
    ])
  ).filter(Boolean);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setRemoveImage(false);
      setNewImageSelected(true);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setRemoveImage(true);
    setNewImageSelected(false);
    const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleGenerateSku = () => {
    // Generate clean standard SKU like BM-8392 or initials from name
    const prefix = name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 3) || "BM"
      : "BM";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${randomSuffix}`);
  };

  // Profit Margin Calculation
  const priceNum = parseFloat(price) || 0;
  const buyPriceNum = parseFloat(buyPrice) || 0;
  const profitNum = priceNum - buyPriceNum;
  const marginPercent = priceNum > 0 && buyPriceNum > 0 ? Math.round((profitNum / priceNum) * 100) : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("price", price);
      if (sku) formData.set("sku", sku);
      if (buyPrice) formData.set("buyPrice", buyPrice);
      if (category) formData.set("category", category);
      if (description) formData.set("description", description);

      if (isEditing) {
        if (removeImage) {
          formData.set("removeImage", "true");
        }
        if (newImageSelected) {
          const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
          const imageFile = fileInput?.files?.[0];
          if (imageFile && imageFile.size > 0) {
            const compressed = await compressImage(imageFile);
            formData.set("image", compressed);
          }
        }
      } else {
        const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
        const imageFile = fileInput?.files?.[0];
        if (imageFile && imageFile.size > 0) {
          const compressed = await compressImage(imageFile);
          formData.set("image", compressed);
        }
      }

      let result;
      if (isEditing && initialData?.id) {
        result = await updateProduct(initialData.id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (result.success) {
        router.refresh();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/products");
        }
      } else {
        setErrorMessage(result.error || "Gagal menyimpan data produk.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-float-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-snug">{errorMessage}</p>
        </div>
      )}

      {/* ── Foto Produk ── */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Foto Produk
        </Label>
        <div className="flex items-start gap-4">
          <div className="relative group shrink-0">
            <label
              htmlFor={fileInputId}
              className={`relative flex flex-col items-center justify-center h-28 w-28 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                imagePreview
                  ? "border-primary/40 shadow-md shadow-primary/10 hover:border-primary"
                  : "border-dashed border-border/80 hover:border-primary/50 bg-muted/30 hover:bg-primary/5"
              }`}
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <ImagePlus className="h-7 w-7 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                  <span className="text-[11px] font-medium text-muted-foreground mt-1.5 group-hover:text-foreground">
                    Upload Foto
                  </span>
                </div>
              )}
            </label>

            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                title="Hapus foto"
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Input
            id={fileInputId}
            name="image"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />

          <div className="flex-1 text-xs text-muted-foreground pt-1 space-y-1">
            <p className="font-semibold text-foreground">Format: JPG, PNG, atau WebP</p>
            <p>Otomatis dikompresi agar loading kasir super cepat dan hemat kuota.</p>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-destructive hover:underline font-semibold block pt-1 text-xs"
              >
                Hapus foto saat ini
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* ── Informasi Utama ── */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="product-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nama Produk <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Cetak Brosur A4 Art Paper 150gr"
            className="h-11 rounded-xl border-border/70 focus:border-primary text-sm font-medium"
          />
        </div>

        {/* ── Kategori ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Kategori Produk
            </Label>
            {category && (
              <span className="text-xs text-primary font-medium">Terpilih: {category}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Pilih di bawah atau ketik nama kategori..."
              className="h-10 rounded-xl border-border/70 text-xs font-medium"
            />
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {mergedCategories.slice(0, 8).map((catName) => {
              const isSelected = category.toLowerCase() === catName.toLowerCase();
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setCategory(catName)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Barcode / SKU & Auto Generator ── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="product-sku" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Barcode className="h-3.5 w-3.5" />
              SKU / Barcode
            </Label>
            <button
              type="button"
              onClick={handleGenerateSku}
              className="text-[11px] text-primary hover:text-primary/80 font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              Buat SKU Otomatis
            </button>
          </div>
          <Input
            id="product-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Contoh: BRS-001 (Bisa discan di Kasir)"
            className="h-11 rounded-xl font-mono text-sm border-border/70"
          />
        </div>

        {/* ── Harga Jual & Harga Modal ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Harga Jual */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Harga Jual (Rp) <span className="text-destructive">*</span>
              </Label>
              {priceNum > 0 && (
                <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                  Rp {priceNum.toLocaleString("id-ID")}
                </Badge>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                id="product-price"
                type="number"
                required
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                className="pl-9 h-11 rounded-xl font-semibold border-border/70 text-sm"
              />
            </div>
            {/* Quick Price Add Buttons */}
            <div className="flex gap-1.5 pt-1">
              {[5000, 10000, 20000, 50000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setPrice(String((parseFloat(price) || 0) + inc))}
                  className="text-[10px] font-mono bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md border border-border/50"
                >
                  +{inc >= 1000 ? `${inc / 1000}k` : inc}
                </button>
              ))}
            </div>
          </div>

          {/* Harga Modal (Opsional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-buyprice" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Harga Modal (Opsional)
              </Label>
              {marginPercent !== null && marginPercent >= 0 && (
                <Badge variant="success" className="text-[10px] font-semibold gap-1">
                  <TrendingUp className="h-2.5 w-2.5" />
                  Margin {marginPercent}%
                </Badge>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                id="product-buyprice"
                type="number"
                min="0"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="15000"
                className="pl-9 h-11 rounded-xl border-border/70 text-sm"
              />
            </div>
            {profitNum > 0 && buyPriceNum > 0 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                Estimasi Laba: Rp {profitNum.toLocaleString("id-ID")} / item
              </p>
            )}
          </div>
        </div>

        {/* ── Deskripsi ── */}
        <div className="space-y-1.5">
          <Label htmlFor="product-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Deskripsi / Spesifikasi Produk (Opsional)
          </Label>
          <textarea
            id="product-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Keterangan ukuran, pilihan kertas, minimal order, atau instruksi pengerjaan..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-border/70 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* ── Footer Tombol Aksi ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-5"
          >
            Batal
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/products")}
            disabled={loading}
            className="rounded-xl px-5"
          >
            Batal
          </Button>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl font-semibold px-6 shadow-md shadow-primary/20 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {isEditing ? "Simpan Perubahan" : "Tambahkan Produk"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
