import yfinance as yf
import pandas as pd
import os
from datetime import datetime, timedelta

LQ45_TICKERS = [
    "AADI.JK", "ADMR.JK", "ADRO.JK", "AKRA.JK", "AMMN.JK",
    "AMRT.JK", "ANTM.JK", "ASII.JK", "BBCA.JK", "BBNI.JK",
    "BBRI.JK", "BBTN.JK", "BMRI.JK", "BRPT.JK", "BUMI.JK",
    "CPIN.JK", "CUAN.JK", "DEWA.JK", "EMTK.JK", "ESSA.JK",
    "EXCL.JK", "GOTO.JK", "HRTA.JK", "ICBP.JK", "INCO.JK",
    "INDF.JK", "INKP.JK", "ISAT.JK", "ITMG.JK", "JPFA.JK",
    "KLBF.JK", "MAPI.JK", "MBMA.JK", "MDKA.JK", "MEDC.JK",
    "PGAS.JK", "PGEO.JK", "PTBA.JK", "SCMA.JK", "SMGR.JK",
    "TLKM.JK", "TOWR.JK", "UNTR.JK", "UNVR.JK", "WIFI.JK",
]

# IHSG ditambahkan terpisah karena tickernya berbeda format
INDEX_TICKERS = {
    "^JKSE": "IHSG",
}

# Kolom OHLCV yang akan diambil
OHLCV_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]

START_DATE = "2020-01-01"
END_DATE   = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "lq45_historical.csv")

def fetch_ticker(ticker_str, label):
    """Ambil data OHLCV satu ticker, return DataFrame dengan kolom berlabel."""
    try:
        hist = yf.Ticker(ticker_str).history(
            start=START_DATE, end=END_DATE, auto_adjust=True
        )
        if hist.empty:
            print(f"  Error  {ticker_str}: kosong")
            return None

        hist.index = hist.index.tz_localize(None)

        # Pilih kolom yang tersedia
        available = [c for c in OHLCV_COLUMNS if c in hist.columns]
        df = hist[available].copy()

        # Rename kolom jadi TICKER_Open, TICKER_High, dst.
        df.columns = [f"{label}_{col}" for col in df.columns]

        print(f"  Ok  {ticker_str:10s} ({label})  {len(hist)} hari trading")
        return df

    except Exception as e:
        print(f"  Error  {ticker_str}: {e}")
        return None


def init():
    print(f"Fetching data dari {START_DATE} sampai {END_DATE}...\n")

    frames = []

    # Fetch semua LQ45
    for ticker_str in LQ45_TICKERS:
        label = ticker_str.replace('.JK', '')
        df = fetch_ticker(ticker_str, label)
        if df is not None:
            frames.append(df)

    # Fetch indeks (IHSG, dll.)
    for ticker_str, label in INDEX_TICKERS.items():
        df = fetch_ticker(ticker_str, label)
        if df is not None:
            frames.append(df)

    if not frames:
        print("\nTidak ada data yang berhasil diambil.")
        return

    # Gabungkan semua jadi satu DataFrame berdasarkan tanggal
    combined = pd.concat(frames, axis=1)
    combined.index.name = 'Date'
    combined = combined.reset_index()
    combined['Date'] = pd.to_datetime(combined['Date']).dt.strftime('%Y-%m-%d')
    combined = combined.sort_values('Date').reset_index(drop=True)

    # Simpan ke CSV
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    combined.to_csv(CSV_PATH, index=False)

    n_tickers = len(LQ45_TICKERS) + len(INDEX_TICKERS)
    print(f"\n Selesai!")
    print(f"  Baris  : {len(combined)} hari trading")
    print(f"  Kolom  : {len(combined.columns)} (Date + {n_tickers} ticker x {len(OHLCV_COLUMNS)} kolom)")
    print(f"  Range  : {combined['Date'].iloc[0]} --> {combined['Date'].iloc[-1]}")
    print(f"  Saved  : {CSV_PATH}")
if __name__ == "__main__":
    init()
