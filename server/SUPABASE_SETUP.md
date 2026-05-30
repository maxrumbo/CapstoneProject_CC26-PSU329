# Supabase PostgreSQL Setup

Panduan ini menyiapkan backend FastAPI SAWIT agar memakai Supabase sebagai PostgreSQL production database. Backend tetap memakai FastAPI, SQLAlchemy, dan psycopg2.

## 1. Ambil Connection String Supabase

1. Buka Supabase Dashboard.
2. Pilih project SAWIT.
3. Masuk ke menu Connect.
4. Pilih connection string untuk Session Pooler.
5. Salin format PostgreSQL connection string.
6. Ganti placeholder password dengan database password project Supabase kamu.

Gunakan Session Pooler karena lebih cocok untuk aplikasi backend yang membuka koneksi database dari environment production.

Contoh format tanpa password asli:

```env
DATABASE_URL=postgresql://postgres.projectref:your_password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Jika Supabase memberikan URL dengan prefix `postgres://`, backend akan otomatis menormalisasi menjadi `postgresql://` agar kompatibel dengan SQLAlchemy.

## 2. Isi File server/.env

1. Duplikasi `server/.env.example` menjadi `server/.env`.
2. Isi value production yang sebenarnya di `server/.env`.
3. Jangan commit `server/.env` ke GitHub.

Contoh variabel yang perlu tersedia:

```env
DATABASE_URL=postgresql://postgres.projectref:your_password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your_gemini_api_key_here
DEMO_USER_ENABLED=true
DEMO_USER_EMAIL=sawit@sawit.id
DEMO_USER_PASSWORD=sawit123
DEMO_USER_DISPLAY_NAME=Demo SAWIT
```

## 3. Jalankan Backend Lokal

Dari root project:

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Saat server berjalan, SQLAlchemy akan membuat tabel otomatis lewat:

```python
Base.metadata.create_all(bind=engine)
```

Tabel yang dibuat mengikuti model saat ini:

- `users`
- `transactions`
- `wishlists`
- `user_budgets`
- `subscriptions`
- `otp_codes`

## 4. Test Swagger

Buka:

```text
http://localhost:8000/docs
```

Test alur dasar seperti register/login, lalu buat data transaksi, wishlist, budget, atau subscription melalui endpoint yang tersedia.

## 5. Cek Data di Supabase

1. Buka Supabase Dashboard.
2. Masuk ke Table Editor.
3. Pastikan tabel SAWIT muncul.
4. Setelah melakukan request dari Swagger atau frontend, pastikan data baru masuk ke tabel yang sesuai.

## 6. Catatan RLS

RLS tidak perlu diaktifkan dulu untuk setup awal ini karena frontend tidak mengakses database Supabase secara langsung. Semua akses database dilakukan melalui backend FastAPI.

Jika nanti frontend memakai Supabase client langsung, aturan RLS perlu dirancang dan diaktifkan sesuai kebutuhan keamanan.

## 7. Deploy ke Render atau Railway

Saat deploy backend, masukkan environment variable dari `server/.env.example` ke dashboard Render atau Railway. Jangan upload file `.env`.

Gunakan start command backend:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Pastikan working directory deployment mengarah ke folder `server/`, atau sesuaikan command build/start dengan struktur project.
