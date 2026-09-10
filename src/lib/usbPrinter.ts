// Helper untuk koneksi langsung ke Mesin Printer Thermal via WebUSB (Chrome/Edge)

export interface PrinterStoreConfig {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  footer: string;
  paperWidth?: "58mm" | "80mm";
}

export interface ReceiptPrintData {
  receiptNumber: string;
  date: Date;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  cash: number;
  change: number;
}

export function isWebUsbSupported(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && "usb" in navigator;
}

// Cari endpoint transfer out pada interface printer
function getOutEndpoint(device: any) {
  for (const configuration of device.configurations || []) {
    for (const iface of configuration.interfaces || []) {
      for (const alternate of iface.alternates || []) {
        for (const endpoint of alternate.endpoints || []) {
          if (endpoint.direction === "out") {
            return {
              interfaceNumber: iface.interfaceNumber,
              endpointNumber: endpoint.endpointNumber
            };
          }
        }
      }
    }
  }
  return null;
}

// Request koneksi ke printer USB dari jendela pop-up browser
export async function requestUsbPrinter(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
  if (!isWebUsbSupported()) {
    return { success: false, error: "Browser Anda tidak mendukung WebUSB. Gunakan Google Chrome atau Microsoft Edge." };
  }

  try {
    const usb = (navigator as any).usb;
    // Buka dialog pemilihan perangkat USB
    const device = await usb.requestDevice({ filters: [] });

    if (!device) {
      return { success: false, error: "Tidak ada perangkat yang dipilih." };
    }

    const deviceName = device.productName || `USB Printer (VID:${device.vendorId.toString(16)})`;
    localStorage.setItem("pos_usb_printer_name", deviceName);
    localStorage.setItem("pos_usb_vendor_id", device.vendorId.toString());
    localStorage.setItem("pos_usb_product_id", device.productId.toString());

    return { success: true, deviceName };
  } catch (err: any) {
    if (err.name === "NotFoundError") {
      return { success: false, error: "Pemilihan printer dibatalkan." };
    }
    console.error("Error connecting WebUSB:", err);
    return { success: false, error: err.message || "Gagal menghubungkan printer USB." };
  }
}

// Ambil printer USB yang sudah pernah dipasangkan
export async function getConnectedUsbDevice(): Promise<any | null> {
  if (!isWebUsbSupported()) return null;
  try {
    const usb = (navigator as any).usb;
    const devices = await usb.getDevices();
    if (!devices || devices.length === 0) return null;

    const savedVid = localStorage.getItem("pos_usb_vendor_id");
    const savedPid = localStorage.getItem("pos_usb_product_id");

    if (savedVid && savedPid) {
      const match = devices.find((d: any) => 
        d.vendorId.toString() === savedVid && d.productId.toString() === savedPid
      );
      if (match) return match;
    }

    return devices[0];
  } catch {
    return null;
  }
}

// Format data nota menjadi kode ESC/POS untuk thermal printer
export function buildEscPosBytes(data: ReceiptPrintData, config: PrinterStoreConfig): Uint8Array {
  const encoder = new TextEncoder();
  const parts: number[] = [];

  // Inisialisasi printer ESC @
  parts.push(0x1b, 0x40);

  // Align Center ESC a 1
  parts.push(0x1b, 0x61, 0x01);

  // Bold ON ESC E 1
  parts.push(0x1b, 0x45, 0x01);
  parts.push(...encoder.encode(`${config.name}\n`));
  // Bold OFF ESC E 0
  parts.push(0x1b, 0x45, 0x00);

  parts.push(...encoder.encode(`${config.tagline}\n`));
  parts.push(...encoder.encode(`${config.address}\n`));
  parts.push(...encoder.encode(`Telp/WA: ${config.phone}\n`));
  parts.push(...encoder.encode("================================\n"));

  // Align Left ESC a 0
  parts.push(0x1b, 0x61, 0x00);
  parts.push(...encoder.encode(`No : ${data.receiptNumber}\n`));
  parts.push(...encoder.encode(`Tgl: ${new Date(data.date).toLocaleString("id-ID")}\n`));
  parts.push(...encoder.encode(`Kas: Kasir 1\n`));
  parts.push(...encoder.encode("--------------------------------\n"));

  // Items
  for (const item of data.items) {
    parts.push(...encoder.encode(`${item.name}\n`));
    const subtotal = (item.quantity * item.price).toLocaleString("id-ID");
    const qtyPrice = ` ${item.quantity} x ${item.price.toLocaleString("id-ID")}`;
    const paddingLength = Math.max(1, 32 - qtyPrice.length - subtotal.length);
    const line = qtyPrice + " ".repeat(paddingLength) + subtotal + "\n";
    parts.push(...encoder.encode(line));
  }

  parts.push(...encoder.encode("--------------------------------\n"));

  // Totals
  const totStr = `Rp ${data.total.toLocaleString("id-ID")}`;
  const totalLine = "TOTAL" + " ".repeat(Math.max(1, 32 - 5 - totStr.length)) + totStr + "\n";
  parts.push(0x1b, 0x45, 0x01); // Bold
  parts.push(...encoder.encode(totalLine));
  parts.push(0x1b, 0x45, 0x00); // Bold off

  const cashStr = `Rp ${data.cash.toLocaleString("id-ID")}`;
  parts.push(...encoder.encode("Bayar" + " ".repeat(Math.max(1, 32 - 5 - cashStr.length)) + cashStr + "\n"));

  const changeStr = `Rp ${data.change.toLocaleString("id-ID")}`;
  parts.push(...encoder.encode("Kembali" + " ".repeat(Math.max(1, 32 - 7 - changeStr.length)) + changeStr + "\n"));
  parts.push(...encoder.encode("================================\n"));

  // Footer Center
  parts.push(0x1b, 0x61, 0x01);
  parts.push(...encoder.encode(`${config.footer}\n`));
  parts.push(...encoder.encode("Simpan nota ini sebagai bukti sah.\n"));
  parts.push(...encoder.encode("*** LUNAS ***\n\n\n\n"));

  // Cut Paper GS V 66 0 (Full Cut)
  parts.push(0x1d, 0x56, 0x42, 0x00);

  return new Uint8Array(parts);
}

// Kirim data langsung ke printer USB
export async function sendToUsbPrinter(bytes: Uint8Array): Promise<{ success: boolean; error?: string }> {
  const device = await getConnectedUsbDevice();
  if (!device) {
    return { success: false, error: "Printer USB belum terhubung atau belum dipilih di Pengaturan." };
  }

  try {
    if (!device.opened) {
      await device.open();
    }

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    const endpointInfo = getOutEndpoint(device);
    const interfaceNum = endpointInfo ? endpointInfo.interfaceNumber : 0;
    const endpointNum = endpointInfo ? endpointInfo.endpointNumber : 1;

    try {
      await device.claimInterface(interfaceNum);
    } catch {
      // Abaikan jika sudah di-claim sebelumnya
    }

    await device.transferOut(endpointNum, bytes);
    return { success: true };
  } catch (err: any) {
    console.error("Gagal mengirim data ke printer USB:", err);
    return { success: false, error: err.message || "Gagal mencetak ke printer USB." };
  }
}
