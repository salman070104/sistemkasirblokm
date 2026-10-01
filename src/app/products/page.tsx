import db from "@/lib/db";
import ProductsClient, { ProductItem } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [productsRaw, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const products: ProductItem[] = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    price: Number(p.price),
    buyPrice: p.buyPrice ? Number(p.buyPrice) : null,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
        }
      : null,
  }));

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
