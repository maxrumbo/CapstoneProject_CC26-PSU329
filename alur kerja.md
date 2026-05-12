# Alur Kerja Fitur Profil dan Budget

## Tujuan

Membuat halaman profil yang berisi data akun, tombol logout, dan pengaturan budget kategori yang berlaku terus sampai user melakukan update.

## Alur Pengerjaan

1. User masuk ke aplikasi SAWIT.
2. User membuka halaman profil dari nama/avatar kanan atas.
3. Frontend menampilkan data user dan tombol logout.
4. Frontend menampilkan input budget untuk setiap kategori.
5. Pertama kali, user mengisi nominal kategori dan menekan `Simpan Budget Kategori`.
6. Setelah tersimpan, input terkunci.
7. Untuk mengubah nilai, user menekan `Update`.
8. Setelah mode update aktif, user mengubah nominal kategori dan menekan `Simpan Budget Kategori`.
9. Frontend menyimpan nilai kategori terbaru dan menimpa nilai sebelumnya.

## Pembagian Kerja

Frontend:
- Halaman profil.
- Input budget per kategori.
- Tombol simpan untuk penyimpanan awal dan penyimpanan perubahan.
- Tombol update untuk membuka mode edit setelah budget tersimpan.
- Logout di halaman profil.

Backend:
- Endpoint penyimpanan dan pengambilan budget kategori.
- Sinkronisasi budget per user.

Analisis AI:
- Dikerjakan pada tab/fitur terpisah, bukan di halaman profil.
- Dapat memakai data budget kategori dari backend jika sudah tersedia.
