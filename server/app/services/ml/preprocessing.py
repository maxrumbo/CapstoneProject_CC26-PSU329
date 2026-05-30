"""Preprocessing text transaksi sesuai pipeline dari tim data."""

import logging
import re
import string
from pathlib import Path

import nltk
import pandas as pd
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from nltk.corpus import stopwords

# Pipeline ini mengikuti preprocessing training dari tim data:
# clean_text -> remove_stopwords -> stemming.

logger = logging.getLogger(__name__)

nltk.download("stopwords", quiet=True)

factory = StemmerFactory()
stemmer = factory.create_stemmer()

stop_words = set(stopwords.words("indonesian"))

custom_stopwords = {
    "promo", "promosi", "sale", "diskon", "discount", "obral",
    "cuci", "gudang", "clearance", "flash", "live", "hot", "deal", "hemat", "meriah",
    "murah", "termurah", "terjangkau", "hemat", "harga",
    "cod", "bayar", "ditempat", "gratis", "free",
    "ongkir", "ongkos", "kirim", "cashback", "voucher",
    "terbaru", "terlaris", "terpercaya", "terpopuler",
    "best", "seller", "bestseller", "hits", "viral",
    "premium", "super", "ultra", "spesial", "eksklusif",
    "original", "ori", "asli", "import", "branded",
    "recommended", "rekomendasi", "pilihan", "unggulan",
    "ready", "stock", "stok", "available", "tersedia",
    "new", "arrival", "limited", "edition",
    "fashion", "distro", "brand", "koleksi",
    "kualitas", "berkualitas", "garansi", "resmi",
    "buruan", "segera", "borong", "grosir", "ecer",
    "bisa", "dapat",
    "tampan", "cantik", "jelek", "kaya", "miskin",
    "lapar", "haus", "kenyang", "luas", "lebar",
    "sempit", "dekat", "jauh", "manis", "pedas",
    "asin", "asam", "baik", "ramah", "sombong",
    "congkak", "hangat", "dingin", "panjang", "pendek",
    "lurus", "bengkok", "keriting", "rapi", "kotor",
    "bersih", "mancung", "pesek", "pelit", "rakus",
    "buas", "jinak", "malas", "rajin", "produktif",
    "abadi", "positif", "negatif", "religius", "aktif",
    "pasif", "cocok", "setuju", "jahat", "pintar",
    "bodoh", "dendam", "pendiam", "riang", "mulia",
    "indah", "buruk", "agung", "rusak", "benar",
    "salah", "sinis", "aktual", "muda", "remaja",
    "tua", "lucu", "jenaka", "bijaksana", "serius",
    "lancar", "macet", "cemas", "tenang", "putih",
    "hitam", "merah", "biru", "kuning", "hijau",
    "ungu", "abu-abu", "oranye", "cokelat", "kelabu",
    "mendung", "cerah", "terang", "basah", "lembap",
    "kering", "tegang", "seram", "lemah", "lesu",
    "lelah", "pucat", "segar", "kuat",
    "sehat", "waspada", "teledor", "lalai", "teliti",
    "legal", "ilegal", "absolut", "sadar",
    "nyaman", "risi", "jijik", "enak", "sedap",
    "harum", "wangi", "adil", "curang", "seimbang",
    "mungil", "elok", "molek", "imut", "tipis",
    "tebal", "halus", "lembut", "kasar", "keras",
    "lunak", "empuk", "lembek", "padat", "kecil",
    "besar", "cepat", "tangkas", "lambat", "lamban",
    "lengket", "lekat", "curam", "terjal", "dalam",
    "dangkal", "manja", "mandiri", "puas", "kecewa",
    "aman", "busuk", "basi", "layu", "sempurna",
    "cacat", "utuh", "penuh", "kosong", "hampa",
    "taat", "palsu", "biasa", "berisik",
    "ricuh", "ribut", "riuh", "gugup", "berani",
    "takut", "cair", "encer", "kental", "merdu",
    "lincah", "tepat", "awal", "terakhir", "timpang",
    "longgar", "ketat", "setia", "utama", "penting",
    "tajam", "tumpul", "tenteram", "gelisah", "khawatir",
    "kurus", "gemuk", "langsing", "gemulai", "kaku",
    "sebentar", "lama", "keren", "mustahil",
    "sopan", "hormat", "nakal", "bandel", "jahil",
    "lugu", "polos", "cekatan", "ideal", "jujur",
    "bohong", "dusta", "tinggi", "rendah", "rahasia",
    "gegabah", "setengah", "waras", "gila", "cemerlang",
    "luhur", "anggun", "apik", "suram", "redup",
    "umum", "khusus", "khas", "istimewa", "bebas",
    "lepas", "datar", "populer", "eksis", "gadungan",
    "mahal", "ahli", "mahir", "etis", "eksotis",
    "langka", "iri", "cukup", "lebih",
    "asyik", "tunggal", "pusing", "ceroboh", "cermat",
    "cerdas", "buta", "canggung", "kikuk", "malu",
    "kuno", "mutakhir", "modern", "baru", "ambigu",
    "pasti", "serasi", "sesuai", "konyol", "kokoh",
    "rapuh", "steril", "bahagia", "sedih", "marah",
    "sedu", "banyak", "galak", "tegas", "inovatif",
    "kreatif", "progresif", "amanah", "alami", "kimiawi",
    "biologis", "abai", "giat", "dinamis",
    "gr", "gram", "kg", "liter", "ml", "cm", "mm", "meter",
    "pcs", "pc", "buah", "butir", "biji", "lembar", "helai",
    "pasang", "set", "lusin", "kodi", "roll", "dus", "karton",
    "netto", "neto", "bruto", "gross", "net",
    "xgr", "xkg", "xml", "xpcs", "kilogram", "kilo", "kaplet",
    "xl", "xxl", "xs", "xxs", "5xl", "4xl", "xxxl", "3xl", "lxl",
    "varian", "variant", "variasi", "pilih",
    "warna", "ukuran", "size", "motif", "tipe", "type",
    "mix", "campur", "acak", "random",
    "paket", "packet", "pack", "packing", "kemas", "kemasan",
    "box", "kotak", "botol", "sachet", "pouch", "wrapper",
    "wadah", "tempat", "isi", "berisi", "konten", "content",
    "porsi", "serving", "menu", "reguler", "regular", "large",
    "small", "medium", "mini", "jumbo",
    "bahan", "material", "ingredient", "komposisi", "terbuat",
    "berbahan", "mengandung", "kandungan",
    "jual", "dijual", "jualin", "jualan", "toko",
    "shop", "store", "lapak", "online", "reseller", "dropship",
    "partai",
    "pria", "wanita", "cowok", "cewek", "cewe", "cowo",
    "laki", "perempuan", "lelaki",
    "dewasa", "bayi", "balita", "lansia", "senior", "junior",
    "dll", "dkk", "dsb", "dst", "etc", "dan", "atau",
    "untuk", "dengan", "dari", "ke", "di", "pada",
    "yang", "adalah", "ini", "itu", "juga", "saja",
    "hanya", "sudah", "belum", "ada", "tidak", "bukan",
    "all", "semua", "seluruh", "berbagai", "beragam",
    "komplit", "full", "half", "setengah",
    "per", "tiap", "setiap",
    "nota", "kode", "link", "linj", "maaf", "error",
    "etalase", "tolong", "saya", "kami", "kamu", "anda",
    "mereka", "kalian", "aku", "gue", "lo",
}


