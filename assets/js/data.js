/**
 * DATA — Kibas Pet Grooming (merek fiktif, untuk portfolio Nauval Dev).
 * Harga, durasi, jadwal groomer, dan zona antar-jemput hanya contoh.
 */
window.KIBAS = {
  name: 'Kibas',
  address: 'Jl. Sukajadi No. 88, Bandung (alamat contoh)',
  hours: 'Selasa–Minggu, 09.00–17.00 · Senin tutup',
  DEMO: true,
  WA_NUMBER: '',
  DEV_CONTACT_URL: 'https://ig.me/m/nauval_dev',

  OPEN: 9, CLOSE: 17, CLOSED_DAYS: [1], STEP_MIN: 30, DAYS_AHEAD: 8,

  // Ukuran: index dipakai untuk membaca harga & durasi paket
  DOG_SIZES: [
    { id: 0, label: 'Kecil', hint: '< 5 kg', ex: 'Pom, Chihuahua, Shih Tzu kecil' },
    { id: 1, label: 'Sedang', hint: '5–15 kg', ex: 'Beagle, Corgi, Poodle' },
    { id: 2, label: 'Besar', hint: '15–30 kg', ex: 'Husky, Golden muda, Border Collie' },
    { id: 3, label: 'Jumbo', hint: '> 30 kg', ex: 'Golden dewasa, Malamute, Samoyed' },
  ],
  COATS: {
    dog: [{ id: 'pendek', label: 'Pendek', pct: 0 }, { id: 'panjang', label: 'Panjang', pct: 15 }, { id: 'keriting', label: 'Keriting', pct: 20 }],
    cat: [{ id: 'pendek', label: 'Pendek', pct: 0 }, { id: 'panjang', label: 'Panjang (Persia, Maine Coon)', pct: 20 }],
  },

  PACKAGES: [
    { id: 'mandi', name: 'Mandi Sehat', desc: 'Mandi 2x dengan sampo sesuai jenis bulu, blow dry, sisir, parfum.',
      dog: [45000, 65000, 90000, 130000], cat: 55000, durDog: [45, 60, 90, 120], durCat: 60, includes: [] },
    { id: 'full', name: 'Full Grooming', desc: 'Mandi Sehat ditambah potong & rapikan bulu sesuai gaya, potong kuku, bersihkan telinga.',
      dog: [95000, 130000, 180000, 250000], cat: 120000, durDog: [90, 120, 150, 180], durCat: 120, includes: ['kuku', 'telinga'], popular: true },
    { id: 'spa', name: 'Spa Kutu & Jamur', desc: 'Mandi dengan sampo obat, didiamkan 10 menit, sisir serit, dan semprot anti kutu.',
      dog: [80000, 110000, 150000, 210000], cat: 95000, durDog: [75, 90, 120, 150], durCat: 90, includes: [] },
  ],

  ADDONS: [
    { id: 'kuku', name: 'Potong kuku', price: 15000, min: 10 },
    { id: 'telinga', name: 'Bersihkan telinga', price: 15000, min: 10 },
    { id: 'gigi', name: 'Sikat gigi', price: 20000, min: 10 },
    { id: 'kusut', name: 'Urai bulu kusut (de-matting)', price: 35000, min: 30, note: 'Untuk bulu yang menggumpal; bila terlalu parah, groomer akan menyarankan cukur pendek.' },
    { id: 'tetes', name: 'Obat kutu tetes', price: 40000, min: 5 },
  ],

  PICKUP: [
    { id: 'datang', label: 'Datang sendiri', fee: 0, note: 'Antar & jemput di Kibas Sukajadi' },
    { id: 'z1', label: 'Antar-jemput · Bandung Utara & Tengah', fee: 25000, note: 'Sukajadi, Cidadap, Coblong, Sumur Bandung, dan sekitarnya' },
    { id: 'z2', label: 'Antar-jemput · Bandung Timur & Selatan', fee: 35000, note: 'Antapani, Arcamanik, Buahbatu, Bojongsoang, dan sekitarnya' },
    { id: 'z3', label: 'Antar-jemput · Cimahi & Lembang', fee: 50000, note: 'Kendaraan ber-AC dengan kandang aman' },
  ],

  GROOMERS: [
    { id: 'tari', name: 'Tari', note: 'Spesialis anjing kecil & kucing' },
    { id: 'bima', name: 'Bima', note: 'Spesialis anjing besar & bulu tebal' },
  ],

  FAQ: [
    ['Apakah wajib vaksin?', 'Ya. Anjing dan kucing wajib sudah vaksin rabies (anjing) atau vaksin dasar (kucing). Bawa buku vaksin saat datang atau kirim fotonya ke admin.'],
    ['Hewan saya galak atau takut air, bagaimana?', 'Tulis di catatan. Groomer akan bekerja pelan dan bisa memakai muzzle. Bila hewan terlalu stres, grooming dihentikan dan hanya dikenakan biaya yang sudah dikerjakan.'],
    ['Apakah bisa ditunggu?', 'Bisa. Ruang tunggu menghadap area grooming. Untuk Full Grooming anjing besar, kami sarankan dijemput saat sudah dikabari selesai.'],
    ['Kalau ternyata ada kutu atau jamur?', 'Groomer akan mengabari lewat WhatsApp dan menawarkan tambahan Spa Kutu sebelum dikerjakan. Tidak ada biaya tambahan tanpa persetujuanmu.'],
  ],
};
