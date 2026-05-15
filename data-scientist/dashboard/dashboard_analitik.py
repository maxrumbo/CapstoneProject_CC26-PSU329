"""
SAWIT - Dashboard Analitik Transaksi
Konek langsung ke PostgreSQL, fokus pada data transactions.

Cara menjalankan:
    streamlit run dashboard_transaksi.py

File .env:
    DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/sawit_db
    CURRENT_USER_ID=3
"""

import os
from datetime import date, datetime, timedelta
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from dotenv import load_dotenv
import calendar

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

st.set_page_config(
    page_title="SAWIT - Transaksi",
    page_icon="🌴",
    layout="wide",
    initial_sidebar_state="expanded",
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


def get_status(expense, income, budget_total=0, days_elapsed=0, days_in_month=30):
    """
    Status berdasarkan 3 faktor:
    - Rasio expense/income
    - Sisa budget (jika ada data budget)
    - Kecepatan pengeluaran (apakah sudah > 80% budget sebelum bulan habis)
    """
    if income == 0:
        return "Tidak Ada Data", "status-waspada"
    
    r = expense / income
    
    # Jika ada data budget, cek kecepatan pengeluaran
    if budget_total > 0 and days_in_month > 0:
        budget_used_pct = expense / budget_total  # % budget terpakai
        month_elapsed_pct = days_elapsed / days_in_month  # % bulan berjalan
        
        # Proyeksi pengeluaran akhir bulan
        if days_elapsed > 0:
            projected = expense / days_elapsed * days_in_month
            projected_pct = projected / budget_total
        else:
            projected_pct = 0
        
        # Boros jika sudah pakai >80% budget sebelum 80% bulan berjalan
        if budget_used_pct >= 0.80 and month_elapsed_pct < 0.80:
            return "BOROS", "status-bahaya"
        # Waspada jika proyeksi akhir bulan melebihi budget
        if projected_pct > 1.10:
            return "WASPADA", "status-waspada"
    
    # Fallback ke rasio expense/income
    if r <= 0.60:
        return "AMAN", "status-aman"
    elif r <= 0.80:
        return "WASPADA", "status-waspada"
    return "BAHAYA", "status-bahaya"


import requests
@st.cache_data(ttl=30)
def load_data(user_id: int) -> pd.DataFrame:
    response = requests.get(
        "https://coba-render-vercel.vercel.app/transactions/",
        params={"user_id": user_id}
    )
    df = pd.DataFrame(response.json())

    df["date"]     = pd.to_datetime(df["date"], errors="coerce")
    df["amount"]   = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    df["category"] = df["category"].fillna("Pemasukan")
    df["method"]   = df["method"].fillna("Lainnya")
    df["bulan"]    = df["date"].dt.to_period("M").astype(str)
    df["tanggal"]  = df["date"].dt.date
    return df

@st.cache_data(ttl=30)
def load_budget(user_id: int) -> pd.DataFrame:
    response = requests.get(
        "https://coba-render-vercel.vercel.app/budget/",
        params={"user_id": user_id}
    )
    df = pd.DataFrame(response.json())
    if df.empty:
        return df
    
    df["month"]  = pd.to_datetime(df["month"]).dt.strftime("%Y-%m")
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    return df

def get_user_id() -> int:
    param = st.query_params.get("user_id")
    if param:
        try:
            return int(param)
        except Exception:
            pass
    env = os.getenv("CURRENT_USER_ID")
    if env:
        try:
            return int(env)
        except Exception:
            pass
    return 1


def main():
    user_id = get_user_id()

    try:
        df_all = load_data(user_id)
        df_budget = load_budget(user_id)
    except Exception as e:
        st.error(f"Gagal konek ke database: {e}")
        st.stop()

    if df_all.empty:
        st.warning("Belum ada data transaksi untuk user ini.")
        st.stop()

    min_date = df_all["date"].min().date()
    max_date = df_all["date"].max().date()
    today    = date.today()

      
    # ── Sidebar ───────────────────────────────────────────────────────────────
    with st.sidebar:
        st.markdown("### 🌴 SAWIT")
        st.caption("Dashboard Analitik Transaksi")
        st.markdown("---")

        filter_mode = st.radio(
            "📅 Filter Periode",
            options=["Semua Data", "7 Hari Terakhir", "30 Hari Terakhir",
                     "90 Hari Terakhir", "Bulan Tertentu", "Rentang Tanggal"],
            index=0,
        )

        if filter_mode == "Semua Data":
            date_start = min_date
            date_end   = max_date
            period     = "Semua Data"

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

        else:  # Rentang Tanggal
            col_d1, col_d2 = st.columns(2)
            with col_d1:
                date_start = st.date_input("Dari", value=min_date, min_value=min_date, max_value=max_date)
            with col_d2:
                date_end = st.date_input("Sampai", value=max_date, min_value=min_date, max_value=max_date)
            period = f"{date_start.strftime('%d %b %Y')} s/d {date_end.strftime('%d %b %Y')}"

        st.markdown("---")
        exp_cats      = sorted(df_all[df_all["type"] == "expense"]["category"].unique())
        selected_cats = st.multiselect("🏷️ Kategori", exp_cats, default=exp_cats)
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
    delta_days  = (date_end - date_start).days + 1
    prev_end    = date_start - timedelta(days=1)
    prev_start  = prev_end - timedelta(days=delta_days - 1)
    df_prev_exp = df_all[
        (df_all["date"].dt.date >= prev_start) &
        (df_all["date"].dt.date <= prev_end) &
        (df_all["type"] == "expense") &
        (df_all["category"].isin(selected_cats))
    ]

    # ── Header ────────────────────────────────────────────────────────────────
    st.markdown(f"""
    <div class="header">
        <h1>Dashboard Analitik Transaksi</h1>
        <p>Periode: {period} &nbsp;·&nbsp; {datetime.now().strftime('%d %b %Y, %H:%M')}</p>
    </div>
    """, unsafe_allow_html=True)

    # ── KPI ───────────────────────────────────────────────────────────────────
    income_total  = df_inc["amount"].sum()
    expense_total = df_exp["amount"].sum()
    saldo         = income_total - expense_total
    savings_pct   = (saldo / income_total * 100) if income_total > 0 else 0

    # Hitung parameter budget untuk bulan yang sedang dilihat
    today = date.today()
    current_month_str = today.strftime("%Y-%m")

    # Filter budget bulan ini
    if not df_budget.empty:
        budget_this_month = df_budget[df_budget["month"] == current_month_str]["amount"].sum()
    else:
        budget_this_month = 0

    days_in_month  = calendar.monthrange(today.year, today.month)[1]
    days_elapsed   = today.day

    status_txt, status_cls = get_status(
        expense_total, income_total,
        budget_total=budget_this_month,
        days_elapsed=days_elapsed,
        days_in_month=days_in_month
    )
    
    k1, k2, k3, k4, k5 = st.columns(5)
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
            <div class="sub">Savings: {savings_pct:.0f}%</div></div>""", unsafe_allow_html=True)
    with k4:
        st.markdown(f"""<div class="kpi"><div class="label">Total Transaksi</div>
            <div class="value" style="color:#7F77DD">{len(df)}</div>
            <div class="sub">income + expense</div></div>""", unsafe_allow_html=True)
    with k5:
        st.markdown(f"""<div class="kpi"><div class="label">Status Keuangan</div>
            <div class="value"><span class="{status_cls}">{status_txt}</span></div>
            <div class="sub">Rasio: {expense_total/max(income_total,1)*100:.0f}%</div></div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

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
    # CHART 3: Donut + Bar Kategori
    # =========================================================================
    col_a, col_b = st.columns([4, 6])
    with col_a:
        st.subheader("Komposisi Pengeluaran")

        if not df_exp.empty:

            # spacer atas
            st.markdown("<div style='height:40px'></div>", unsafe_allow_html=True)

            cat_sum = (
                df_exp.groupby("category")["amount"]
                .sum()
                .reset_index()
                .sort_values("amount", ascending=False)
            )

            fig3 = go.Figure(go.Pie(
                labels=cat_sum["category"],
                values=cat_sum["amount"],
                hole=0.55,
                marker=dict(
                   colors=[CATEGORY_COLORS.get(c, "#888780")
                            for c in cat_sum["category"]]
                ),
                textinfo="percent+label",
                textfont_size=11,
                hovertemplate="<b>%{label}</b><br>Rp %{value:,.0f} (%{percent})<extra></extra>",
            ))

            fig3.add_annotation(
                text=f"<b>{fmt(expense_total)}</b>",
                x=0.5,
                y=0.5,
                showarrow=False,
                font=dict(size=13, family="Plus Jakarta Sans")
            )

            fig3.update_layout(
                height=360,
                margin=dict(l=0, r=0, t=10, b=0),
                showlegend=False,
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)"
            )

            st.plotly_chart(fig3, use_container_width=True)

    with col_b:
        st.subheader("Budget Tracker")
        if not df_exp.empty:
            cat_bar = df_exp.groupby("category")["amount"].sum().reset_index().sort_values("amount", ascending=False)

            if not df_budget.empty:
                # ── Ambil semua bulan dalam rentang filter, bukan cuma bulan ini ──
                months_in_range = pd.period_range(
                    start=date_start.strftime("%Y-%m"),
                    end=date_end.strftime("%Y-%m"),
                    freq="M"
                ).strftime("%Y-%m").tolist()

                budget_range = df_budget[df_budget["month"].isin(months_in_range)]
                budget_map   = budget_range.groupby("category")["amount"].sum().to_dict()
            else:
                budget_map = {}

            if budget_map:
                for _, row in cat_bar.iterrows():
                    cat    = row["category"]
                    actual = row["amount"]
                    budget = budget_map.get(cat, 0)

                    if budget > 0:
                        pct = actual / budget * 100
                        if pct >= 100:
                            bar_color  = "#A32D2D"
                            status     = f"OVER +{fmt(actual - budget)}"
                            status_bg  = "#FCEBEB"
                            status_fg  = "#A32D2D"
                        elif pct >= 80:
                            bar_color  = "#EF9F27"
                            status     = f"{pct:.0f}% terpakai"
                            status_bg  = "#FAEEDA"
                            status_fg  = "#854F0B"
                        else:
                            bar_color  = CATEGORY_COLORS.get(cat, "#1D9E75")
                            status     = f"{pct:.0f}% terpakai"
                            status_bg  = "#E1F5EE"
                            status_fg  = "#0F6E56"

                        over_badge = (
                            '<div style="position:absolute;right:0;top:-3px;'
                            'font-size:0.65rem;color:#A32D2D;font-weight:600">⚠️</div>'
                            if pct >= 100 else ""
                        )
                        st.markdown(
                            f'<div style="margin-bottom:16px">'
                            f'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
                            f'<span style="font-weight:600;font-size:0.95rem;color:#1a1a1a">{cat}</span>'
                            f'<span style="font-size:0.8rem;font-weight:600;padding:2px 10px;border-radius:20px;background:{status_bg};color:{status_fg}">{status}</span>'
                            f'</div>'
                            f'<div style="display:flex;justify-content:space-between;font-size:0.78rem;color:#888;margin-bottom:6px">'
                            f'<span>{fmt(actual)} dari {fmt(budget)}</span>'
                            f'<span>Sisa: {fmt(max(budget - actual, 0))}</span>'
                            f'</div>'
                            f'<div style="background:#F0F0F0;border-radius:6px;height:8px;position:relative">'
                            f'<div style="background:{bar_color};width:{min(pct,100):.0f}%;height:8px;border-radius:6px"></div>'
                            f'{over_badge}'
                            f'</div>'
                            f'</div>',
                            unsafe_allow_html=True
                        )
                    else:
                        st.markdown(
                            f'<div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">'
                            f'<span style="font-weight:600;font-size:0.95rem;color:#1a1a1a">{cat}</span>'
                            f'<span style="font-size:0.78rem;color:#aaa">{fmt(actual)} — no budget</span>'
                            f'</div>',
                            unsafe_allow_html=True
                        )
            else:
                # Fallback ke bar chart biasa jika tidak ada budget
                fig4 = go.Figure(go.Bar(
                    x=cat_bar["amount"], y=cat_bar["category"], orientation="h",
                    marker=dict(color=[CATEGORY_COLORS.get(c, "#888780") for c in cat_bar["category"]]),
                    text=[fmt(v) for v in cat_bar["amount"]], textposition="outside",
                    hovertemplate="<b>%{y}</b><br>Rp %{x:,.0f}<extra></extra>",
                ))
                fig4.update_layout(
                    height=320, margin=dict(l=0, r=90, t=10, b=0),
                    xaxis=dict(tickprefix="Rp ", tickformat=",.0f", gridcolor="#F5F5F5"),
                    plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                    font=dict(family="Plus Jakarta Sans"),
                )
                st.plotly_chart(fig4, use_container_width=True)
        else:
            st.info("Tidak ada data pengeluaran.")

    st.markdown("<hr>", unsafe_allow_html=True)
    
    # =========================================================================
    # SECTION: Deteksi Kategori Terboros
    # =========================================================================
    st.subheader("Deteksi Kategori Terboros")

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
            st.caption(f"Dibandingkan dengan: {prev_label}")
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
    # CHART 4: Metode Pembayaran
    # =========================================================================
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
        fig5.update_layout(height=280, margin=dict(l=0, r=0, t=30, b=0),
                            title=dict(text="Jumlah Transaksi per Metode", font=dict(size=13)),
                            yaxis=dict(gridcolor="#F5F5F5"),
                            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                            font=dict(family="Plus Jakarta Sans"))
        st.plotly_chart(fig5, use_container_width=True)
    with col_m2:
        method_sum = df.groupby("method")["amount"].sum().reset_index().sort_values("amount", ascending=False)
        fig6 = go.Figure(go.Bar(
            x=method_sum["method"], y=method_sum["amount"],
            marker=dict(color=[METHOD_COLORS.get(m, "#888780") for m in method_sum["method"]]),
            text=[fmt(v) for v in method_sum["amount"]], textposition="outside",
            hovertemplate="<b>%{x}</b><br>Rp %{y:,.0f}<extra></extra>",
        ))
        fig6.update_layout(height=280, margin=dict(l=0, r=0, t=30, b=0),
                            title=dict(text="Total Nominal per Metode", font=dict(size=13)),
                            yaxis=dict(tickprefix="Rp ", tickformat=",.0f", gridcolor="#F5F5F5"),
                            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                            font=dict(family="Plus Jakarta Sans"))
        st.plotly_chart(fig6, use_container_width=True)

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
