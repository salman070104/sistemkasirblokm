"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart, 
  Settings, 
  Menu, 
  X, 
  UserCheck
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { InstallAppButton } from "./InstallAppButton";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/pos", label: "Kasir POS", icon: ShoppingCart, highlight: true },
  { href: "/products", label: "Katalog Produk", icon: Package },
  { href: "/transactions", label: "Riwayat Transaksi", icon: FileText },
  { href: "/reports", label: "Laporan Penjualan", icon: BarChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cashierName, setCashierName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pos_cashier_name") || "Salman";
    }
    return "Salman";
  });

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* ═══════ MOBILE TOP BAR ═══════ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/90 backdrop-blur-md border-b border-border/60 flex items-center justify-between px-4 shadow-xs">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-xl overflow-hidden shadow-xs border border-border/60">
            <Image src="/logo-blokm.png" alt="Blok M Studio" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-foreground leading-none">Blok M Studio</h1>
            <span className="text-[10px] text-muted-foreground font-medium">Sistem Kasir Modern</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ═══════ MOBILE SLIDE-OUT MENU ═══════ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-14 right-0 w-72 h-[calc(100%-3.5rem)] bg-background border-l border-border/60 shadow-2xl animate-float-in overflow-y-auto p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="px-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Navigasi Kasir
                </span>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-2">
                <InstallAppButton />
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 space-y-2">
              <div className="px-2 flex items-center gap-2 text-xs text-muted-foreground">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Kasir: <strong className="text-foreground">{cashierName}</strong></span>
              </div>
              <Link
                href="/settings"
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  pathname === "/settings"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Pengaturan Sistem</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MOBILE BOTTOM NAV BAR ═══════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/60 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <nav className="flex items-center justify-around h-16 px-1">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-2xl transition-all ${
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-primary/10 scale-110" : ""
                }`}>
                  <Icon className={`h-[18px] w-[18px] ${isActive ? "stroke-[2.4px]" : "stroke-[1.8px]"}`} />
                </div>
                <span className={`text-[10px] ${isActive ? "font-bold text-foreground" : "font-medium"}`}>
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* ═══════ DESKTOP MINIMALIST PROFESSIONAL SIDEBAR ═══════ */}
      <aside className="hidden lg:flex h-screen w-72 flex-col bg-card border-r border-border/60 shadow-xs shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 rounded-2xl overflow-hidden shadow-xs border border-border/60 bg-muted shrink-0 group-hover:scale-105 transition-transform">
              <Image src="/logo-blokm.png" alt="Blok M Studio" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-foreground leading-none">
                Blok M Studio
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                Sistem Kasir Modern
              </p>
            </div>
          </Link>

          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>

        {/* Quick Launch Kasir Button */}
        <div className="p-4 pb-2">
          <Link
            href="/pos"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Buka Kasir POS</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          <div className="px-3 pb-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Menu Utama
            </span>
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">
                    Kasir
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 px-1">
            <InstallAppButton />
          </div>
        </nav>

        {/* Footer Identity & Settings */}
        <div className="p-3 border-t border-border/60 bg-muted/20 space-y-2">
          <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {cashierName[0]?.toUpperCase() || "K"}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground block font-medium">Kasir Aktif</span>
                <p className="text-xs font-bold text-foreground truncate">{cashierName}</p>
              </div>
            </div>
            <Link
              href="/settings"
              title="Pengaturan"
              className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
