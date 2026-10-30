# au-interlude
# Interlude — Starter

Fondasi baru untuk simulasi iPhone Shaqil Naraya. Project ini menggunakan HTML, CSS, dan JavaScript ES Modules tanpa framework atau dependency eksternal.

## Menjalankan secara lokal

Karena project menggunakan `type="module"`, jalankan melalui local server (jangan membuka `index.html` langsung dengan `file://`). Pilihan sederhana:

- VS Code: pasang ekstensi Live Server, lalu pilih **Open with Live Server**.
- Node.js: jalankan `npx serve .` dari folder project.

## Demo passcode

Passcode sementara: `0422`.
Ubah `demoPasscode` di `data/config.js` sebelum deployment publik.

## Struktur kode

- `index.html`: struktur layar smartphone.
- `css/`: desain perangkat, lock screen, Home Screen, dan app surface.
- `js/main.js`: entry point dan penghubung event.
- `js/core/`: ikon, jam, dan sistem passcode.
- `js/apps/`: renderer aplikasi.
- `data/`: konfigurasi dan metadata aplikasi.
- `manifest.webmanifest` dan `sw.js`: dasar PWA dan cache app shell.

## Tahap berikutnya

1. Cocokkan dimensi, wallpaper, status bar, Dynamic Island, widget, ikon, dan transisi dengan referensi HP Kino.
2. Bangun app engine yang lebih lengkap (app lifecycle, gesture, navigation, toast, notification center, control center).
3. Bangun UI setiap aplikasi.
4. Masukkan konten AU setelah semua interaksi utama stabil.

Catatan: data percakapan pada starter ini hanya placeholder untuk menguji navigasi, bukan naskah cerita.
