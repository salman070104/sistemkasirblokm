import db from "@/lib/db";
import POSClient from "./POSClient";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const products = await db.product.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-6 py-4 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold tracking-tight">Kasir (Point of Sale)</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Pilih produk untuk memulai transaksi</p>
      </div>
      <POSClient 
        products={products.map((p: any) => ({
          ...p,
          price: Number(p.price),
          buyPrice: p.buyPrice ? Number(p.buyPrice) : null,
        }))} 
      />
    </div>
  );
}
