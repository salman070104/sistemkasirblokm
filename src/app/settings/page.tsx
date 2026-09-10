"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Printer, 
  Store, 
  Check, 
  Save, 
  RotateCcw, 
  Usb, 
  Unplug, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Laptop, 
  Percent, 
  User, 
  Download, 
  Database, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  Info,
  Banknote,
  Receipt
} from "lucide-react";
import { 
  isWebUsbSupported, 
  requestUsbPrinter, 
  buildEscPosBytes, 
  sendToUsbPrinter 
} from "@/lib/usbPrinter";
import { useTheme } from "@/components/ThemeProvider";
import { soundManager } from "@/lib/soundEffects";
import { exportDatabaseBackup } from "../actions/backup";

type SettingsTab = "display" | "audio" | "tax" | "printer" | "data";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("display");

  // Tampilan & Profil Kasir
  const [cashierName, setCashierName] = useState("Salman");
  const [quickCashEnabled, setQuickCashEnabled] = useState(true);

  // Efek Suara
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundBarcode, setSoundBarcode] = useState(true);
  const [soundCheckout, setSoundCheckout] = useState(true);
  const [soundError, setSoundError] = useState(true);

  // Pajak & Biaya Tambahan (Default: OFF)
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState("11");
  const [serviceFeeEnabled, setServiceFeeEnabled] = useState(false);
  const [serviceFeeAmount, setServiceFeeAmount] = useState("0");
  const [serviceFeeType, setServiceFeeType] = useState<"fixed" | "percent">("fixed");

  // Pengaturan Printer & Toko (Default: OFF karena mesin belum dibeli)
  const [printEnabled, setPrintEnabled] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("58mm");
  const [storeName, setStoreName] = useState("BLOK M STUDIO");
  const [storeTagline, setStoreTagline] = useState("PERCETAKAN & DIGITAL PRINTING");
  const [storeAddress, setStoreAddress] = useState("Jl. Raya Ciledug-Ketanggungan");
  const [storePhone, setStorePhone] = useState("087858231341 / 087816548545");
  const [storeFooter, setStoreFooter] = useState("Terima Kasih Atas Kunjungan Anda!");

  // Status WebUSB
  const [usbSupported, setUsbSupported] = useState(false);
  const [usbDeviceName, setUsbDeviceName] = useState<string | null>(null);
  const [usbStatusMsg, setUsbStatusMsg] = useState<string | null>(null);
  const [isTestingUsb, setIsTestingUsb] = useState(false);

  // Feedback State
  const [isSaved, setIsSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [clearCacheMessage, setClearCacheMessage] = useState<string | null>(null);

  // Muat preferensi dari localStorage
  useEffect(() => {
    setUsbSupported(isWebUsbSupported());

    // Tema
    const savedTheme = localStorage.getItem("pos_theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
      setTheme(savedTheme);
    }

    // Kasir
    const savedCashier = localStorage.getItem("pos_cashier_name");
    if (savedCashier) setCashierName(savedCashier);

    const savedQuickCash = localStorage.getItem("pos_quick_cash_enabled");
    if (savedQuickCash !== null) setQuickCashEnabled(savedQuickCash === "true");

    // Audio
    const savedSound = localStorage.getItem("pos_sound_enabled");
    if (savedSound !== null) setSoundEnabled(savedSound === "true");

    const savedBarcode = localStorage.getItem("pos_sound_barcode");
    if (savedBarcode !== null) setSoundBarcode(savedBarcode === "true");

    const savedCheckout = localStorage.getItem("pos_sound_checkout");
    if (savedCheckout !== null) setSoundCheckout(savedCheckout === "true");

    const savedError = localStorage.getItem("pos_sound_error");
    if (savedError !== null) setSoundError(savedError === "true");

    // Pajak & Biaya
    const savedTaxEnabled = localStorage.getItem("pos_tax_enabled");
    if (savedTaxEnabled !== null) setTaxEnabled(savedTaxEnabled === "true");

    const savedTaxRate = localStorage.getItem("pos_tax_rate");
    if (savedTaxRate) setTaxRate(savedTaxRate);

    const savedServiceFeeEnabled = localStorage.getItem("pos_service_fee_enabled");
    if (savedServiceFeeEnabled !== null) setServiceFeeEnabled(savedServiceFeeEnabled === "true");

    const savedServiceFeeAmount = localStorage.getItem("pos_service_fee_amount");
    if (savedServiceFeeAmount) setServiceFeeAmount(savedServiceFeeAmount);

    const savedServiceFeeType = localStorage.getItem("pos_service_fee_type");
    if (savedServiceFeeType === "fixed" || savedServiceFeeType === "percent") {
      setServiceFeeType(savedServiceFeeType);
    }

    // Printer & Kop Struk
    const savedPrint = localStorage.getItem("pos_print_enabled");
    if (savedPrint !== null) setPrintEnabled(savedPrint === "true");

    const savedAutoPrint = localStorage.getItem("pos_auto_print");
    if (savedAutoPrint !== null) setAutoPrint(savedAutoPrint === "true");

    const savedWidth = localStorage.getItem("pos_paper_width");
    if (savedWidth) setPaperWidth(savedWidth as "58mm" | "80mm");

    const savedName = localStorage.getItem("pos_store_name");
    if (savedName) setStoreName(savedName);

    const savedTagline = localStorage.getItem("pos_store_tagline");
    if (savedTagline) setStoreTagline(savedTagline);

    const savedAddress = localStorage.getItem("pos_store_address");
    if (savedAddress) setStoreAddress(savedAddress);

    const savedPhone = localStorage.getItem("pos_store_phone");
    if (savedPhone) setStorePhone(savedPhone);

    const savedFooter = localStorage.getItem("pos_store_footer");
    if (savedFooter) setStoreFooter(savedFooter);

    const savedUsbName = localStorage.getItem("pos_usb_printer_name");
    if (savedUsbName) setUsbDeviceName(savedUsbName);
  }, []);

  const handleConnectUsb = async () => {
    setUsbStatusMsg(null);
    const res = await requestUsbPrinter();
    if (res.success && res.deviceName) {
      setUsbDeviceName(res.deviceName);
      setUsbStatusMsg("✅ Terhubung ke: " + res.deviceName);
    } else if (res.error) {
      setUsbStatusMsg("⚠️ " + res.error);
    }
  };

  const handleDisconnectUsb = () => {
    localStorage.removeItem("pos_usb_printer_name");
    localStorage.removeItem("pos_usb_vendor_id");
    localStorage.removeItem("pos_usb_product_id");
    setUsbDeviceName(null);
    setUsbStatusMsg("Printer USB telah diputuskan.");
  };

  const handleTestPrintUsb = async () => {
    setIsTestingUsb(true);
    setUsbStatusMsg(null);

    const testData = {
      receiptNumber: "TES-PRINT-01",
      date: new Date(),
      items: [{ name: "Tes Sambungan Printer USB", quantity: 1, price: 0 }],
      total: 0,
      cash: 0,
      change: 0,
      cashierName: cashierName,
    };

    const config = {
      name: storeName,
      tagline: storeTagline,
      address: storeAddress,
      phone: storePhone,
      footer: storeFooter,
      paperWidth: paperWidth,
    };

    const bytes = buildEscPosBytes(testData, config);
    const res = await sendToUsbPrinter(bytes);
    setIsTestingUsb(false);

    if (res.success) {
      setUsbStatusMsg("🎉 Perintah tes cetak berhasil dikirim ke printer!");
    } else {
      setUsbStatusMsg("⚠️ " + (res.error || "Gagal mencetak. Pastikan kabel USB terpasang rapat."));
    }
  };

  const handleSave = () => {
    // Simpan semua state ke localStorage
    localStorage.setItem("pos_theme", theme);
    localStorage.setItem("pos_cashier_name", cashierName);
    localStorage.setItem("pos_quick_cash_enabled", quickCashEnabled ? "true" : "false");

    localStorage.setItem("pos_sound_enabled", soundEnabled ? "true" : "false");
    localStorage.setItem("pos_sound_barcode", soundBarcode ? "true" : "false");
    localStorage.setItem("pos_sound_checkout", soundCheckout ? "true" : "false");
    localStorage.setItem("pos_sound_error", soundError ? "true" : "false");

    localStorage.setItem("pos_tax_enabled", taxEnabled ? "true" : "false");
    localStorage.setItem("pos_tax_rate", taxRate);
    localStorage.setItem("pos_service_fee_enabled", serviceFeeEnabled ? "true" : "false");
    localStorage.setItem("pos_service_fee_amount", serviceFeeAmount);
    localStorage.setItem("pos_service_fee_type", serviceFeeType);

    localStorage.setItem("pos_print_enabled", printEnabled ? "true" : "false");
    localStorage.setItem("pos_auto_print", autoPrint ? "true" : "false");
    localStorage.setItem("pos_paper_width", paperWidth);
    localStorage.setItem("pos_store_name", storeName);
    localStorage.setItem("pos_store_tagline", storeTagline);
    localStorage.setItem("pos_store_address", storeAddress);
    localStorage.setItem("pos_store_phone", storePhone);
    localStorage.setItem("pos_store_footer", storeFooter);

    window.dispatchEvent(new Event("storage"));

    soundManager.playSuccessChime();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm("Kembalikan semua preferensi ke pengaturan awal pabrik?")) return;

    setTheme("system");
    setCashierName("Salman");
    setQuickCashEnabled(true);

    setSoundEnabled(true);
    setSoundBarcode(true);
    setSoundCheckout(true);
    setSoundError(true);

    setTaxEnabled(false);
    setTaxRate("11");
    setServiceFeeEnabled(false);
    setServiceFeeAmount("0");
    setServiceFeeType("fixed");

    setPrintEnabled(false);
    setAutoPrint(false);
    setPaperWidth("58mm");
    setStoreName("BLOK M STUDIO");
    setStoreTagline("PERCETAKAN & DIGITAL PRINTING");
    setStoreAddress("Jl. Raya Ciledug-Ketanggungan");
    setStorePhone("087858231341 / 087816548545");
    setStoreFooter("Terima Kasih Atas Kunjungan Anda!");
    handleDisconnectUsb();

    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);

    const res = await exportDatabaseBackup();
    setIsBackingUp(false);

    if (res.success && res.backupData) {
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonStr);
      downloadAnchor.setAttribute("download", res.filename || "backup-kasir.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      soundManager.playSuccessChime();
      setBackupMessage(`✅ Berhasil mengunduh cadangan: ${res.backupData.meta.stats.totalProducts} produk, ${res.backupData.meta.stats.totalTransactions} transaksi.`);
    } else {
      soundManager.playErrorBeep();
      setBackupMessage("⚠️ Gagal mengekspor data: " + (res.error || "Terjadi kesalahan server."));
    }
  };

  const handleClearCache = () => {
    if (confirm("Bersihkan cache lokal browser? (Data produk dan transaksi di server tetap aman).")) {
      const currentTheme = localStorage.getItem("pos_theme") || "system";
      localStorage.clear();
      localStorage.setItem("pos_theme", currentTheme);
      setClearCacheMessage("✅ Cache lokal browser berhasil dibersihkan.");
      setTimeout(() => setClearCacheMessage(null), 3500);
    }
  };

  // Kalkulasi pratinjau nota
  const previewSubtotal = 90000;
  const numTaxRate = taxEnabled ? (parseFloat(taxRate) || 0) : 0;
  const previewTax = taxEnabled ? Math.round((previewSubtotal * numTaxRate) / 100) : 0;
  const numService = serviceFeeEnabled ? (parseFloat(serviceFeeAmount) || 0) : 0;
  const previewService = serviceFeeEnabled 
    ? (serviceFeeType === "percent" ? Math.round((previewSubtotal * numService) / 100) : numService)
    : 0;
  const previewTotal = previewSubtotal + previewTax + previewService;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
      {/* HEADER ATAS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Pro POS v2.1
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Konfigurasi mode tampilan, audio kasir, pajak PPN, printer struk, dan cadangan data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            className="rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Default
          </Button>

          <Button 
            onClick={handleSave} 
            className="rounded-xl gap-2 shadow-md shadow-primary/25 bg-primary text-primary-foreground font-semibold text-xs sm:text-sm"
          >
            {isSaved ? <Check className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
            {isSaved ? "Tersimpan!" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {/* NAVIGASI TAB MENU PENGATURAN */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border/60 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("display")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "display"
              ? "bg-background text-foreground shadow-sm font-semibold ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Tampilan & Kasir</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audio")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "audio"
              ? "bg-background text-foreground shadow-sm font-semibold ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Volume2 className="h-4 w-4 text-blue-500" />
          <span>Suara Kasir</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tax")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "tax"
              ? "bg-background text-foreground shadow-sm font-semibold ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Percent className="h-4 w-4 text-emerald-500" />
          <span>Pajak & Biaya</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("printer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "printer"
              ? "bg-background text-foreground shadow-sm font-semibold ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Printer className="h-4 w-4 text-purple-500" />
          <span>Printer & Struk</span>
          {!printEnabled && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
              OFF
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("data")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "data"
              ? "bg-background text-foreground shadow-sm font-semibold ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Database className="h-4 w-4 text-indigo-500" />
          <span>Data & Cadangan</span>
        </button>
      </div>

      {/* KONTEN BERDASARKAN TAB */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* KOLOM KIRI & TENGAH: PENGATURAN UTAMA (COL-SPAN-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: TAMPILAN & KASIR */}
          {activeTab === "display" && (
            <div className="space-y-6 animate-float-in">
              {/* TEMA APLIKASI */}
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Tema & Tampilan Layar</CardTitle>
                      <CardDescription className="text-xs">
                        Pilih tema yang nyaman untuk mata kasir saat bertugas siang maupun malam.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* LIGHT */}
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
                        theme === "light"
                          ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary shadow-sm"
                          : "border-border/70 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Sun className="h-5 w-5 text-amber-500" />
                        {theme === "light" && <Check className="h-4 w-4 text-primary font-bold" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Mode Terang</div>
                        <div className="text-[11px] text-muted-foreground">Tampilan bersih & cerah</div>
                      </div>
                    </button>

                    {/* DARK */}
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
                        theme === "dark"
                          ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary shadow-sm"
                          : "border-border/70 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Moon className="h-5 w-5 text-indigo-400" />
                        {theme === "dark" && <Check className="h-4 w-4 text-primary font-bold" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Mode Gelap (Malam)</div>
                        <div className="text-[11px] text-muted-foreground">Redup & ramah di mata</div>
                      </div>
                    </button>

                    {/* SYSTEM */}
                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
                        theme === "system"
                          ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary shadow-sm"
                          : "border-border/70 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Laptop className="h-5 w-5 text-neutral-400" />
                        {theme === "system" && <Check className="h-4 w-4 text-primary font-bold" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Otomatis (Sistem)</div>
                        <div className="text-[11px] text-muted-foreground">Ikuti pengaturan PC/HP</div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* PROFIL KASIR & CEPAT */}
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Profil Petugas Kasir</CardTitle>
                      <CardDescription className="text-xs">
                        Nama petugas yang bertugas melayani transaksi dan tercetak di nota.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Nama Kasir Aktif</Label>
                    <Input
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="Contoh: Salman / Kasir 1"
                      className="rounded-xl h-10 max-w-md"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Nama ini akan otomatis tersemat di sudut kanan atas nota struk transaksi.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <Label htmlFor="quick-cash-toggle" className="font-semibold text-sm cursor-pointer">
                        Rekomendasi Pecahan Uang Cepat (Quick Cash)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tampilkan tombol pecahan uang pas (Rp 10rb, 20rb, 50rb, 100rb) di kasir.
                      </p>
                    </div>
                    <button
                      id="quick-cash-toggle"
                      type="button"
                      onClick={() => setQuickCashEnabled(!quickCashEnabled)}
                      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        quickCashEnabled ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                          quickCashEnabled ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: SUARA KASIR (AUDIO FEEDBACK) */}
          {activeTab === "audio" && (
            <div className="space-y-6 animate-float-in">
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Efek Suara Kasir (Audio Feedback)</CardTitle>
                      <CardDescription className="text-xs">
                        Umpan balik suara interaktif untuk kenyamanan dan kepastian saat kasir melayani pesanan.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* MASTER SOUND TOGGLE */}
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-between">
                    <div>
                      <Label htmlFor="master-sound-toggle" className="font-semibold text-sm cursor-pointer">
                        Suara Sistem Kasir (Master Switch)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {soundEnabled ? "Aktif: Menghasilkan bunyi saat scan dan bayar." : "Nonaktif: Kasir berjalan dalam mode hening."}
                      </p>
                    </div>
                    <button
                      id="master-sound-toggle"
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        soundEnabled ? "bg-blue-600" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                          soundEnabled ? "translate-x-7" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {soundEnabled && (
                    <div className="space-y-3 pt-1 animate-float-in">
                      {/* BEEP SCAN / TAMBAH PRODUK */}
                      <div className="p-3.5 rounded-xl border border-border/60 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-medium text-sm">Bunyi Beep Barcode / Tambah Item</div>
                          <p className="text-xs text-muted-foreground">
                            Bunyi nada tinggi pendek (1850 Hz) saat produk dimasukkan ke keranjang.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => soundManager.playBarcodeBeep(true)}
                            className="rounded-xl text-xs gap-1.5 h-8"
                          >
                            <Volume2 className="h-3.5 w-3.5 text-blue-500" />
                            Tes Bunyi
                          </Button>
                          <button
                            type="button"
                            onClick={() => setSoundBarcode(!soundBarcode)}
                            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                              soundBarcode ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                                soundBarcode ? "translate-x-6" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* TRANSKASI SUKSES / KACHING */}
                      <div className="p-3.5 rounded-xl border border-border/60 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-medium text-sm">Bunyi Transaksi Berhasil (Kaching)</div>
                          <p className="text-xs text-muted-foreground">
                            Melodi arpeggio C-Mayor saat checkout kasir selesai dan uang diterima.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => soundManager.playSuccessChime(true)}
                            className="rounded-xl text-xs gap-1.5 h-8"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                            Tes Bunyi
                          </Button>
                          <button
                            type="button"
                            onClick={() => setSoundCheckout(!soundCheckout)}
                            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                              soundCheckout ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                                soundCheckout ? "translate-x-6" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* PERINGATAN / ERROR */}
                      <div className="p-3.5 rounded-xl border border-border/60 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-medium text-sm">Bunyi Peringatan / Uang Kurang</div>
                          <p className="text-xs text-muted-foreground">
                            Bunyi peringatan jika stok habis atau uang tunai yang diinput kurang.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => soundManager.playErrorBeep(true)}
                            className="rounded-xl text-xs gap-1.5 h-8"
                          >
                            <VolumeX className="h-3.5 w-3.5 text-amber-500" />
                            Tes Bunyi
                          </Button>
                          <button
                            type="button"
                            onClick={() => setSoundError(!soundError)}
                            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                              soundError ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                                soundError ? "translate-x-6" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    *Semua efek audio diproses langsung oleh chip suara browser (Web Audio API) tanpa perlu koneksi internet atau mengunduh berkas audio.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: PAJAK & BIAYA TAMBAHAN */}
          {activeTab === "tax" && (
            <div className="space-y-6 animate-float-in">
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Percent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Pajak (PPN) & Biaya Layanan</CardTitle>
                      <CardDescription className="text-xs">
                        Aktifkan jika usaha percetakan Anda mengenakan PPN atau biaya admin/layanan tambahan.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* PPN TOGGLE */}
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="tax-toggle" className="font-semibold text-sm cursor-pointer">
                          Pajak Pertambahan Nilai (PPN)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {taxEnabled ? "Aktif: PPN akan ditambahkan saat pembayaran." : "Nonaktif: Harga produk murni tanpa tambahan PPN."}
                        </p>
                      </div>
                      <button
                        id="tax-toggle"
                        type="button"
                        onClick={() => setTaxEnabled(!taxEnabled)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                          taxEnabled ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                            taxEnabled ? "translate-x-7" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {taxEnabled && (
                      <div className="pt-3 border-t border-border/60 flex items-center gap-3 animate-float-in">
                        <Label className="text-xs font-semibold shrink-0">Tarif Pajak (%):</Label>
                        <div className="relative w-32">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={taxRate}
                            onChange={(e) => setTaxRate(e.target.value)}
                            className="rounded-xl h-9 pr-7 text-right font-semibold"
                          />
                          <span className="absolute right-2.5 top-2 text-xs text-muted-foreground font-bold">%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">(Standar PPN Indonesia: 11%)</span>
                      </div>
                    )}
                  </div>

                  {/* SERVICE FEE TOGGLE */}
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="service-toggle" className="font-semibold text-sm cursor-pointer">
                          Biaya Layanan / Admin / Desain
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {serviceFeeEnabled ? "Aktif: Biaya tetap atau persentase akan ditambahkan." : "Nonaktif: Tidak ada biaya layanan tambahan."}
                        </p>
                      </div>
                      <button
                        id="service-toggle"
                        type="button"
                        onClick={() => setServiceFeeEnabled(!serviceFeeEnabled)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                          serviceFeeEnabled ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                            serviceFeeEnabled ? "translate-x-7" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {serviceFeeEnabled && (
                      <div className="pt-3 border-t border-border/60 space-y-3 animate-float-in">
                        <div className="flex items-center gap-3">
                          <Label className="text-xs font-semibold shrink-0">Tipe Biaya:</Label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setServiceFeeType("fixed")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                serviceFeeType === "fixed" ? "bg-primary text-primary-foreground border-primary" : "border-border"
                              }`}
                            >
                              Nominal Tetap (Rp)
                            </button>
                            <button
                              type="button"
                              onClick={() => setServiceFeeType("percent")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                serviceFeeType === "percent" ? "bg-primary text-primary-foreground border-primary" : "border-border"
                              }`}
                            >
                              Persentase (%)
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Label className="text-xs font-semibold shrink-0">Jumlah Biaya:</Label>
                          <div className="relative w-44">
                            <Input
                              type="number"
                              min="0"
                              value={serviceFeeAmount}
                              onChange={(e) => setServiceFeeAmount(e.target.value)}
                              className="rounded-xl h-9 text-right font-semibold"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {serviceFeeType === "fixed" ? "Rupiah per transaksi" : "% dari subtotal transaksi"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: PRINTER & STRUK (MASTER SWITCH DEFAULT OFF) */}
          {activeTab === "printer" && (
            <div className="space-y-6 animate-float-in">
              {/* MASTER SWITCH & WEBUSB */}
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Printer className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Perangkat Printer Thermal</CardTitle>
                      <CardDescription className="text-xs">
                        Pengaturan pencetakan otomatis dan sambungan kabel printer USB kasir.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* MASTER TOGGLE ON/OFF */}
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="print-toggle" className="font-semibold text-sm cursor-pointer">
                          Saklar Fitur Cetak Struk
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {printEnabled
                            ? "🟢 Aktif: Sistem akan mencetak nota fisik saat transaksi selesai."
                            : "🟡 Nonaktif: Transaksi langsung tersimpan tanpa mencetak nota kertas."}
                        </p>
                      </div>
                      <button
                        id="print-toggle"
                        type="button"
                        onClick={() => setPrintEnabled(!printEnabled)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                          printEnabled ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                            printEnabled ? "translate-x-7" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status Cetak Kasir:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold ${
                          printEnabled
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {printEnabled ? "🟢 AKTIF" : "🟡 NONAKTIF (Printer belum digunakan)"}
                      </span>
                    </div>
                  </div>

                  {/* KONEKSI PRINTER USB */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Usb className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm text-foreground">Sambungan USB Thermal (WebUSB)</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        usbDeviceName 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {usbDeviceName ? "🟢 Terhubung" : "⚪ Belum Ada Perangkat"}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground bg-background/80 p-3 rounded-xl border border-border/60">
                      <div className="flex justify-between items-center">
                        <span>Perangkat Terpilih:</span>
                        <span className="font-semibold text-foreground truncate max-w-[200px]">
                          {usbDeviceName || "Belum ada printer dipilih"}
                        </span>
                      </div>
                    </div>

                    {usbStatusMsg && (
                      <p className="text-xs font-medium text-primary animate-float-in">
                        {usbStatusMsg}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleConnectUsb}
                        className="rounded-xl gap-1.5 text-xs border-primary/30 hover:bg-primary/10 text-primary font-medium"
                      >
                        <Usb className="h-3.5 w-3.5" />
                        {usbDeviceName ? "Ganti / Pilih Printer USB" : "🔌 Sambungkan Printer USB"}
                      </Button>

                      {usbDeviceName && (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleTestPrintUsb}
                            disabled={isTestingUsb}
                            className="rounded-xl gap-1.5 text-xs font-medium"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            {isTestingUsb ? "Mencetak..." : "🧪 Tes Cetak USB"}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleDisconnectUsb}
                            className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Unplug className="h-3.5 w-3.5" />
                            Putuskan
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* TOGGLE AUTO-PRINT */}
                  {printEnabled && (
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 animate-float-in">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoprint-toggle" className="font-semibold text-sm cursor-pointer text-foreground">
                            ⚡ Cetak Otomatis (Auto-Print Saat Bayar)
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Struk langsung keluar seketika tombol Selesaikan Pembayaran ditekan.
                          </p>
                        </div>
                        <button
                          id="autoprint-toggle"
                          type="button"
                          onClick={() => setAutoPrint(!autoPrint)}
                          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                            autoPrint ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-0.5 ${
                              autoPrint ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UKURAN KERTAS */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Ukuran Lebar Kertas Struk</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaperWidth("58mm")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paperWidth === "58mm"
                            ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                            : "border-border/70 hover:bg-muted/50"
                        }`}
                      >
                        <div className="text-sm">58 mm</div>
                        <div className="text-[11px] text-muted-foreground font-normal">Kecil / Thermal Mini Portable</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaperWidth("80mm")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paperWidth === "80mm"
                            ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                            : "border-border/70 hover:bg-muted/50"
                        }`}
                      >
                        <div className="text-sm">80 mm</div>
                        <div className="text-[11px] text-muted-foreground font-normal">Standar Kasir Minimarket/Resto</div>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KOP TOKO */}
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Kop Toko & Catatan Struk</CardTitle>
                      <CardDescription className="text-xs">
                        Informasi bisnis yang akan tercetak di bagian atas dan bawah nota.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Nama Usaha / Toko</Label>
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Slogan / Layanan</Label>
                    <Input
                      value={storeTagline}
                      onChange={(e) => setStoreTagline(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Alamat Percetakan</Label>
                    <Input
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Nomor WhatsApp / Kontak</Label>
                    <Input
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Pesan Kaki (Footer Struk)</Label>
                    <Input
                      value={storeFooter}
                      onChange={(e) => setStoreFooter(e.target.value)}
                      className="rounded-xl h-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 5: DATA & CADANGAN */}
          {activeTab === "data" && (
            <div className="space-y-6 animate-float-in">
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Cadangan & Keamanan Database</CardTitle>
                      <CardDescription className="text-xs">
                        Ekspor seluruh arsip transaksi dan data barang ke komputer untuk keamanan data Anda.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* EKSPOR DATA JSON */}
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm">Unduh Cadangan Lengkap (.JSON)</div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Arsip cadangan berisi semua kategori, data produk, dan seluruh riwayat transaksi.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleDownloadBackup}
                        disabled={isBackingUp}
                        className="rounded-xl gap-2 text-xs font-semibold shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {isBackingUp ? "Mengambil Data..." : "📥 Unduh Cadangan Data"}
                      </Button>
                    </div>

                    {backupMessage && (
                      <p className="text-xs font-medium text-primary pt-2 animate-float-in">
                        {backupMessage}
                      </p>
                    )}
                  </div>

                  {/* BERSIHKAN CACHE */}
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">Bersihkan Cache & Preferensi Lokal</div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Menghapus data sementara di browser kasir tanpa memengaruhi database produk di server.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearCache}
                      className="rounded-xl gap-2 text-xs text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Bersihkan Cache
                    </Button>
                  </div>

                  {clearCacheMessage && (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {clearCacheMessage}
                    </p>
                  )}

                  {/* INFORMASI SISTEM & LISENSI */}
                  <div className="p-4 rounded-xl border border-border/60 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Status Sistem Kasir
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Aplikasi</span>
                        <span className="font-medium text-foreground">Blok M POS Web & PWA</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Versi Rilis</span>
                        <span className="font-medium text-foreground">v2.1.0 Stable</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Lisensi</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 font-semibold">Aktif Seumur Hidup</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Database Server</span>
                        <span className="font-medium text-foreground">PostgreSQL Cloud</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Penyimpanan Offline</span>
                        <span className="font-medium text-foreground">Aktif (IndexedDB/Cache)</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Pemilik Usaha</span>
                        <span className="font-medium text-foreground">Blok M Studio</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: PRATINJAU NOTA STRUK REALTIME (COL-SPAN-1) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Receipt className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm tracking-tight">Pratinjau Nota Fisik</span>
          </div>

          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden bg-muted/20">
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-full max-w-[300px] bg-white text-neutral-900 p-4 rounded-xl border border-dashed border-neutral-300 shadow-md font-mono text-[11px] leading-relaxed select-none">
                {/* KOP */}
                <div className="text-center space-y-0.5 pb-1">
                  <div className="font-bold text-sm tracking-tight text-neutral-950">{storeName}</div>
                  <div className="font-semibold text-[10px] text-neutral-800">{storeTagline}</div>
                  <div className="text-[9px] text-neutral-600">{storeAddress}</div>
                  <div className="text-[9px] text-neutral-600">Telp/WA: {storePhone}</div>
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* INFO TRANSAKSI */}
                <div className="flex justify-between text-[9px] text-neutral-600">
                  <span>No: TRX-SAMPLE-01</span>
                  <span>Kas: {cashierName || "Kasir 1"}</span>
                </div>
                <div className="text-[9px] text-neutral-500">
                  {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* ITEMS CONTOH */}
                <div className="space-y-1 text-[10px]">
                  <div>
                    <div className="font-medium">Cetak Spanduk Flexi 280g</div>
                    <div className="flex justify-between text-neutral-600">
                      <span> 1 x 50.000</span>
                      <span>50.000</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Print A3+ Art Paper (Brosur)</div>
                    <div className="flex justify-between text-neutral-600">
                      <span> 5 x 8.000</span>
                      <span>40.000</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* SUBTOTAL & PAJAK */}
                {(taxEnabled || serviceFeeEnabled) && (
                  <div className="space-y-0.5 text-[10px] text-neutral-700 pb-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {previewSubtotal.toLocaleString("id-ID")}</span>
                    </div>
                    {taxEnabled && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>PPN ({taxRate}%)</span>
                        <span>Rp {previewTax.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    {serviceFeeEnabled && (
                      <div className="flex justify-between text-blue-700 font-medium">
                        <span>Biaya Layanan</span>
                        <span>Rp {previewService.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="border-b border-dashed border-neutral-300 my-1" />
                  </div>
                )}

                {/* TOTAL */}
                <div className="flex justify-between font-bold text-xs pt-0.5 text-neutral-950">
                  <span>TOTAL</span>
                  <span>Rp {previewTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-600 pt-0.5">
                  <span>Bayar (Tunai)</span>
                  <span>Rp 100.000</span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-600">
                  <span>Kembali</span>
                  <span>Rp {Math.max(0, 100000 - previewTotal).toLocaleString("id-ID")}</span>
                </div>

                <div className="border-b border-dashed border-neutral-400 my-2" />

                {/* FOOTER */}
                <div className="text-center space-y-0.5 text-[8px] text-neutral-600 pt-1">
                  <div className="font-semibold text-neutral-800">{storeFooter}</div>
                  <div>Simpan nota ini sebagai bukti sah pembayaran.</div>
                  <div className="tracking-widest pt-1 font-bold text-neutral-900">*** LUNAS ***</div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-center text-muted-foreground">
                Ukuran kertas: <span className="font-bold text-foreground">{paperWidth}</span> • Status cetak:{" "}
                <span className={`font-semibold ${printEnabled ? "text-emerald-600" : "text-amber-600"}`}>
                  {printEnabled ? "Aktif" : "Mati"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
