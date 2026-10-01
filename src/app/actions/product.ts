"use server"

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

async function saveProductImage(image: File): Promise<string | null> {
  if (!image || image.size === 0) return null;
  const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  try {
    const blob = await put(fileName, image, {
      access: 'public',
    });
    return blob.url;
  } catch (blobError) {
    console.warn("Vercel Blob put failed, falling back to base64 data URI:", blobError);
    // Fallback gracefully so images can still be stored without remote storage configuration
    const buffer = Buffer.from(await image.arrayBuffer());
    return `data:${image.type || 'image/png'};base64,${buffer.toString('base64')}`;
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const sku = (formData.get("sku") as string)?.trim();
    const price = parseFloat(formData.get("price") as string);
    const buyPriceRaw = formData.get("buyPrice") as string;
    const buyPrice = buyPriceRaw && !isNaN(parseFloat(buyPriceRaw)) ? parseFloat(buyPriceRaw) : null;
    const categoryName = (formData.get("category") as string)?.trim();
    const image = formData.get("image") as File;

    if (!name || isNaN(price)) {
      return { success: false, error: "Nama dan harga produk wajib diisi." };
    }

    const existingProduct = await db.product.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          ...(sku ? [{ sku }] : [])
        ]
      }
    });

    if (existingProduct) {
      return { success: false, error: "Produk dengan nama atau SKU tersebut sudah terdaftar." };
    }

    let categoryId: number | null = null;
    if (categoryName) {
      const cat = await db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = cat.id;
    }

    let imageUrl: string | null = null;
    if (image && image.size > 0) {
      imageUrl = await saveProductImage(image);
    }

    await db.product.create({
      data: {
        name,
        description: description || null,
        sku: sku || null,
        price,
        buyPrice,
        categoryId,
        imageUrl,
      }
    });

    revalidatePath("/products");
    revalidatePath("/pos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error?.message || "Gagal menambahkan produk baru" };
  }
}

export async function deleteProduct(id: number) {
  try {
    const transactionCount = await db.transactionItem.count({ where: { productId: id } });
    if (transactionCount > 0) {
      return { 
        success: false, 
        error: `Produk tidak bisa dihapus karena tersimpan pada ${transactionCount} riwayat transaksi. Produk ini dapat diubah namanya jika sudah tidak dijual.` 
      };
    }

    const product = await db.product.findUnique({ where: { id } });
    if (product?.imageUrl && product.imageUrl.includes('vercel-storage.com')) {
      try {
        await del(product.imageUrl);
      } catch (err) {
        console.warn("Could not delete blob image:", err);
      }
    }
    
    await db.product.delete({ where: { id } });
    revalidatePath("/products");
    revalidatePath("/pos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error?.message || "Gagal menghapus produk" };
  }
}

export async function getProduct(id: number) {
  try {
    const product = await db.product.findUnique({ 
      where: { id },
      include: { category: true }
    });
    if (!product) return null;
    return {
      ...product,
      price: Number(product.price),
      buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
      categoryName: product.category?.name || null,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function updateProduct(id: number, formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const sku = (formData.get("sku") as string)?.trim();
    const price = parseFloat(formData.get("price") as string);
    const buyPriceRaw = formData.get("buyPrice") as string;
    const buyPrice = buyPriceRaw && !isNaN(parseFloat(buyPriceRaw)) ? parseFloat(buyPriceRaw) : null;
    const categoryName = (formData.get("category") as string)?.trim();
    const image = formData.get("image") as File;
    const removeImage = formData.get("removeImage") === "true";

    if (!name || isNaN(price)) {
      return { success: false, error: "Nama dan harga produk wajib diisi." };
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Produk tidak ditemukan." };

    // Check SKU duplicate on other products
    if (sku) {
      const duplicateSku = await db.product.findFirst({
        where: {
          sku,
          id: { not: id }
        }
      });
      if (duplicateSku) {
        return { success: false, error: `SKU/Barcode '${sku}' sudah digunakan produk '${duplicateSku.name}'.` };
      }
    }

    let categoryId: number | null = null;
    if (categoryName) {
      const cat = await db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = cat.id;
    }

    let imageUrl = existing.imageUrl;

    // Handle image removal
    if (removeImage && existing.imageUrl) {
      if (existing.imageUrl.includes('vercel-storage.com')) {
        try {
          await del(existing.imageUrl);
        } catch (err) {
          console.warn("Could not delete old blob image:", err);
        }
      }
      imageUrl = null;
    }

    // Handle new image upload
    if (image && image.size > 0) {
      if (existing.imageUrl && existing.imageUrl.includes('vercel-storage.com')) {
        try {
          await del(existing.imageUrl);
        } catch (err) {
          console.warn("Could not delete old blob image:", err);
        }
      }
      imageUrl = await saveProductImage(image);
    }

    await db.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        sku: sku || null,
        price,
        buyPrice,
        categoryId,
        imageUrl,
      },
    });

    revalidatePath("/products");
    revalidatePath("/pos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error?.message || "Gagal mengupdate produk" };
  }
}

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" }
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
