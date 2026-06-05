# Proyek Akhir: Menyelesaikan Permasalahan Perusahaan Edutech

## Business Understanding
Perkembangan teknologi digital telah mempermudah berbagai aktivitas keuangan, namun juga 
meningkatkan tantangan pengelolaan keuangan pribadi bagi Generasi Z yang memiliki gaya 
hidup serba digital dan cenderung konsumtif. Berdasarkan Survei Nasional Literasi dan 
Inklusi Keuangan (SNLIK) 2024 yang dirilis OJK, tingkat literasi keuangan Generasi Z masih 
berada pada angka 44,04%. Kondisi ini menyebabkan banyak generasi muda kesulitan mengontrol 
pengeluaran, menabung secara konsisten, dan mencapai tujuan keuangan jangka panjang. SAWIT 
(Sahabat Duwit) hadir sebagai aplikasi keuangan digital berbasis AI yang membantu Generasi Z 
mencatat, menganalisis transaksi, memperoleh rekomendasi keuangan personal, dan meningkatkan 
literasi investasi.

### Permasalahan Bisnis
1. Bagaimana membantu Generasi Z memahami pola pemasukan dan pengeluaran mereka secara 
   lebih efektif?
2. Bagaimana membantu Generasi Z mengelola dan memantau transaksi keuangan sehari-hari 
   secara lebih mudah, akurat, dan terstruktur?
3. Bagaimana memberikan rekomendasi keuangan yang personal dan relevan berdasarkan kondisi 
   serta perilaku pengeluaran Generasi Z?
4. Bagaimana meningkatkan literasi investasi Generasi Z melalui informasi yang sederhana, 
   informatif, dan mudah dipahami?

### Cakupan Proyek
SAWIT dikembangkan sebagai aplikasi berbasis web dengan enam fitur utama:
- **Auto Categorization** — kategorisasi transaksi otomatis berbasis IndoBERT + MLP
- **AI Recommendation & Early Warning** — rekomendasi keuangan personal dan sistem 
  peringatan dini (AMAN/WASPADA/BAHAYA) menggunakan Gemini 2.5 Flash
- **Dashboard Analytics** — visualisasi cashflow, breakdown kategori, dan deteksi 
  kategori terboros
- **Subscription Tracker** — pemantauan dan pengelolaan pengeluaran langganan rutin
- **Wishlist Calculator** — perencanaan target keuangan dan estimasi tabungan
- **Investment Corner** — informasi dan edukasi saham LQ45 dengan indikator teknikal

Proyek ini tidak mencakup integrasi langsung dengan rekening bank/dompet digital, 
transaksi jual beli saham, deteksi otomatis langganan via email, dan OCR struk fisik.

### Persiapan

Sumber data: 
- Dataset kategorisasi transaksi: web scraping dari Shopee, Tokopedia, GoFood, Traveloka, 
  Google Maps, Astronauts, K24Klik + data sintetis berbasis AI (total 61.075 data, 
  train: 48.860 | test: 12.215)
- Data saham LQ45: Yahoo Finance via library `yfinance`, diperbarui otomatis setiap 
  hari bursa melalui GitHub Actions
- Profil emiten: halaman Profil Perusahaan Tercatat BEI

Setup environment:
```
# Clone repository
git clone 
cd CapstoneProject_CC26-PSU329

# Install dependencies frontend
cd client
npm install

# Install dependencies data science & ML
cd ../data-scientist
pip install -r requirements.txt

# Install dependencies backend
cd ../server
pip install -r requirements.txt
```

## Business Dashboard
Dashboard analitik SAWIT dikembangkan menggunakan Streamlit dan terhubung langsung ke 
database PostgreSQL (Supabase). Dashboard menampilkan ringkasan indikator keuangan 
(total pemasukan, pengeluaran, saldo bersih), visualisasi cashflow bulanan, breakdown 
kategori pengeluaran via donut chart, analisis metode pembayaran, budget tracker, status 
keuangan early warning, deteksi kategori terboros, dan riwayat transaksi yang dapat difilter.

Akses dashboard analitik (token sesuai akun pengguna):
🔗 https://dashboardtransaksi.streamlit.app/?token=<token_pengguna>

Dashboard investasi menampilkan pergerakan harga saham LQ45 (line chart & candlestick), 
profil emiten, statistik deskriptif, return historis, analisis Moving Average (SMA/EMA), 
MACD, RSI, Pivot Point, serta ringkasan sinyal teknikal (BUY/SELL/NEUTRAL) yang bersifat 
edukatif.

Akses dashboard investasi:
🔗 https://dashboardsahamlq45.streamlit.app/

## Menjalankan Sistem Machine Learning
Model Auto Categorization (IndoBERT + MLP) dapat diakses melalui endpoint API yang 
telah dideploy, atau dijalankan secara lokal sebagai berikut:

```bash
# Jalankan backend FastAPI (termasuk endpoint prediksi AI)
cd server
pip install -r requirements.txt
uvicorn main:app --reload

# Endpoint prediksi kategori transaksi:
# POST /api/transactions/predict-category
# POST /api/ml/kategorisasi (batch)
```

Prototype sistem machine learning dapat diakses langsung melalui aplikasi web SAWIT:
🔗 https://sahabatduwit.vercel.app/

API Backend:
🔗 https://sawit-server-production.up.railway.app

## Conclusion
SAWIT berhasil menjawab keempat permasalahan bisnis yang dirumuskan. Model Auto 
Categorization berbasis IndoBERT + MLP mencapai akurasi 95,24% pada 12.215 data uji, 
melampaui target minimal 85%, dengan keunggulan yang telah divalidasi secara statistik 
melalui A/B Testing (Z-statistic = 7,6752, p-value = 0,0000). Keenam fitur utama telah 
berhasil diimplementasikan dan dapat diakses publik di https://sahabatduwit.vercel.app/.


### Rekomendasi Action Items
1)	Mengembangkan aplikasi mobile (iOS dan Android) untuk mendukung pencatatan transaksi yang lebih cepat dan real-time mengingat Generasi Z sangat bergantung pada perangkat mobile dalam aktivitas sehari-hari.
2)	Mengimplementasikan mekanisme active learning yang memungkinkan model belajar secara berkelanjutan dari koreksi yang diberikan oleh pengguna.
3)	Menambahkan fitur OCR untuk struk fisik guna membuat pencatatan transaksi lebih sudah.
4)	Menambahkan fitur chatbot sehingga pengguna dapat berinteraksi dan mendapatkan saran dengan maksimal.

