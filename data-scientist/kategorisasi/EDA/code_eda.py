import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from collections import Counter
from wordcloud import WordCloud

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="EDA Dashboard – Kategorisasi Teks",
    page_icon="📊",
    layout="wide",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* Font & background */
    html, body, [class*="css"] { font-family: 'Segoe UI', sans-serif; }

    /* Header utama */
    .dashboard-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 2.5rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        color: white;
    }
    .dashboard-header h1 { margin: 0; font-size: 2rem; font-weight: 700; }
    .dashboard-header p  { margin: 0.4rem 0 0; font-size: 1rem; opacity: 0.88; }

    /* Metric cards */
    .metric-card {
        border-radius: 12px;
        padding: 1.1rem 1.4rem;
        color: white;
        font-weight: 600;
        margin-bottom: 0.6rem;
    }
    .metric-card .val  { font-size: 1.7rem; font-weight: 700; }
    .metric-card .pct  { font-size: 0.85rem; opacity: 0.88; }
    .metric-card .lbl  { font-size: 0.8rem; text-transform: uppercase;
                         letter-spacing: 0.07em; opacity: 0.75; }

    /* Section header pill */
    .section-pill {
        display: inline-block;
        background: #f0f2ff;
        color: #4C72B0;
        font-weight: 700;
        font-size: 0.78rem;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        margin-bottom: 0.5rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    /* Tab styling */
    [data-testid="stTabs"] button {
        font-weight: 600;
        font-size: 0.92rem;
        border-radius: 8px 8px 0 0;
    }

    /* Divider */
    hr { border: none; border-top: 1.5px solid #e8eaf0; margin: 1.5rem 0; }
</style>
""", unsafe_allow_html=True)

# ── Palette ───────────────────────────────────────────────────────────────────
PALETTE = ["#4C72B0","#DD8452","#55A868","#C44E52","#8172B3","#937860","#DA8BC3"]
WC_CMAPS = [
    "viridis",
    "plasma",
    "inferno",
    "magma",
    "cividis",
    "turbo",
    "cubehelix"
]

# ── Load data ─────────────────────────────────────────────────────────────────
@st.cache_data
def load_data(path):
    df = pd.read_csv(path)
    df = df[df["label"] != "label"].dropna(subset=["label","clean_text"])
    df["clean_text"]  = df["clean_text"].astype(str)
    df["word_count"]  = df["clean_text"].apply(lambda x: len(x.split()))
    df["char_count"]  = df["clean_text"].apply(len)
    return df

DATA_PATH = "hasil_preprocessing_bersih.csv"

try:
    df = load_data(DATA_PATH)
except FileNotFoundError:
    uploaded = st.file_uploader("📂 Upload file CSV", type="csv")
    if uploaded:
        df = pd.read_csv(uploaded)
        df = df[df["label"] != "label"].dropna(subset=["label","clean_text"])
        df["clean_text"] = df["clean_text"].astype(str)
        df["word_count"] = df["clean_text"].apply(lambda x: len(x.split()))
        df["char_count"] = df["clean_text"].apply(len)
    else:
        st.stop()

LABELS    = sorted(df["label"].unique())
COLOR_MAP = {lbl: PALETTE[i % len(PALETTE)] for i, lbl in enumerate(LABELS)}
CMAP_MAP  = {lbl: WC_CMAPS[i % len(WC_CMAPS)] for i, lbl in enumerate(LABELS)}

# ── Helpers ───────────────────────────────────────────────────────────────────
def get_top_words(series, n=10):
    words = " ".join(series).split()
    return pd.Series(Counter(words)).nlargest(n)

def hex_to_rgba(hex_color, alpha=0.15):
    h = hex_color.lstrip("#")
    r,g,b = tuple(int(h[i:i+2],16) for i in (0,2,4))
    return f"rgba({r},{g},{b},{alpha})"

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## ⚙️ Pengaturan")
    st.markdown("---")
    selected_labels = st.multiselect("Filter Label", LABELS, default=LABELS)
    top_n = st.slider("Top N Kata", 5, 20, 10)
    st.markdown("---")
    st.markdown(f"**Total data:** `{len(df):,}`")
    st.markdown(f"**Label aktif:** `{len(selected_labels)}`")

df_f = df[df["label"].isin(selected_labels)]

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown(f"""
<div class="dashboard-header">
    <h1>📊 EDA Dashboard – Kategorisasi Teks</h1>
    <p>{len(df_f):,} data · {len(selected_labels)} label aktif · hasil_preprocessing_bersih.csv</p>
</div>
""", unsafe_allow_html=True)

if not selected_labels:
    st.warning("Pilih minimal satu label di sidebar.")
    st.stop()

# ── TABS ──────────────────────────────────────────────────────────────────────
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📈 Distribusi Label",
    "📝 Word Count & Top Kata",
    "☁️ Word Cloud",
    "📊 Perbandingan Label",
    "🔍 Sample Data",
])

# ══════════════════════════════════════════════════════════════════════════════
# TAB 1 — Distribusi Label
# ══════════════════════════════════════════════════════════════════════════════
with tab1:
    st.markdown('<div class="section-pill">Distribusi Label</div>', unsafe_allow_html=True)
    st.markdown("#### Jumlah data per kategori label")

    label_counts = (
        df_f["label"].value_counts()
        .reindex(selected_labels).dropna().astype(int)
    )

    col_chart, col_cards = st.columns([3, 1])

    with col_chart:
        fig, ax = plt.subplots(figsize=(9, 4))
        colors = [COLOR_MAP[l] for l in label_counts.index]
        bars = ax.bar(label_counts.index, label_counts.values,
                      color=colors, edgecolor="white", linewidth=0.8,
                      width=0.55)
        for bar in bars:
            ax.text(bar.get_x() + bar.get_width()/2,
                    bar.get_height() + label_counts.max()*0.01,
                    f"{int(bar.get_height()):,}",
                    ha="center", va="bottom", fontsize=9, fontweight="600")
        ax.set_xlabel("Label", fontsize=10)
        ax.set_ylabel("Jumlah Data", fontsize=10)
        ax.set_title("Distribusi Jumlah Data per Label",
                     fontsize=12, fontweight="bold", pad=14)
        ax.yaxis.set_major_formatter(
            mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))
        ax.spines[["top","right"]].set_visible(False)
        ax.tick_params(axis="x", labelsize=9)
        ax.set_facecolor("#fafbfc")
        fig.patch.set_facecolor("#ffffff")
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()

    with col_cards:
        st.markdown("##### Ringkasan")
        for lbl, cnt in label_counts.items():
            pct  = cnt / len(df_f) * 100
            col  = COLOR_MAP[lbl]
            bg   = hex_to_rgba(col, 0.12)
            st.markdown(f"""
            <div class="metric-card" style="background:{col};">
                <div class="lbl">{lbl}</div>
                <div class="val">{cnt:,}</div>
                <div class="pct">{pct:.1f}% dari total</div>
            </div>""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# TAB 2 — Word Count & Top Kata
# ══════════════════════════════════════════════════════════════════════════════
with tab2:
    st.markdown('<div class="section-pill">Word Count & Top Kata</div>',
                unsafe_allow_html=True)
    st.markdown("#### Distribusi panjang teks & kata paling sering muncul per label")

    for lbl in selected_labels:
        sub   = df_f[df_f["label"] == lbl]
        color = COLOR_MAP[lbl]

        # ── Label header ──
        st.markdown(f"""
        <div style="background:{color};color:white;padding:0.5rem 1rem;
             border-radius:10px;margin:1rem 0 0.6rem;font-weight:700;font-size:1rem;">
            🏷️ {lbl} &nbsp;·&nbsp; {len(sub):,} data
        </div>""", unsafe_allow_html=True)

        col_hist, col_stat, col_bar = st.columns([2, 1, 2])

        # Histogram word count
        with col_hist:
            fig, ax = plt.subplots(figsize=(5, 3.2))
            ax.hist(sub["word_count"], bins=30, color=color,
                    edgecolor="white", alpha=0.85)
            wc_mean   = sub["word_count"].mean()
            wc_median = sub["word_count"].median()
            ax.axvline(wc_mean,   color="#222", linestyle="--", lw=1.2,
                       label=f"Mean: {wc_mean:.1f}")
            ax.axvline(wc_median, color="#888", linestyle=":",  lw=1.2,
                       label=f"Median: {wc_median:.1f}")
            ax.set_title(f"Distribusi Word Count", fontsize=9, fontweight="bold")
            ax.set_xlabel("Jumlah Kata", fontsize=8)
            ax.set_ylabel("Frekuensi",   fontsize=8)
            ax.legend(fontsize=7)
            ax.spines[["top","right"]].set_visible(False)
            ax.set_facecolor("#fafbfc")
            fig.patch.set_facecolor("#ffffff")
            plt.tight_layout()
            st.pyplot(fig)
            plt.close()

        # Tabel statistik
        with col_stat:
            stats = sub["word_count"].describe().rename({
                "count":"n","mean":"rata-rata","std":"std dev",
                "min":"min","25%":"Q1","50%":"median","75%":"Q3","max":"max"
            })
            st.markdown("**Statistik**")
            st.dataframe(
                stats.to_frame("nilai").style.format("{:.1f}"),
                use_container_width=True, height=290,
            )

        # Top N kata bar chart horizontal
        with col_bar:
            top_words = get_top_words(sub["clean_text"], top_n)
            fig, ax = plt.subplots(figsize=(5, 3.2))
            y_pos = range(len(top_words))
            bars_h = ax.barh(
                top_words.index[::-1], top_words.values[::-1],
                color=color, edgecolor="white", alpha=0.85, height=0.6
            )
            for i, val in enumerate(top_words.values[::-1]):
                ax.text(val + top_words.max()*0.01, i,
                        f"{val:,}", va="center", fontsize=7.5)
            ax.set_title(f"Top {top_n} Kata", fontsize=9, fontweight="bold")
            ax.set_xlabel("Frekuensi", fontsize=8)
            ax.spines[["top","right"]].set_visible(False)
            ax.set_facecolor("#fafbfc")
            fig.patch.set_facecolor("#ffffff")
            plt.tight_layout()
            st.pyplot(fig)
            plt.close()

# ══════════════════════════════════════════════════════════════════════════════
# TAB 3 — Word Cloud
# ══════════════════════════════════════════════════════════════════════════════
with tab3:
    st.markdown('<div class="section-pill">Word Cloud</div>', unsafe_allow_html=True)
    st.markdown("#### Visualisasi kata paling dominan per label")

    cols = st.columns(2)

    for i, lbl in enumerate(selected_labels):
        sub = df_f[df_f["label"] == lbl]
        text = " ".join(sub["clean_text"])

        if not text.strip():
            continue

        wc = WordCloud(
            width=800,
            height=380,
            background_color="white",
            max_words=100,
            collocations=False,
            colormap=CMAP_MAP[lbl],
        ).generate(text)

        with cols[i % 2]:
            st.markdown(f"""
            <div style="background:{COLOR_MAP[lbl]};color:white;
                 padding:0.4rem 1rem;border-radius:8px 8px 0 0;
                 font-weight:700;font-size:0.9rem;">
                🏷️ {lbl} · {len(sub):,} data
            </div>""", unsafe_allow_html=True)

            fig, ax = plt.subplots(figsize=(7, 3.5))
            ax.imshow(wc, interpolation="bilinear")
            ax.axis("off")
            fig.patch.set_facecolor("#ffffff")
            plt.tight_layout(pad=0.5)
            st.pyplot(fig)
            plt.close()

# ══════════════════════════════════════════════════════════════════════════════
# TAB 4 — Perbandingan Label
# ══════════════════════════════════════════════════════════════════════════════
with tab4:
    st.markdown('<div class="section-pill">Perbandingan Antar Label</div>',
                unsafe_allow_html=True)

    # ── Rata-rata word count ──
    st.markdown("#### Rata-rata Word Count per Label (±1 std dev)")
    wc_stats = (
        df_f.groupby("label")["word_count"]
        .agg(["mean","median","std"])
        .reindex(selected_labels).dropna()
    )
    fig, ax = plt.subplots(figsize=(9, 4))
    x = range(len(wc_stats))
    bars = ax.bar(
        x, wc_stats["mean"],
        color=[COLOR_MAP[l] for l in wc_stats.index],
        edgecolor="white", linewidth=0.8,
        yerr=wc_stats["std"], capsize=5,
        error_kw={"elinewidth":1.2,"alpha":0.55}, width=0.5,
    )
    ax.set_xticks(list(x))
    ax.set_xticklabels(wc_stats.index, fontsize=9)
    ax.set_ylabel("Rata-rata Word Count", fontsize=10)
    ax.set_title("Rata-rata Word Count per Label",
                 fontsize=12, fontweight="bold", pad=14)
    for bar, (_, row) in zip(bars, wc_stats.iterrows()):
        ax.text(bar.get_x() + bar.get_width()/2,
                bar.get_height() + wc_stats["std"].max()*0.06,
                f"μ={row['mean']:.1f}\nm={row['median']:.1f}",
                ha="center", va="bottom", fontsize=7.5)
    ax.spines[["top","right"]].set_visible(False)
    ax.set_facecolor("#fafbfc")
    fig.patch.set_facecolor("#ffffff")
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

    st.markdown("---")

    # ── Vocabulary richness ──
    st.markdown("#### Vocabulary Richness — Unique Words vs Total Token")

    vocab_rows = []
    for lbl in selected_labels:
        sub = df_f[df_f["label"] == lbl]
        all_words = " ".join(sub["clean_text"]).split()
        vocab_rows.append({
            "Label":        lbl,
            "Total Token":  len(all_words),
            "Unique Words": len(set(all_words)),
            "Richness (%)": round(len(set(all_words))/max(len(all_words),1)*100, 2),
        })
    vocab_df = pd.DataFrame(vocab_rows).set_index("Label")

    col_v1, col_v2 = st.columns([2.5, 1])
    with col_v1:
        fig, ax = plt.subplots(figsize=(9, 3.8))
        x = range(len(vocab_df))
        colors = [COLOR_MAP[l] for l in vocab_df.index]
        ax.bar(x, vocab_df["Total Token"],  color=colors, alpha=0.35, label="Total Token")
        ax.bar(x, vocab_df["Unique Words"], color=colors, alpha=1.0,  label="Unique Words")
        ax.set_xticks(list(x))
        ax.set_xticklabels(vocab_df.index, fontsize=9)
        ax.yaxis.set_major_formatter(
            mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))
        ax.set_ylabel("Jumlah", fontsize=9)
        ax.set_title("Total Token vs Unique Words per Label",
                     fontsize=12, fontweight="bold", pad=14)
        ax.legend(fontsize=8)
        ax.spines[["top","right"]].set_visible(False)
        ax.set_facecolor("#fafbfc")
        fig.patch.set_facecolor("#ffffff")
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()

    with col_v2:
        st.markdown("**Tabel Richness**")
        st.dataframe(
            vocab_df.style.format({
                "Total Token":  "{:,}",
                "Unique Words": "{:,}",
                "Richness (%)": "{:.2f}%",
            }).background_gradient(subset=["Richness (%)"], cmap="YlGn"),
            use_container_width=True,
        )

# ══════════════════════════════════════════════════════════════════════════════
# TAB 5 — Sample Data
# ══════════════════════════════════════════════════════════════════════════════
with tab5:
    st.markdown('<div class="section-pill">Sample Data</div>', unsafe_allow_html=True)
    st.markdown("#### Preview teks per label")

    col_s1, col_s2 = st.columns([2, 1])
    with col_s1:
        sample_label = st.selectbox("Pilih label", selected_labels)
    with col_s2:
        n_sample = st.slider("Jumlah baris", 5, 50, 10)

    sub_sample = df_f[df_f["label"] == sample_label]
    sample_df = (
        sub_sample
        .sample(min(n_sample, len(sub_sample)), random_state=42)
        [["label","clean_text","word_count"]]
        .reset_index(drop=True)
    )

    color = COLOR_MAP[sample_label]
    st.markdown(f"""
    <div style="background:{color};color:white;padding:0.4rem 1rem;
         border-radius:8px 8px 0 0;font-weight:700;font-size:0.9rem;
         margin-bottom:0;">
        🏷️ {sample_label} · menampilkan {len(sample_df)} dari {len(sub_sample):,} data
    </div>""", unsafe_allow_html=True)
    st.dataframe(sample_df, use_container_width=True, height=420)

st.markdown("""
<div style="text-align:center;color:#aaa;font-size:0.8rem;margin-top:2rem;">
    Dashboard EDA · Kategorisasi Teks
</div>
""", unsafe_allow_html=True)
