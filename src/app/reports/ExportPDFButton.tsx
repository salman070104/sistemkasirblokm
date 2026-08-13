"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type DailyData = {
  date: Date;
  totalRevenue: number;
  totalTransactions: number;
  totalItems: number;
};

export default function ExportPDFButton({ data }: { data: DailyData[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Laporan Penjualan", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Dicetak pada: ${format(new Date(), "d MMMM yyyy HH:mm", { locale: id })}`, 14, 30);

      // Total Summary
      const totalRevenue = data.reduce((s, d) => s + d.totalRevenue, 0);
      const totalTransactions = data.reduce((s, d) => s + d.totalTransactions, 0);
      
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Pendapatan: Rp ${totalRevenue.toLocaleString("id-ID")}`, 14, 40);
      doc.text(`Total Transaksi: ${totalTransactions}`, 14, 46);

      // Table Data
      const tableData = data.map(item => [
        format(new Date(item.date), "d MMMM yyyy", { locale: id }),
        item.totalTransactions.toString(),
        item.totalItems.toString(),
        `Rp ${item.totalRevenue.toLocaleString("id-ID")}`
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['Tanggal', 'Jumlah Transaksi', 'Item Terjual', 'Pendapatan']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'right' }
        }
      });

      // Save PDF
      doc.save(`Laporan_Penjualan_${format(new Date(), "MMM_yyyy")}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting || data.length === 0}
      className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Memproses..." : "Ekspor PDF"}
    </Button>
  );
}
