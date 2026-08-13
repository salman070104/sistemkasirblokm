"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Plus, Minus, Trash2, CheckCircle2, ShoppingCart, Sparkles, Package, ChevronUp, X, LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import { processTransaction } from "../actions/transaction";
import CameraScanner from "./CameraScanner";

type Product = {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
};

type CartItem = Product & {
  quantity: number;
};

export default function POSClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{ change: number, total: number } | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cashNum = parseInt(cashAmount) || 0;
  const changeAmount = cashNum - totalAmount;

  const handleCheckout = async () => {
    if (changeAmount < 0) return;
    setIsProcessing(true);

    const items = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const res = await processTransaction(items, cashNum);
    setIsProcessing(false);

    if (res.success) {
      setSuccessData({ change: changeAmount, total: totalAmount });
      setCart([]);
      setCashAmount("");
    } else {
      alert(res.error || "Gagal checkout");
    }
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
    setIsCheckoutOpen(false);
    setMobileCartOpen(false);
  };

  /* ═══════════ Cart Content (shared between desktop sidebar and mobile drawer) ═══════════ */
  const cartContent = (
    <>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground space-y-3">
            <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-2xl bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 lg:h-10 lg:w-10 opacity-20" />
            </div>
            <p className="font-medium text-sm">Keranjang masih kosong</p>
            <p className="text-xs text-center max-w-[200px]">Klik pada produk untuk menambahkan</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-start justify-between group p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold leading-tight mb-1 truncate">{item.name}</h4>
                <p className="text-xs text-muted-foreground mb-2.5">Rp {item.price.toLocaleString("id-ID")} / pcs</p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-bold w-8 text-center bg-background rounded-md py-0.5">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between h-full ml-3">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <span className="text-sm font-bold mt-4 text-primary">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 lg:p-5 border-t border-border/60 bg-muted/20 space-y-3 lg:space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium text-sm lg:text-base">Total</span>
          <span className="text-xl lg:text-2xl font-bold tracking-tight">Rp {totalAmount.toLocaleString("id-ID")}</span>
        </div>
        <Button 
          className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
          disabled={cart.length === 0}
          onClick={() => setIsCheckoutOpen(true)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Bayar Sekarang
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col bg-muted/20">
        <div className="p-3 lg:p-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari barang..."
                className="pl-10 bg-background h-10 lg:h-11 rounded-xl border-border/60 focus:ring-2 focus:ring-primary/20 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex bg-muted/50 p-1 rounded-xl">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className={`h-8 w-8 lg:h-9 lg:w-9 rounded-lg ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className={`h-8 w-8 lg:h-9 lg:w-9 rounded-lg ${viewMode === "list" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <CameraScanner products={products} onProductFound={addToCart} />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3 lg:p-4 pb-24 lg:pb-4">
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4"
              : "flex flex-col gap-2 lg:gap-3"
          }>
            {filteredProducts.map(product => {
              const inCart = cart.find(c => c.id === product.id);
              return viewMode === "grid" ? (
                <div 
                  key={product.id} 
                  className={`product-card bg-card rounded-xl lg:rounded-2xl border shadow-sm overflow-hidden cursor-pointer flex flex-col relative ${
                    product.stock <= 0 ? "opacity-60 pointer-events-none" : ""
                  } ${inCart ? "ring-2 ring-primary ring-offset-1 lg:ring-offset-2" : "border-border/60 hover:border-primary/40"}`}
                  onClick={() => addToCart(product)}
                >
                  {inCart && (
                    <div className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 z-10 flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] lg:text-xs font-bold shadow-lg shadow-primary/30">
                      {inCart.quantity}
                    </div>
                  )}

                  <div className="relative h-24 sm:h-28 lg:h-32 w-full bg-muted/50">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground/40">
                        <Package className="h-8 w-8 lg:h-10 lg:w-10" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-destructive text-destructive-foreground text-[10px] lg:text-xs px-2 py-1 lg:px-3 lg:py-1.5 rounded-full font-semibold">Stok Habis</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 lg:p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-xs lg:text-sm line-clamp-2" title={product.name}>{product.name}</h3>
                      {product.sku && <p className="text-[10px] lg:text-[11px] text-muted-foreground mt-0.5 font-mono">{product.sku}</p>}
                    </div>
                    <div className="mt-1.5 lg:mt-2 flex items-end justify-between">
                      <span className="font-bold text-primary text-xs lg:text-sm">Rp {product.price.toLocaleString("id-ID")}</span>
                      <span className="text-[9px] lg:text-[11px] text-muted-foreground bg-muted px-1 lg:px-1.5 py-0.5 rounded-md">Stok: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  key={product.id} 
                  className={`product-card bg-card rounded-xl border shadow-sm overflow-hidden cursor-pointer flex items-center relative p-2 gap-3 lg:gap-4 ${
                    product.stock <= 0 ? "opacity-60 pointer-events-none" : ""
                  } ${inCart ? "ring-2 ring-primary ring-offset-1" : "border-border/60 hover:border-primary/40"}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="relative h-12 w-12 lg:h-16 lg:w-16 rounded-lg bg-muted/50 overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground/40">
                        <Package className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-destructive text-destructive-foreground text-[8px] px-1 py-0.5 rounded font-bold">Habis</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base line-clamp-1" title={product.name}>{product.name}</h3>
                    {product.sku && <p className="text-[10px] lg:text-[11px] text-muted-foreground font-mono">{product.sku}</p>}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-bold text-primary text-sm lg:text-base">Rp {product.price.toLocaleString("id-ID")}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">Stok: {product.stock}</span>
                  </div>

                  {inCart && (
                    <div className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-md">
                      {inCart.quantity}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 lg:py-16 text-center text-muted-foreground">
                <Search className="h-10 w-10 lg:h-12 lg:w-12 mx-auto opacity-20 mb-3" />
                <p className="font-medium text-sm lg:text-base">Barang tidak ditemukan</p>
                <p className="text-xs lg:text-sm mt-1">Coba kata kunci lain</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ MOBILE: Floating Cart Button + Drawer ═══════ */}
      {cart.length > 0 && !mobileCartOpen && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="lg:hidden fixed bottom-20 left-4 right-4 z-30 bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl shadow-primary/30 flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 h-4 w-4 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span className="font-semibold text-sm">{totalItems} Item</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Rp {totalAmount.toLocaleString("id-ID")}</span>
            <ChevronUp className="h-4 w-4" />
          </div>
        </button>
      )}

      {/* Mobile Cart Drawer */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-float-in">
            <div className="flex items-center justify-between p-4 border-b border-border/60">
              <h3 className="font-bold text-lg flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                Keranjang
              </h3>
              <button onClick={() => setMobileCartOpen(false)} className="h-8 w-8 rounded-xl hover:bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            {cartContent}
          </div>
        </div>
      )}

      {/* ═══════ DESKTOP: Cart Sidebar ═══════ */}
      <div className="hidden lg:flex w-[400px] bg-card border-l border-border/60 flex-col shadow-2xl shadow-primary/5">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <ShoppingCart className="h-4 w-4" />
            </div>
            Keranjang
          </h3>
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
            {totalItems} Item
          </span>
        </div>
        {cartContent}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl max-h-[90vh] overflow-auto mx-4 sm:mx-auto">
          {!successData ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Pembayaran</DialogTitle>
                <DialogDescription>
                  Masukkan jumlah uang yang diterima dari pelanggan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-between items-center bg-primary/5 p-3 lg:p-4 rounded-xl border border-primary/10">
                  <span className="font-medium text-muted-foreground text-sm">Total Tagihan</span>
                  <span className="text-xl lg:text-2xl font-bold text-primary">Rp {totalAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Uang Tunai (Rp)</label>
                  <Input 
                    type="number" 
                    value={cashAmount} 
                    onChange={e => setCashAmount(e.target.value)} 
                    placeholder="Contoh: 50000"
                    autoFocus
                    className="text-lg h-12 rounded-xl"
                  />
                </div>
                {cashAmount && (
                  <div className={`flex justify-between items-center p-3 lg:p-4 rounded-xl border ${changeAmount >= 0 ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-700' : 'bg-red-500/5 border-red-500/15 text-red-700'}`}>
                    <span className="font-medium text-sm">Kembalian</span>
                    <span className="text-lg lg:text-xl font-bold">
                      {changeAmount >= 0 ? `Rp ${changeAmount.toLocaleString("id-ID")}` : "Uang Kurang"}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 20000, 50000, 100000].map(amt => (
                    <Button key={amt} variant="outline" type="button" onClick={() => setCashAmount(amt.toString())} className="text-xs rounded-xl h-10 font-semibold hover:bg-primary/5 hover:border-primary/30">
                      {amt >= 1000 ? `${amt / 1000}k` : amt}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" type="button" onClick={() => setCashAmount(totalAmount.toString())} className="text-sm font-semibold bg-primary/5 border-primary/15 hover:bg-primary/10 rounded-xl h-10">
                  💰 Uang Pas
                </Button>
              </div>
              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="rounded-xl w-full sm:w-auto">Batal</Button>
                <Button onClick={handleCheckout} disabled={changeAmount < 0 || isProcessing || !cashAmount} className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                  {isProcessing ? "Memproses..." : "Selesaikan Pembayaran"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 lg:h-20 lg:w-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center animate-float-in">
                <CheckCircle2 className="h-10 w-10 lg:h-12 lg:w-12" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold animate-float-in-delay-1">Transaksi Berhasil! 🎉</h2>
              <div className="bg-muted/50 w-full p-4 lg:p-5 rounded-xl space-y-3 mt-4 text-left animate-float-in-delay-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Total Tagihan</span>
                  <span className="font-medium">Rp {successData.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Uang Tunai</span>
                  <span className="font-medium">Rp {(successData.total + successData.change).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-3">
                  <span className="font-bold">Kembalian</span>
                  <span className="font-bold text-lg lg:text-xl text-emerald-600">Rp {successData.change.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="w-full flex gap-2 mt-4 pt-4 border-t animate-float-in-delay-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => window.print()}>🖨️ Cetak Struk</Button>
                <Button className="flex-1 rounded-xl shadow-lg shadow-primary/20" onClick={handleCloseSuccess}>Transaksi Baru</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
