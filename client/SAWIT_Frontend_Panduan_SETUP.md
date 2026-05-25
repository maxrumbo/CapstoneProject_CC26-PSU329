# 🚀 SAWIT Frontend - Setup & Jalankan

Frontend React + Vite. Setup lokal untuk development.

---

# ⚙️ SETUP FRONTEND

## 1. Masuk Folder Client

```bash
cd client
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Buat File `.env`

Buat file `.env` di folder `client/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_STREAMLIT_URL=https://dashboardtransaksi.streamlit.app/?user_id=3&embed=true
VITE_STOCK_STREAMLIT_URL=https://dashboardsahamlq45.streamlit.app/?embed=true
```

| Variable | Nilai Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` |
| `VITE_STREAMLIT_URL` | `https://dashboardtransaksi.streamlit.app/?user_id=3&embed=true` |
| `VITE_STOCK_STREAMLIT_URL` | `https://dashboardsahamlq45.streamlit.app/?embed=true` |

## 4. Jalankan Backend Dulu

Dari folder `server/`:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend di: `http://localhost:8000/docs`

## 5. Jalankan Frontend

Dari folder `client/`:

```bash
npm run dev
```

Frontend di: `http://localhost:5173` (atau port berikutnya jika terpakai)

## 6. Login

Email: `sawit@sawit.id`  
Password: `sawit123`

---

# 📖 ROUTES

| URL | Halaman |
|-----|---------|
| `#/login` | Login |
| `#/register` | Register |
| `#/dashboard` | Dashboard |
| `#/transactions` | Transaksi |
| `#/wishlist-calculator` | Wishlist |
| `#/investment` | Investasi |

---

# 📦 SCRIPTS

| Command | Fungsi |
|---------|--------|
| `npm run dev` | Development server |
| `npm run build` | Build production (`dist/`) |
| `npm run lint` | Check code quality |
| `npm run preview` | Preview build |

---

# 🗂️ STRUKTUR FOLDER

```
client/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── transactions/
│   │   └── wishlist/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── styles/
│   └── utils/
├── package.json
├── vite.config.js
└── .env
```

---

# ⚡ QUICK START

```bash
# 1. Setup
cd client
npm install

# 2. Create .env
# (buat file .env dengan VITE_API_BASE_URL)

# 3. Jalankan backend (terminal lain)
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 4. Jalankan frontend
cd client
npm run dev

# 5. Buka browser http://localhost:5173
```

---

# 🐛 TROUBLESHOOTING

| Masalah | Solusi |
|--------|--------|
| Login gagal `Failed to fetch` | Jalankan backend, cek `VITE_API_BASE_URL` |
| Port 5173 sudah dipakai | Vite otomatis gunakan port berikutnya |
| `.env` tidak terbaca | Restart `npm run dev` |
| `npm` error di PowerShell | Gunakan `npm.cmd` atau Command Prompt |
| Data transaksi kosong | Login dulu, tambah pemasukan |

---

# 📝 SEBELUM COMMIT

```bash
npm run lint
npm run build
```

Jangan commit: `node_modules/`, `dist/`, `.env`

---

# 💡 CATATAN    

- Backend di folder `src/services/`
- Token disimpan di `src/utils/authStorage.js`
- Hash routing (bukan React Router)
- Tambah endpoint baru → buat helper API di `src/services/`
