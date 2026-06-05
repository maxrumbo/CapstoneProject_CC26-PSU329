# SAWIT - Sahabat Duwit

Ringkas. Cerdas. Siap bantu kamu mengelola keuangan harian.

## Deskripsi Singkat Proyek

SAWIT (Sahabat Duwit) adalah aplikasi manajemen keuangan berbasis web untuk membantu pengguna mencatat transaksi, melihat ringkasan saldo, dan mendapatkan rekomendasi pengelolaan keuangan. Backend menyediakan API transaksi dan fitur AI untuk kategorisasi otomatis pengeluaran.

## Highlight Fitur

- Pencatatan transaksi income dan expense dengan ringkasan saldo.
- Kategorisasi otomatis pengeluaran berbasis IndoBERT + MLP.
- Rekomendasi dan early warning berbasis AI.
- Dashboard ringkas untuk pemantauan kondisi finansial.

## Galeri Aplikasi


![Welcome Page](docs/images/welcome-page.png)

## Tech Stack

Frontend:
- React + Vite
- Tailwind CSS

Backend:
- FastAPI
- SQLAlchemy
- PostgreSQL

AI/ML:
- Hugging Face Transformers (IndoBERT)
- TensorFlow/Keras (MLP)

## Petunjuk Setup Environment

### Prasyarat

- Node.js 18+
- Python 3.10+
- PostgreSQL

### Frontend (client/)

```bash
cd client
npm install
npm run dev
```

### Backend (server/)

```bash
cd server
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# Windows CMD
.venv\Scripts\activate
pip install -r requirements.txt
```

Buat file server/.env:

```env
DATABASE_URL=postgresql://postgres:password_kamu@localhost:5432/sawit_db
SECRET_KEY=ganti_dengan_random_string_panjang_minimal_32_karakter
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=isi_api_key_gemini_dari_tim_ai
HF_MODEL_ID=StefanoGarrent/sawit-indobert-kategorisasi
HF_TOKEN=isi_token_huggingface_jika_repo_privat
HF_CACHE_DIR=/tmp/hf_model_cache
```

Jalankan server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Konfigurasi Environment

Backend memakai variabel berikut:
- DATABASE_URL: koneksi PostgreSQL.
- SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES: konfigurasi JWT.
- GEMINI_API_KEY: API key Gemini untuk rekomendasi AI.
- HF_MODEL_ID, HF_TOKEN, HF_CACHE_DIR: konfigurasi model AI dari Hugging Face Hub.

## Tautan Model ML

Model AI dapat diunduh dari Google Drive berikut:
https://drive.google.com/drive/folders/1hY5yuir9umRMbqMUdKrCGkO84qnIuVU3

Catatan: Backend saat ini memuat model dari Hugging Face Hub melalui HF_MODEL_ID dan HF_TOKEN.

## Tech Report

Dokumen tech report dapat diakses di:
https://drive.google.com/file/d/19Us8byCFFXWmWw_ewWPgOyfiPmh37w6F/view?usp=drivesdk

## Cara Menjalankan Aplikasi

1. Jalankan backend di folder server/ (lihat langkah di atas).
2. Jalankan frontend di folder client/.
3. Buka aplikasi di browser: http://localhost:5173

## Endpoint Utama (Backend)

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/transactions/
- GET /api/transactions/
- GET /api/transactions/summary/balance
- POST /api/transactions/predict-category
- POST /api/budget/set
- GET /api/budget/summary/{month}
- GET /api/advice/

Dokumentasi interaktif tersedia di http://localhost:8000/docs

## Struktur Repo

- client/ - frontend React + Vite
- server/ - backend FastAPI
- data-scientist/ - notebook dan riset data
- server/artifacts/ - artifacts training/model

## Catatan Pengembangan

- Backend memuat model AI dari Hugging Face Hub.
- Folder data-scientist dan artifacts berisi material riset dan training.
