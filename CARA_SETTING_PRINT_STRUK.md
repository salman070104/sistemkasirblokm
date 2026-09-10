# 🖨️ Panduan Lengkap Setting Auto-Print Mesin Struk Kasir (Blok M Studio)

Dokumen ini berisi panduan langkah demi langkah untuk menghubungkan **Mesin Cetak Struk Thermal (58mm / 80mm via USB)** ke **Komputer / PC Windows Kasir** agar dapat mencetak nota secara otomatis (**Auto-Print / Silent Print**) tanpa perlu memunculkan jendela pop-up dialog print browser.

---

## 📌 Ringkasan Cara Kerja
Ketika fitur ini aktif:
Setiap kali kasir menekan tombol **"Selesaikan Pembayaran"** di aplikasi kasir:
1. Transaksi langsung tercatat ke database.
2. Mesin printer langsung berbunyi dan kertas struk keluar dalam hitungan **0,5 detik**.
3. Layar PC tidak memunculkan pop-up apa pun dan langsung menampilkan uang kembalian pelanggan.

---

## ⚙️ Langkah 1: Pasang Printer ke PC Windows & Install Driver
1. Colokkan kabel power printer ke stopkontak listrik dan nyalakan tombol power.
2. Colokkan **kabel USB** dari printer ke port USB di PC Windows kasir.
3. Masukkan gulungan kertas thermal ke dalam printer (*Pastikan kertas tidak terbalik; sisi luar kertas yang peka panas menghadap ke atas/ke arah pemotong*).
4. **Install Driver Printer**:
   * Masukkan CD driver bawaan printer atau download driver dari link yang diberikan penjual (biasanya bernama *POS-58 Driver* atau *POS-80 Driver*).
   * Jalankan installer, pilih tipe koneksi **USB**, lalu ikuti instruksi hingga selesai (*1–2 menit*).

---

## ⚙️ Langkah 2: Jadikan Printer Thermal sebagai "Default Printer" di Windows
Agar komputer langsung tahu printer mana yang dipakai untuk struk kasir:
1. Di keyboard PC Windows, tekan tombol **Windows (Start)**, ketik **Printers & Scanners**, lalu tekan **Enter**.
2. Cari nama printer thermal Anda yang baru terpasang (contoh: *POS-58*, *POS-80*, *XP-58*, atau *Iware C-58*).
3. Klik printer tersebut, lalu klik tombol **Set as default** (Jadikan Printer Default).
4. *(Opsional)* Klik **Printing preferences**:
   * Pastikan ukuran kertas (*Paper Size*) sudah dipilih sesuai kertas Anda: **58 x 210 mm** atau **80 x 297 mm**.

---

## ⚙️ Langkah 3: Setting Mode "Kiosk Printing" pada Aplikasi Kasir di Desktop
Karena aplikasi kasir sudah Anda install di PC (*via fitur "Tambahkan ke PC" / Install App*), ada icon shortcut di Desktop Windows Anda.

Langkah mengaktifkan mode Auto-Print:
1. Di layar **Desktop Windows**, cari icon aplikasi kasir **Blok M Studio**.
2. **Klik kanan** pada icon tersebut, lalu pilih **Properties**.
3. Masuk ke tab **Shortcut**.
4. Perhatikan kolom **Target**. Isinya biasanya menyerupai ini:
   ```text
   "C:\Program Files\Google\Chrome\Application\chrome_proxy.exe" --profile-directory=Default --app-id=abcdefgh123456789
   ```
5. Di bagian paling ujung teks target tersebut, **tambahkan 1 spasi**, lalu tambahkan:
   ```text
   --kiosk-printing
   ```
   **Contoh target setelah ditambahkan:**
   ```text
   "C:\Program Files\Google\Chrome\Application\chrome_proxy.exe" --profile-directory=Default --app-id=abcdefgh123456789 --kiosk-printing
   ```
6. Klik tombol **Apply**, lalu klik **OK**.
7. Tutup aplikasi kasir jika sedang terbuka, lalu **buka kembali melalui icon shortcut tersebut**.

> 💡 **Catatan:** Flag `--kiosk-printing` inilah yang memerintahkan aplikasi untuk langsung mengirim cetakan ke printer tanpa menampilkan jendela konfirmasi / preview.

---

## ⚙️ Langkah 4: Aktifkan Fitur di Menu Pengaturan Aplikasi Kasir
1. Buka aplikasi kasir **Blok M Studio** di PC Windows Anda.
2. Di menu samping kiri (sidebar), klik **Pengaturan**.
3. Pada kartu **Printer & Struk Nota**:
   * Nyalakan saklar: **Cetak Struk Setelah Transaksi** (Ubah ke *AKTIF*).
   * Nyalakan saklar: **⚡ Cetak Otomatis (Auto-Print Saat Bayar)** (Ubah ke *AKTIF*).
   * Pilih ukuran kertas default Anda: **58 mm** atau **80 mm**.
4. Klik tombol **Simpan Pengaturan**.

---

## 🧪 Langkah 5: Uji Coba Transaksi
1. Buka menu **Kasir (POS)**.
2. Masukkan salah satu produk ke keranjang.
3. Klik tombol **Bayar**.
4. Masukkan nominal uang tunai yang diterima, lalu klik **Selesaikan Pembayaran**.
5. **Hasil:** Struk langsung tercetak otomatis dari mesin tanpa pop-up preview!
6. *(Setelah uji coba selesai, Anda bisa menghapus transaksi uji coba tersebut di menu **Riwayat Transaksi** dan stok barang akan otomatis dipulihkan kembali).*

---

## ❓ Tanya Jawab & Solusi Masalah (Troubleshooting)

### 1. Kertas struk keluar tapi tulisannya kosong/polos?
* **Penyebab:** Gulungan kertas thermal terpasang terbalik.
* **Solusi:** Buka penutup printer, balik gulungan kertasnya, lalu tutup rapat kembali.

### 2. Bagaimana jika printer belum dibeli atau kehabisan kertas?
* Cukup klik tombol status di bilah atas halaman kasir: **`Struk: ON`** $\rightarrow$ klik 1x untuk mengubahnya menjadi **`Struk: OFF (Sementara)`**.
* Kasir bisa tetap melayani pembeli dengan lancar tanpa ada proses print yang tertunda.

### 3. Di mana saya bisa mengganti nama toko, alamat, dan nomor WA pada struk?
* Buka menu **Pengaturan** di aplikasi kasir.
* Anda bisa mengedit Nama Usaha, Layanan, Alamat (*Jl. Raya Ciledug-Ketanggungan*), dan Nomor Telepon/WA (*087858231341 / 087816548545*) kapan saja secara mandiri.
