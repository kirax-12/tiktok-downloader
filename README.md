# TikTok Downloader — Tanpa Watermark

**Demo live:** [tiktok-downloader di GitHub Pages](https://kirax-12.github.io/tiktok-downloader/)

Web app statis buat download video TikTok **tanpa watermark**, kualitas HD, audio MP3, dan foto slideshow. Tinggal tempel link, klik Download, pilih versi yang mau disimpan. Gratis, tanpa daftar, tanpa install apa-apa.

Dibuat oleh **Remike Dev**.

## Fitur

- **Video HD** — kualitas terbaik kalau tersedia dari sumbernya.
- **Video Tanpa Watermark** — versi bersih tanpa logo TikTok dan username melayang.
- **Video Pakai Watermark** — versi original, kalau memang butuh yang ada watermark-nya.
- **Audio MP3** — ambil suara/lagunya aja, cocok buat nada dering atau bahan edit.
- **Foto Slideshow** — postingan foto bisa diunduh satu per satu dalam resolusi aslinya.
- **Tombol Tempel** — paste link langsung dari clipboard, gak perlu ketik manual.
- Info video ditampilkan dulu sebelum download: thumbnail, judul, nama kreator, dan durasi.
- Validasi link: yang diterima cuma URL dari domain `tiktok.com` (termasuk link pendek `vt.tiktok.com` / `vm.tiktok.com`).
- Tampilan responsif, enak dipakai dari HP maupun desktop.

## Cara Pakai

1. Buka video/foto di aplikasi TikTok → **Bagikan** → **Salin tautan**.
2. Tempel link-nya di kolom yang tersedia, tekan **Download**.
3. Klik tombol versi yang mau disimpan (HD / tanpa watermark / MP3 / foto).

Catatan: tombol unduh membuka file di tab baru karena file-nya berasal dari server lain (batasan keamanan browser). Kalau videonya langsung muter di tab baru, tekan titik tiga di pojok video lalu pilih **Download**.

## Cara Kerja

Aplikasi ini murni frontend — tidak ada server sendiri. Saat pengguna menekan Download, browser memanggil API publik [tikwm](https://tikwm.com):

```
GET https://www.tikwm.com/api/?url=<link tiktok>&hd=1
```

Respons JSON-nya berisi beberapa varian file dari satu postingan:

| Field API    | Dipakai untuk                  |
| ------------ | ------------------------------ |
| `hdplay`     | Video HD tanpa watermark       |
| `play`       | Video tanpa watermark (SD)     |
| `wmplay`     | Video dengan watermark         |
| `music`      | Audio MP3                      |
| `images[]`   | Daftar foto (postingan slideshow) |
| `cover`, `title`, `author.nickname` | Thumbnail, judul, dan kreator |

Link yang dimasukkan pengguna hanya dikirim ke API tikwm untuk diproses; tidak disimpan, tidak dicatat, dan tidak dikirim ke tempat lain.

## Cara Menjalankan

Paling gampang: buka file `index.html` langsung di browser.

Atau jalankan server lokal dari folder ini:

```bash
npx serve .
# atau
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.

Buat online: repo ini bisa langsung di-deploy sebagai situs statis, misalnya lewat **GitHub Pages** (Settings → Pages → deploy from branch `main`, folder root) atau Netlify/Vercel dengan drag-and-drop folder.

Catatan: fitur tombol **Tempel** (baca clipboard) butuh konteks aman — jalan di `https://` atau `localhost`, tapi mungkin dibatasi browser kalau file dibuka langsung dari disk. Paste manual tetap bisa.

## Teknologi

- HTML, CSS, dan JavaScript vanilla — tanpa framework, tanpa build step.
- Fetch API untuk memanggil tikwm.
- Desain neo-brutalist khas Remike Dev: latar cream `#FFF8EC`, border hitam 2px, bayangan offset keras, aksen kuning/pink/biru/hijau, font Space Grotesk + Space Mono + Caveat (Google Fonts).

## Struktur File

```
tiktok-downloader/
├── index.html   # struktur halaman
├── style.css    # styling (design system Remike Web Style)
├── script.js    # validasi link, panggil API, render hasil
└── README.md
```

## Etika Pemakaian

Download hanya untuk pemakaian pribadi. Semua video dan foto tetap hak milik kreatornya — jangan di-upload ulang, diperjualbelikan, atau diklaim sebagai karya sendiri tanpa izin.
