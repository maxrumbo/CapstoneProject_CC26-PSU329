import re
import string
import pandas as pd
import nltk
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from nltk.corpus import stopwords

nltk.download('stopwords', quiet=True)

# ============================================================
# SETUP — dijalankan sekali saat modul di-import
# ============================================================

# Stemmer Bahasa Indonesia
factory = StemmerFactory()
stemmer = factory.create_stemmer()

# Stopwords NLTK Indonesia
stop_words = set(stopwords.words('indonesian'))

# Custom stopwords promosi & e-commerce
custom_stopwords = {
    # kata promosi umum
    "promo", "promosi", "sale", "diskon", "discount", "obral",
    "cuci", "gudang", "clearance", "flash", "live", "hot", "deal", "hemat", "murah meriah",

    # kata harga & pembayaran
    "murah", "termurah", "terjangkau", "hemat", "harga",
    "cod", "bayar", "ditempat", "gratis", "free",
    "ongkir", "ongkos", "kirim", "cashback", "voucher",

    # kata kualitas marketing
    "terbaru", "terlaris", "terpercaya", "terpopuler",
    "best", "seller", "bestseller", "hits", "viral",
    "premium", "super", "ultra", "spesial", "eksklusif",
    "original", "ori", "asli", "import", "branded",
    "recommended", "rekomendasi", "pilihan", "unggulan",

    # kata stok & ketersediaan
    "ready", "stock", "stok", "available", "tersedia",
    "new", "arrival", "limited", "edition",

    # kata fashion tidak spesifik
    "fashion", "distro", "brand", "koleksi",
    "kualitas", "berkualitas", "garansi", "resmi",

    # kata ajakan beli
    "buruan", "segera", "borong", "grosir", "ecer",
    "bisa", "dapat",

    # kata sifat umum
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

    # satuan & ukuran
    "gr", "gram", "kg", "liter", "ml", "cm", "mm", "meter",
    "pcs", "pc", "buah", "butir", "biji", "lembar", "helai",
    "pasang", "set", "lusin", "kodi", "roll", "dus", "karton",
    "netto", "neto", "bruto", "gross", "net",
    "xgr", "xkg", "xml", "xpcs", "kilogram", "kilo", "kaplet",
    "xl", "xxl", "xs", "xxs", "5xl", "4xl", "xxxl", "3xl", "lxl",

    # varian & pilihan
    "varian", "variant", "variasi", "pilih",
    "warna", "ukuran", "size", "motif", "tipe", "type",
    "mix", "campur", "acak", "random",

    # kemasan & packaging
    "paket", "packet", "pack", "packing", "kemas", "kemasan",
    "box", "kotak", "botol", "sachet", "pouch", "wrapper",
    "wadah", "tempat", "isi", "berisi", "konten", "content",

    # porsi & menu
    "porsi", "serving", "menu", "reguler", "regular", "large",
    "small", "medium", "mini", "jumbo",

    # bahan & komposisi
    "bahan", "material", "ingredient", "komposisi", "terbuat",
    "berbahan", "mengandung", "kandungan",

    # kata jual & transaksi
    "jual", "dijual", "jualin", "jualan", "toko",
    "shop", "store", "lapak", "online", "reseller", "dropship",
    "partai",

    # demografis & usia
    "pria", "wanita", "cowok", "cewek", "cewe", "cowo",
    "laki", "perempuan", "lelaki",
    "dewasa", "bayi", "balita", "lansia", "senior", "junior",

    # kata penghubung tidak penting
    "dll", "dkk", "dsb", "dst", "etc", "dan", "atau",
    "untuk", "dengan", "dari", "ke", "di", "pada",
    "yang", "adalah", "ini", "itu", "juga", "saja",
    "hanya", "sudah", "belum", "ada", "tidak", "bukan",

    # kata deskripsi generik
    "all", "semua", "seluruh", "berbagai", "beragam",
    "komplit", "full", "half", "setengah",
    "per", "tiap", "setiap",

    # lainnya
    "nota", "kode", "link", "linj", "maaf", "error",
    "etalase", "tolong", "saya", "kami", "kamu", "anda",
    "mereka", "kalian", "aku", "gue", "lo",
}

# Load sentiment adjective dari CSV eksternal
try:
    _URL_ADJ = (
        "https://raw.githubusercontent.com/maxrumbo/CapstoneProject_CC26-PSU329"
        "/development/data-scientist/kategorisasi/indonesian-adjective-sentiment-raw.csv"
    )
    _df_adj = pd.read_csv(_URL_ADJ)
    _words_from_csv = set(_df_adj['word'].dropna().str.lower().str.strip())
    custom_stopwords.update(_words_from_csv)
    print(f"[preprocessing] Loaded {len(_words_from_csv)} kata dari CSV adjective.")
except Exception as e:
    print(f"[preprocessing] Warning: Gagal load CSV adjective — {e}")

# Gabungkan semua stopwords
all_stopwords = stop_words.union(custom_stopwords)

# Pengecualian — kata yang tidak boleh dihapus walau masuk stopwords
_exceptions = {"solar"}
all_stopwords -= _exceptions


# ============================================================
# FUNGSI-FUNGSI PREPROCESSING
# ============================================================

def clean_text(text: str) -> str:
    """
    Lowercase, hapus angka, tanda baca, dan spasi berlebih.
    """
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def remove_stopwords(text: str) -> str:
    """
    Hapus stopwords umum + custom stopwords promosi e-commerce.
    """
    words = text.split()
    filtered = [w for w in words if w not in all_stopwords and len(w) > 1]
    return " ".join(filtered)


def stemming(text: str) -> str:
    """
    Stemming Sastrawi — ubah kata ke bentuk dasar Bahasa Indonesia.
    """
    return stemmer.stem(text)


def preprocess_pipeline(text: str) -> str:
    """
    Pipeline lengkap preprocessing:
        clean_text → remove_stopwords → stemming

    Gunakan fungsi ini di endpoint prediksi sebelum memanggil model.

    Contoh penggunaan:
        from preprocessing import preprocess_pipeline

        raw = "Baju Pria Distro Premium Murah Ready Stock"
        clean = preprocess_pipeline(raw)
        prediction = model.predict([clean])
    """
    text = clean_text(text)
    text = remove_stopwords(text)
    text = stemming(text)
    return text
