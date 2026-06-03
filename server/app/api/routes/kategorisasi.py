# server/app/api/routes/kategorisasi.py

import os, re, pickle, string
import numpy as np
import torch
import nltk
from transformers import AutoTokenizer, AutoModel
from tensorflow import keras
from tensorflow.keras import layers
import tensorflow as tf
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

router = APIRouter(prefix="/api/ml", tags=["ML Kategorisasi"])

# ── Custom Objects (wajib ada agar model.keras bisa di-load) ──────────────────
@keras.utils.register_keras_serializable()
class ResidualBlock(layers.Layer):
    def __init__(self, units, dropout_rate=0.3, **kwargs):
        super().__init__(**kwargs)
        self.dense1 = layers.Dense(units, activation="relu")
        self.dense2 = layers.Dense(units)
        self.bn = layers.BatchNormalization()
        self.dropout = layers.Dropout(dropout_rate)
        self.add = layers.Add()
        self.relu = layers.Activation("relu")

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.dropout(x, training=training)
        x = self.dense2(x)
        x = self.bn(x, training=training)
        x = self.add([x, inputs])
        return self.relu(x)

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.dense1.units, "dropout_rate": self.dropout.rate})
        return config


@keras.utils.register_keras_serializable()
class FocalLoss(keras.losses.Loss):
    def __init__(self, gamma=2.0, alpha=0.25, **kwargs):
        super().__init__(**kwargs)
        self.gamma = gamma
        self.alpha = alpha

    def call(self, y_true, y_pred):
        y_true = tf.cast(y_true, tf.int32)
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1.0)
        y_true_oh = tf.one_hot(y_true, tf.shape(y_pred)[-1])
        y_true_oh = tf.cast(y_true_oh, tf.float32)
        ce = -tf.reduce_sum(y_true_oh * tf.math.log(y_pred), axis=-1)
        pt = tf.reduce_sum(y_true_oh * y_pred, axis=-1)
        return tf.reduce_mean(self.alpha * tf.pow(1.0 - pt, self.gamma) * ce)

    def get_config(self):
        config = super().get_config()
        config.update({"gamma": self.gamma, "alpha": self.alpha})
        return config


# ── Preprocessing ─────────────────────────────────────────────────────────────
factory = StemmerFactory()
stemmer = factory.create_stemmer()
STOPWORDS = set(stopwords.words("indonesian"))
CUSTOM_SW = {"promo","promosi","sale","diskon","gratis","free","ongkir","cashback","voucher"}
DOMAIN_WORDS = {"solar","transport","langganan","tagihan","kesehatan","konsumsi","entertainment"}
ALL_SW = (STOPWORDS | CUSTOM_SW) - DOMAIN_WORDS

def preprocess(text: str) -> str:
    if not isinstance(text, str): return ""
    text = text.lower()
    text = re.sub(r"\d+", " ", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text).strip()
    text = " ".join(w for w in text.split() if w not in ALL_SW and len(w) > 1)
    return stemmer.stem(text)


# ── State model (diisi saat startup dari main.py) ─────────────────────────────
ML_MODELS = {}

def load_ml_models():
    """Dipanggil dari lifespan di main.py"""
    BASE = os.path.join(os.path.dirname(__file__), "../../../../artifacts")
    print("⏳ [ML] Loading IndoBERT tokenizer...")
    ML_MODELS["tokenizer"] = AutoTokenizer.from_pretrained(f"{BASE}/indobert_tokenizer")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"⏳ [ML] Loading IndoBERT model (device: {device})...")
    bert = AutoModel.from_pretrained(f"{BASE}/indobert_model").to(device)
    bert.eval()
    ML_MODELS["bert"] = bert
    ML_MODELS["device"] = device

    print("⏳ [ML] Loading MLP model...")
    ML_MODELS["mlp"] = keras.models.load_model(
        f"{BASE}/mlp_functional.keras",
        custom_objects={"ResidualBlock": ResidualBlock, "FocalLoss": FocalLoss},
    )

    with open(f"{BASE}/label_encoder.pkl", "rb") as f:
        ML_MODELS["le"] = pickle.load(f)

    print("✅ [ML] Semua model berhasil dimuat!")


def extract_bert_features(texts: List[str]) -> np.ndarray:
    tokenizer = ML_MODELS["tokenizer"]
    bert = ML_MODELS["bert"]
    device = ML_MODELS["device"]
    embeddings = []
    with torch.no_grad():
        for i in range(0, len(texts), 32):
            batch = texts[i: i + 32]
            enc = tokenizer(batch, padding=True, truncation=True,
                            max_length=64, return_tensors="pt")
            enc = {k: v.to(device) for k, v in enc.items()}
            out = bert(**enc)
            mask = enc["attention_mask"].unsqueeze(-1).float()
            emb = (out.last_hidden_state * mask).sum(1) / mask.sum(1)
            embeddings.append(emb.cpu().numpy())
    return np.vstack(embeddings)


# ── Schema ────────────────────────────────────────────────────────────────────
class KategorisasiRequest(BaseModel):
    texts: List[str]
    top_k: int = 3

class KategorisasiItem(BaseModel):
    teks: str
    prediksi: str
    confidence: str
    top_k_labels: str

class KategorisasiResponse(BaseModel):
    results: List[KategorisasiItem]


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/health")
def ml_health():
    return {"status": "ok", "loaded": list(ML_MODELS.keys())}

@router.post("/kategorisasi", response_model=KategorisasiResponse)
def kategorisasi(req: KategorisasiRequest):
    if not ML_MODELS:
        raise HTTPException(status_code=503, detail="Model ML belum dimuat")
    if not req.texts:
        raise HTTPException(status_code=400, detail="Field 'texts' tidak boleh kosong")

    clean = [preprocess(t) for t in req.texts]
    X = extract_bert_features(clean).astype(np.float32)
    proba = ML_MODELS["mlp"].predict(X, verbose=0)
    preds = np.argmax(proba, axis=1)

    results = []
    for i, (pred, prob) in enumerate(zip(preds, proba)):
        label = ML_MODELS["le"].inverse_transform([pred])[0]
        top_idx = prob.argsort()[::-1][: req.top_k]
        top_lbl = ", ".join(
            f"{ML_MODELS['le'].inverse_transform([j])[0]} {prob[j]*100:.1f}%"
            for j in top_idx
        )
        results.append(KategorisasiItem(
            teks=req.texts[i],
            prediksi=label,
            confidence=f"{prob[pred]*100:.1f}%",
            top_k_labels=top_lbl,
        ))
    return KategorisasiResponse(results=results)