# Product Requirements Document (PRD): PilihAcak (Mobile-First Wheel Spinner)

## 1. Ringkasan & Tujuan Produk (Overview & Objectives)
* **Nama Proyek:** PilihAcak
* **Tujuan:** Membangun aplikasi berbasis web statis (*Single Page Application*) untuk mengundi atau memilih peserta secara acak menggunakan sistem roda putar (*wheel spinner*). Aplikasi ini dirancang agar dapat digunakan untuk berbagai keperluan acara (undian periodik, pembagian *doorprize*, pemilihan acak di kelas, dll.).
* **Karakteristik Utama:** Cepat, ringan, tanpa peladen (*serverless / no-backend*), privasi tinggi (seluruh data disimpan secara lokal di peramban), dan dioptimalkan secara ketat untuk tampilan dan interaksi di layar ponsel (*mobile-only / mobile-first layout*).
* **Bahasa Copywriting:** Seluruh antarmuka pengguna (*UI*), tombol, notifikasi, dan pesan peringatan wajib menggunakan **Bahasa Indonesia** yang jelas, modern, dan komunikatif.

---

## 2. Arsitektur Teknis & Tech Stack
* **Frontend:** HTML5, Vanilla JavaScript (ES6+), Vite (sebagai *build tool* dan *local development server*).
* **Styling & UI:** Tailwind CSS. Menggunakan kelas utilitas bergaya *mobile-first*, *flexbox/grid*, desain minimalis modern dengan kontras tinggi, serta indikator visual yang jelas untuk interaksi sentuh (*touch-friendly*).
* **Penyimpanan Data:** `localStorage` pada peramban (*browser*) pengguna tanpa ketergantungan pada basis data eksternal.
* **Animasi & Grafis Roda:** HTML5 Canvas atau manipulasi DOM CSS3 (`transform: rotate()`) dengan transisi *cubic-bezier* untuk menghasilkan efek perlambatan putaran (*easing out*) yang alami dan mulus.
* **Audio & Efek Visual:**
  * **Efek Visual:** Library ringan `canvas-confetti` untuk ledakan kertas warna-warni saat pemenang terpilih.
  * **Audio:** Web Audio API bawaan peramban (atau efek suara berbasis sintesis/aset audio ringan HTML5 Audio) untuk menghasilkan suara *ticking* (klik-klik-klik) saat roda berputar, dan suara perayaan (*fanfare/cheer*) saat roda berhenti.
* **Target Deployment:** Vercel atau GitHub Pages (penyajian file statis melalui protokol HTTPS).

---

## 3. Spesifikasi Tata Letak (Mobile-First Layout)
Aplikasi akan selalu dibuka via ponsel, sehingga *agentic tool* wajib menerapkan standar tata letak berikut:
* **Kontainer Utama:** Membatasi lebar maksimum tata letak bergaya aplikasi seluler yang berada di tengah layar peramban (contoh implementasi Tailwind: `max-w-md mx-auto min-h-screen bg-slate-50 shadow-xl flex flex-col justify-between`).
* **Navigasi Utama (Bottom/Top Tab Navigation):** Menggunakan sistem bilah navigasi dengan 3 *tab* utama agar antarmuka bersih dan tidak bertumpuk:
  1. **Tab 1: Roda Putar (Wheel)** – Tampilan utama berisi roda undian dan tombol aksi putar.
  2. **Tab 2: Daftar Peserta (Pool)** – Tampilan untuk mengelola, menambah, mengimpor, dan menghapus daftar nama peserta aktif.
  3. **Tab 3: Riwayat & Pengaturan (History & Settings)** – Tampilan daftar peserta yang sudah terpilih sebelumnya dan menu pengelolaan cadangan data (*backup/restore/clear*).

---

## 4. Fitur & Kebutuhan Fungsional (Functional Requirements)

### 4.1. Modul Roda Putar (Wheel Spinner)
* **Visual Roda:** Roda terbagi otomatis menjadi beberapa juring (*slices*) yang sama besar sesuai jumlah peserta aktif. Warna juring menggunakan palet warna yang harmonis dan berselang-seling agar mudah dibaca. Teks nama peserta harus terpotong rapi (*truncated*) jika terlalu panjang agar tidak merusak tata letak juring.
* **Tombol Putar (Spin Button):** Tombol berukuran besar, mudah ditekan dengan jempol (*thumb-friendly*), terletak di bawah roda atau tepat di tengah roda.
* **Algoritma Pengundian (Fair Randomness):** Wajib menggunakan fungsi `window.crypto.getRandomValues()` untuk menentukan target juring pemenang secara acak murni dan adil sebelum putaran visual dimulai.
* **Interaksi Putaran & Audio:**
  * Saat tombol "Putar" ditekan, status tombol berubah menjadi nonaktif (*disabled*) untuk mencegah klik ganda.
  * Selama roda berputar, mainkan efek suara *ticking* yang frekuensinya melambat seiring melambatnya putaran roda.

