import os
from datetime import date, datetime, timedelta
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from dotenv import load_dotenv
import calendar                          
from PIL import Image
from io import BytesIO
from pathlib import Path
import streamlit_antd_components as sac
from supabase import create_client
import jwt

load_dotenv()

CATEGORY_COLORS = {
    "Entertainment": "#D85A30",
    "Langganan":     "#7F77DD",
    "Kesehatan":     "#D4537E",
    "Transportasi":  "#378ADD",
    "Konsumsi":      "#1D9E75",
    "Tagihan":       "#EF9F27",
    "Pemasukan":     "#B4B2A9",
}

METHOD_COLORS = {
    "Tunai":    "#1D9E75",
    "Debit":    "#378ADD",
    "Kredit":   "#D85A30",
    "E-Wallet": "#7F77DD",
}

logo_path_s = "https://raw.githubusercontent.com/GabrielaSugiarto/TrialCapstone/main/dashboard/logo-sawit%20s%20doang.png"
logo_path = "https://raw.githubusercontent.com/GabrielaSugiarto/TrialCapstone/main/dashboard/logo-sawit.png"

st.set_page_config(
    page_title="SAWIT - Transaksi",
    page_icon=logo_path_s,
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif; }
    .header {
        background: linear-gradient(135deg, #0F6E56, #1D9E75);
        padding: 1.2rem 2rem; border-radius: 12px;
        color: white; margin-bottom: 1.2rem;
    }
    .header h1 { margin:0; font-size:1.6rem; font-weight:700; }
    .header p  { margin:0.2rem 0 0; font-size:0.85rem; opacity:0.85; }
    .kpi { background:white; border-radius:12px; padding:1rem 1.2rem; border:1px solid #EFEFEF; }
    .kpi .label { font-size:0.75rem; color:#888; font-weight:500; }
    .kpi .value { font-size:1.35rem; font-weight:700; margin-top:2px; }
    .kpi .sub   { font-size:0.72rem; color:#aaa; margin-top:2px; }
    .status-aman    { background:#e1f5ee; color:#0F6E56; padding:5px 14px; border-radius:20px; font-weight:600; font-size:0.82rem; display:inline-block; }
    .status-waspada { background:#faeeda; color:#854F0B; padding:5px 14px; border-radius:20px; font-weight:600; font-size:0.82rem; display:inline-block; }
    .status-bahaya  { background:#fcebeb; color:#A32D2D; padding:5px 14px; border-radius:20px; font-weight:600; font-size:0.82rem; display:inline-block; }
    hr { border:none; border-top:1px solid #F0F0F0; margin:1rem 0; }
</style>
""", unsafe_allow_html=True)


def fmt(amount: float) -> str:
    if amount >= 1_000_000:
        return f"Rp {amount/1_000_000:.1f}jt"
    elif amount >= 1_000:
        return f"Rp {amount/1_000:.0f}rb"
    return f"Rp {amount:,.0f}"

supabase = create_client(
    st.secrets["SUPABASE_URL"],
    st.secrets["SUPABASE_KEY"]
)

@st.cache_data(ttl=30)
def load_data(user_id: int) -> pd.DataFrame:
    response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
    df = pd.DataFrame(response.data)
    
    if df.empty:          # ← tambah ini
        return df         # ← langsung return kosong

    df["date"]     = pd.to_datetime(df["date"], errors="coerce")
    df["amount"]   = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    df["category"] = df["category"].fillna("Pemasukan")
    df["method"]   = df["method"].fillna("Lainnya")
    df["bulan"]    = df["date"].dt.to_period("M").astype(str)
    df["tanggal"]  = df["date"].dt.date
    return df

@st.cache_data(ttl=30)
def load_budget(user_id: int) -> pd.DataFrame:
    response = supabase.table("user_budgets").select("*").eq("user_id", user_id).execute()
    df = pd.DataFrame(response.data)
    if df.empty:
        return df
    
    df["month"]  = pd.to_datetime(df["month"]).dt.strftime("%Y-%m")
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    return df

def get_user_id() -> int:
    token = st.query_params.get("token")
    user_id_param = st.query_params.get("user_id")
    if token:
        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False}
            )
            return int(payload["sub"])
        except Exception:
            st.error("Sesi expired, silakan login ulang.")
            st.stop()
    elif user_id_param:
        return int(user_id_param)
    
    st.error("Akses ditolak. Silakan login melalui aplikasi.")
    st.stop()

def main():
    user_id = get_user_id()

    try:
        df_all = load_data(user_id)
        df_budget = load_budget(user_id)
    except Exception as e:
        st.error(f"Gagal konek ke database: {e}")
        import traceback
        st.code(traceback.format_exc())
        st.stop()

    if df_all.empty:
        st.warning("Belum ada data catatan transaksi.")
        st.stop()

    min_date = df_all["date"].min().date()
    max_date = df_all["date"].max().date()
    today    = date.today()

      
    # ── Sidebar ───────────────────────────────────────────────────────────────
    with st.sidebar:
        st.image(str(logo_path), width=180)
        st.markdown("##### Dashboard Analitik Transaksi")
        st.markdown("---")

        filter_mode = st.selectbox(
            "Filter Periode",
            options=[ "Bulan Ini", "7 Hari Terakhir", "30 Hari Terakhir",
                     "90 Hari Terakhir", "Bulan Tertentu", "Rentang Tanggal", "Semua Data"],
            index=0,
        )

        if filter_mode == "Semua Data":
            date_start = min_date
            date_end   = max_date
            period     = "Semua Data"
        elif filter_mode == ("Bulan Ini"):
            nama_bulan_id = [
                "Januari","Februari","Maret","April","Mei","Juni",
                "Juli","Agustus","September","Oktober","November","Desember"
            ]
            current_period = pd.Period(today.strftime("%Y-%m"), freq="M")
            date_start     = current_period.start_time.date()
            date_end       = current_period.end_time.date()
            period         = f"{nama_bulan_id[today.month - 1]} {today.year}"
    
        elif filter_mode == "7 Hari Terakhir":
            date_start = today - timedelta(days=7)
            date_end   = today
            period     = "7 Hari Terakhir"

        elif filter_mode == "30 Hari Terakhir":
            date_start = today - timedelta(days=30)
            date_end   = today
            period     = "30 Hari Terakhir"

        elif filter_mode == "90 Hari Terakhir":
            date_start = today - timedelta(days=90)
            date_end   = today
            period     = "90 Hari Terakhir"

        elif filter_mode == "Bulan Tertentu":
            available_years = sorted(df_all["date"].dt.year.unique(), reverse=True)
            nama_bulan = {
                1:"Januari", 2:"Februari", 3:"Maret",    4:"April",
                5:"Mei",     6:"Juni",     7:"Juli",      8:"Agustus",
                9:"September",10:"Oktober",11:"November",12:"Desember"
            }
            col_thn, col_bln = st.columns(2)
            with col_thn:
                selected_year = st.selectbox("Tahun", available_years)
            with col_bln:
                months_in_year      = sorted(df_all[df_all["date"].dt.year == selected_year]["date"].dt.month.unique())
                month_options       = {nama_bulan[m]: m for m in months_in_year}
                selected_month_name = st.selectbox("Bulan", list(month_options.keys()))
                selected_month_num  = month_options[selected_month_name]
            period_obj = pd.Period(f"{selected_year}-{selected_month_num:02d}", freq="M")
            date_start = period_obj.start_time.date()
            date_end   = period_obj.end_time.date()
            period     = f"{selected_month_name} {selected_year}"
            is_monthly_filter = True

        else:  # Rentang Tanggal
            col_d1, col_d2 = st.columns(2)
            with col_d1:
                date_start = st.date_input("Dari", value=min_date, min_value=min_date, max_value=max_date)
            with col_d2:
                date_end = st.date_input("Sampai", value=max_date, min_value=min_date, max_value=max_date)
            period = f"{date_start.strftime('%d %b %Y')} s/d {date_end.strftime('%d %b %Y')}"

        st.markdown("---")
        exp_cats      = sorted(df_all[df_all["type"] == "expense"]["category"].unique())
        st.markdown("Kategori Pengeluaran")
        semua = st.checkbox("Semua Kategori", value=True, key="all_cats")
        if semua:
            selected_cats = exp_cats
        else:
            selected_cats = st.multiselect(
                "Pilih Kategori",
                options=exp_cats,
                default=exp_cats
            )
            if not selected_cats:  # fallback kalau kosong
                selected_cats = exp_cats
                
        st.markdown("---")
        st.caption(f"User ID: **{user_id}**")
        st.caption(f"Total data: **{len(df_all)} transaksi**")
        st.caption(f"Periode data: {df_all['date'].min().strftime('%d %b %Y')} s/d {df_all['date'].max().strftime('%d %b %Y')}")

    # ── Filter data ───────────────────────────────────────────────────────────
    df = df_all[
        (df_all["date"].dt.date >= date_start) &
        (df_all["date"].dt.date <= date_end)
    ].copy()

    df_inc = df[df["type"] == "income"]
    df_exp = df[(df["type"] == "expense") & (df["category"].isin(selected_cats))]
    df     = pd.concat([df_inc, df_exp])

    # ── Periode sebelumnya (untuk deteksi terboros) ───────────────────────────
    if filter_mode == "Bulan Tertentu":
        prev_period = pd.Period(f"{selected_year}-{selected_month_num:02d}", freq="M") - 1
        prev_start  = prev_period.start_time.date()
        prev_end    = prev_period.end_time.date()
    else:
        delta_days = (date_end - date_start).days + 1
        prev_end   = date_start - timedelta(days=1)
        prev_start = prev_end - timedelta(days=delta_days - 1)
    prev_label = f"{prev_start.strftime('%d %b')} - {prev_end.strftime('%d %b %Y')}"
        
    df_prev_exp = df_all[
        (df_all["date"].dt.date >= prev_start) &
        (df_all["date"].dt.date <= prev_end) &
        (df_all["type"] == "expense") &
        (df_all["category"].isin(selected_cats))
    ]

    # ── Kalkulasi KPI (dipindah ke atas supaya bisa dipakai badge) ────────────
    income_total  = df_inc["amount"].sum()
    expense_total = df_exp["amount"].sum()
    saldo         = income_total - expense_total
    savings_pct   = (saldo / income_total * 100) if income_total > 0 else 0

    # ── Budget Warning Badge ──────────────────────────────────────────────────
    show_budget_warning = (
        filter_mode == "Bulan Ini" or
        (filter_mode == "Bulan Tertentu" and
         date_start.year == today.year and
         date_start.month == today.month)
    )

    budget_badge_html = ""
    if show_budget_warning and not df_budget.empty:
        current_month_str = today.strftime("%Y-%m")
        budget_bulan      = df_budget[df_budget["month"] == current_month_str]
        total_budget_now  = budget_bulan["amount"].sum()

        if total_budget_now > 0:
            day_of_month   = today.day
            days_in_month  = calendar.monthrange(today.year, today.month)[1]
            spending_ratio = expense_total / total_budget_now
            daily_avg      = expense_total / max(day_of_month, 1)
            projected      = daily_avg * days_in_month
            remaining_days = days_in_month - day_of_month
            pct_label      = f"{spending_ratio*100:.0f}% terpakai"

            is_budget_used_too_fast = spending_ratio >= 0.8 and (day_of_month / days_in_month) < 0.8

            if expense_total > total_budget_now or projected > total_budget_now * 1.2:
                c_border = "#A32D2D"
                c_bg     = "#FFF5F5"
                c_label  = "BAHAYA"
                c_text   = "Budget Terlampaui"
                c_sub    = f"+{fmt(expense_total - total_budget_now)}"
                c_clr    = "#A32D2D"
            elif projected > total_budget_now or is_budget_used_too_fast:
                c_border = "#D4860A"
                c_bg     = "#FFFBF0"
                c_label  = "WASPADA"
                c_text   = "Budget Menipis"
                c_sub    = f"Sisa Budget: {fmt(total_budget_now - expense_total)}"
                c_clr    = "#854F0B"
            else:
                c_border = "#1D9E75"
                c_bg     = "#F0FBF7"
                c_label  = "AMAN"
                c_text   = "Keuangan Sehat"
                c_sub    = f"Sisa Budget: {fmt(total_budget_now - expense_total)}"
                c_clr    = "#0F6E56"

            budget_badge_html = (
                f'<div style="background:{c_bg};border:2px solid {c_border};border-radius:14px;'
                f'padding:6px 14px;text-align:center;min-width:0;">'
                f'<div style="font-size:0.68rem;font-weight:600;color:{c_clr};letter-spacing:1px;'
                f'text-transform:uppercase;opacity:0.75;">Status Keuangan Bulan Ini </div>'
                f'<div style="font-size:1.3rem;font-weight:800;color:{c_clr};'
                f'letter-spacing:2px;margin:0 0 2px 0;">{c_label}</div>'
                f'<div style="font-size:0.78rem;font-weight:600;color:{c_clr};">{c_text}</div>'
                f'<div style="font-size:0.72rem;color:{c_clr};opacity:0.70;margin-top:1.5px;">{c_sub}</div>'
                f'<div style="font-size:0.68rem;color:{c_clr};opacity:0.55;margin-top:1.5px;">{pct_label}</div>'
                f'</div>'
            )

    # ── Header ────────────────────────────────────────────────────────────────
    if budget_badge_html:
        col_header, col_status = st.columns([2, 1])
        with col_header:
            st.markdown(
                f'<div class="header">'
                f'<h1>Dashboard Analitik Transaksi</h1>'
                f'<p>Periode: {period} &nbsp;·&nbsp; {datetime.now().strftime("%d %b %Y, %H:%M")}</p>'
                f'</div>',
                unsafe_allow_html=True
            )
        with col_status:
            st.markdown(
                f'<div style="padding-top:2px;">{budget_badge_html}</div>',
                unsafe_allow_html=True
            )
    else:
        st.markdown(
            f'<div class="header">'
            f'<h1>Dashboard Analitik Transaksi</h1>'
            f'<p>Periode: {period} &nbsp;·&nbsp; {datetime.now().strftime("%d %b %Y, %H:%M")}</p>'
            f'</div>',
            unsafe_allow_html=True
        )

    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(f"""<div class="kpi"><div class="label">Pemasukan</div>
            <div class="value" style="color:#1D9E75">{fmt(income_total)}</div>
            <div class="sub">{len(df_inc)} transaksi</div></div>""", unsafe_allow_html=True)
    with k2:
        st.markdown(f"""<div class="kpi"><div class="label">Pengeluaran</div>
            <div class="value" style="color:#D85A30">{fmt(expense_total)}</div>
            <div class="sub">{len(df_exp)} transaksi</div></div>""", unsafe_allow_html=True)
    with k3:
        saldo_color = "#1D9E75" if saldo >= 0 else "#D85A30"
        st.markdown(f"""<div class="kpi"><div class="label">Saldo Bersih</div>
            <div class="value" style="color:{saldo_color}">{fmt(saldo)}</div>
            <div class="sub">Dana Tersisa: {savings_pct:.0f}%</div></div>""", unsafe_allow_html=True)
    with k4:    
        st.markdown(f"""<div class="kpi"><div class="label">Total Transaksi</div>
            <div class="value" style="color:#7F77DD">{len(df)}</div>
            <div class="sub">Pemasukan & Pengeluaran</div></div>""", unsafe_allow_html=True)

    # =========================================================================
    # CHART 1: Cashflow Bulanan
    # =========================================================================
    st.subheader("Cashflow Bulanan")
    monthly = df.groupby(["bulan", "type"])["amount"].sum().reset_index()
    if not monthly.empty:
        pivot = monthly.pivot(index="bulan", columns="type", values="amount").fillna(0).reset_index()
        pivot.columns.name = None
        pivot["selisih"] = pivot.get("income", 0) - pivot.get("expense", 0)
        use_bar = len(pivot) <= 1
        fig1 = go.Figure()
        if "income" in pivot.columns:
            fig1.add_trace(go.Bar(x=pivot["bulan"], y=pivot["income"], name="Pemasukan",
                                  marker=dict(color="#1D9E75"),
                                  hovertemplate="<b>%{x}</b><br>Pemasukan: Rp %{y:,.0f}<extra></extra>")
                           if use_bar else
                           go.Scatter(x=pivot["bulan"], y=pivot["income"], name="Pemasukan",
                                      mode="lines+markers", line=dict(color="#1D9E75", width=3),
                                      fill="tozeroy", fillcolor="rgba(29,158,117,0.04)",
                                      marker=dict(size=8),
                                      hovertemplate="<b>%{x}</b><br>Pemasukan: Rp %{y:,.0f}<extra></extra>"))
        if "expense" in pivot.columns:
            fig1.add_trace(go.Bar(x=pivot["bulan"], y=pivot["expense"], name="Pengeluaran",
                                  marker=dict(color="#D85A30"),
                                  hovertemplate="<b>%{x}</b><br>Pengeluaran: Rp %{y:,.0f}<extra></extra>")
                           if use_bar else
                           go.Scatter(x=pivot["bulan"], y=pivot["expense"], name="Pengeluaran",
                                      mode="lines+markers", line=dict(color="#D85A30", width=3, dash="dot"),
                                      fill="tozeroy", fillcolor="rgba(216,90,48,0.02)",
                                      marker=dict(size=8),
                                      hovertemplate="<b>%{x}</b><br>Pengeluaran: Rp %{y:,.0f}<extra></extra>"))
        for _, row in pivot.iterrows():
            surplus = row["selisih"] >= 0
            label   = f"+{fmt(row['selisih'])}" if surplus else f"-{fmt(abs(row['selisih']))}"
            fig1.add_annotation(
                x=row["bulan"], y=max(row.get("income", 0), row.get("expense", 0)),
                text=f"<b>{label}</b>", showarrow=False, yshift=18,
                font=dict(size=10, color="#1D9E75" if surplus else "#D85A30", family="Plus Jakarta Sans"),
            )
        fig1.update_layout(
            barmode="group", height=360, margin=dict(l=0, r=0, t=30, b=0),
            legend=dict(orientation="h", y=1.08, x=1, xanchor="right"),
            yaxis=dict(tickprefix="Rp ", tickformat=",.0f", gridcolor="#F5F5F5"),
            xaxis=dict(gridcolor="#F5F5F5", type="category"),
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Plus Jakarta Sans"), hovermode="x unified",
        )
        st.plotly_chart(fig1, use_container_width=True)

    st.markdown("<hr>", unsafe_allow_html=True)

    # =========================================================================
    # CHART 2: Tren Harian (stacked bar per kategori)
    # =========================================================================
    st.subheader("Tren Harian")
    fig2 = go.Figure()
    df_total = df_exp.groupby("tanggal")["amount"].sum().reset_index()
    if not df_total.empty:
        fig2.add_trace(go.Bar(
            x=df_total["tanggal"], y=[0] * len(df_total),
            name="Total", marker=dict(color="rgba(0,0,0,0)"),
            hovertemplate="──────────<br><b>Total: Rp %{customdata:,.0f}</b><extra></extra>",
            customdata=df_total["amount"], showlegend=False,
        ))
    for cat in selected_cats:
        df_cat = df_exp[df_exp["category"] == cat].groupby("tanggal")["amount"].sum().reset_index()
        if df_cat.empty:
            continue
        fig2.add_trace(go.Bar(
            x=df_cat["tanggal"], y=df_cat["amount"], name=cat,
            marker=dict(color=CATEGORY_COLORS.get(cat, "#888780")),
            hovertemplate=f"<b>{cat}</b><br>%{{x}}<br>Rp %{{y:,.0f}}<extra></extra>",
        ))
    fig2.update_layout(
        barmode="stack", height=360, margin=dict(l=0, r=0, t=10, b=0),
        legend=dict(orientation="h", y=-0.25, x=0),
        yaxis=dict(tickprefix="Rp ", tickformat=",.0f", gridcolor="#F5F5F5"),
        xaxis=dict(gridcolor="#F5F5F5"),
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Plus Jakarta Sans"), hovermode="x unified",
    )
    st.plotly_chart(fig2, use_container_width=True)

    st.markdown("<hr>", unsafe_allow_html=True)

    # =========================================================================
    # CHART 3: Donut + Metode Pembayaran
    # =========================================================================
    col_a, col_b = st.columns([4, 6])
    with col_a:
        st.subheader("Komposisi Pengeluaran")
        if not df_exp.empty:
            st.markdown("<div style='height:40px'></div>", unsafe_allow_html=True)
            cat_sum = (
                df_exp.groupby("category")["amount"]
                .sum().reset_index()
                .sort_values("amount", ascending=False)
            )
            fig3 = go.Figure(go.Pie(
                labels=cat_sum["category"],
                values=cat_sum["amount"],
                hole=0.55,
                marker=dict(colors=[CATEGORY_COLORS.get(c, "#888780") for c in cat_sum["category"]]),
                textinfo="percent+label",
                textfont_size=11,
                hovertemplate="<b>%{label}</b><br>Rp %{value:,.0f} (%{percent})<extra></extra>",
            ))
            fig3.add_annotation(
                text=f"<b>{fmt(expense_total)}</b>",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=13, family="Plus Jakarta Sans")
            )
            fig3.update_layout(
                height=320, margin=dict(l=0, r=0, t=10, b=0),
                showlegend=False,
                plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)"
            )
            st.plotly_chart(fig3, use_container_width=True)

    with col_b:
        st.subheader("Metode Pembayaran")
        col_m1, col_m2 = st.columns(2)
        with col_m1:
            method_count = df.groupby("method").size().reset_index(name="jumlah").sort_values("jumlah", ascending=False)
            fig5 = go.Figure(go.Bar(
                x=method_count["method"], y=method_count["jumlah"],
                marker=dict(color=[METHOD_COLORS.get(m, "#888780") for m in method_count["method"]]),
                text=method_count["jumlah"], textposition="outside",
                hovertemplate="<b>%{x}</b><br>%{y} transaksi<extra></extra>",
            ))
            fig5.update_layout(
                height=360, margin=dict(l=0, r=0, t=30, b=0),
                title=dict(text="Jumlah Transaksi", font=dict(size=13)),
                yaxis=dict(gridcolor="#F5F5F5"),
                plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                font=dict(family="Plus Jakarta Sans")
            )
            st.plotly_chart(fig5, use_container_width=True)
        with col_m2:
            method_sum = df.groupby("method")["amount"].sum().reset_index().sort_values("amount", ascending=False)
            fig6 = go.Figure(go.Bar(
                x=method_sum["method"], y=method_sum["amount"],
                marker=dict(color=[METHOD_COLORS.get(m, "#888780") for m in method_sum["method"]]),
                text=[f"Rp {v/1_000_000:.1f}jt" for v in method_sum["amount"]], textposition="outside",
                hovertemplate="<b>%{x}</b><br>Rp %{y:,.0f}<extra></extra>",
            ))
            fig6.update_layout(
                height=360, margin=dict(l=0, r=0, t=30, b=0),
                title=dict(text="Total Nominal", font=dict(size=13)),
                yaxis=dict(
                    tickprefix="Rp ",
                    ticksuffix="jt",
                    tickformat=".0f",
                    tickvals=[i * 5_000_000 for i in range(0, 6)],
                    ticktext=[f"{i*5}jt" for i in range(0, 6)],
                    gridcolor="#F5F5F5"
                    ),
                plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                font=dict(family="Plus Jakarta Sans")
            )
            st.plotly_chart(fig6, use_container_width=True)

    st.markdown("<hr>", unsafe_allow_html=True)

    # =========================================================================
    # BUDGET TRACKER (full width)
    # =========================================================================
    st.subheader("Budget Tracker")

    if df_budget.empty:
        st.info("Belum ada data budget.")
    else:
        months_in_range = pd.period_range(
            start=date_start.strftime("%Y-%m"),
            end=date_end.strftime("%Y-%m"),
            freq="M"
        ).strftime("%Y-%m").tolist()

        months_with_budget = [m for m in months_in_range if m in df_budget["month"].values]

        if not months_with_budget:
            st.info("Tidak ada data budget untuk periode ini.")
        else:
            current_month_str = today.strftime("%Y-%m")

            for bulan_str in reversed(months_with_budget):
                bm       = pd.Period(bulan_str, freq="M")
                bm_start = bm.start_time.date()
                bm_end   = bm.end_time.date()

                df_exp_bulan = df_all[
                    (df_all["date"].dt.date >= bm_start) &
                    (df_all["date"].dt.date <= bm_end) &
                    (df_all["type"] == "expense") &
                    (df_all["category"].isin(selected_cats))
                ]

                budget_bulan = df_budget[df_budget["month"] == bulan_str]
                budget_map   = budget_bulan.groupby("category")["amount"].sum().to_dict()
                total_budget = sum(budget_map.values())
                total_actual = df_exp_bulan["amount"].sum()

                if total_budget == 0:
                    continue

                pct_total   = total_actual / total_budget * 100
                status_icon = "🚨" if pct_total >= 100 else ("⚠️" if pct_total >= 80 else "✅")
                label_bulan = datetime.strptime(bulan_str, "%Y-%m").strftime("%b %Y")
                is_current  = bulan_str == current_month_str

                expander_label = (
                    f"{status_icon} {'▶ Bulan Ini · ' if is_current else ''}"
                    f"**{label_bulan}** — "
                    f"terpakai {fmt(total_actual)} dari {fmt(total_budget)} "
                    f"({pct_total:.0f}%)"
                )

                if filter_mode in ("Bulan Tertentu","Bulan Ini"):
                    st.markdown(f"##### {expander_label}")
                    container = st.container()
                else:
                    container = st.expander(expander_label, expanded=is_current)

                with container:
                    bar_color_total = "#A32D2D" if pct_total >= 100 else ("#EF9F27" if pct_total >= 80 else "#1D9E75")
                    sisa_total = max(total_budget - total_actual, 0)
                    over_total = max(total_actual - total_budget, 0)
                    
                    st.markdown(
                        f'<div style="margin-bottom:20px;background:white;border:1px solid #EFEFEF;border-radius:10px;padding:12px 16px">'
                        f'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
                        f'<span style="font-weight:600;font-size:0.88rem;color:#1a1a1a">Budget Keseluruhan</span>'
                        f'<span style="font-size:0.75rem;font-weight:600;padding:2px 8px;border-radius:20px;'
                        f'background:{"#FCEBEB" if pct_total>=100 else ("#FAEEDA" if pct_total>=80 else "#E1F5EE")};'
                        f'color:{"#A32D2D" if pct_total>=100 else ("#854F0B" if pct_total>=80 else "#0F6E56")}">'
                        f'{"OVER +" + fmt(over_total) if pct_total>=100 else f"{pct_total:.0f}% terpakai"}</span>'
                        f'</div>'
                        f'<div style="display:flex;justify-content:space-between;font-size:0.74rem;color:#888;margin-bottom:8px">'
                        f'<span>{fmt(total_actual)} dari {fmt(total_budget)}</span>'
                        f'<span>Sisa: {fmt(sisa_total)}</span>'
                        f'</div>'
                        f'<div style="background:#F0F0F0;border-radius:6px;height:7px">'
                        f'<div style="background:{bar_color_total};width:{min(pct_total,100):.0f}%;height:7px;border-radius:6px"></div>'
                        f'</div></div>',
                        unsafe_allow_html=True
                    )

                    cat_actual = df_exp_bulan.groupby("category")["amount"].sum()

                    # Tampilkan dalam 2 kolom supaya full width tidak terlalu kosong
                    cat_items  = sorted(budget_map.items(), key=lambda x: -x[1])
                    mid        = (len(cat_items) + 1) // 2
                    col_c1, col_c2 = st.columns(2)

                    for i, (cat, budget) in enumerate(cat_items):
                        actual = cat_actual.get(cat, 0)
                        pct    = actual / budget * 100 if budget > 0 else 0

                        if pct >= 100:
                            bar_color  = "#A32D2D"
                            badge      = f"OVER +{fmt(actual - budget)}"
                            s_bg, s_fg = "#FCEBEB", "#A32D2D"
                        elif pct >= 80:
                            bar_color  = "#EF9F27"
                            badge      = f"{pct:.0f}% terpakai"
                            s_bg, s_fg = "#FAEEDA", "#854F0B"
                        else:
                            bar_color  = "#1D9E75"
                            badge      = f"{pct:.0f}% terpakai"
                            s_bg, s_fg = "#E1F5EE", "#0F6E56"

                        item_html = (
                            f'<div style="margin-bottom:14px">'
                            f'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">'
                            f'<span style="font-weight:600;font-size:0.88rem;color:#1a1a1a">{cat}</span>'
                            f'<span style="font-size:0.75rem;font-weight:600;padding:2px 8px;border-radius:20px;background:{s_bg};color:{s_fg}">{badge}</span>'
                            f'</div>'
                            f'<div style="display:flex;justify-content:space-between;font-size:0.74rem;color:#888;margin-bottom:5px">'
                            f'<span>{fmt(actual)} dari {fmt(budget)}</span>'
                            f'<span>Sisa: {fmt(max(budget - actual, 0))}</span>'
                            f'</div>'
                            f'<div style="background:#F0F0F0;border-radius:6px;height:7px">'
                            f'<div style="background:{bar_color};width:{min(pct,100):.0f}%;height:7px;border-radius:6px"></div>'
                            f'</div></div>'
                        )

                        with col_c1 if i < mid else col_c2:
                            st.markdown(item_html, unsafe_allow_html=True)

                    # Kategori tanpa budget
                    no_budget_cats = [c for c in cat_actual.index if c not in budget_map]
                    if no_budget_cats:
                        st.markdown("<div style='font-size:0.75rem;color:#aaa;margin-top:4px'>Tanpa budget:</div>", unsafe_allow_html=True)
                        for cat in no_budget_cats:
                            st.markdown(
                                f'<div style="margin-bottom:6px;display:flex;justify-content:space-between">'
                                f'<span style="font-size:0.88rem;color:#1a1a1a;font-weight:600">{cat}</span>'
                                f'<span style="font-size:0.74rem;color:#aaa">{fmt(cat_actual[cat])} — no budget</span>'
                                f'</div>',
                                unsafe_allow_html=True
                            )

    st.markdown("<hr>", unsafe_allow_html=True)
    
    # =========================================================================
    # SECTION: Deteksi Kategori Terboros
    # =========================================================================
    st.subheader("Deteksi Kategori Terboros")
    st.caption(f"Dibandingkan dengan: {prev_label}")

    if not df_exp.empty:
        cur_cat    = df_exp.groupby("category")["amount"].sum()
        prev_cat   = df_prev_exp.groupby("category")["amount"].sum() if not df_prev_exp.empty else pd.Series(dtype=float)
        prev_label = f"{prev_start.strftime('%d %b')} - {prev_end.strftime('%d %b %Y')}"

        rows_boros = []
        for cat, cur_val in cur_cat.items():
            prev_val  = prev_cat.get(cat, 0)
            delta_pct = ((cur_val - prev_val) / prev_val * 100) if prev_val > 0 else (100.0 if cur_val > 0 else 0.0)
            rows_boros.append({"category": cat, "cur": cur_val, "prev": prev_val, "delta": delta_pct})

        df_boros  = pd.DataFrame(rows_boros).sort_values("delta", ascending=False)
        n_cols    = min(len(df_boros), 3)
        b_cols    = st.columns(n_cols)

        for i, (_, row) in enumerate(df_boros.head(n_cols).iterrows()):
            with b_cols[i]:
                delta        = row["delta"]
                bar_color    = CATEGORY_COLORS.get(row["category"], "#888780")
                pct_of_total = row["cur"] / max(expense_total, 1) * 100

                if row["prev"] == 0:
                    badge_bg, badge_color, badge_text = "#f0e6ff", "#6B21A8", "BARU"
                elif delta >= 30:
                    badge_bg, badge_color, badge_text = "#fcebeb", "#A32D2D", f"+{delta:.0f}%"
                elif delta > 0:
                    badge_bg, badge_color, badge_text = "#faeeda", "#854F0B", f"+{delta:.0f}%"
                elif delta < 0:
                    badge_bg, badge_color, badge_text = "#e1f5ee", "#0F6E56", f"{delta:.0f}%"
                else:
                    badge_bg, badge_color, badge_text = "#f5f5f5", "#666", "0%"

                st.markdown(
                    f'<div style="background:white;border:1px solid #EFEFEF;border-radius:12px;padding:1rem">'
                    f'<div style="display:flex;justify-content:space-between;margin-bottom:6px">'
                    f'<div style="font-weight:700;font-size:0.9rem">{row["category"]}</div>'
                    f'<span style="background:{badge_bg};color:{badge_color};padding:2px 10px;border-radius:12px;font-size:0.75rem;font-weight:700">{badge_text}</span></div>'
                    f'<div style="font-size:1.2rem;font-weight:700;color:{bar_color}">{fmt(row["cur"])}</div>'
                    f'<div style="font-size:0.72rem;color:#aaa;margin:3px 0 8px">Periode lalu: {fmt(row["prev"]) if row["prev"] > 0 else "Tidak ada data"}</div>'
                    f'<div style="background:#F0F0F0;border-radius:6px;height:5px">'
                    f'<div style="background:{bar_color};width:{min(pct_of_total,100):.0f}%;height:5px;border-radius:6px"></div></div>'
                    f'<div style="font-size:0.7rem;color:#aaa;margin-top:3px">{pct_of_total:.0f}% dari total pengeluaran</div></div>',
                    unsafe_allow_html=True
                )

        with st.expander("Lihat semua kategori"):
            tb = df_boros.copy()
            tb["Periode Ini"]  = tb["cur"].apply(fmt)
            tb["Periode Lalu"] = tb["prev"].apply(lambda x: fmt(x) if x > 0 else "-")
            tb["Perubahan"]    = tb["delta"].apply(lambda x: f"+{x:.0f}%" if x > 0 else (f"{x:.0f}%" if x < 0 else "0%"))
            tb = tb.rename(columns={"category": "Kategori"})
            st.dataframe(tb[["Kategori","Periode Ini","Periode Lalu","Perubahan"]], use_container_width=True, hide_index=True)
    else:
        st.info("Tidak ada data pengeluaran untuk periode ini.")

    st.markdown("<hr>", unsafe_allow_html=True)
    
    # =========================================================================
    # TABEL TRANSAKSI
    # =========================================================================
    st.subheader("Riwayat Transaksi")

    display = df.copy().sort_values("date", ascending=False)
    display["date"]   = display["date"].dt.strftime("%d %b %Y")
    display["amount"] = display["amount"].apply(lambda x: f"Rp {x:,.0f}")
    display["type"]   = display["type"].map({"income": "Pemasukan", "expense": "Pengeluaran"})
    display = display.rename(columns={
        "date": "Tanggal", "description": "Deskripsi",
        "amount": "Nominal", "type": "Tipe",
        "category": "Kategori", "method": "Metode",
    })
    cols = [c for c in ["Tanggal","Deskripsi","Nominal","Tipe","Kategori","Metode"] if c in display.columns]

    search = st.text_input("Cari transaksi...", placeholder="Ketik nama transaksi")
    if search:
        display = display[display["Deskripsi"].str.contains(search, case=False, na=False)]

    st.dataframe(display[cols], use_container_width=True, hide_index=True, height=400)
    st.caption(f"Menampilkan {len(display)} transaksi")

    st.markdown("""
    <div style="text-align:center;padding:1.5rem 0 0.5rem;color:#ccc;font-size:0.72rem">
        SAWIT - Sahabat Duwit - Coding Camp 2026 - DBS Foundation - CC26-PSU329
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
