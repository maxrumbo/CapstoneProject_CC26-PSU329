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

INDEX_TICKERS = {
    "^JKSE": "IHSG",
}

OHLCV_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]
LOOKBACK_DAYS = 30  # jumlah hari ke belakang yang dicek & di-refresh

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "lq45_historical.csv")


def fetch_ohlcv_range(ticker_str, label, start_date, end_date):
    """
    Ambil OHLCV untuk rentang start_date..end_date.
    Return: dict keyed by date_str -> {label_Col: value, ...}
    """
    try:
        hist = yf.download(
            ticker_str,
            start=start_date,
            end=(datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d"),
            auto_adjust=True,
            progress=False,
        )
        if hist.empty:
            print(f"  Skip  {ticker_str}: kosong")
            return {}

        hist.columns = hist.columns.get_level_values(0)
        hist.index = hist.index.tz_localize(None) if hist.index.tzinfo else hist.index

        result = {}
        for ts, row in hist.iterrows():
            date_str = ts.strftime("%Y-%m-%d")
            data = {}
            for col in OHLCV_COLUMNS:
                if col in row.index:
                    val = row[col]
                    data[f"{label}_{col}"] = round(float(val), 2) if col != "Volume" else int(val)
                else:
                    data[f"{label}_{col}"] = None
            result[date_str] = data

        dates_fetched = ", ".join(sorted(result.keys()))
        print(f"  Ok  {ticker_str:10s} ({label})  [{dates_fetched}]")
        return result

    except Exception as e:
        print(f"  Error  {ticker_str}: {e}")
        return {}


def fetch_range(lookback_days=LOOKBACK_DAYS):
    """
    Fetch semua ticker untuk `lookback_days` hari ke belakang.
    Return: DataFrame dengan satu baris per tanggal bursa.
    """
    end_date   = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=lookback_days + 5)).strftime("%Y-%m-%d")
    # +5 biar tetap dapat N hari bursa meski ada hari libur di tengah

    print(f"Fetching {start_date} s/d {end_date} ...")

    # Kumpulkan semua ticker: LQ45 + indeks
    ticker_label_pairs = [(t, t.replace(".JK", "")) for t in LQ45_TICKERS]
    ticker_label_pairs += list(INDEX_TICKERS.items())

    # date_str -> {col: val}
    by_date: dict[str, dict] = {}

    for ticker_str, label in ticker_label_pairs:
        range_data = fetch_ohlcv_range(ticker_str, label, start_date, end_date)
        for date_str, cols in range_data.items():
            if date_str not in by_date:
                by_date[date_str] = {"Date": date_str}
            by_date[date_str].update(cols)

    if not by_date:
        print("Tidak ada data sama sekali.")
        return None

    df = pd.DataFrame(list(by_date.values()))
    df = df.sort_values("Date").reset_index(drop=True)
    return df


def upsert_to_csv(new_df):
    """
    Untuk setiap baris di new_df:
    - Kalau tanggal belum ada di CSV → tambah
    - Kalau sudah ada tapi data beda → update
    - Kalau sudah ada dan sama → skip
    """
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)

    if os.path.exists(CSV_PATH):
        existing = pd.read_csv(CSV_PATH)
        existing["Date"] = existing["Date"].astype(str)
    else:
        existing = pd.DataFrame()

    added = updated = skipped = 0

    for _, new_row in new_df.iterrows():
        date_str = str(new_row["Date"])

        if existing.empty or date_str not in existing["Date"].values:
            existing = pd.concat([existing, new_row.to_frame().T], ignore_index=True)
            print(f"  + Tambah  {date_str}")
            added += 1
        else:
            old_row = existing[existing["Date"] == date_str].iloc[0]
            common_cols = [c for c in new_row.index if c in old_row.index and c != "Date"]

            # Bandingkan nilai numerik dengan toleransi kecil
            changed = False
            for c in common_cols:
                old_val = old_row[c]
                new_val = new_row[c]
                try:
                    if abs(float(old_val) - float(new_val)) > 0.001:
                        changed = True
                        break
                except (TypeError, ValueError):
                    if str(old_val) != str(new_val):
                        changed = True
                        break

            if changed:
                existing = existing[existing["Date"] != date_str]
                existing = pd.concat([existing, new_row.to_frame().T], ignore_index=True)
                print(f"  ~ Update  {date_str}")
                updated += 1
            else:
                print(f"  = Skip    {date_str} (sama)")
                skipped += 1

    existing = existing.sort_values("Date").reset_index(drop=True)
    existing.to_csv(CSV_PATH, index=False)
    print(f"\nSelesai → +{added} baru, ~{updated} diupdate, ={skipped} skip | total {len(existing)} baris")


if __name__ == "__main__":
    print(f"Mulai fetch {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ...")
    new_df = fetch_range(lookback_days=LOOKBACK_DAYS)
    if new_df is not None:
        upsert_to_csv(new_df)
