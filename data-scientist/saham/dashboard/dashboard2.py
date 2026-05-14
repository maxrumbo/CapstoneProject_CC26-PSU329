import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import requests
from io import StringIO
from datetime import timedelta

# ──────────────────────────────────────────────────────
# PAGE CONFIG
# ──────────────────────────────────────────────────────
st.set_page_config(
    page_title="LQ45 Market Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ──────────────────────────────────────────────────────
# CSS
# ──────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
    background-color: #f5f6fa;
    color: #1a1d2e;
}

#MainMenu, footer, header { visibility: hidden; }
.block-container { padding: 0 2rem 2rem 2rem; max-width: 1400px; }

/* ── NAVBAR ── */
.navbar {
    background: #ffffff;
    border-bottom: 1px solid #e8eaf0;
    padding: 14px 2rem 12px 2rem;
    margin: 0 -2rem 2rem -2rem;
    display: flex;
    align-items: center;
    gap: 12px;
    position: sticky;
    top: 0;
    z-index: 100;
}
.navbar-brand { font-size: 17px; font-weight: 700; color: #1a1d2e; letter-spacing: -0.3px; }
.navbar-brand span { color: #3b82f6; }
.navbar-divider { width: 1px; height: 20px; background: #e0e3ee; }
.navbar-sub { font-size: 12px; color: #8b92a9; font-weight: 400; }

/* ── IHSG UNIFIED FRAME ── */
.ihsg-frame {
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #bfdbfe;
    margin-bottom: 28px;
    box-shadow: 0 4px 24px rgba(59,130,246,0.08);
}
.ihsg-hero {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
    padding: 28px 36px 22px 36px;
    color: white;
    position: relative;
    overflow: hidden;
}
.ihsg-hero::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
}
.ihsg-hero::after {
    content: '';
    position: absolute;
    bottom: -30px; right: 100px;
    width: 140px; height: 140px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
}
.ihsg-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.65;
    margin-bottom: 6px;
}
.ihsg-price {
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -1px;
    line-height: 1;
    margin-bottom: 0;
    font-family: 'DM Mono', monospace;
}
.ihsg-change-pos { color: #86efac; font-size: 15px; font-weight: 600; }
.ihsg-change-neg { color: #fca5a5; font-size: 15px; font-weight: 600; }
.ihsg-meta { font-size: 11px; opacity: 0.5; margin-top: 6px; }

/* stat mini inside hero */
.ihsg-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.15);
    padding-top: 16px;
    position: relative;
    z-index: 1;
}
.ihsg-stat-item { text-align: center; padding: 0 8px; }
.ihsg-stat-item + .ihsg-stat-item { border-left: 1px solid rgba(255,255,255,0.12); }
.ihsg-stat-label { font-size: 10px; opacity: 0.55; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px; }
.ihsg-stat-val { font-size: 15px; font-weight: 700; font-family: 'DM Mono', monospace; }

/* ── IHSG chart + stat body ── */
.ihsg-body {
    background: #ffffff;
    padding: 20px 20px 12px 20px;
}
.ihsg-body-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

/* ── CARDS ── */
.card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e8eaf0;
    padding: 20px 22px;
    margin-bottom: 16px;
}
.card-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #8b92a9;
    margin-bottom: 14px;
}

