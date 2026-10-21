# FireChain AI — Cara Menjalankan Kode

## Isi folder
- `src/routes/index.tsx` — seluruh halaman dashboard (menu kiri, kartu ringkasan, peta, laporan, analisis AI, audit blockchain, grafik emisi).
- `src/styles.css` — sistem warna & gaya: tema gelap, aksen merah/jingga, kelas `panel` dan `glow`.
- `src/assets/map.jpg` dan `src/assets/fire.jpg` — gambar peta dan foto api.
- `package.json`, `vite.config.ts`, `tsconfig.json` — pengaturan proyek.

## Menjalankan
1. Pasang dependensi: `bun install` (atau `npm install`)
2. Jalankan: `bun run dev` (atau `npm run dev`)
3. Buka alamat yang muncul, biasanya http://localhost:8080

## Mengubah warna
Semua warna ada di `src/styles.css` bagian `:root`, format oklch:
- `--primary` = merah (aksi utama, menu aktif, level risiko "Tinggi")
- `--accent` = jingga (level "Sedang")
- `--success` = hijau (level "Rendah", data terverifikasi)
- `--background` / `--card` = latar gelap

## Mengubah angka & tulisan
Semua data contoh ada di bagian atas `src/routes/index.tsx`:
- `nav` — daftar menu kiri
- `kpis` — 4 kartu ringkasan
- `reports` — daftar laporan terbaru
- `factors` — persentase faktor risiko
- `chain` — langkah audit blockchain
- `emissions` — tinggi batang grafik emisi
