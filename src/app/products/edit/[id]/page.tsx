import { notFound } from "next/navigation";
import { getProduct } from "@/app/actions/product";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(parseInt(id, 10));

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}