/* stat table inside white area */
.ihsg-stat-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}
.ihsg-stat-table tr { border-bottom: 1px solid #f0f2f9; }
.ihsg-stat-table tr:last-child { border-bottom: none; }
.ihsg-stat-table tr:hover { background: #f8faff; }
.ihsg-stat-table td { padding: 9px 6px; }
.ihsg-stat-table td:first-child { color: #8b92a9; font-size: 13px; font-weight: 500; }
.ihsg-stat-table td:last-child { text-align: right; font-weight: 700; font-family: 'DM Mono', monospace; color: #1a1d2e; font-size: 14px; }

/* ── TOOLTIP ── */
.stat-tip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    cursor: default;
}
.stat-tip .tip-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: #fef9c3;
    color: #a16207;
    font-size: 10px;
    font-weight: 800;
    flex-shrink: 0;
    line-height: 1;
    border: 1.5px solid #fde047;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.stat-tip:hover .tip-icon {
    background: #fde047;
    border-color: #ca8a04;
    color: #713f12;
}
.stat-tip .tip-box {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    z-index: 9999;
    background: #1e293b;
    color: #f1f5f9;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.65;
    padding: 12px 15px;
    border-radius: 10px;
    width: 260px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.28);
    transition: opacity 0.15s ease, visibility 0.15s ease;
    white-space: normal;
    font-family: 'DM Sans', sans-serif;
    border: 1px solid rgba(255,255,255,0.07);
}
.stat-tip .tip-box::before {
    content: '';
    position: absolute;
    top: -5px; left: 12px;
    width: 10px; height: 10px;
    background: #1e293b;
    transform: rotate(45deg);
    border-radius: 2px;
}
.stat-tip:hover .tip-box {
    visibility: visible;
    opacity: 1;
}

/* ── TICKER ── */
.ticker-code { font-size: 36px; font-weight: 700; color: #1a1d2e; letter-spacing: -1px; font-family: 'DM Mono', monospace; }
.ticker-name { font-size: 16px; color: #5c6380; font-weight: 400; margin-top: 2px; }
.ticker-price { font-size: 30px; font-weight: 700; color: #1a1d2e; font-family: 'DM Mono', monospace; }
.change-pos { color: #16a34a; font-size: 15px; font-weight: 600; }
.change-neg { color: #dc2626; font-size: 15px; font-weight: 600; }

/* ── PILLS ── */
.pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #f0f2f9;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #3d4466;
    margin: 2px 3px 2px 0;
}

/* ── METRICS MINI ── */
.mini-label { font-size: 14px; color: #8b92a9; margin-bottom: 5px; font-weight: 500; }
.mini-val { font-size: 21px; font-weight: 700; color: #1a1d2e; font-family: 'DM Mono', monospace; }

/* ── SIGNALS ── */
.sig-buy { background: #dcfce7; color: #15803d; border-radius: 6px; padding: 4px 12px; font-size: 14px; font-weight: 700; }
.sig-sell { background: #fee2e2; color: #b91c1c; border-radius: 6px; padding: 4px 12px; font-size: 14px; font-weight: 700; }
.sig-neutral { background: #fef9c3; color: #854d0e; border-radius: 6px; padding: 4px 12px; font-size: 14px; font-weight: 700; }

/* ── TABLE ── */
.styled-table { width: 100%; border-collapse: collapse; font-size: 15px; }
.styled-table th {
    text-align: left; padding: 10px 12px;
    background: #f5f6fa; color: #8b92a9;
    font-weight: 600; font-size: 13px;
    letter-spacing: 0.5px; text-transform: uppercase;
    border-bottom: 1px solid #e8eaf0;
}
.styled-table td { padding: 12px 12px; border-bottom: 1px solid #f0f2f9; color: #1a1d2e; font-size: 15px; }
.styled-table tr:last-child td { border-bottom: none; }
.styled-table tr:hover td { background: #f9fafb; }

/* ── MISC ── */
.sec-divider { 
    height: 5px;
    background: linear-gradient(90deg, #e8eaf0, #e8eaf0);
    border-radius: 999px;
    margin: 28px 0;
}
div[data-testid="stHorizontalBlock"] button { border-radius: 8px !important; font-size: 12px !important; font-weight: 500 !important; }
div[data-testid="stSelectbox"] label,
div[data-testid="stRadio"] label { font-size: 13px !important; font-weight: 500 !important; color: #5c6380 !important; }

/* ── LQ45 NAVBAR TOOLTIP ── */
.lq45-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    cursor: default;
}
.lq45-badge .lq45-tip {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    z-index: 9999;
    background: #1e293b;
    color: #f1f5f9;
    font-size: 13px;
    line-height: 1.65;
    padding: 12px 15px;
    border-radius: 10px;
    width: 300px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.28);
    transition: opacity 0.15s ease, visibility 0.15s ease;
    white-space: normal;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    border: 1px solid rgba(255,255,255,0.07);
}
.lq45-badge .lq45-tip .lq45-tip-title {
    font-size: 14px; font-weight: 700; color: #93c5fd;
    margin-bottom: 6px; display: block;
}
.lq45-badge .lq45-tip .lq45-tip-src {
    font-size: 12px; color: #94a3b8; margin-top: 8px; display: block;
    border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;
}
.lq45-badge:hover .lq45-tip {
    visibility: visible;
    opacity: 1;
}

/* ── DISCLAIMER BOX ── */
.disclaimer-box {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    padding: 11px 16px;
    margin-top: 12px;
    font-size: 13px;
    color: #78350f;
    line-height: 1.65;
}
.disclaimer-box strong { font-weight: 700; }
</style>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────
# URLS
# ──────────────────────────────────────────────────────
HISTORICAL_URL = (
    "https://raw.githubusercontent.com/maxrumbo/CapstoneProject_CC26-PSU329/"
    "development/data-scientist/saham/data/lq45_historical.csv"
)
DESKRIPSI_CSV_URL = (
    "https://raw.githubusercontent.com/maxrumbo/CapstoneProject_CC26-PSU329/"
    "development/data-scientist/saham/data/Deskripsi%20Umum%20LQ45.csv"
)

# ──────────────────────────────────────────────────────
# DESKRIPSI — load dari CSV GitHub, fallback ke dict
# ──────────────────────────────────────────────────────
DESKRIPSI_FALLBACK = {
    "AADI": {"nama": "PT Adaro Andalan Indonesia Tbk", "bidang": "Perkebunan kelapa sawit, karet, dan perusahaan holding", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Batu Bara", "kantor": "Jakarta Selatan"},
    "ADMR": {"nama": "PT Alamtri Minerals Indonesia Tbk", "bidang": "Pertambangan", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Batu Bara", "kantor": "Jakarta"},
    "ADRO": {"nama": "Alamtri Resources Indonesia Tbk", "bidang": "Perusahaan holding — pertambangan, angkutan, pelabuhan, dan lainnya", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Batu Bara", "kantor": "Jakarta"},
    "AKRA": {"nama": "PT AKR Corporindo Tbk", "bidang": "Perdagangan dan Distribusi BBM dan Bahan Kimia Dasar", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Minyak & Gas", "kantor": "Jakarta"},
    "AMMN": {"nama": "PT Amman Mineral Internasional Tbk", "bidang": "Aktivitas Perusahaan Holding", "sektor": "Barang Baku", "subsektor": "Logam & Mineral", "industri": "Tembaga", "kantor": "Jakarta Selatan"},
    "AMRT": {"nama": "PT Sumber Alfaria Trijaya Tbk", "bidang": "Retail Trade", "sektor": "Barang Konsumen Primer", "subsektor": "Perdagangan Ritel", "industri": "Supermarket", "kantor": "Tangerang, Banten"},
    "ANTM": {"nama": "Aneka Tambang Tbk", "bidang": "Metal and Mineral Mining", "sektor": "Barang Baku", "subsektor": "Logam & Mineral", "industri": "Logam & Mineral Lainnya", "kantor": "Jakarta Selatan"},
    "ASII": {"nama": "Astra International Tbk", "bidang": "Perdagangan Umum — konglomerat multi-sektor", "sektor": "Perindustrian", "subsektor": "Perusahaan Holding Multi Sektor", "industri": "Konglomerat", "kantor": "Jakarta"},
    "BBCA": {"nama": "PT Bank Central Asia Tbk", "bidang": "Jasa Perbankan", "sektor": "Keuangan", "subsektor": "Bank", "industri": "Bank Swasta", "kantor": "Jakarta Pusat"},
    "BBNI": {"nama": "PT Bank Negara Indonesia (Persero) Tbk", "bidang": "Perbankan & Kegiatan Usaha Penunjang", "sektor": "Keuangan", "subsektor": "Bank", "industri": "Bank BUMN", "kantor": "Jakarta"},
    "BBRI": {"nama": "PT Bank Rakyat Indonesia (Persero) Tbk", "bidang": "Jasa Perbankan", "sektor": "Keuangan", "subsektor": "Bank", "industri": "Bank BUMN", "kantor": "Jakarta Pusat"},
    "BBTN": {"nama": "PT Bank Tabungan Negara (Persero) Tbk", "bidang": "Usaha Perbankan (fokus KPR)", "sektor": "Keuangan", "subsektor": "Bank", "industri": "Bank BUMN", "kantor": "Jakarta Pusat"},
    "BMRI": {"nama": "PT Bank Mandiri (Persero) Tbk", "bidang": "Jasa Keuangan — Perbankan", "sektor": "Keuangan", "subsektor": "Bank", "industri": "Bank BUMN", "kantor": "Jakarta Selatan"},
    "BRPT": {"nama": "Barito Pacific Tbk", "bidang": "Industri, properti, energi terbarukan, kehutanan, pertambangan", "sektor": "Barang Baku", "subsektor": "Barang Kimia", "industri": "Barang Kimia Dasar", "kantor": "Jakarta Barat"},
    "BUMI": {"nama": "Bumi Resources Tbk", "bidang": "Perusahaan induk pertambangan batu bara", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Batu Bara", "kantor": "Jakarta"},
    "CPIN": {"nama": "Charoen Pokphand Indonesia Tbk", "bidang": "Animal Feed", "sektor": "Barang Konsumen Primer", "subsektor": "Makanan & Minuman", "industri": "Produk Unggas", "kantor": "Jakarta Utara"},
    "CUAN": {"nama": "PT Petrindo Jaya Kreasi Tbk", "bidang": "Holding dan pertambangan batu bara", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Batu Bara", "kantor": "Jakarta Barat"},
    "DEWA": {"nama": "Darma Henwa Tbk", "bidang": "Jasa Pertambangan", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Jasa Pertambangan", "kantor": "Jakarta"},
    "EMTK": {"nama": "Elang Mahkota Teknologi Tbk", "bidang": "Jasa dan Perdagangan — media & teknologi", "sektor": "Teknologi", "subsektor": "Perangkat Lunak & Jasa TI", "industri": "Aplikasi & Jasa Internet", "kantor": "Jakarta"},
    "ESSA": {"nama": "ESSA Industries Indonesia Tbk", "bidang": "Industri pemurnian dan pengolahan gas bumi", "sektor": "Barang Baku", "subsektor": "Barang Kimia", "industri": "Barang Kimia Dasar", "kantor": "Jakarta"},
    "EXCL": {"nama": "PT XLSMART Telecom Sejahtera Tbk", "bidang": "Jasa telekomunikasi dan jaringan", "sektor": "Infrastruktur", "subsektor": "Telekomunikasi", "industri": "Jasa Telekomunikasi Nirkabel", "kantor": "Jakarta"},
    "GOTO": {"nama": "PT GoTo Gojek Tokopedia Tbk", "bidang": "Platform digital — on-demand, e-commerce, fintech", "sektor": "Teknologi", "subsektor": "Perangkat Lunak & Jasa TI", "industri": "Aplikasi & Jasa Internet", "kantor": "Jakarta Selatan"},
    "HRTA": {"nama": "PT Hartadinata Abadi Tbk", "bidang": "Perindustrian dan Perdagangan perhiasan", "sektor": "Barang Konsumen Non-Primer", "subsektor": "Pakaian & Barang Mewah", "industri": "Aksesoris & Perhiasan", "kantor": "Bandung, Jawa Barat"},
    "ICBP": {"nama": "Indofood CBP Sukses Makmur Tbk", "bidang": "Industri produk makanan bermerek", "sektor": "Barang Konsumen Primer", "subsektor": "Makanan & Minuman", "industri": "Makanan Olahan", "kantor": "Jakarta"},
    "INCO": {"nama": "Vale Indonesia Tbk", "bidang": "Nickel Ore Mining", "sektor": "Barang Baku", "subsektor": "Logam & Mineral", "industri": "Nikel", "kantor": "Jakarta"},
    "INDF": {"nama": "Indofood Sukses Makmur Tbk", "bidang": "Food and Beverages", "sektor": "Barang Konsumen Primer", "subsektor": "Makanan & Minuman", "industri": "Makanan Olahan", "kantor": "Jakarta"},
    "INKP": {"nama": "Indah Kiat Pulp & Paper Tbk", "bidang": "Pulp and Paper", "sektor": "Barang Baku", "subsektor": "Perhutanan & Kertas", "industri": "Kertas", "kantor": "Jakarta"},
    "ISAT": {"nama": "PT Indosat Tbk", "bidang": "Telekomunikasi", "sektor": "Infrastruktur", "subsektor": "Telekomunikasi", "industri": "Jasa Telekomunikasi Nirkabel", "kantor": "Jakarta"},
    "ITMG": {"nama": "Indo Tambangraya Megah Tbk", "bidang": "Pertambangan Batubara", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Batu Bara", "kantor": "Jakarta"},
    "JPFA": {"nama": "JAPFA Comfeed Indonesia Tbk", "bidang": "Animal Feed", "sektor": "Barang Konsumen Primer", "subsektor": "Makanan & Minuman", "industri": "Produk Unggas", "kantor": "Jakarta"},
    "KLBF": {"nama": "Kalbe Farma Tbk", "bidang": "Farmasi", "sektor": "Kesehatan", "subsektor": "Farmasi & Riset Kesehatan", "industri": "Farmasi", "kantor": "Jakarta Pusat"},
    "MAPI": {"nama": "PT Mitra Adiperkasa Tbk", "bidang": "Perdagangan ritel, kafe, restoran", "sektor": "Barang Konsumen Non-Primer", "subsektor": "Perdagangan Ritel", "industri": "Ritel Pakaian & Tekstil", "kantor": "Jakarta"},
    "MBMA": {"nama": "PT Merdeka Battery Materials Tbk", "bidang": "Pertambangan nikel dan mineral terintegrasi", "sektor": "Barang Baku", "subsektor": "Logam & Mineral", "industri": "Nikel", "kantor": "Jakarta Selatan"},
    "MDKA": {"nama": "PT Merdeka Copper Gold Tbk", "bidang": "Pertambangan emas, perak, tembaga, nikel", "sektor": "Barang Baku", "subsektor": "Logam & Mineral", "industri": "Emas & Tembaga", "kantor": "Jakarta"},
    "MEDC": {"nama": "PT Medco Energi Internasional Tbk", "bidang": "Crude Petroleum and Natural Gas", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Minyak & Gas", "kantor": "Jakarta"},
    "PGAS": {"nama": "PT Perusahaan Gas Negara (Persero) Tbk", "bidang": "Distribusi dan Transmisi Gas Bumi", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Minyak & Gas", "kantor": "Jakarta"},
    "PGEO": {"nama": "PT Pertamina Geothermal Energy Tbk", "bidang": "Usaha bidang panas bumi hulu dan hilir", "sektor": "Infrastruktur", "subsektor": "Utilitas", "industri": "Utilitas Listrik", "kantor": "Jakarta Pusat"},
    "PTBA": {"nama": "PT Bukit Asam (Persero) Tbk", "bidang": "Pertambangan Batubara", "sektor": "Energi", "subsektor": "Minyak, Gas & Batu Bara", "industri": "Batu Bara", "kantor": "Sumatera Selatan"},
    "SCMA": {"nama": "Surya Citra Media Tbk", "bidang": "Media — penyiaran televisi", "sektor": "Barang Konsumen Non-Primer", "subsektor": "Media & Hiburan", "industri": "Penyiaran", "kantor": "Jakarta"},
    "SMGR": {"nama": "Semen Indonesia (Persero) Tbk", "bidang": "Produsen Semen", "sektor": "Barang Baku", "subsektor": "Material Konstruksi", "industri": "Semen", "kantor": "Jakarta"},
    "TLKM": {"nama": "PT Telkom Indonesia (Persero) Tbk", "bidang": "Penyelenggara Jaringan dan Jasa Telekomunikasi", "sektor": "Infrastruktur", "subsektor": "Telekomunikasi", "industri": "Jasa Telekomunikasi Terintegrasi", "kantor": "Jakarta"},
    "TOWR": {"nama": "Sarana Menara Nusantara Tbk", "bidang": "Investasi dan jasa penunjang telekomunikasi", "sektor": "Infrastruktur", "subsektor": "Telekomunikasi", "industri": "Menara Telekomunikasi", "kantor": "Kudus"},
    "UNTR": {"nama": "United Tractors Tbk", "bidang": "Wholesale — mesin konstruksi dan kendaraan berat", "sektor": "Perindustrian", "subsektor": "Barang Perindustrian", "industri": "Mesin Konstruksi", "kantor": "Jakarta"},
    "UNVR": {"nama": "Unilever Indonesia Tbk", "bidang": "Fast Moving Consumer Goods", "sektor": "Barang Konsumen Primer", "subsektor": "Produk Rumah Tangga", "industri": "Produk Perawatan Tubuh", "kantor": "Banten"},
    "WIFI": {"nama": "PT Solusi Sinergi Digital Tbk", "bidang": "Periklanan, produk digital, dan jaringan serat optik", "sektor": "Teknologi", "subsektor": "Perangkat Lunak & Jasa TI", "industri": "Aplikasi & Jasa Internet", "kantor": "Jakarta Selatan"},
}

@st.cache_data(ttl=86400, show_spinner=False)
def load_deskripsi():
    """Load deskripsi perusahaan dari CSV GitHub, fallback ke dict hardcoded."""
    try:
        r = requests.get(DESKRIPSI_CSV_URL, timeout=15)
        r.raise_for_status()
        df_desc = pd.read_csv(StringIO(r.text))
        df_desc.columns = df_desc.columns.str.strip()
        # Deteksi kolom kode saham
        kode_col = next(
            (c for c in df_desc.columns if c.lower() in ("kode", "ticker", "kode saham", "saham")),
            df_desc.columns[0]
        )
        result = {}
        for _, row in df_desc.iterrows():
            kode = str(row[kode_col]).strip()
            def g(keys):
                for k in keys:
                    for col in df_desc.columns:
                        if col.strip().lower() == k.lower():
                            v = row[col]
                            return str(v).strip() if pd.notna(v) else "—"
                return "—"
            result[kode] = {
                "nama":      g(["nama", "nama perusahaan"]),
                "bidang":    g(["bidang", "bidang usaha"]),
                "sektor":    g(["sektor"]),
                "subsektor": g(["subsektor", "sub-sektor", "sub sektor"]),
                "industri":  g(["industri"]),
                "kantor":    g(["kantor", "kantor pusat"]),
            }
        return result if result else DESKRIPSI_FALLBACK
    except Exception:
        return DESKRIPSI_FALLBACK

SEKTOR_COLOR = {
    "Energi": ("#fef3c7", "#92400e"),
    "Barang Baku": ("#ede9fe", "#5b21b6"),
    "Keuangan": ("#dbeafe", "#1e40af"),
    "Teknologi": ("#ccfbf1", "#0f766e"),
    "Infrastruktur": ("#dcfce7", "#15803d"),
    "Barang Konsumen Primer": ("#ffedd5", "#c2410c"),
    "Barang Konsumen Non-Primer": ("#fce7f3", "#9d174d"),
    "Kesehatan": ("#fce7f3", "#be185d"),
    "Perindustrian": ("#f1f5f9", "#475569"),
}

# ──────────────────────────────────────────────────────
# DATA LOADER
# ──────────────────────────────────────────────────────
@st.cache_data(ttl=3600, show_spinner=False)
def load_data():
    try:
        r = requests.get(HISTORICAL_URL, timeout=20)
        r.raise_for_status()
        df = pd.read_csv(StringIO(r.text), parse_dates=["Date"])
    except Exception as e:
        st.error(f"❌ Gagal memuat data dari GitHub: {e}")
        st.stop()
    return df.sort_values("Date").reset_index(drop=True)

def get_ohlcv(df, ticker):
    pfx = f"{ticker}_"
    cols_needed = [pfx + c for c in ["Open", "High", "Low", "Close", "Volume"]]
    if not all(c in df.columns for c in cols_needed):
        return pd.DataFrame()
    t = df[["Date"] + cols_needed].dropna(subset=[pfx + "Close"]).copy()
    t.columns = ["Date", "Open", "High", "Low", "Close", "Volume"]
    return t.reset_index(drop=True)

def filter_period(df, period):
    if df.empty:
        return df
    last = df["Date"].max()
    delta_map = {"7D": 7, "1M": 30, "3M": 90, "1Y": 365, "5Y": 365*5}
    if period not in delta_map:
        return df
    return df[df["Date"] >= last - timedelta(days=delta_map[period])].copy()

# ──────────────────────────────────────────────────────
# INDICATORS
# ──────────────────────────────────────────────────────
def compute_indicators(t):
    c = t["Close"].copy()
    for n in [5, 10, 20, 50, 100, 200]:
        t[f"SMA{n}"]  = c.rolling(n).mean()
        t[f"EMA{n}"]  = c.ewm(span=n, adjust=False).mean()
    ema12 = c.ewm(span=12, adjust=False).mean()
    ema26 = c.ewm(span=26, adjust=False).mean()
    t["MACD"] = ema12 - ema26
    t["MACD_signal"] = t["MACD"].ewm(span=9, adjust=False).mean()
    t["MACD_hist"] = t["MACD"] - t["MACD_signal"]
    delta = c.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / loss.replace(0, np.nan)
    t["RSI"] = 100 - 100 / (1 + rs)
    return t

def pivot_points(t):
    last = t.iloc[-1]
    H, L, C = last["High"], last["Low"], last["Close"]
    P = (H + L + C) / 3
    return {
        "Pivot (P)": P,
        "Resistance 1 (R1)": 2*P - L,
        "Resistance 2 (R2)": P + (H - L),
        "Resistance 3 (R3)": H + 2*(P - L),
        "Support 1 (S1)": 2*P - H,
        "Support 2 (S2)": P - (H - L),
        "Support 3 (S3)": L - 2*(H - P),
    }

def ma_signal(price, ma_val):
    if pd.isna(ma_val): return "N/A", "—"
    return ("BUY", "sig-buy") if price > ma_val else ("SELL", "sig-sell")

def rsi_signal(rsi):
    if pd.isna(rsi): return "N/A", "sig-neutral"
    if rsi < 30: return "BUY", "sig-buy"
    if rsi > 70: return "SELL", "sig-sell"
    return "NEUTRAL", "sig-neutral"

def macd_signal_fn(macd, signal):
    if pd.isna(macd) or pd.isna(signal): return "N/A", "sig-neutral"
    return ("BUY", "sig-buy") if macd > signal else ("SELL", "sig-sell")

# ──────────────────────────────────────────────────────
# CHART BUILDER
# ──────────────────────────────────────────────────────
CHART_BG   = "#ffffff"
GRID_COLOR = "#f0f2f9"
AXIS_COLOR = "#8b92a9"

def make_price_chart(t, chart_type="Line", ticker="", show_ma=True):
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        row_heights=[0.72, 0.28], vertical_spacing=0.04)
    if chart_type == "Candlestick":
        fig.add_trace(go.Candlestick(
            x=t["Date"], open=t["Open"], high=t["High"],
            low=t["Low"], close=t["Close"], name="OHLC",
            increasing=dict(line_color="#16a34a", fillcolor="#16a34a"),
            decreasing=dict(line_color="#dc2626", fillcolor="#dc2626"),
        ), row=1, col=1)
    else:
        fig.add_trace(go.Scatter(
            x=t["Date"], y=t["Close"], name="Harga",
            line=dict(color="#3b82f6", width=2),
            fill="tozeroy", fillcolor="rgba(59,130,246,0.07)",
        ), row=1, col=1)
    if show_ma:
        for col_, nm, clr in [("SMA20","SMA 20","#f59e0b"),("SMA50","SMA 50","#8b5cf6")]:
            if col_ in t.columns:
                fig.add_trace(go.Scatter(x=t["Date"], y=t[col_], name=nm,
                    line=dict(color=clr, width=1.2, dash="dot")), row=1, col=1)
    vol_colors = ["#3b82f6"] + [
        "#16a34a" if t["Close"].iloc[i] >= t["Close"].iloc[i-1] else "#dc2626"
        for i in range(1, len(t))
    ]
    fig.add_trace(go.Bar(x=t["Date"], y=t["Volume"], name="Volume",
                         marker_color=vol_colors, opacity=0.55), row=2, col=1)
    fig.update_layout(
        height=420, paper_bgcolor=CHART_BG, plot_bgcolor=CHART_BG,
        font=dict(family="DM Sans", color="#1a1d2e", size=11),
        margin=dict(l=0, r=0, t=8, b=0),
        legend=dict(orientation="h", y=1.05, x=0, font_size=11, bgcolor="rgba(0,0,0,0)"),
        xaxis_rangeslider_visible=False, hovermode="x unified",
    )
    for ax in ["xaxis","xaxis2","yaxis","yaxis2"]:
        fig.update_layout(**{ax: dict(gridcolor=GRID_COLOR, showgrid=True,
            tickfont=dict(color=AXIS_COLOR, size=10), linecolor="#e8eaf0")})
    return fig

def make_macd_rsi_chart(t):
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        row_heights=[0.5,0.5], vertical_spacing=0.08,
                        subplot_titles=["MACD","RSI (14)"])
    hist_colors = ["#16a34a" if v >= 0 else "#dc2626" for v in t["MACD_hist"].fillna(0)]
    fig.add_trace(go.Bar(x=t["Date"], y=t["MACD_hist"], name="Histogram",
                         marker_color=hist_colors, opacity=0.7), row=1, col=1)
    fig.add_trace(go.Scatter(x=t["Date"], y=t["MACD"], name="MACD",
                             line=dict(color="#3b82f6", width=1.5)), row=1, col=1)
    fig.add_trace(go.Scatter(x=t["Date"], y=t["MACD_signal"], name="Signal",
                             line=dict(color="#f59e0b", width=1.5, dash="dot")), row=1, col=1)
    fig.add_trace(go.Scatter(x=t["Date"], y=t["RSI"], name="RSI",
                             line=dict(color="#8b5cf6", width=1.5)), row=2, col=1)
    for lvl, clr in [(70,"rgba(220,38,38,0.12)"),(30,"rgba(22,163,74,0.12)")]:
        fig.add_hline(y=lvl, line_dash="dot", line_color="rgba(0,0,0,0.15)",
                      annotation_text=str(lvl), annotation_font_size=10, row=2, col=1)
    fig.update_layout(
        height=360, paper_bgcolor=CHART_BG, plot_bgcolor=CHART_BG,
        font=dict(family="DM Sans", color="#1a1d2e", size=11),
        margin=dict(l=0, r=0, t=30, b=0),
        legend=dict(orientation="h", y=1.12, x=0, font_size=11, bgcolor="rgba(0,0,0,0)"),
        xaxis_rangeslider_visible=False, hovermode="x unified",
    )
    for ax in ["xaxis","xaxis2","yaxis","yaxis2"]:
        fig.update_layout(**{ax: dict(gridcolor=GRID_COLOR, showgrid=True,
            tickfont=dict(color=AXIS_COLOR, size=10), linecolor="#e8eaf0")})
    return fig

# ──────────────────────────────────────────────────────
# LOAD DATA
# ──────────────────────────────────────────────────────
with st.spinner("Memuat data…"):
    df_all   = load_data()
    DESKRIPSI = load_deskripsi()

ALL_TICKERS = list(DESKRIPSI.keys())
last_date   = df_all["Date"].max().strftime("%d %b %Y")

# ──────────────────────────────────────────────────────
# NAVBAR
# ──────────────────────────────────────────────────────
st.markdown(f"""
<div class="navbar">
  <div class="navbar-brand">📊
    <span class="lq45-badge">LQ45
      <span class="lq45-tip">
        <span class="lq45-tip-title">Apa itu LQ45?</span>
        LQ45 adalah indeks saham yang terdiri dari 45 saham paling likuid
        dan berkapitalisasi pasar besar di Bursa Efek Indonesia (BEI).
        Indeks ini diperbarui setiap 6 bulan sekali (Februari dan Agustus)
        berdasarkan kriteria likuiditas, kapitalisasi, dan fundamental perusahaan.
        <span class="lq45-tip-src">📌 Sumber: PT Bursa Efek Indonesia (BEI)</span>
      </span>
    </span>
  </div>
  <span style="font-size:17px; font-weight:700; color:#1a1d2e;">&nbsp;Dashboard</span>
  <div class="navbar-divider"></div>
  <div class="navbar-sub">Data terakhir: {last_date} · Sumber: Yahoo Finance (Refresh Per Hari)</div>
</div>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────
# IHSG — UNIFIED FRAME (hero + chart + stat)
# ──────────────────────────────────────────────────────
ihsg = get_ohlcv(df_all, "IHSG")
ihsg = compute_indicators(ihsg)

ihsg_last  = ihsg.iloc[-1]
ihsg_prev  = ihsg.iloc[-2]
ihsg_delta = ihsg_last["Close"] - ihsg_prev["Close"]
ihsg_pct   = ihsg_delta / ihsg_prev["Close"] * 100
arrow      = "▲" if ihsg_delta >= 0 else "▼"
chg_cls    = "ihsg-change-pos" if ihsg_delta >= 0 else "ihsg-change-neg"

ihsg_filtered = filter_period(ihsg, "1Y")  # default awal; akan di-rerun setelah widget
ihsg_filtered = compute_indicators(ihsg_filtered)

# Stat values (akan diupdate setelah widget dirender)
ih_close  = ihsg_filtered["Close"]
ih_high   = ihsg_filtered["High"]
ih_low    = ihsg_filtered["Low"]
ih_vol    = ihsg_filtered["Volume"]

# ── HERO (tanpa return, IHSG lebih besar + deskripsi) ──
st.markdown(f"""
<div class="ihsg-frame">
  <div class="ihsg-hero">
    <div class="ihsg-label">Indeks Harga Saham Gabungan</div>
    <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
      <div class="ihsg-price">IHSG</div>
      <div style="padding-bottom:8px;">
        <div style="font-size:28px; font-weight:700; font-family:'DM Mono',monospace; letter-spacing:-0.5px;">{ihsg_last['Close']:,.2f}</div>
        <div class="{chg_cls}" style="margin-top:2px;">{arrow} {abs(ihsg_delta):,.2f} &nbsp;({ihsg_pct:+.2f}%)</div>
      </div>
    </div>
    <div class="ihsg-desc">
      IHSG (Indeks Harga Saham Gabungan) adalah indeks komposit yang mencerminkan
      pergerakan harga seluruh saham yang tercatat di Bursa Efek Indonesia (BEI).
      Digunakan sebagai tolok ukur utama kinerja pasar modal Indonesia.
    </div>
    <div class="ihsg-meta" style="margin-top:10px;">Per {ihsg_last['Date'].strftime('%d %b %Y')} &nbsp;·&nbsp; Vol: {ihsg_last['Volume']/1e9:.2f}B</div>
    <div class="ihsg-stat-grid">
        <div class="ihsg-stat-item">
            <div class="ihsg-stat-label">High</div>
            <div class="ihsg-stat-val">{ihsg_last['High']:,.2f}</div>
        </div>
        <div class="ihsg-stat-item">
            <div class="ihsg-stat-label">Low</div>
            <div class="ihsg-stat-val">{ihsg_last['Low']:,.2f}</div>
        </div>
        <div class="ihsg-stat-item">
            <div class="ihsg-stat-label">Volume</div>
            <div class="ihsg-stat-val">{ihsg_last['Volume']/1e9:.2f}B</div>
        </div>  
  </div>
</div>
  </div>
  <div class="ihsg-body">
""", unsafe_allow_html=True)

# ── CONTROLS (di dalam frame, di atas chart) ──
ctrl_l, ctrl_r = st.columns([3, 1])
with ctrl_l:
    ihsg_period = st.radio("Periode IHSG", ["7D", "1M", "1Y", "5Y"],
                           index=2, horizontal=True, key="ihsg_period",
                           label_visibility="collapsed")
with ctrl_r:
    ihsg_chart_type = st.selectbox("Tipe chart IHSG", ["Line", "Candlestick"],
                                   key="ihsg_ct", label_visibility="collapsed")

# Re-filter dengan pilihan user
ihsg_filtered = filter_period(ihsg, ihsg_period)
ihsg_filtered = compute_indicators(ihsg_filtered)
ih_close  = ihsg_filtered["Close"]
ih_high   = ihsg_filtered["High"]
ih_low    = ihsg_filtered["Low"]
ih_vol    = ihsg_filtered["Volume"]
col_chart, col_stat = st.columns([3, 1])

with col_chart:
    fig_ihsg = make_price_chart(ihsg_filtered, ihsg_chart_type, "IHSG", show_ma=True)
    st.plotly_chart(fig_ihsg, use_container_width=True)

with col_stat:
    st.markdown("""
<div style="padding: 8px 4px 0 4px;">
  <div style="font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
              color:#8b92a9; margin-bottom:12px;">Statistik Deskriptif</div>
</div>
""", unsafe_allow_html=True)
    # Build stat table
    ih_q25 = ih_close.quantile(0.25)
    ih_q75 = ih_close.quantile(0.75)
    skew   = ih_close.skew()
    kurt   = ih_close.kurt()
    cv     = ih_close.std() / ih_close.mean() * 100

    # (label, nilai, keterangan tooltip)
    stat_rows = [
        ("Rata-rata",     f"{ih_close.mean():,.2f}",
         "Nilai tengah harga Close selama periode yang dipilih. Dihitung dari jumlah semua harga dibagi jumlah hari."),
        ("Median",        f"{ih_close.median():,.2f}",
         "Nilai tengah data jika diurutkan. Lebih tahan terhadap nilai ekstrem dibanding rata-rata."),
        ("Tertinggi",     f"{ih_high.max():,.2f}",
         "Harga tertinggi (High) yang pernah dicapai IHSG selama periode yang dipilih."),
        ("Terendah",      f"{ih_low.min():,.2f}",
         "Harga terendah (Low) yang pernah dicapai IHSG selama periode yang dipilih."),
        ("Std Deviasi",   f"{ih_close.std():,.2f}",
         "Ukuran seberapa jauh harga menyimpang dari rata-ratanya. Makin besar = makin volatil."),
        ("Variansi",      f"{ih_close.var():,.0f}",
         "Kuadrat dari standar deviasi. Menunjukkan sebaran data secara statistik."),
        ("Q1 (25%)",      f"{ih_q25:,.2f}",
         "Kuartil pertama: 25% data harga berada di bawah nilai ini."),
        ("Q3 (75%)",      f"{ih_q75:,.2f}",
         "Kuartil ketiga: 75% data harga berada di bawah nilai ini."),
        ("IQR",           f"{ih_q75-ih_q25:,.2f}",
         "Interquartile Range = Q3 − Q1. Rentang data di 50% tengah, tidak terpengaruh outlier."),
        ("Skewness",      f"{skew:.3f}",
         "Kemiringan distribusi. Positif = condong ke kanan (ekor panjang di atas). Negatif = condong ke kiri."),
        ("Kurtosis",      f"{kurt:.3f}",
         "Ketajaman puncak distribusi. Nilai > 0 berarti lebih runcing dari distribusi normal (lebih banyak ekstrem)."),
        ("CV (%)",        f"{cv:.2f}%",
         "Coefficient of Variation = Std Deviasi / Rata-rata × 100. Ukuran volatilitas relatif terhadap harga rata-rata."),
        ("Vol Rata-rata", f"{ih_vol.mean()/1e9:.3f}B",
         "Rata-rata volume perdagangan IHSG per hari selama periode yang dipilih, dalam miliar."),
        ("N Hari",        f"{len(ih_close)} hari",
         "Jumlah hari perdagangan (trading days) dalam periode yang dipilih."),
    ]

    def tip_cell(label, keterangan):
        return f"""<span class="stat-tip">{label}
  <span class="tip-icon">?</span>
  <span class="tip-box">{keterangan}</span>
</span>"""

    rows_html = "".join(
        f"<tr><td>{tip_cell(lbl, ket)}</td><td>{val}</td></tr>"
        for lbl, val, ket in stat_rows
    )
    st.markdown(f"""
<table class="ihsg-stat-table">
  <tbody>{rows_html}</tbody>
</table>
""", unsafe_allow_html=True)

st.markdown("</div></div>", unsafe_allow_html=True)  # close ihsg-body + ihsg-frame

# ──────────────────────────────────────────────────────
# PILIH SAHAM
# ──────────────────────────────────────────────────────
st.markdown('<div class="sec-divider"></div>', unsafe_allow_html=True)
st.markdown("""
<div style="margin-bottom: 10px;">
  <span class="stat-tip" style="font-size:20px; font-weight:700; color:#1a1d2e; letter-spacing:-0.3px;">
    Pilih Saham LQ45
    <span class="tip-icon" style="width:16px; height:16px; font-size:10px;">?</span>
    <span class="tip-box" style="width:300px;">
      <span style="font-size:13px; font-weight:700; color:#93c5fd; display:block; margin-bottom:6px;">Apa itu LQ45?</span>
      LQ45 adalah indeks yang berisi <strong>45 saham paling likuid</strong> di Bursa Efek Indonesia (BEI),
      dipilih berdasarkan kriteria likuiditas tinggi, kapitalisasi pasar besar, dan kondisi fundamental
      perusahaan yang baik. Komposisi diperbarui setiap <strong>6 bulan sekali</strong> (Februari &amp; Agustus).
      <span style="font-size:11px; color:#94a3b8; margin-top:8px; display:block;
                   border-top:1px solid rgba(255,255,255,0.1); padding-top:6px;">
        📌 Sumber: PT Bursa Efek Indonesia (BEI)
      </span>
    </span>
  </span>
</div>
""", unsafe_allow_html=True)

ticker = st.selectbox(
    "Saham", ALL_TICKERS,
    format_func=lambda x: f"{x} — {DESKRIPSI[x]['nama']}",
    label_visibility="collapsed",
)

# ──────────────────────────────────────────────────────
# STOCK DATA
# ──────────────────────────────────────────────────────
t_full = get_ohlcv(df_all, ticker)
if t_full.empty:
    st.warning(f"Data untuk {ticker} tidak tersedia.")
    st.stop()
t_full = compute_indicators(t_full)

last  = t_full.iloc[-1]
prev  = t_full.iloc[-2]
delta_rp  = last["Close"] - prev["Close"]
delta_pct = delta_rp / prev["Close"] * 100
info  = DESKRIPSI.get(ticker, {})
sektor = info.get("sektor", "")
bg_c, txt_c = SEKTOR_COLOR.get(sektor, ("#f1f5f9", "#475569"))

# ── STOCK HEADER ──
col_h1, col_h2 = st.columns([2, 1])
with col_h1:
    st.markdown(f"""
<div style="margin: 8px 0 4px 0;">
  <div class="ticker-code">{ticker}</div>
  <div class="ticker-name">{info.get('nama','')}</div>
</div>
""", unsafe_allow_html=True)
with col_h2:
    arrow2  = "▲" if delta_rp >= 0 else "▼"
    chg_cls2 = "change-pos" if delta_rp >= 0 else "change-neg"
    st.markdown(f"""
<div style="text-align:right; padding-top:8px;">
  <div class="ticker-price">Rp {last['Close']:,.0f}</div>
  <div class="{chg_cls2}">{arrow2} Rp {abs(delta_rp):,.0f} ({delta_pct:+.2f}%)</div>
  <div style="font-size:11px; color:#8b92a9; margin-top:2px;">Per {last['Date'].strftime('%d %b %Y')}</div>
</div>
""", unsafe_allow_html=True)

st.markdown(f"""
<div style="margin: 8px 0 16px 0;">
  <span class="pill">🏭 {info.get('sektor','')}</span>
  <span class="pill">📂 {info.get('subsektor','')}</span>
  <span class="pill">🔖 {info.get('industri','')}</span>
  <span class="pill">📍 {info.get('kantor','')}</span>
</div>
""", unsafe_allow_html=True)

# ── DESKRIPSI PERUSAHAAN ──
with st.expander("📋 Deskripsi Perusahaan", expanded=True):
    col_d1, col_d2 = st.columns(2)
    with col_d1:
        st.markdown(f"""
<table class="styled-table" style="font-size:13px;">
  <tr><td style="color:#8b92a9; width:140px;">Kode Saham</td><td><b>{ticker}</b></td></tr>
  <tr><td style="color:#8b92a9;">Nama Perusahaan</td><td>{info.get('nama','—')}</td></tr>
  <tr><td style="color:#8b92a9;">Sektor</td><td><span style="background:{bg_c};color:{txt_c};border-radius:12px;padding:2px 10px;font-size:12px;font-weight:500;">{sektor}</span></td></tr>
  <tr><td style="color:#8b92a9;">Sub-Sektor</td><td>{info.get('subsektor','—')}</td></tr>
  <tr><td style="color:#8b92a9;">Industri</td><td>{info.get('industri','—')}</td></tr>
  <tr><td style="color:#8b92a9;">Kantor Pusat</td><td>{info.get('kantor','—')}</td></tr>
</table>
""", unsafe_allow_html=True)
    with col_d2:
        st.markdown("**Bidang Usaha Utama**")
        st.markdown(f"""<div style="background:#f5f6fa; border-left:3px solid #3b82f6; border-radius:6px; padding:12px 14px; font-size:13px; color:#3d4466; line-height:1.6;">{info.get('bidang','—')}</div>""", unsafe_allow_html=True)

st.markdown('<div class="sec-divider"></div>', unsafe_allow_html=True)

# ──────────────────────────────────────────────────────
# CHART SAHAM
# ──────────────────────────────────────────────────────
st.markdown("#### Grafik Harga")
cca, ccb, ccc = st.columns([2, 1, 1])
with cca:
    chart_period = st.radio("Periode Chart", ["7D","1M","3M","1Y","5Y"],
                             index=3, horizontal=True, key="stock_period",
                             label_visibility="collapsed")
with ccb:
    chart_type = st.selectbox("Tipe Chart", ["Line","Candlestick"],
                               key="stock_ct", label_visibility="collapsed")
with ccc:
    show_ma_overlay = st.checkbox("Tampilkan SMA 20 & 50", value=True)

t_chart = filter_period(t_full, chart_period)
t_chart = compute_indicators(t_chart)

# Layout: chart di kiri, statistika deskriptif di kanan (seperti IHSG)
col_schart, col_sstat = st.columns([3, 1])

with col_schart:
    fig_stock = make_price_chart(t_chart, chart_type, ticker, show_ma=show_ma_overlay)
    st.plotly_chart(fig_stock, use_container_width=True)

with col_sstat:
    # Pakai chart_period (filter yang aktif) untuk statistik
    s_close = t_chart["Close"]
    s_high  = t_chart["High"]
    s_low   = t_chart["Low"]
    s_vol   = t_chart["Volume"]
    sq25    = s_close.quantile(0.25)
    sq75    = s_close.quantile(0.75)
    s_skew  = s_close.skew()
    s_kurt  = s_close.kurt()
    s_cv    = s_close.std() / s_close.mean() * 100

    def s_tip_cell(label, keterangan):
        return f"""<span class="stat-tip">{label}
  <span class="tip-icon">?</span>
  <span class="tip-box">{keterangan}</span>
</span>"""

    stock_stat_rows = [
        ("Rata-rata",     f"Rp {s_close.mean():,.0f}",
         "Nilai tengah harga Close selama periode chart yang dipilih."),
        ("Median",        f"Rp {s_close.median():,.0f}",
         "Nilai tengah data jika diurutkan. Lebih tahan terhadap outlier dibanding rata-rata."),
        ("Tertinggi",     f"Rp {s_high.max():,.0f}",
         "Harga tertinggi (High) yang dicapai saham ini selama periode chart."),
        ("Terendah",      f"Rp {s_low.min():,.0f}",
         "Harga terendah (Low) yang dicapai saham ini selama periode chart."),
        ("Std Deviasi",   f"Rp {s_close.std():,.0f}",
         "Ukuran seberapa jauh harga menyimpang dari rata-ratanya. Makin besar = makin volatil."),
        ("Q1 (25%)",      f"Rp {sq25:,.0f}",
         "Kuartil pertama: 25% data harga berada di bawah nilai ini."),
        ("Q3 (75%)",      f"Rp {sq75:,.0f}",
         "Kuartil ketiga: 75% data harga berada di bawah nilai ini."),
        ("IQR",           f"Rp {sq75 - sq25:,.0f}",
         "Interquartile Range = Q3 − Q1. Rentang data di 50% tengah, tidak terpengaruh outlier."),
        ("Skewness",      f"{s_skew:.3f}",
         "Kemiringan distribusi. Positif = condong ke kanan. Negatif = condong ke kiri."),
        ("CV (%)",        f"{s_cv:.2f}%",
         "Coefficient of Variation = Std/Rata-rata × 100. Ukuran volatilitas relatif."),
        ("Vol Rata-rata", f"{s_vol.mean()/1e6:.1f}M",
         "Rata-rata volume perdagangan per hari selama periode chart, dalam juta lembar saham."),
        ("N Hari",        f"{len(s_close)} hari",
         "Jumlah hari perdagangan (trading days) dalam periode chart yang dipilih."),
    ]

    s_rows_html = "".join(
        f"<tr><td>{s_tip_cell(lbl, ket)}</td><td>{val}</td></tr>"
        for lbl, val, ket in stock_stat_rows
    )
    st.markdown(f"""
<div style="padding: 4px 2px 0 2px;">
  <div style="font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
              color:#8b92a9; margin-bottom:10px;">Statistika Deskriptif</div>
  <table class="ihsg-stat-table">
    <tbody>{s_rows_html}</tbody>
  </table>
</div>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────
# RETURN
# ──────────────────────────────────────────────────────
st.markdown('<div class="sec-divider"></div>', unsafe_allow_html=True)
st.markdown("#### Return Harga (Close)")

periods_ret = {"7 Hari": "7D", "1 Bulan": "1M", "3 Bulan": "3M", "1 Tahun": "1Y"}
ret_rows = []
for label, p in periods_ret.items():
    t_r = filter_period(t_full, p)
    if len(t_r) < 2:
        ret_rows.append({"Periode": label, "Harga Awal": "N/A", "Harga Akhir": "N/A",
                         "Return (Rp)": "N/A", "Return (%)": "N/A"})
        continue
    p_start = t_r["Close"].iloc[0]
    p_end   = t_r["Close"].iloc[-1]
    ret_rp  = p_end - p_start
    ret_pct = (ret_rp / p_start) * 100
    color   = "#16a34a" if ret_pct >= 0 else "#dc2626"
    ret_rows.append({
        "Periode":    label,
        "Harga Awal": f"Rp {p_start:,.0f}",
        "Harga Akhir":f"Rp {p_end:,.0f}",
        "Return (Rp)":f"<span style='color:{color};font-weight:600;font-family:DM Mono,monospace;'>{'▲' if ret_rp>=0 else '▼'} Rp {abs(ret_rp):,.0f}</span>",
        "Return (%)": f"<span style='color:{color};font-weight:600;font-family:DM Mono,monospace;'>{ret_pct:+.2f}%</span>",
    })

ret_html = "<table class='styled-table'><thead><tr>"
for h in ["Periode","Harga Awal","Harga Akhir","Return (Rp)","Return (%)"]:
    ret_html += f"<th>{h}</th>"
ret_html += "</tr></thead><tbody>"
for row in ret_rows:
    ret_html += "<tr>" + "".join(f"<td>{v}</td>" for v in row.values()) + "</tr>"
ret_html += "</tbody></table>"
st.markdown(f'<div class="card">{ret_html}</div>', unsafe_allow_html=True)
st.markdown(f"""
<div class="disclaimer-box">
  ⚠️ <strong>Disclaimer:</strong> Data return di atas dihitung berdasarkan <strong>data historis harga penutupan (Close)</strong>
  per hari terakhir yang tersedia (<strong>{last['Date'].strftime('%d %b %Y')}</strong>).
  Return historis <strong>tidak menjamin</strong> kinerja di masa mendatang dan tidak merupakan rekomendasi investasi.
</div>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────
# PIVOT POINTS
# ──────────────────────────────────────────────────────
st.markdown('<div class="sec-divider"></div>', unsafe_allow_html=True)
st.markdown("#### Pivot Points")
st.caption(f"Dihitung dari data terakhir ({last['Date'].strftime('%d %b %Y')}) · H={last['High']:,.0f} · L={last['Low']:,.0f} · C={last['Close']:,.0f}")

pp = pivot_points(t_full)
pv_cols = st.columns(7)
pp_colors = {
    "Pivot (P)": "#3b82f6",
    "Resistance 1 (R1)":"#dc2626","Resistance 2 (R2)":"#dc2626","Resistance 3 (R3)":"#dc2626",
    "Support 1 (S1)":"#16a34a","Support 2 (S2)":"#16a34a","Support 3 (S3)":"#16a34a",
}
pp_tips = {
    "Pivot (P)":          "Pivot Point = (High + Low + Close) / 3. Titik referensi utama arah pergerakan harga hari ini.",
    "Resistance 1 (R1)":  "Resistance 1 = (2 × P) − Low. Level harga di atas pivot yang berpotensi menjadi hambatan kenaikan pertama.",
    "Resistance 2 (R2)":  "Resistance 2 = P + (High − Low). Level hambatan kenaikan kedua, lebih kuat dari R1.",
    "Resistance 3 (R3)":  "Resistance 3 = High + 2 × (P − Low). Level hambatan kenaikan ketiga, jarang dicapai dalam satu sesi.",
    "Support 1 (S1)":     "Support 1 = (2 × P) − High. Level harga di bawah pivot yang berpotensi menjadi penyangga penurunan pertama.",
    "Support 2 (S2)":     "Support 2 = P − (High − Low). Level penyangga kedua, lebih kuat dari S1.",
    "Support 3 (S3)":     "Support 3 = Low − 2 × (High − P). Level penyangga ketiga, jarang diuji dalam satu sesi normal.",
}
for i, (name, val) in enumerate(pp.items()):
    clr = pp_colors.get(name, "#1a1d2e")
    tip = pp_tips.get(name, "")
    pv_cols[i].markdown(f"""
<div class="card" style="text-align:center; padding:14px 8px;">
  <div style="margin-bottom:8px;">
    <span class="stat-tip" style="justify-content:center;">
      <span style="font-size:13px; font-weight:600; color:#8b92a9; text-transform:uppercase; letter-spacing:0.5px;">{name}</span>
      <span class="tip-icon">?</span>
      <span class="tip-box" style="left:50%; transform:translateX(-50%);">{tip}</span>
    </span>
  </div>
  <div class="mini-val" style="font-size:16px; color:{clr};">Rp {val:,.0f}</div>
</div>""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────
# MOVING AVERAGE TABLE
# ──────────────────────────────────────────────────────
st.markdown('<div class="sec-divider"></div>', unsafe_allow_html=True)
st.markdown("#### Moving Average")
st.caption(f"Berdasarkan harga Close terakhir: Rp {last['Close']:,.0f}")

price_now = last["Close"]
ma_rows = []
for period_n, s_col, e_col in [(5,"SMA5","EMA5"),(10,"SMA10","EMA10"),(20,"SMA20","EMA20"),
                                (50,"SMA50","EMA50"),(100,"SMA100","EMA100"),(200,"SMA200","EMA200")]:
    sma_v = t_full[s_col].iloc[-1] if s_col in t_full.columns else np.nan
    ema_v = t_full[e_col].iloc[-1] if e_col in t_full.columns else np.nan
    s_sig, s_cls = ma_signal(price_now, sma_v)
    e_sig, e_cls = ma_signal(price_now, ema_v)
    ma_rows.append({
        "MA": f"MA {period_n}",
        "SMA": f"Rp {sma_v:,.0f}" if not pd.isna(sma_v) else "N/A",
        "SMA_sig": (s_sig, s_cls),
        "EMA": f"Rp {ema_v:,.0f}" if not pd.isna(ema_v) else "N/A",
        "EMA_sig": (e_sig, e_cls),
    })

def sig_badge(sig, cls):
    return f'<span class="{cls}">{sig}</span>'

ma_html = """<table class='styled-table'><thead><tr>
<th>Periode</th>
<th><span class="stat-tip">SMA (Sederhana)<span class="tip-icon">?</span><span class="tip-box">Simple Moving Average: rata-rata harga Close selama N hari terakhir, semua hari diberi bobot sama.</span></span></th>
<th>Sinyal SMA</th>
<th><span class="stat-tip">EMA (Eksponensial)<span class="tip-icon">?</span><span class="tip-box">Exponential Moving Average: rata-rata berbobot yang memberi penekanan lebih besar pada harga terbaru, lebih responsif terhadap perubahan harga.</span></span></th>
<th>Sinyal EMA</th>
</tr></thead><tbody>"""
for r in ma_rows:
    ma_html += f"""<tr>
      <td><b>{r['MA']}</b></td>
      <td style='font-family:DM Mono,monospace;'>{r['SMA']}</td>
      <td>{sig_badge(*r['SMA_sig'])}</td>
      <td style='font-family:DM Mono,monospace;'>{r['EMA']}</td>
      <td>{sig_badge(*r['EMA_sig'])}</td>
    </tr>"""
ma_html += "</tbody></table>"

buy_ma  = sum(1 for r in ma_rows if r["SMA_sig"][0]=="BUY") + sum(1 for r in ma_rows if r["EMA_sig"][0]=="BUY")
sell_ma = sum(1 for r in ma_rows if r["SMA_sig"][0]=="SELL") + sum(1 for r in ma_rows if r["EMA_sig"][0]=="SELL")
overall_ma = "BUY" if buy_ma > sell_ma else ("SELL" if sell_ma > buy_ma else "NEUTRAL")
ov_cls = "sig-buy" if overall_ma=="BUY" else ("sig-sell" if overall_ma=="SELL" else "sig-neutral")

st.markdown(f"""
<div class="card">
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
    <div style="font-size:15px; color:#8b92a9;">Rangkuman Moving Average:</div>
    <span class="{ov_cls}">{overall_ma}</span>
    <span style="font-size:14px; color:#8b92a9;">Beli: {buy_ma} · Jual: {sell_ma}</span>
  </div>
  {ma_html}
</div>""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────
# RSI & MACD
# ──────────────────────────────────────────────────────
st.markdown('<div class="sec-divider"></div>', unsafe_allow_html=True)
st.markdown("#### RSI & MACD")

rsi_last   = t_full["RSI"].iloc[-1]
macd_last  = t_full["MACD"].iloc[-1]
msig_last  = t_full["MACD_signal"].iloc[-1]
mhist_last = t_full["MACD_hist"].iloc[-1]
r_sig, r_cls = rsi_signal(rsi_last)
m_sig, m_cls = macd_signal_fn(macd_last, msig_last)

rm1, rm2 = st.columns(2)
with rm1:
    rsi_bar   = min(max(rsi_last, 0), 100) if not pd.isna(rsi_last) else 50
    rsi_color = "#16a34a" if rsi_last < 30 else ("#dc2626" if rsi_last > 70 else "#3b82f6")
    st.markdown(f"""
<div class="card">
  <div class="card-title">
    <span class="stat-tip">RSI — Relative Strength Index (14)
      <span class="tip-icon">?</span>
      <span class="tip-box">RSI mengukur kecepatan dan perubahan pergerakan harga dalam 14 hari terakhir.
Nilai &lt;30: <strong>Oversold</strong> — saham mungkin terlalu murah (sinyal beli).
Nilai &gt;70: <strong>Overbought</strong> — saham mungkin terlalu mahal (sinyal jual).
Nilai 30–70: kondisi normal / netral.</span>
    </span>
  </div>
  <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
    <div style="font-size:32px; font-weight:700; color:{rsi_color}; font-family:DM Mono,monospace;">{rsi_last:.1f}</div>
    <span class="{r_cls}">{r_sig}</span>
  </div>
  <div style="background:#f0f2f9; border-radius:99px; height:8px; overflow:hidden;">
    <div style="width:{rsi_bar}%; height:100%; background:linear-gradient(90deg,#16a34a,{rsi_color}); border-radius:99px;"></div>
  </div>
  <div style="display:flex; justify-content:space-between; font-size:13px; color:#8b92a9; margin-top:4px;">
    <span>0 — Oversold</span><span>30</span><span>70</span><span>Overbought — 100</span>
  </div>
</div>""", unsafe_allow_html=True)
with rm2:
    hist_color = "#16a34a" if mhist_last >= 0 else "#dc2626"
    arrow_m    = "▲" if mhist_last >= 0 else "▼"
    st.markdown(f"""
<div class="card">
  <div class="card-title">
    <span class="stat-tip">MACD (12, 26, 9)
      <span class="tip-icon">?</span>
      <span class="tip-box">MACD (Moving Average Convergence Divergence) mengukur momentum tren.
MACD Line = EMA 12 − EMA 26.
Signal Line = EMA 9 dari MACD Line.
Histogram = MACD − Signal.
MACD &gt; Signal: tren naik (BUY). MACD &lt; Signal: tren turun (SELL).</span>
    </span>
  </div>
  <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
    <div style="font-size:32px; font-weight:700; color:#3b82f6; font-family:DM Mono,monospace;">{macd_last:.2f}</div>
    <span class="{m_cls}">{m_sig}</span>
  </div>
  <table style="width:100%; font-size:14px; color:#5c6380;">
    <tr><td style="padding:5px 0;">MACD Line</td><td style="text-align:right; font-family:DM Mono,monospace; color:#1a1d2e; font-size:15px; font-weight:600;">{macd_last:.4f}</td></tr>
    <tr><td style="padding:5px 0;">Signal Line</td><td style="text-align:right; font-family:DM Mono,monospace; color:#1a1d2e; font-size:15px; font-weight:600;">{msig_last:.4f}</td></tr>
    <tr><td style="padding:5px 0;">Histogram</td><td style="text-align:right; font-family:DM Mono,monospace; color:{hist_color}; font-size:15px; font-weight:600;">{arrow_m} {abs(mhist_last):.4f}</td></tr>
  </table>
</div>""", unsafe_allow_html=True)

t_ind   = compute_indicators(t_full.copy())
fig_ind = make_macd_rsi_chart(filter_period(t_ind, chart_period))
st.plotly_chart(fig_ind, use_container_width=True)

st.markdown(f"""
<div style="text-align:center; color:#c0c6d8; font-size:13px; margin-top:24px;
            padding-top:16px; border-top:1px solid #e8eaf0;">
  ⚠️ Dashboard ini bersifat informatif dan bukan merupakan rekomendasi investasi.
  &nbsp;|&nbsp; Data: Yahoo Finance (per {last['Date'].strftime('%d %b %Y')})
</div>
""", unsafe_allow_html=True)