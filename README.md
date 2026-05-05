# Capstone Project CC26-PSU329

Repository ini dipakai bareng oleh beberapa anggota tim. Isi README ini dibuat sebagai panduan kerja supaya proses clone, branch, commit, dan push tetap aman dan rapi, terutama untuk yang belum terbiasa pakai Git.

## Isi Repo

- `client/` - frontend React + Vite
- `data-scientist/` - analisis data, notebook, dan script Python
- `server/` - backend
- `machine-learning/` - model dan kode machine learning

## Alur Kerja yang Disarankan

1. Clone repository ke laptop masing-masing.
2. Selalu buat branch baru untuk pekerjaan kamu.
3. Kerjakan perubahan di branch itu, jangan langsung di `main`.
4. Commit perubahan dengan pesan yang jelas.
5. Push branch ke GitHub.
6. Kalau sudah selesai, buat pull request atau minta review dari tim.

## Cara Clone

Kalau pakai terminal:

```bash
git clone <url-repository>
cd CapstoneProject_CC26-PSU329
```

Kalau pakai GitHub Desktop:

1. Login ke GitHub Desktop.
2. Pilih menu Clone a repository.
3. Masukkan URL repo atau pilih dari daftar repository kamu.
4. Tentukan folder lokal, lalu clone.

## Cara Kerja Pakai Branch

Satu orang sebaiknya punya satu branch kerja sendiri. Contoh nama branch:

- `feature/login`
- `feature/dashboard`
- `fix/navbar`
- `data-cleaning`

Contoh alur pakai terminal:

```bash
git checkout -b feature/nama-kamu
git add .
git commit -m "Add login page"
git push origin feature/nama-kamu
```

## Alur Push yang Aman

- Pastikan sudah `git pull` dulu sebelum mulai kerja supaya branch kamu tidak ketinggalan.
- Commit perubahan kecil-kecil supaya mudah dilacak.
- Jangan push langsung ke `main` kecuali memang disetujui tim.
- Kalau ada konflik, jangan asal hapus file. Cek dulu perubahan dari anggota lain.

## Do

- Pakai branch sendiri untuk setiap tugas.
- Pull dulu sebelum mulai kerja.
- Kasih nama commit yang jelas.
- Simpan file yang sudah selesai sebelum push.
- Tanya tim kalau tidak yakin sebelum mengubah file penting.

## Don't

- Jangan kerja langsung di `main`.
- Jangan force push kalau tidak paham dampaknya.
- Jangan hapus file milik orang lain tanpa diskusi.
- Jangan commit file yang tidak perlu, seperti file sementara atau hasil build.
- Jangan overwrite perubahan anggota tim lain.

## Menjalankan Frontend

Masuk ke folder `client/`, lalu jalankan:

```bash
npm install
npm run dev
```

## Data Science

Di folder `data-scientist/` terdapat dua bagian utama:

- `kategorisasi/` - dataset, notebook, dan kebutuhan Python untuk klasifikasi atau sentimen
- `saham/` - script Python untuk data historis saham LQ45

Contoh menjalankan script di `data-scientist/saham/`:

```bash
pip install -r requirements.txt
python src/init_historical.py
python src/fetch_lq45.py
```

## Catatan

- Kalau mau tambah fitur baru, buat branch baru dulu.
- Kalau pakai GitHub Desktop, tetap ikuti alur yang sama: branch, commit, push.
- Folder `server/` dan `machine-learning/` masih bisa dikembangkan sesuai kebutuhan tim.