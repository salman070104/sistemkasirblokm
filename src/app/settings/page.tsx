"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Store, Check, Save, RotateCcw, Usb, Unplug, CheckCircle2, AlertCircle } from "lucide-react";
import { 
  isWebUsbSupported, 
  requestUsbPrinter, 
  getConnectedUsbDevice, 
  buildEscPosBytes, 
  sendToUsbPrinter 
} from "@/lib/usbPrinter";

export default function SettingsPage() {
  // Pengaturan cetak: DEFAULT MATI (OFF) karena mesin belum dibeli
  const [printEnabled, setPrintEnabled] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("58mm");
  const [storeName, setStoreName] = useState("BLOK M STUDIO");
  const [storeTagline, setStoreTagline] = useState("PERCETAKAN & DIGITAL PRINTING");
  const [storeAddress, setStoreAddress] = useState("Jl. Raya Ciledug-Ketanggungan");
  const [storePhone, setStorePhone] = useState("087858231341 / 087816548545");
  const [storeFooter, setStoreFooter] = useState("Terima Kasih Atas Kunjungan Anda!");
  const [isSaved, setIsSaved] = useState(false);

  // Status Perangkat WebUSB
  const [usbSupported, setUsbSupported] = useState(false);
  const [usbDeviceName, setUsbDeviceName] = useState<string | null>(null);
  const [usbStatusMsg, setUsbStatusMsg] = useState<string | null>(null);
  const [isTestingUsb, setIsTestingUsb] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setUsbSupported(isWebUsbSupported());

    const savedPrint = localStorage.getItem("pos_print_enabled");
    if (savedPrint !== null) {
      setPrintEnabled(savedPrint === "true");
    } else {
      setPrintEnabled(false); // Default OFF jika belum punya printer
    }

    const savedAutoPrint = localStorage.getItem("pos_auto_print");
    if (savedAutoPrint !== null) {
      setAutoPrint(savedAutoPrint === "true");
    } else {
      setAutoPrint(false); // Default OFF
    }

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

    // Cek apakah ada printer USB yang sudah tersimpan
    const savedUsbName = localStorage.getItem("pos_usb_printer_name");
    if (savedUsbName) {
      setUsbDeviceName(savedUsbName);
    }
  }, []);

  const handleConnectUsb = async () => {
    setUsbStatusMsg(null);
    const res = await requestUsbPrinter();
    if (res.success && res.deviceName) {
      setUsbDeviceName(res.deviceName);
      setUsbStatusMsg("✅ Berhasil menghubungkan: " + res.deviceName);
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
      items: [
        { name: "Tes Komunikasi USB", quantity: 1, price: 0 }
      ],
      total: 0,
      cash: 0,
      change: 0,
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
      setUsbStatusMsg("🎉 Perintah cetak berhasil dikirim ke printer USB!");
    } else {
      setUsbStatusMsg("⚠️ " + (res.error || "Gagal mencetak. Pastikan kabel USB terpasang rapat."));
    }
  };

  const handleSave = () => {
    localStorage.setItem("pos_print_enabled", printEnabled ? "true" : "false");
    localStorage.setItem("pos_auto_print", autoPrint ? "true" : "false");
    localStorage.setItem("pos_paper_width", paperWidth);
    localStorage.setItem("pos_store_name", storeName);
    localStorage.setItem("pos_store_tagline", storeTagline);
    localStorage.setItem("pos_store_address", storeAddress);
    localStorage.setItem("pos_store_phone", storePhone);
    localStorage.setItem("pos_store_footer", storeFooter);

    // Trigger storage event so POSClient updates immediately
    window.dispatchEvent(new Event("storage"));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setPrintEnabled(false);
    setAutoPrint(false);
    setPaperWidth("58mm");
    setStoreName("BLOK M STUDIO");
    setStoreTagline("PERCETAKAN & DIGITAL PRINTING");
    setStoreAddress("Jl. Raya Ciledug-Ketanggungan");
    setStorePhone("087858231341 / 087816548545");
    setStoreFooter("Terima Kasih Atas Kunjungan Anda!");
    handleDisconnectUsb();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
          <p className="text-muted-foreground text-sm">
            Kelola preferensi kasir, koneksi printer nota struk, dan profil toko Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="rounded-xl gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Default
          </Button>
          <Button onClick={handleSave} className="rounded-xl gap-1.5 shadow-md shadow-primary/20">
            {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isSaved ? "Tersimpan!" : "Simpan Pengaturan"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PENGATURAN PRINTER & KONEKSI */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Printer & Struk Nota</CardTitle>
                <CardDescription className="text-xs">
                  Atur koneksi perangkat printer thermal dan saklar otomatis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* MASTER TOGGLE ON / OFF */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="print-toggle" className="font-semibold text-sm cursor-pointer">
                    Fitur Cetak Struk
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {printEnabled
                      ? "Aktif: Sistem akan mencetak nota setiap transaksi kasir."
                      : "Nonaktif (Sementara): Transaksi langsung tercatat tanpa print."}
                  </p>
                </div>
                {/* Switch Button */}
                <button
                  id="print-toggle"
                  type="button"
                  onClick={() => setPrintEnabled(!printEnabled)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    printEnabled ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ${
                      printEnabled ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status Sistem:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold ${
                    printEnabled
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {printEnabled ? "🟢 AKTIF" : "🟡 NONAKTIF (Saat ini dimatikan)"}
                </span>
              </div>
            </div>

            {/* KONEKSI PRINTER USB LANGSUNG (WEBUSB / DARI DALAM PROGRAM) */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Usb className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm text-foreground">Sambungan Printer USB</span>
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
                  <span className="font-semibold text-foreground truncate max-w-[180px]">
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
                      {isTestingUsb ? "Mencetak..." : "🧪 Tes Print USB"}
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
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                *Cukup sambungkan kabel USB printer thermal Anda ke PC, lalu klik tombol di atas untuk memilih printer Anda secara langsung dari dalam program.
              </p>
            </div>

            {/* TOGGLE AUTO PRINT */}
            {printEnabled && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 animate-float-in">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoprint-toggle" className="font-semibold text-sm cursor-pointer text-foreground">
                      ⚡ Cetak Otomatis (Auto-Print Saat Bayar)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Struk langsung tercetak otomatis begitu tombol Selesaikan Pembayaran diklik.
                    </p>
                  </div>
                  <button
                    id="autoprint-toggle"
                    type="button"
                    onClick={() => setAutoPrint(!autoPrint)}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoPrint ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ${
                        autoPrint ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* UKURAN KERTAS */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Ukuran Kertas Thermal</Label>
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
                  <div className="text-[11px] text-muted-foreground font-normal">Ukuran kecil/ekonomis</div>
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
                  <div className="text-[11px] text-muted-foreground font-normal">Ukuran standar kasir</div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PROFIL TOKO & KOP NOTA */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Informasi Toko & Kop Struk</CardTitle>
                <CardDescription className="text-xs">
                  Teks yang akan tercetak di bagian atas dan bawah nota
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
              <Label className="text-xs">Layanan / Tagline</Label>
              <Input
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Alamat Toko</Label>
              <Input
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nomor Telepon / WhatsApp</Label>
              <Input
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Catatan Kaki (Footer)</Label>
              <Input
                value={storeFooter}
                onChange={(e) => setStoreFooter(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRATINJAU REALTIME */}
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Pratinjau Kertas Nota Struk</CardTitle>
          <CardDescription className="text-xs">
            Tampilan nota fisik yang akan tercetak di printer thermal sesuai pengaturan di atas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-4 pb-6">
          <div className="w-full max-w-[320px] bg-white text-neutral-900 p-4 rounded-xl border border-dashed border-neutral-300 shadow-sm font-mono text-[11px] leading-relaxed select-none">
            <div className="text-center space-y-0.5 pb-1">
              <div className="font-bold text-sm tracking-tight text-neutral-950">{storeName}</div>
              <div className="font-semibold text-[10px] text-neutral-800">{storeTagline}</div>
              <div className="text-[9px] text-neutral-600">{storeAddress}</div>
              <div className="text-[9px] text-neutral-600">Telp/WA: {storePhone}</div>
            </div>
            <div className="border-b border-dashed border-neutral-400 my-2" />
            <div className="flex justify-between text-[9px] text-neutral-600">
              <span>No: TRX-SAMPLE-01</span>
              <span>Kasir: Salman</span>
            </div>
            <div className="border-b border-dashed border-neutral-400 my-2" />
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>1x Cetak Banner Flexi</span>
                <span>Rp 50.000</span>
              </div>
              <div className="flex justify-between">
                <span>5x Print A3+ Brosur</span>
                <span>Rp 40.000</span>
              </div>
            </div>
            <div className="border-b border-dashed border-neutral-400 my-2" />
            <div className="flex justify-between font-bold text-xs pt-0.5">
              <span>TOTAL</span>
              <span>Rp 90.000</span>
            </div>
            <div className="border-b border-dashed border-neutral-400 my-2" />
            <div className="text-center space-y-0.5 text-[8px] text-neutral-600 pt-1">
              <div className="font-semibold text-neutral-800">{storeFooter}</div>
              <div>Simpan nota ini sebagai bukti sah pembayaran.</div>
              <div className="tracking-widest pt-0.5 font-bold">*** LUNAS ***</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