def _load_adjective_stopwords() -> set[str]:
    local_path = (
        Path(__file__).resolve().parents[4]
        / "data-scientist"
        / "kategorisasi"
        / "indonesian-adjective-sentiment-raw.csv"
    )
    source = local_path
    if not local_path.exists():
        source = (
            "https://raw.githubusercontent.com/maxrumbo/CapstoneProject_CC26-PSU329"
            "/development/data-scientist/kategorisasi/indonesian-adjective-sentiment-raw.csv"
        )

    try:
        df_adj = pd.read_csv(source)
        words_from_csv = set(df_adj["word"].dropna().str.lower().str.strip())
        logger.info("[preprocessing] Loaded %s kata dari CSV adjective.", len(words_from_csv))
        return words_from_csv
    except Exception as exc:
        logger.warning("[preprocessing] Gagal load CSV adjective: %s", exc)
        return set()


custom_stopwords.update(_load_adjective_stopwords())

all_stopwords = stop_words.union(custom_stopwords)
all_stopwords -= {"solar"}


def clean_text(text: str) -> str:
    """Lowercase, hapus angka, tanda baca, dan spasi berlebih."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"\d+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_words(text: str) -> str:
    """Compatibility shim; pipeline tim data tidak memakai normalisasi kata."""
    if not isinstance(text, str):
        return ""
    return text


def remove_stopwords(text: str) -> str:
    """Hapus stopwords umum + custom stopwords promosi e-commerce."""
    if not isinstance(text, str):
        return ""
    words = text.split()
    filtered = [word for word in words if word not in all_stopwords and len(word) > 1]
    return " ".join(filtered)


def stemming(text: str) -> str:
    """Stemming Sastrawi untuk mengubah kata ke bentuk dasar Bahasa Indonesia."""
    if not isinstance(text, str):
        return ""
    return stemmer.stem(text)


def preprocess_pipeline(text: str) -> str:
    """Pipeline lengkap: clean_text -> remove_stopwords -> stemming."""
    text = clean_text(text)
    text = remove_stopwords(text)
    text = stemming(text)
    return text


def preprocess_text(text: str) -> str:
    """Alias untuk predictor backend agar memakai pipeline dari tim data."""
    return preprocess_pipeline(text)
