# Profil Page Budgeting

## Fokus Fitur

Halaman profil hanya dipakai untuk mengatur nilai budget per kategori. Nilai ini berlaku seterusnya sampai user melakukan update.

## Alur Pengguna

1. User membuka halaman profil dari nama/avatar kanan atas.
2. User mengisi nominal untuk setiap kategori.
3. User menekan tombol `Simpan Budget Kategori`.
4. Setelah tersimpan, input kategori terkunci.
5. Jika ingin mengubah, user menekan tombol `Update`.
6. Setelah mode update aktif, user mengubah nominal kategori lalu menekan `Simpan Budget Kategori`.
7. Nilai kategori tersimpan dan akan tetap digunakan sampai user mengubahnya lagi.

## Kategori Dan Warna

```js
const CATEGORY_COLORS = {
  Entertainment: "#D85A30",
  Langganan: "#7F77DD",
  Kesehatan: "#D4537E",
  Transportasi: "#378ADD",
  Konsumsi: "#1D9E75",
  Tagihan: "#EF9F27",
  Pemasukan: "#B4B2A9",
};
```

## Struktur Data Frontend Sementara

Data masih disimpan di `localStorage` per user.

```json
{
  "id:1": {
    "category_limits": {
      "Entertainment": 200000,
      "Langganan": 150000,
      "Kesehatan": 100000,
      "Transportasi": 300000,
      "Konsumsi": 900000,
      "Tagihan": 500000,
      "Pemasukan": 3000000
    },
    "income_target": 3000000,
    "updated_at": "2026-05-12T02:30:00.000Z"
  }
}
```

## Catatan Integrasi Backend

- Tidak ada pemilihan bulan di profile page.
- Tidak ada riwayat/list budget.
- Tidak ada input budget total.
- Semua nilai disimpan per kategori dan bisa di-update kapan saja.
- Update hanya bisa dilakukan setelah user menekan tombol `Update`.
- `Pemasukan` disimpan sebagai `income_target`.
- Analisis AI berada di tab/fitur terpisah.
