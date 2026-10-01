"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  PlusCircle, 
  Search, 
  LayoutGrid, 
  List, 
  Edit, 
  Trash2, 
  Package, 
  X, 
  Copy, 
  Check, 
  Eye, 
  TrendingUp, 
  Tag, 
  SlidersHorizontal,
  DollarSign,
  AlertCircle,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { ProductForm, ProductFormData } from "./ProductForm";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { ProductDetailModal } from "./ProductDetailModal";

export type ProductItem = {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  buyPrice: number | null;
  imageUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  category: { id: number; name: string } | null;
};

interface ProductsClientProps {
  initialProducts: ProductItem[];
  categories: { id: number; name: string }[];
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  // State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "name_asc" | "name_desc" | "price_asc" | "price_desc">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);
  const [copiedSkuId, setCopiedSkuId] = useState<number | null>(null);

  // Copy SKU helper
  const handleCopySku = (e: React.MouseEvent, id: number, skuText: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skuText);
    setCopiedSkuId(id);
    setTimeout(() => setCopiedSkuId(null), 1800);
  };

  // Metrics
  const totalProducts = initialProducts.length;
  const totalValue = useMemo(() => {
    return initialProducts.reduce((sum, p) => sum + p.price, 0);
  }, [initialProducts]);

  const avgPrice = totalProducts > 0 ? Math.round(totalValue / totalProducts) : 0;
  const missingInfoCount = useMemo(() => {
    return initialProducts.filter((p) => !p.imageUrl || !p.sku).length;
  }, [initialProducts]);

  // Unique category names for tabs
  const categoryTabs = useMemo(() => {
    const list = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.category?.name) list.add(p.category.name);
    });
    return Array.from(list);
  }, [initialProducts]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.price.toString().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category?.name === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return result;
  }, [initialProducts, search, selectedCategory, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-float-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Katalog Produk
            </h1>
            <Badge variant="secondary" className="font-bold text-xs">
              {totalProducts} Produk
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data barang, harga jual, margin keuntungan, dan barcode untuk kasir.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-semibold gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-float-in-delay-1">
        {/* Total Produk */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Item
            </p>
            <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              {totalProducts}
            </p>
          </div>
        </div>

        {/* Rata-rata Harga */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Rata-rata Harga
            </p>
            <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              Rp {avgPrice.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Kategori Aktif */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Kategori
            </p>
            <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              {categoryTabs.length} Golongan
            </p>
          </div>
        </div>

        {/* Tanpa Foto / SKU */}
        <div className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Perlu Lengkapi
            </p>
            <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              {missingInfoCount} Item
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter, Search & View Controls Bar ── */}
      <div className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs space-y-3.5 animate-float-in-delay-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama barang, barcode / SKU, atau harga..."
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

          {/* Sort & View Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-muted/40 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="newest">Terbaru</option>
                <option value="name_asc">Nama (A - Z)</option>
                <option value="name_desc">Nama (Z - A)</option>
                <option value="price_asc">Harga: Rendah ke Tinggi</option>
                <option value="price_desc">Harga: Tinggi ke Rendah</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Tampilan Grid Card"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Tampilan Tabel"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua ({totalProducts})
          </button>

          {categoryTabs.map((catName) => {
            const count = initialProducts.filter((p) => p.category?.name === catName).length;
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {catName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product List Display (Grid / Table) ── */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center flex flex-col items-center justify-center animate-float-in">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/40 mb-3">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">Tidak Ada Produk Ditemukan</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {search || selectedCategory !== "all"
              ? "Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih."
              : "Belum ada produk yang terdaftar di katalog. Klik tombol di bawah untuk menambah produk pertama Anda."}
          </p>
          {(search || selectedCategory !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-4 rounded-xl text-xs"
            >
              Reset Filter
            </Button>
          )}
          {!search && selectedCategory === "all" && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 rounded-xl text-xs gap-1.5 font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              Tambah Produk Sekarang
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* ──── GRID CARD VIEW ──── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 animate-float-in">
          {filteredProducts.map((product) => {
            const hasMargin = product.buyPrice && product.price > Number(product.buyPrice);
            const marginPercent = hasMargin
              ? Math.round(((product.price - Number(product.buyPrice!)) / product.price) * 100)
              : null;

            return (
              <div
                key={product.id}
                onClick={() => setPreviewProduct(product)}
                className="group relative bg-card rounded-2xl border border-border/70 hover:border-primary/50 shadow-xs hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Image Area */}
                <div className="relative aspect-4/3 w-full bg-muted/40 overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30">
                      <Package className="h-8 w-8 stroke-[1.2]" />
                    </div>
                  )}

                  {/* Category Pill Over Image */}
                  {product.category?.name && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-bold bg-background/90 backdrop-blur-md text-foreground px-2 py-0.5 rounded-lg shadow-xs">
                        {product.category.name}
                      </span>
                    </div>
                  )}

                  {/* Profit Margin Tag */}
                  {marginPercent !== null && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] font-extrabold bg-emerald-600/90 backdrop-blur-md text-white px-1.5 py-0.5 rounded-md shadow-xs">
                        +{marginPercent}% Laba
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    {/* SKU Tag with One-Click Copy */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      {product.sku ? (
                        <button
                          type="button"
                          onClick={(e) => handleCopySku(e, product.id, product.sku!)}
                          title="Klik untuk salin barcode"
                          className="font-mono text-[10px] text-muted-foreground bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
                        >
                          {copiedSkuId === product.id ? (
                            <>
                              <Check className="h-2.5 w-2.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Salin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-2.5 w-2.5 opacity-60" />
                              <span>{product.sku}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">Tanpa Barcode</span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Harga</span>
                      <span className="font-extrabold text-sm sm:text-base text-primary">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            sku: product.sku,
                            price: product.price,
                            buyPrice: product.buyPrice,
                            categoryName: product.category?.name || null,
                            imageUrl: product.imageUrl,
                          })
                        }
                        title="Edit Produk"
                        className="h-7 w-7 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground flex items-center justify-center transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingProduct(product)}
                        title="Hapus Produk"
                        className="h-7 w-7 rounded-lg bg-muted/60 hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ──── TABLE VIEW ──── */
        <div className="rounded-2xl border border-border/60 bg-card shadow-xs overflow-x-auto animate-float-in">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[70px] font-bold text-xs uppercase tracking-wider">
                  Foto
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Produk & Spesifikasi
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Kategori
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  SKU / Barcode
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Harga Jual
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Harga Modal & Laba
                </TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider pr-6">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const priceNum = product.price;
                const buyPriceNum = product.buyPrice ? Number(product.buyPrice) : null;
                const profit = buyPriceNum !== null ? priceNum - buyPriceNum : null;
                const margin =
                  buyPriceNum !== null && priceNum > 0
                    ? Math.round((profit! / priceNum) * 100)
                    : null;

                return (
                  <TableRow
                    key={product.id}
                    onClick={() => setPreviewProduct(product)}
                    className="table-row-hover cursor-pointer"
                  >
                    <TableCell>
                      {product.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border/60 bg-muted">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl border border-dashed border-border/70 bg-muted/40 flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-sm text-foreground">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category?.name ? (
                        <Badge variant="outline" className="font-medium text-xs bg-muted/30">
                          {product.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.sku ? (
                        <button
                          type="button"
                          onClick={(e) => handleCopySku(e, product.id, product.sku!)}
                          title="Klik untuk salin"
                          className="font-mono text-xs bg-muted/60 hover:bg-muted px-2 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          {copiedSkuId === product.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-muted-foreground" />
                              <span>{product.sku}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-extrabold text-sm text-primary">
                        Rp {priceNum.toLocaleString("id-ID")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {buyPriceNum !== null ? (
                        <div className="space-y-0.5">
                          <p className="text-xs text-foreground font-medium">
                            Rp {buyPriceNum.toLocaleString("id-ID")}
                          </p>
                          {margin !== null && (
                            <span className="inline-flex text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Untung Rp {profit?.toLocaleString("id-ID")} ({margin}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewProduct(product)}
                          title="Lihat Detail"
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setEditingProduct({
                              id: product.id,
                              name: product.name,
                              description: product.description,
                              sku: product.sku,
                              price: product.price,
                              buyPrice: product.buyPrice,
                              categoryName: product.category?.name || null,
                              imageUrl: product.imageUrl,
                            })
                          }
                          title="Edit Produk"
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingProduct(product)}
                          title="Hapus Produk"
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Dialog Quick Add Product ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Tambah Produk Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Masukkan informasi lengkap produk untuk ditambahkan ke katalog kasir.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <ProductForm
              existingCategories={categories}
              onCancel={() => setIsAddModalOpen(false)}
              onSuccess={() => setIsAddModalOpen(false)}
              isModal
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Quick Edit Product ── */}
      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Produk
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Perbarui harga, barcode, atau foto untuk{" "}
              <span className="font-bold text-foreground">{editingProduct?.name}</span>
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="mt-2">
              <ProductForm
                initialData={editingProduct}
                existingCategories={categories}
                onCancel={() => setEditingProduct(null)}
                onSuccess={() => setEditingProduct(null)}
                isModal
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog Hapus Produk ── */}
      <DeleteProductDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        product={deletingProduct}
        onSuccess={() => setDeletingProduct(null)}
      />

      {/* ── Modal Detail Preview Produk ── */}
      <ProductDetailModal
        open={Boolean(previewProduct)}
        onOpenChange={(open) => !open && setPreviewProduct(null)}
        product={previewProduct}
        onEdit={(p) =>
          setEditingProduct({
            id: p.id,
            name: p.name,
            description: p.description,
            sku: p.sku,
            price: p.price,
            buyPrice: p.buyPrice,
            categoryName: p.category?.name || p.categoryName || null,
            imageUrl: p.imageUrl,
          })
        }
        onDelete={(p) => setDeletingProduct(p as ProductItem)}
      />
    </div>
  );
}
