"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "../actions/product";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    
    setLoading(true);
    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        // Tidak perlu router.refresh() jika revalidatePath sudah dipanggil di Server Action,
        // tapi sebagai fallback di client kita bisa memanggilnya:
        // Namun sebenarnya akan lebih baik jika Action me-return success, dan biarkan Server yang me-refresh
        // Tapi kadang router.refresh() membantu jika ada state client.
      } else {
        alert(result.error || "Gagal menghapus produk");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="button" 
      onClick={handleDelete}
      disabled={loading}
      variant="ghost" 
      size="icon" 
      className="text-red-500/70 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
