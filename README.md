https://valmortheos.github.io/EXCSVJSON/

# EXCSJSON - Excel, CSV, JSON Converter

Aplikasi web statis untuk mengonversi file Excel ↔ CSV ↔ JSON. Berjalan **100% di sisi klien (browser)** tanpa backend, tanpa database, dan tanpa mengirimkan data ke server mana pun.

## 🚀 Fitur

- **Excel → CSV**: Unggah file `.xlsx` atau `.xls`. Mengekstrak seluruh sheet ke dalam beberapa file CSV.
- **CSV → JSON**: Unggah satu atau banyak file `.csv`. Mengubah data menjadi array of objects JSON (dilengkapi pretty print).
- **Batch Download**: Dukungan untuk mengunduh semua hasil konversi sekaligus dalam bentuk file `.zip`.
- **Performa Tinggi**: Menggunakan **Web Workers** untuk memproses file (puluhan MB) di background thread, menjaga UI tetap responsif.
- **Mobile-First & Dark Mode**: Antarmuka responsif yang nyaman digunakan di smartphone maupun desktop, dikhususkan dengan tema gelap.
- **Offline First**: Semua dependensi (SheetJS, JSZip, Papa Parse) di-hosting secara lokal, memungkinkan aplikasi dijalankan murni secara luring.

## 📁 Struktur Direktori

```text
/
├── index.html                  # Landing Page
├── pages/
│   ├── excel-to-csv.html       # Antarmuka Excel ke CSV
│   └── csv-to-json.html        # Antarmuka CSV ke JSON
├── css/
│   ├── style.css               # Base CSS & Variables
│   ├── components.css          # UI Components
│   └── responsive.css          # Media Queries
├── js/
│   ├── app.js                  # Entry point
│   ├── excel.js                # Logika Excel -> CSV
│   ├── csv.js                  # Logika CSV -> JSON
│   ├── download.js             # Utils unduh file
│   ├── ui.js                   # Manipulasi DOM & Notifikasi
│   ├── utils.js                # Fungsi helper umum
│   └── workers/
│       ├── excel-worker.js     # Web worker proses Excel
│       └── csv-worker.js       # Web worker proses CSV
├── assets/
│   ├── icons/                  # Logo & Favicon (SVG)
│   └── images/                 
├── vendor/
│   ├── xlsx.full.min.js        # Library SheetJS (Excel)
│   ├── jszip.min.js            # Library JSZip (Zip)
│   └── papaparse.min.js        # Library Papa Parse (CSV)
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Pages CI/CD
```

## 💻 Cara Menjalankan Secara Lokal

Karena aplikasi ini adalah Web Static 100%, ada dua cara untuk menjalankannya:

1. **(Rekomendasi) Menggunakan Local Server:**
   Buka terminal di root direktori project dan jalankan server statis.
   ```bash
   # Jika menggunakan Python:
   python3 -m http.server 8000
   
   # Jika menggunakan Node.js (http-server):
   npx http-server -p 8000
   ```
   Lalu buka `http://localhost:8000` di browser. Ini direkomendasikan karena Web Workers kadang diblokir oleh browser jika diakses via protokol `file://`.

2. **Membuka file langsung:**
   Klik dua kali pada `index.html`. *(Catatan: Di beberapa browser modern seperti Chrome, Web Workers mungkin tidak bekerja dengan baik via protokol `file://` karena alasan keamanan CORS lokal).*

## 🌍 Cara Deploy ke GitHub Pages

Project ini sudah dilengkapi dengan konfigurasi GitHub Actions.
1. Buat repository baru di GitHub.
2. Push semua kode ke branch `main`.
3. Buka **Settings** repository Anda -> **Pages**.
4. Di bagian **Build and deployment**, ubah "Source" menjadi **GitHub Actions**.
5. Proses deploy akan berjalan otomatis setiap kali ada perubahan yang di-push ke branch `main`.

## 📦 Dependensi Eksternal

Semua file telah disertakan secara lokal di dalam folder `vendor/`.
- [SheetJS](https://sheetjs.com/) (xlsx.full.min.js) - Membaca & ekstrak Excel.
- [JSZip](https://stuk.github.io/jszip/) (jszip.min.js) - Kompresi file Zip secara client-side.
- [Papa Parse](https://www.papaparse.com/) (papaparse.min.js) - Parsing CSV yang kuat & handal.

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).
