"use server"

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

type CartItem = {
  productId: number;
  quantity: number;
  price: number;
};

export async function processTransaction(cartItems: CartItem[], cashAmount: number) {
  try {
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const changeAmount = cashAmount - totalAmount;

    if (changeAmount < 0) {
      return { success: false, error: "Uang tidak cukup" };
    }

    // Buat receipt number (contoh: TRX-20231015-12345)
    const receiptNumber = `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await db.transaction.create({
      data: {
        receiptNumber,
        totalAmount,
        cashAmount,
        changeAmount,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    // Kurangi stok produk
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    revalidatePath("/products");
    revalidatePath("/transactions");
    revalidatePath("/pos");
    revalidatePath("/");

    return { success: true, transactionId: transaction.id };
  } catch (error) {
    console.error("Error processing transaction:", error);
    return { success: false, error: "Gagal memproses transaksi" };
  }
}
