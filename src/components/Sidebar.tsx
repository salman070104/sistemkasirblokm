"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, FileText, BarChart, Settings, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { InstallAppButton } from "./InstallAppButton";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/pos", label: "Kasir", icon: ShoppingCart },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/transactions", label: "Riwayat", icon: FileText },
  { href: "/reports", label: "Laporan", icon: BarChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-md border-b border-border/60 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-sm">
            <Image src="/logo-blokm.png" alt="Blok M Studio" fill className="object-cover" />
          </div>
          <h1 className="text-base font-bold tracking-tight">Blok M Studio</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ═══════ MOBILE SLIDE-OUT MENU ═══════ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-14 right-0 w-72 h-[calc(100%-3.5rem)] bg-background border-l border-border/60 shadow-2xl animate-float-in overflow-auto">
            <nav className="p-3 space-y-1">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Menu Utama
              </p>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "sidebar-link-active"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-muted/60"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2">
                <InstallAppButton />
              </div>
              <div className="my-2 h-px bg-border/60" />
              <Link
                href="/settings"
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  pathname === "/settings"
                    ? "sidebar-link-active"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  pathname === "/settings"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-muted/60"
                }`}>
                  <Settings className="h-4 w-4" />
                </div>
                Pengaturan
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* ═══════ MOBILE BOTTOM NAV ═══════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]">
        <nav className="flex items-center justify-around h-16 px-1">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-primary/10 scale-110" : ""
                }`}>
                  <Icon className={`h-[18px] w-[18px] ${isActive ? "stroke-[2.5px]" : ""}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        {/* Safe area for iPhones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* ═══════ DESKTOP SIDEBAR ═══════ */}
      <div className="hidden lg:flex h-screen w-72 flex-col sidebar-gradient border-r border-border/60 shadow-xl shadow-primary/5 shrink-0">
        {/* Logo Area */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-border/60">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-primary/30">
            <Image src="/logo-blokm.png" alt="Blok M Studio" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Blok M Studio</h1>
            <p className="text-xs text-muted-foreground">Sistem Kasir</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "sidebar-link-active"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-muted/60"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 px-3">
            <InstallAppButton />
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 p-3">
          <Link
            href="/settings"
            className={`sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
              pathname === "/settings"
                ? "sidebar-link-active"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              pathname === "/settings"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-muted/60"
            }`}>
              <Settings className="h-4 w-4" />
            </div>
            Pengaturan
          </Link>
        </div>
      </div>
    </>
  );
}
