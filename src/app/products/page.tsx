import db from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Edit, Package, Search } from "lucide-react";
import Image from "next/image";
import { deleteProduct } from "../actions/product";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-float-in">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Data Produk</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{products.length} produk terdaftar di inventaris</p>
        </div>
        <Link href="/products/add">
          <Button className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-x-auto animate-float-in-delay-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[80px] font-semibold">Foto</TableHead>
              <TableHead className="font-semibold">Nama Produk</TableHead>
              <TableHead className="font-semibold">SKU/Barcode</TableHead>
              <TableHead className="font-semibold">Harga Jual</TableHead>
              <TableHead className="font-semibold">Stok</TableHead>
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-40">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12 opacity-20 mb-3" />
                    <p className="font-medium">Belum ada produk terdaftar</p>
                    <p className="text-sm mt-1">Klik "Tambah Produk" untuk memulai</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: any) => (
                <TableRow key={product.id} className="table-row-hover">
                  <TableCell>
                    {product.imageUrl ? (
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border/60 bg-muted shadow-sm">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-xl border border-dashed border-border/60 bg-muted/50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell>
                    {product.sku ? (
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{product.sku}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">Rp {Number(product.price).toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      product.stock === 0
                        ? "bg-red-500/10 text-red-600"
                        : product.stock <= 5
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/products/edit/${product.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-primary/10 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteProduct(product.id);
                        revalidatePath("/products");
                      }}>
                        <Button type="submit" variant="ghost" size="icon" className="text-red-500/70 hover:text-red-600 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
