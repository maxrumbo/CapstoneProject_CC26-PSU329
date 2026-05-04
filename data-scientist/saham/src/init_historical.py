# data-scientist/src/init_historical.py
# Jalankan SEKALI di lokal: python data-scientist/src/init_historical.py

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

# Ubah start_date sesuai kebutuhan
START_DATE = "2020-01-01"
END_DATE   = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
CSV_PATH   = "data-scientist/saham/data/lq45_historical.csv"

def init():
    print(f"Fetching data dari {START_DATE} sampai hari ini...")
    all_close = {}

    for ticker_str in LQ45_TICKERS:
        try:
            hist = yf.Ticker(ticker_str).history(
                start=START_DATE, end=END_DATE, auto_adjust=True
            )
            if hist.empty:
                print(f"  ⚠  {ticker_str}: kosong")
                continue

            hist.index = hist.index.tz_localize(None)
            all_close[ticker_str.replace('.JK', '')] = hist['Close']
            print(f"  ✓  {ticker_str:8s}  ({len(hist)} hari trading)")

        except Exception as e:
            print(f"  ✗  {ticker_str}: {e}")

    # Gabungkan semua jadi satu DataFrame
    df = pd.DataFrame(all_close)
    df.index.name = 'Date'
    df = df.reset_index()
    df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')

    # Simpan ke CSV
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    df.to_csv(CSV_PATH, index=False)

    print(f"\n✓ Selesai!")
    print(f"  Baris  : {len(df)} hari trading")
    print(f"  Kolom  : {len(df.columns)} (Date + {len(df.columns)-1} saham)")
    print(f"  Range  : {df['Date'].iloc[0]} → {df['Date'].iloc[-1]}")
    print(f"  Saved  : {CSV_PATH}")

if __name__ == "__main__":
    init()
