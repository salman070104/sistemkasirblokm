"use server";

import db from "@/lib/db";

export async function exportDatabaseBackup() {
  try {
    const [categories, products, transactions] = await Promise.all([
      db.category.findMany({
        orderBy: { id: "asc" },
      }),
      db.product.findMany({
        orderBy: { id: "asc" },
      }),
      db.transaction.findMany({
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const backupData = {
      meta: {
        app: "Blok M Studio - Sistem Kasir POS",
        version: "2.1.0",
        exportedAt: new Date().toISOString(),
        stats: {
          totalCategories: categories.length,
          totalProducts: products.length,
          totalTransactions: transactions.length,
        },
      },
      categories,
      products,
      transactions,
    };

    return {
      success: true,
      backupData,
      filename: `backup-kasir-blokm-${new Date().toISOString().slice(0, 10)}.json`,
    };
  } catch (error: any) {
    console.error("Gagal membuat backup database:", error);
    return {
      success: false,
      error: error.message || "Gagal mengambil data dari database",
    };
  }
}
