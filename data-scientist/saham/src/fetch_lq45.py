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

CSV_PATH = "data-scientist/saham/data/lq45_historical.csv"

def fetch_today() -> pd.DataFrame:
    """Ambil data close hari ini untuk semua ticker."""
    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

    all_close = {"Date": today}

    for ticker_str in LQ45_TICKERS:
        try:
            hist = yf.Ticker(ticker_str).history(start=today, end=tomorrow, auto_adjust=True)
            if hist.empty:
                print(f"  Error  {ticker_str}: kosong")
                all_close[ticker_str.replace('.JK', '')] = None
            else:
                close = round(hist['Close'].iloc[-1], 2)
                all_close[ticker_str.replace('.JK', '')] = close
                print(f"  Oke  {ticker_str:8s}  close = {close:,.2f}")
        except Exception as e:
            print(f"  No  {ticker_str}: {e}")
            all_close[ticker_str.replace('.JK', '')] = None

    return pd.DataFrame([all_close])

def append_to_csv(new_row: pd.DataFrame):
    os.makedirs("data", exist_ok=True)
    today = str(new_row['Date'].iloc[0])

    if os.path.exists(CSV_PATH):
        existing = pd.read_csv(CSV_PATH)
        existing['Date'] = existing['Date'].astype(str)

        if today in existing['Date'].values:
            print(f"Error Tanggal {today} sudah ada, cek perubahan...")

            # ambil row lama
            old_row = existing[existing['Date'] == today]

            # bandingkan isi (kecuali kolom Date)
            old_values = old_row.drop(columns=["Date"]).values
            new_values = new_row.drop(columns=["Date"]).values

            if (old_values == new_values).all():
                print("Oke Data sama, tidak perlu update.")
                return
            else:
                print("Data berubah, update row...")

                # hapus row lama
                existing = existing[existing['Date'] != today]

                # append data baru
                updated = pd.concat([existing, new_row], ignore_index=True)
        else:
            updated = pd.concat([existing, new_row], ignore_index=True)
    else:
        updated = new_row

    # rapikan
    updated = updated.sort_values("Date").reset_index(drop=True)

    updated.to_csv(CSV_PATH, index=False)
    print(f"Oke Saved {today} → total {len(updated)} baris")

if __name__ == "__main__":
    print(f"Fetching data untuk {datetime.now().strftime('%Y-%m-%d')}...")
    new_row = fetch_today()
    append_to_csv(new_row)
