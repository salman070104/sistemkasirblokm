"use server"

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const sku = formData.get("sku") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const image = formData.get("image") as File;

    const existingProduct = await db.product.findFirst({
      where: {
        OR: [
          { name: name },
          ...(sku ? [{ sku }] : [])
        ]
      }
    });

    if (existingProduct) {
      return { success: false, error: "Barang sudah ada di data." };
    }

    let imageUrl = null;

    if (image && image.size > 0) {
      const fileName = `${Date.now()}-${image.name}`;
      const blob = await put(fileName, image, {
        access: 'public',
      });
      imageUrl = blob.url;
    }

    await db.product.create({
      data: {
        name,
        description,
        sku: sku || null,
        price,
        stock,
        imageUrl,
      }
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function deleteProduct(id: number) {
  try {

    const product = await db.product.findUnique({ where: { id } });
    if (product?.imageUrl && product.imageUrl.includes('vercel-storage.com')) {
      await del(product.imageUrl);
    }
    
    await db.product.delete({ where: { id } });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}

export async function getProduct(id: number) {
  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return null;
    return {
      ...product,
      price: Number(product.price),
      buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
    };
  } catch (error) {
    return null;
  }
}

export async function updateProduct(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const sku = formData.get("sku") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const image = formData.get("image") as File;
    const removeImage = formData.get("removeImage") === "true";

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Produk tidak ditemukan" };

    let imageUrl = existing.imageUrl;

    // Handle image removal
    if (removeImage && existing.imageUrl) {
      if (existing.imageUrl.includes('vercel-storage.com')) {
        await del(existing.imageUrl);
      }
      imageUrl = null;
    }

    // Handle new image upload
    if (image && image.size > 0) {
      // Delete old image if exists
      if (existing.imageUrl && existing.imageUrl.includes('vercel-storage.com')) {
        await del(existing.imageUrl);
      }

      const fileName = `${Date.now()}-${image.name}`;
      const blob = await put(fileName, image, {
        access: 'public',
      });
      imageUrl = blob.url;
    }

    await db.product.update({
      where: { id },
      data: {
        name,
        description,
        sku: sku || null,
        price,
        stock,
        imageUrl,
      },
    });

    revalidatePath("/products");
    revalidatePath("/pos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Gagal mengupdate produk" };
  }
}