### 4.2. Modul Manajemen Peserta (Pool & Input Data)
* **Input Manual (Satuan):** Form masukan teks simpel dengan tombol "Tambah" untuk memasukkan satu nama peserta baru.
* **Input Masal (Bulk Add via Textarea):** Menyediakan area teks (*textarea*) yang memungkinkan pengguna menyalin dan menempel (*paste*) puluhan nama sekaligus dari daftar chat atau spreadsheet (satu nama per baris / dipisahkan oleh karakter baris baru `\n`). Terdapat tombol "Tambahkan Semua".
* **Impor Berkas JSON:** Tombol alternatif untuk mengunggah berkas `.json` hasil pencadangan (*backup*) sebelumnya.
* **Daftar Peserta Aktif:** Menampilkan seluruh nama yang saat ini siap diundi. Setiap nama dilengkapi tombol ikon "Hapus" kecil di sampingnya untuk membuang nama jika terjadi kesalahan ketik.
* **Validasi Input:** Sistem otomatis mengabaikan baris kosong, menghapus spasi berlebih di awal/akhir kata (*trim*), dan mencegah masuknya nama yang menduplikasi nama yang sudah ada di dalam daftar aktif maupun daftar riwayat terpilih.

### 4.3. Modul Popup Pemenang (Winner Modal)
* **Pemicu:** Tampil otomatis dalam bentuk *modal pop-up* tepat ketika animasi putaran roda berhenti di juring pemenang.
* **Efek Perayaan:** Saat *popup* terbuka, sistem otomatis memicu ledakan visual confetti dari library `canvas-confetti` dan memainkan efek suara perayaan pendek (*fanfare/winning sound*).
* **Konten Modal:** Menampilkan teks "Selamat!" dan menampilkan nama peserta yang terpilih dengan ukuran huruf besar dan tebal (*bold/large typography*).
* **Aksi Tombol (2 Pilihan Eksklusif):**
  1. **"Tutup & Biarkan" (Close Only):** Menutup *popup* tanpa mengubah status peserta. Peserta tetap berada di dalam daftar roda (berguna untuk pengundian uji coba / *dummy spin*).
  2. **"Simpan (Tidak Diundi Lagi)" (Confirm & Remove):** Menghapus nama pemenang dari daftar peserta aktif, memindahkannya secara permanen ke dalam daftar Riwayat Terpilih (*History*), dan menutup *popup*. Roda otomatis menggambar ulang juringnya tanpa nama tersebut.

### 4.4. Modul Riwayat Terpilih (History)
* **Daftar Riwayat:** Menampilkan daftar nama peserta yang sudah terpilih pada putaran-putaran sebelumnya, diurutkan secara kronologis terbalik (pemenang terbaru berada di urutan paling atas).
* **Stempel Waktu (Timestamp):** Setiap item di riwayat menampilkan waktu terpilih (contoh: *"Terpilih pada 27 Jul 2026, 14:30"* atau label urutan *"Terpilih #1"*).
* **Aksi Kembalikan (Restore):** Tombol "Kembalikan" di sebelah setiap nama pemenang untuk mengembalikan nama tersebut ke daftar peserta aktif jika terjadi kesalahan pemilihan atau pembatalan.

### 4.5. Modul Manajemen Data & Pengaturan (Backup, Restore, & Clear)
* **Export Data (Unduh Backup):** Tombol "Unduh Backup (.json)" yang akan mengunduh seluruh data (*pool* peserta aktif + riwayat pemenang + pengaturan) ke dalam berkas `pilihacak-backup.json`.
* **Import Data (Pulihkan Backup):** Fitur untuk mengimpor berkas `.json` hasil unduhan sebelumnya untuk menimpa dan memulihkan data di `localStorage`.
* **Clear Data (Reset Total):** Tombol "Hapus Semua Data" dengan peringatan ganda (*Double Confirmation Alert/Modal*):
  * Peringatan 1: *"Apakah Anda yakin ingin menghapus seluruh daftar peserta dan riwayat terpilih?"* (Pilihan: Batal / Ya, Lanjutkan).
  * Peringatan 2: *"Tindakan ini tidak dapat dibatalkan. Seluruh data di perangkat ini akan hilang."* (Pilihan: Batal / Hapus Permanen).
* **Sakelar Suara (Sound Toggle):** Tombol sakelar (*switch/toggle*) sederhana untuk mengaktifkan atau membisukan (*mute*) seluruh efek suara aplikasi.

---

## 5. Skema Penyimpanan LocalStorage (JSON Schema)
*Agentic tool* wajib menggunakan struktur skema JSON berikut untuk menyimpan dan membaca data dari kunci `localStorage` dengan nama `pilihacak_state`:

```json
{
  "activePool": [
    { "id": "550e8400-e29b-41d4-a716-446655440000", "name": "Peserta Pertama", "addedAt": "2026-07-27T10:00:00Z" },
    { "id": "550e8400-e29b-41d4-a716-446655440001", "name": "Peserta Kedua", "addedAt": "2026-07-27T10:01:00Z" }
  ],
  "winnerHistory": [
    { 
      "id": "550e8400-e29b-41d4-a716-446655440002", 
      "name": "Peserta Terpilih", 
      "wonAt": "2026-07-27T14:30:00Z",
      "orderLabel": "Terpilih #1"
    }
  ],
  "settings": {
    "soundEnabled": true
  }
}