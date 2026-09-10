"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Plus, Minus, Trash2, CheckCircle2, ShoppingCart, Sparkles, Package, ChevronUp, X, LayoutGrid, List, Printer } from "lucide-react";
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

export type ReceiptData = {
  receiptNumber: string;
  date: Date;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  cash: number;
  change: number;
};

const DEMO_RECEIPT: ReceiptData = {
  receiptNumber: "TRX-20260910-8821",
  date: new Date(),
  items: [
    { name: "Cetak Spanduk Flexi 280g (3x1m)", quantity: 1, price: 60000 },
    { name: "Print A3+ Art Paper 260g (Brosur)", quantity: 5, price: 8000 },
    { name: "Jilid Spiral Kawat + Mika", quantity: 2, price: 15000 },
  ],
  total: 130000,
  cash: 150000,
  change: 20000,
};

export default function POSClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<ReceiptData | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [printEnabled, setPrintEnabled] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [storeConfig, setStoreConfig] = useState({
    name: "BLOK M STUDIO",
    tagline: "PERCETAKAN & DIGITAL PRINTING",
    address: "Jl. Raya Ciledug-Ketanggungan",
    phone: "087858231341 / 087816548545",
    footer: "Terima Kasih Atas Kunjungan Anda!",
    paperWidth: "58mm",
  });
  const router = useRouter();

  // Load pengaturan print & toko dari localStorage
  useEffect(() => {
    const loadSettings = () => {
      const savedPrint = localStorage.getItem("pos_print_enabled");
      setPrintEnabled(savedPrint === "true");

      const savedAutoPrint = localStorage.getItem("pos_auto_print");
      setAutoPrint(savedAutoPrint === "true");

      const savedName = localStorage.getItem("pos_store_name");
      const savedTagline = localStorage.getItem("pos_store_tagline");
      const savedAddress = localStorage.getItem("pos_store_address");
      const savedPhone = localStorage.getItem("pos_store_phone");
      const savedFooter = localStorage.getItem("pos_store_footer");
      const savedWidth = localStorage.getItem("pos_paper_width");

      setStoreConfig({
        name: savedName || "BLOK M STUDIO",
        tagline: savedTagline || "PERCETAKAN & DIGITAL PRINTING",
        address: savedAddress || "Jl. Raya Ciledug-Ketanggungan",
        phone: savedPhone || "087858231341 / 087816548545",
        footer: savedFooter || "Terima Kasih Atas Kunjungan Anda!",
        paperWidth: savedWidth || "58mm",
      });
    };

    loadSettings();
    window.addEventListener("storage", loadSettings);
    return () => window.removeEventListener("storage", loadSettings);
  }, []);

  const togglePrintEnabled = () => {
    const nextVal = !printEnabled;
    setPrintEnabled(nextVal);
    localStorage.setItem("pos_print_enabled", nextVal ? "true" : "false");
  };

  // Polling data produk setiap 5 detik agar auto-update tanpa hard refresh
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

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

    const currentItems = cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }));
    const res = await processTransaction(items, cashNum);
    setIsProcessing(false);

    if (res.success) {
      setSuccessData({ 
        receiptNumber: res.receiptNumber || `TRX-${Date.now()}`,
        date: res.createdAt ? new Date(res.createdAt) : new Date(),
        items: currentItems,
        total: totalAmount,
        cash: cashNum,
        change: changeAmount 
      });
      setCart([]);
      setCashAmount("");

      // Jika cetak struk aktif dan auto-print aktif, langsung cetak otomatis
      if (printEnabled && autoPrint) {
        setTimeout(() => {
          window.print();
        }, 150);
      }
    } else {
      alert(res.error || "Gagal checkout");
    }
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
    setShowReceiptPreview(false);
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
          onClick={() => {
            setIsCheckoutOpen(true);
            setMobileCartOpen(false);
          }}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Bayar Sekarang
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col bg-muted/20 min-h-0">
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
            <button
              type="button"
              onClick={togglePrintEnabled}
              className={`h-8 lg:h-9 px-2.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all font-medium ${
                printEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
              }`}
              title="Klik untuk ON/OFF fitur cetak struk"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Struk: {printEnabled ? "ON" : "OFF (Sementara)"}</span>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSuccessData(DEMO_RECEIPT);
                setShowReceiptPreview(true);
                setIsCheckoutOpen(true);
              }}
              className="h-8 lg:h-9 rounded-xl text-xs gap-1.5 border-dashed border-primary/40 hover:bg-primary/5 text-primary font-medium"
              title="Lihat Contoh Format Struk Blok M Studio"
            >
              Contoh Struk
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-4 pb-36 lg:pb-4 min-h-0">
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
        <div className="lg:hidden fixed inset-0 z-[60]">
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
        <DialogContent className="sm:max-w-[440px] rounded-2xl max-h-[90vh] overflow-auto">
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
            <div className="py-3 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  {successData.receiptNumber.includes("8821") ? "Contoh Struk Percetakan" : "Transaksi Berhasil Dicatat! 🎉"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Data penjualan telah tersimpan otomatis ke database & laporan.
              </p>

              {/* JIKA CETAK STRUK NONAKTIF (TAMPILAN CEPAT TANPA PRINT) */}
              {!printEnabled && !successData.receiptNumber.includes("8821") && !showReceiptPreview ? (
                <div className="w-full space-y-3 mt-1">
                  <div className="bg-muted/40 w-full p-4 rounded-xl space-y-2.5 text-left border border-border/60">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Tagihan</span>
                      <span className="font-semibold">Rp {successData.total.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uang Tunai</span>
                      <span className="font-semibold">Rp {successData.cash.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/80 pt-2.5 text-base">
                      <span className="font-bold">Kembalian</span>
                      <span className="font-bold text-emerald-600 text-xl">
                        Rp {successData.change.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2 text-center">
                    <Button 
                      className="w-full h-11 rounded-xl shadow-lg shadow-primary/25 font-bold" 
                      onClick={handleCloseSuccess}
                      autoFocus
                    >
                      Selesai & Transaksi Baru 🚀
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowReceiptPreview(true)}
                      className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 py-1 inline-flex items-center gap-1"
                    >
                      <Printer className="h-3 w-3" />
                      Tampilkan / Cetak Nota (Opsional)
                    </button>
                  </div>
                </div>
              ) : (
                /* JIKA CETAK STRUK AKTIF ATAU USER INGIN LIHAT NOTA */
                <div className="w-full flex flex-col items-center space-y-3 animate-float-in">
                  {/* Kertas Struk Thermal Preview */}
                  <div className="w-full max-w-[340px] bg-white text-neutral-900 p-4 rounded-xl border border-dashed border-neutral-300 shadow-sm font-mono text-xs leading-relaxed text-left">
                    {/* Header Toko Dinamis */}
                    <div className="text-center space-y-0.5 pb-2">
                      <h3 className="font-extrabold text-sm tracking-tight text-neutral-950">{storeConfig.name}</h3>
                      <p className="font-semibold text-[11px] text-neutral-800">{storeConfig.tagline}</p>
                      <p className="text-[10px] text-neutral-600">{storeConfig.address}</p>
                      <p className="text-[10px] text-neutral-600">Telp/WA: {storeConfig.phone}</p>
                    </div>

                    <div className="border-b border-dashed border-neutral-400 my-2" />

                    {/* Metadata Transaksi */}
                    <div className="text-[10px] text-neutral-600 space-y-0.5">
                      <div className="flex justify-between">
                        <span>No: {successData.receiptNumber}</span>
                        <span>Kasir: Salman</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tgl: {new Date(successData.date).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
                        <span>Tunai</span>
                      </div>
                    </div>

                    <div className="border-b border-dashed border-neutral-400 my-2" />

                    {/* Daftar Barang Belanjaan */}
                    <div className="space-y-1.5 py-1">
                      {successData.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-medium text-neutral-900 line-clamp-1">{item.name}</div>
                          <div className="flex justify-between text-neutral-600 text-[10px]">
                            <span>{item.quantity} x Rp {item.price.toLocaleString("id-ID")}</span>
                            <span className="font-semibold text-neutral-950">Rp {(item.quantity * item.price).toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-b border-dashed border-neutral-400 my-2" />

                    {/* Total & Pembayaran */}
                    <div className="space-y-1 text-[11px] pt-1">
                      <div className="flex justify-between font-bold text-xs text-neutral-950">
                        <span>TOTAL</span>
                        <span>Rp {successData.total.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-neutral-700">
                        <span>Bayar (Tunai)</span>
                        <span>Rp {successData.cash.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-neutral-700 font-medium">
                        <span>Kembalian</span>
                        <span className="text-emerald-700 font-bold">Rp {successData.change.toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    <div className="border-b border-dashed border-neutral-400 my-2" />

                    {/* Footer Struk */}
                    <div className="text-center space-y-1 text-[9px] text-neutral-600 pt-1">
                      <p className="font-bold text-neutral-800">{storeConfig.footer}</p>
                      <p>Simpan nota ini sebagai bukti sah pembayaran & pengambilan hasil cetakan.</p>
                      <p className="tracking-widest font-mono text-[8px] pt-0.5">*** LUNAS ***</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full flex gap-2 pt-2">
                    <Button 
                      variant="default" 
                      className="flex-1 rounded-xl shadow-md gap-1.5 bg-primary text-primary-foreground font-semibold" 
                      onClick={() => window.print()}
                    >
                      <Printer className="h-4 w-4" />
                      Cetak Struk ({storeConfig.paperWidth})
                    </Button>
                    <Button variant="outline" className="rounded-xl px-4" onClick={handleCloseSuccess}>
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════ PRINTABLE THERMAL RECEIPT CONTAINER (Visible only during window.print) ═══════ */}
      {successData && (
        <div id="printable-receipt" style={{ display: "none" }}>
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", letterSpacing: "0.5px" }}>{storeConfig.name}</div>
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>{storeConfig.tagline}</div>
            <div style={{ fontSize: "9px" }}>{storeConfig.address}</div>
            <div style={{ fontSize: "9px" }}>Telp/WA: {storeConfig.phone}</div>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          <div className="receipt-flex" style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
            <span>No: {successData.receiptNumber}</span>
            <span>Kasir: Salman</span>
          </div>
          <div className="receipt-flex" style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
            <span>Tgl: {new Date(successData.date).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
            <span>Tunai</span>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <tbody>
              {successData.items.map((item, idx) => (
                <tr key={idx} style={{ verticalAlign: "top" }}>
                  <td style={{ padding: "2px 0" }}>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: "9px", color: "#333" }}>
                      {item.quantity} x {item.price.toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", padding: "2px 0", whiteSpace: "nowrap", fontWeight: "bold" }}>
                    {(item.quantity * item.price).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          <div className="receipt-flex" style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", padding: "2px 0" }}>
            <span>TOTAL</span>
            <span>Rp {successData.total.toLocaleString("id-ID")}</span>
          </div>
          <div className="receipt-flex" style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
            <span>Bayar</span>
            <span>Rp {successData.cash.toLocaleString("id-ID")}</span>
          </div>
          <div className="receipt-flex" style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
            <span>Kembalian</span>
            <span>Rp {successData.change.toLocaleString("id-ID")}</span>
          </div>

          <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

          <div style={{ textAlign: "center", fontSize: "9px", marginTop: "6px", lineHeight: "1.2" }}>
            <div style={{ fontWeight: "bold" }}>{storeConfig.footer}</div>
            <div style={{ marginTop: "2px" }}>Simpan nota ini sebagai bukti sah pengambilan barang.</div>
            <div style={{ marginTop: "4px", letterSpacing: "2px" }}>*** LUNAS ***</div>
          </div>
        </div>
      )}
    </div>
  );
}
