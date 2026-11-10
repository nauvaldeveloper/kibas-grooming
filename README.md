# Kibas — Website Pet Grooming (Portfolio Nauval Dev)

Contoh website **reservasi layanan** untuk pet grooming: merek, groomer, dan jadwal fiktif.
HTML/CSS/JS biasa, tanpa build tool. Buka `index.html` langsung di browser.

## Fitur
- Tabel harga dasar per ukuran anjing (kecil–jumbo) dan kucing
- Booking satu halaman dengan ringkasan yang menempel di samping:
  1. Jenis hewan, ukuran, jenis bulu (bulu panjang/keriting menambah persentase harga)
  2. Paket (Mandi Sehat, Full Grooming, Spa Kutu & Jamur) + tambahan; tambahan yang sudah termasuk paket otomatis nonaktif
  3. Pilih groomer (atau "siapa saja") dan jam mulai: hanya jam yang cukup untuk **total durasi** layanan yang ditampilkan
  4. Antar-jemput dengan biaya per zona
  5. Data pemilik, catatan kondisi hewan, konfirmasi vaksin
- Total biaya dan durasi dihitung ulang setiap pilihan berubah
- Pesan booking ke WhatsApp tersusun lengkap

## Menyesuaikan
Harga, durasi, tambahan, zona, groomer, dan jam buka ada di `assets/js/data.js`.
Jadwal groomer di demo dibuat otomatis; untuk dipakai sungguhan bisa dihubungkan ke Google Sheets
seperti demo playroom. Isi `WA_NUMBER` lalu set `DEMO: false`.

## Kredit foto
rawpixel (CC0) dan Matt Bango via StockSnap (CC0).
