# SAWIT Backend - Panduan Setup & Jalankan Server

Panduan ini menjelaskan cara menjalankan backend SAWIT, termasuk fitur klasifikasi kategori transaksi otomatis dengan model LSTM.

## 1. Masuk ke Folder & Aktifkan Virtual Environment

```bash
cd server

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

## 2. Install Dependensi

```bash
pip install -r requirements.txt
```

Dependensi utama backend:

```txt
fastapi>=0.111.0
uvicorn[standard]>=0.30.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.9
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
pydantic-settings>=2.3.0
pydantic[email]>=2.7.0
python-multipart>=0.0.9
tensorflow-intel>=2.16.0; platform_system == "Windows"
tensorflow>=2.16.0; platform_system != "Windows"
numpy>=1.26.0
google-genai>=2.6.0
```

Dependency AI dipakai untuk klasifikasi kategori transaksi dengan model LSTM di `machine-learning/ModelLSTM`. Model yang dipakai adalah `best_lstm_model.keras`, `tokenizer.json`, dan `model_config.json`.
Dependency `google-genai` dipakai untuk fitur Rekomendasi AI dan Early Warning berbasis Gemini.

## 3. Siapkan File `.env`

File `.env` berada di folder `server/`:

```env
DATABASE_URL=postgresql://postgres:password_kamu@localhost:5432/sawit_db
SECRET_KEY=ganti_dengan_random_string_panjang_minimal_32_karakter
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=isi_api_key_gemini_dari_tim_ai
```

Akun demo default:

```env
DEMO_USER_ENABLED=true
DEMO_USER_EMAIL=sawit@sawit.id
DEMO_USER_PASSWORD=sawit123
DEMO_USER_DISPLAY_NAME=Demo SAWIT
```

## 4. Jalankan Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

Swagger UI tersedia di `http://localhost:8000/docs`.

## 5. Urutan Test di Swagger

Register user:

```http
POST /api/auth/register
{
  "email": "test@sawit.id",
  "password": "password123",
  "display_name": "Andi Sahabat Duwit"
}
```

Login dan salin `access_token`:

```http
POST /api/auth/login
{
  "email": "test@sawit.id",
  "password": "password123"
}
```

Tambah pemasukan dulu agar saldo tersedia:

```http
POST /api/transactions/
{
  "description": "Gaji bulan ini",
  "amount": 5000000,
  "type": "income",
  "date": "2026-05-01"
}
```

Cek saldo:

```http
GET /api/transactions/summary/balance
```

Tambah pengeluaran. Kategori tidak perlu dikirim karena backend selalu memakai prediksi AI LSTM dari `description`:

```http
POST /api/transactions/
{
  "description": "Beli makan siang",
  "amount": 35000,
  "type": "expense",
  "method": "Tunai",
  "date": "2026-05-06"
}
```

Test prediksi kategori langsung:

```http
POST /api/transactions/predict-category
{
  "description": "Beli makan siang"
}
```

Set budget bulan ini sebelum mencoba Rekomendasi AI:

```http
POST /api/budget/set
{
  "month": "2026-05",
  "budgets": [
    { "category": "Konsumsi", "amount": 1500000 },
    { "category": "Transportasi", "amount": 500000 },
    { "category": "Tagihan", "amount": 750000 }
  ]
}
```

Test rekomendasi AI dan Early Warning:

```http
GET /api/advice/
```

Endpoint ini mengembalikan status `AMAN`, `WASPADA`, atau `BAHAYA`, ringkasan kondisi keuangan, saran hemat dari Gemini, dan metrik seperti rata-rata pengeluaran harian serta proyeksi akhir bulan.

Test expense melebihi saldo:

```http
POST /api/transactions/
{
  "description": "Beli laptop mahal",
  "amount": 99999999,
  "type": "expense",
  "date": "2026-05-06"
}
```

## Endpoint

| Method | Path | Fungsi | Auth |
|--------|------|--------|------|
| GET | `/` | Health check | Tidak |
| POST | `/api/auth/register` | Daftar akun baru | Tidak |
| POST | `/api/auth/login` | Login dan dapat JWT token | Tidak |
| GET | `/api/auth/me` | Data user login | Ya |
| GET | `/api/transactions/summary/balance` | Hitung saldo | Ya |
| POST | `/api/transactions/predict-category` | Prediksi kategori pengeluaran dengan LSTM | Ya |
| POST | `/api/transactions/` | Tambah transaksi baru | Ya |
| GET | `/api/transactions/` | Daftar transaksi | Ya |
| GET | `/api/transactions/{id}` | Detail transaksi | Ya |
| PATCH | `/api/transactions/{id}` | Ditolak: transaksi immutable | Ya |
| DELETE | `/api/transactions/{id}` | Ditolak: transaksi immutable | Ya |
| POST | `/api/budget/set` | Set/update budget bulanan per kategori | Ya |
| GET | `/api/budget/summary/{month}` | Ringkasan budget vs spending | Ya |
| GET | `/api/advice/` | Rekomendasi AI dan Early Warning dari Gemini | Ya |

## Catatan Validasi

- Expense selalu dikategorikan otomatis oleh model LSTM; kategori manual dari client diabaikan.
- Income selalu memakai kategori `Pemasukan`.
- Deskripsi wajib diisi dan maksimal 255 karakter.
- Amount harus lebih dari 0.
- Tanggal tidak boleh di masa depan.
- Expense ditolak jika amount lebih besar dari saldo user.
- User hanya bisa mengakses transaksi miliknya.

## Troubleshooting

| Masalah | Penyebab | Solusi |
|--------|----------|--------|
| `connection refused` saat start | PostgreSQL belum jalan | Start service PostgreSQL |
| `database "sawit_db" does not exist` | Database belum dibuat | Buat database di pgAdmin |
| `module 'pydantic_settings' not found` | Dependency belum terinstall | Jalankan `pip install -r requirements.txt` |
| `No module named 'tensorflow'` saat prediksi | Dependency AI belum terinstall | Jalankan `pip install -r requirements.txt` |
| Prediksi mengembalikan 503 | Model LSTM gagal dimuat atau file model tidak ditemukan | Pastikan folder `machine-learning/ModelLSTM` lengkap |
| Rekomendasi AI mengembalikan 503 Gemini belum terinstall | Dependency `google-genai` belum terinstall | Jalankan `pip install google-genai` atau `pip install -r requirements.txt` |
| Rekomendasi AI mengembalikan 503 API key kosong | `GEMINI_API_KEY` belum diisi | Isi `GEMINI_API_KEY` di `server/.env`, lalu restart backend |
| `401 Unauthorized` | Token belum dikirim | Login lalu pakai token Bearer |
| `403 Saldo tidak cukup` | Expense melebihi saldo | Tambah income dulu |
