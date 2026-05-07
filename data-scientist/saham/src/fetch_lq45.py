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

# IHSG dan indeks lain jika dibutuhkan
INDEX_TICKERS = {
    "^JKSE": "IHSG",
}

# Kolom OHLCV yang akan diambil
OHLCV_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]

CSV_PATH = "lq45_historical.csv"


def fetch_ohlcv_today(ticker_str, label):
    """Ambil data OHLCV hari ini untuk satu ticker."""
    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

    try:
        hist = yf.Ticker(ticker_str).history(start=today, end=tomorrow, auto_adjust=True)
        if hist.empty:
            print(f"  Error  {ticker_str}: kosong")
            return {f"{label}_{col}": None for col in OHLCV_COLUMNS}

        row = hist.iloc[-1]
        data = {}
        for col in OHLCV_COLUMNS:
            if col in row.index:
                val = row[col]
                data[f"{label}_{col}"] = round(float(val), 2) if col != "Volume" else int(val)
            else:
                data[f"{label}_{col}"] = None

        print(f"  Ok  {ticker_str:10s} ({label})  Close={data.get(f'{label}_Close')}")
        return data

    except Exception as e:
        print(f"  Error  {ticker_str}: {e}")
        return {f"{label}_{col}": None for col in OHLCV_COLUMNS}


def fetch_today():
    """Ambil data OHLCV hari ini untuk semua ticker + IHSG."""
    today = datetime.now().strftime('%Y-%m-%d')
    all_data = {"Date": today}

    # Fetch LQ45
    for ticker_str in LQ45_TICKERS:
        label = ticker_str.replace('.JK', '')
        all_data.update(fetch_ohlcv_today(ticker_str, label))

    # Fetch indeks
    for ticker_str, label in INDEX_TICKERS.items():
        all_data.update(fetch_ohlcv_today(ticker_str, label))

    return pd.DataFrame([all_data])


def append_to_csv(new_row):
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    today = str(new_row['Date'].iloc[0])

    if os.path.exists(CSV_PATH):
        existing = pd.read_csv(CSV_PATH)
        existing['Date'] = existing['Date'].astype(str)

        if today in existing['Date'].values:
            print(f"Tanggal {today} sudah ada, cek perubahan...")

            old_row = existing[existing['Date'] == today]

            # Align kolom sebelum dibandingkan
            common_cols = [c for c in new_row.columns if c in old_row.columns and c != 'Date']
            old_values = old_row[common_cols].values
            new_values = new_row[common_cols].values

            if (old_values == new_values).all():
                print("Data sama, tidak perlu update.")
                return
            else:
                print("Data berubah, update row...")
                existing = existing[existing['Date'] != today]
                updated = pd.concat([existing, new_row], ignore_index=True)
        else:
            updated = pd.concat([existing, new_row], ignore_index=True)
    else:
        updated = new_row

    updated = updated.sort_values("Date").reset_index(drop=True)
    updated.to_csv(CSV_PATH, index=False)
    print(f"Saved {today} --> total {len(updated)} baris")


if __name__ == "__main__":
    print(f"Fetching data untuk {datetime.now().strftime('%Y-%m-%d')}...")
    new_row = fetch_today()
    append_to_csv(new_row)
