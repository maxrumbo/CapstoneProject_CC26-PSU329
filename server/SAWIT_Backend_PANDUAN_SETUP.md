`# SAWIT Backend — Panduan Setup & Jalankan Server

Semua file sudah dibuat. Ikuti langkah di bawah ini secara berurutan di terminal kamu.

---

## Langkah 1 — Masuk ke Folder & Aktifkan Virtual Environment

```bash
cd server
# Aktifkan venv kamu (sesuaikan dengan OS)
source venv/bin/activate          # macOS / Linux
venv\Scripts\activate             # Windows
```

---

## Langkah 2 — Install Semua Dependensi

```bash
pip install -r requirements.txt
```

Isi `requirements.txt`:
```
fastapi>=0.111.0
uvicorn[standard]>=0.30.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.9
alembic>=1.13.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
pydantic-settings>=2.3.0
pydantic[email]>=2.7.0
python-multipart>=0.0.9
```

---

## Langkah 3 — Pastikan File .env Sudah Benar

File `.env` kamu harus berada di `server/.env` (sejajar dengan `main.py`), isinya:

```env
DATABASE_URL=postgresql://postgres:password_kamu@localhost:5432/sawit_db
SECRET_KEY=ganti_dengan_random_string_panjang_minimal_32_karakter
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Opsional — Akun Demo Otomatis

Backend akan membuat akun demo saat startup. Defaultnya:

- Email: `sawit@sawit.id`
- Password: `sawit123`
- Nama: `Demo SAWIT`

Kalau mau ubah atau nonaktifkan, tambahkan ke `.env`:

```env
DEMO_USER_ENABLED=true
DEMO_USER_EMAIL=demo@sawit.id
DEMO_USER_PASSWORD=Sahabat123
DEMO_USER_DISPLAY_NAME=Demo SAWIT
```

> Cara generate SECRET_KEY yang aman:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

---

## Langkah 4 — Jalankan Server

```bash
# Dari dalam folder server/, pastikan venv aktif
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Kalau berhasil, terminal akan tampilkan:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

**Saat pertama jalan**, FastAPI otomatis membuat semua tabel di `sawit_db` melalui:
```python
Base.metadata.create_all(bind=engine)  # Ada di main.py
```

Kamu bisa cek di pgAdmin — tabel `users` dan `transactions` akan muncul otomatis.

---

## Langkah 5 — Buka Swagger UI & Test Endpoint

Buka browser: **http://localhost:8000/docs**

### Urutan Test yang Benar:

**1. Register user baru**
```
POST /api/auth/register
{
  "email": "test@sawit.id",
  "password": "password123",
  "display_name": "Andi Sahabat Duwit"
}
```

**2. Login untuk dapat token**
```
POST /api/auth/login
{
  "email": "test@sawit.id",
  "password": "password123"
}
```
Salin `access_token` dari response → klik tombol **Authorize** di Swagger → paste token.

**3. Tambah income dulu (supaya ada saldo)**
```
POST /api/transactions/
{
  "description": "Gaji bulan ini",
  "amount": 5000000,
  "type": "income",
  "date": "2026-05-01"
}
```

**4. Cek saldo**
```
GET /api/transactions/summary/balance
```

**5. Tambah expense**
```
POST /api/transactions/
{
  "description": "Beli makan siang",
  "amount": 35000,
  "type": "expense",
  "category": "Makanan",
  "method": "Tunai",
  "date": "2026-05-06"
}
```

**6. Test expense melebihi saldo → harusnya error 403**
```
POST /api/transactions/
{
  "description": "Beli laptop mahal",
  "amount": 99999999,
  "type": "expense",
  "category": "Belanja",
  "date": "2026-05-06"
}
```

---

## Struktur File Lengkap

```
server/
├── .env                          ← File kamu (jangan di-commit ke git!)
├── main.py                       ← Entry point, register router, buat tabel
├── requirements.txt              ← Semua dependensi
└── app/
    ├── __init__.py
    ├── core/
    │   ├── __init__.py
    │   ├── config.py             ← Baca .env via pydantic-settings
    │   └── security.py           ← hash_password, verify_password, JWT functions
    ├── db/
    │   ├── __init__.py
    │   ├── base.py               ← SQLAlchemy Base class
    │   └── session.py            ← Engine, SessionLocal, get_db dependency
    ├── models/
    │   ├── __init__.py
    │   ├── user.py               ← ORM model tabel users
    │   └── transaction.py        ← ORM model tabel transactions + VALID_CATEGORIES
    ├── schemas/
    │   ├── __init__.py
    │   ├── base.py               ← APIResponse<T> wrapper standar
    │   ├── user.py               ← UserRegister, UserLogin, UserResponse, TokenResponse
    │   └── transaction.py        ← TransactionCreate, TransactionUpdate, TransactionResponse, BalanceSummaryResponse
    └── api/
        ├── __init__.py
        ├── dependencies.py       ← get_current_user, get_db
        └── routes/
            ├── __init__.py
            ├── auth.py           ← POST /register, POST /login, GET /me
            └── transactions.py   ← endpoint transaksi aktif + proteksi immutable
```

---

## Semua Endpoint yang Tersedia

| Method | Path | Fungsi | Auth |
|--------|------|--------|------|
| GET | `/` | Health check | ❌ |
| POST | `/api/auth/register` | Daftar akun baru | ❌ |
| POST | `/api/auth/login` | Login, dapat JWT token | ❌ |
| GET | `/api/auth/me` | Data user yang login | ✅ |
| GET | `/api/transactions/summary/balance` | Hitung saldo (income - expense) | ✅ |
| POST | `/api/transactions/` | Tambah transaksi baru | ✅ |
| GET | `/api/transactions/` | Daftar transaksi (filter + pagination) | ✅ |
| GET | `/api/transactions/{id}` | Detail 1 transaksi | ✅ |
| PATCH | `/api/transactions/{id}` | Ditolak: transaksi immutable setelah dicatat (405) | ❌ |
| DELETE | `/api/transactions/{id}` | Ditolak: transaksi immutable setelah dicatat (405) | ❌ |

---

## Error yang Umum & Cara Fixing

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `connection refused` saat start | PostgreSQL belum jalan | Start service PostgreSQL di pgAdmin |
| `database "sawit_db" does not exist` | DB belum dibuat | Buat manual di pgAdmin |
| `module 'pydantic_settings' not found` | Library belum install | `pip install pydantic-settings` |
| `ModuleNotFoundError` or `ImportError` | Modul tidak ditemukan atau terjadi kesalahan import (sering akibat `__init__.py` hilang) | Pastikan semua folder punya `__init__.py` dan modul bisa di-import |
| `401 Unauthorized` saat test | Lupa klik Authorize di Swagger | Klik tombol Authorize → paste token |
| `403 Saldo tidak cukup` | Amount expense > balance | Tambah income dulu |

---

## Catatan Penting untuk Tim

**Validasi yang sudah ada di backend (tidak perlu duplikasi di FE):**
- Kategori wajib untuk expense, diabaikan untuk income
- Deskripsi max 255 karakter, tidak boleh kosong
- Amount harus > 0
- Tanggal tidak boleh di masa depan
- Expense ditolak jika amount > saldo user (HTTP 403)
- User hanya bisa akses transaksi miliknya (HTTP 403 jika bukan miliknya)

**Format response semua endpoint konsisten:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Transaksi berhasil ditambahkan",
  "error": null
}
```
