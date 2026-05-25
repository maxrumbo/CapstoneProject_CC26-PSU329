import json
from functools import lru_cache
from pathlib import Path


MODEL_LABEL_TO_CATEGORY = {
    "entertainment": "Entertainment",
    "kesehatan": "Kesehatan",
    "konsumsi": "Konsumsi",
    "langganan": "Langganan",
    "tagihan": "Tagihan",
    "transport": "Transportasi",
}


class TransactionClassifierError(RuntimeError):
    pass


def _model_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "machine-learning" / "ModelLSTM"


@lru_cache(maxsize=1)
def _load_artifacts():
    model_dir = _model_dir()
    model_path = model_dir / "best_lstm_model.keras"
    tokenizer_path = model_dir / "tokenizer.json"
    config_path = model_dir / "model_config.json"

    missing_files = [
        str(path)
        for path in (model_path, tokenizer_path, config_path)
        if not path.exists()
    ]
    if missing_files:
        raise TransactionClassifierError(
            f"File model AI tidak ditemukan: {', '.join(missing_files)}"
        )

    try:
        from tensorflow.keras.models import load_model
        from tensorflow.keras.preprocessing.text import tokenizer_from_json

        model = load_model(str(model_path), compile=False)
        tokenizer = tokenizer_from_json(tokenizer_path.read_text(encoding="utf-8"))
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except ModuleNotFoundError as exc:
        if exc.name and exc.name.startswith("tensorflow"):
            raise TransactionClassifierError(
                "TensorFlow belum terinstall. Jalankan `pip install -r requirements.txt`."
            ) from exc
        raise TransactionClassifierError(
            "Gagal memuat model klasifikasi transaksi"
        ) from exc
    except Exception as exc:
        raise TransactionClassifierError(
            "Gagal memuat model klasifikasi transaksi"
        ) from exc

    classes = config.get("classes") or []
    max_len = int(config.get("max_len") or 20)

    if not classes:
        raise TransactionClassifierError("Konfigurasi model tidak memiliki daftar kelas")

    return model, tokenizer, classes, max_len


def predict_transaction_category(description: str) -> dict:
    cleaned_description = description.strip()
    if not cleaned_description:
        raise ValueError("Deskripsi tidak boleh kosong")

    try:
        import numpy as np
        from tensorflow.keras.preprocessing.sequence import pad_sequences

        model, tokenizer, classes, max_len = _load_artifacts()
        sequence = tokenizer.texts_to_sequences([cleaned_description])
        padded_sequence = pad_sequences(
            sequence,
            maxlen=max_len,
            padding="post",
            truncating="post",
        )
        predictions = model.predict(padded_sequence, verbose=0)
        scores = np.asarray(predictions)[0]
        class_index = int(np.argmax(scores))
        confidence = float(scores[class_index])
    except TransactionClassifierError:
        raise
    except ModuleNotFoundError as exc:
        if exc.name and exc.name.startswith("tensorflow"):
            raise TransactionClassifierError(
                "TensorFlow belum terinstall. Jalankan `pip install -r requirements.txt`."
            ) from exc
        raise TransactionClassifierError("Gagal melakukan prediksi kategori") from exc
    except Exception as exc:
        raise TransactionClassifierError("Gagal melakukan prediksi kategori") from exc

    model_label = str(classes[class_index])
    category = MODEL_LABEL_TO_CATEGORY.get(model_label)

    if not category:
        raise TransactionClassifierError(f"Label model tidak dikenali: {model_label}")

    return {
        "category": category,
        "confidence": confidence,
        "model_label": model_label,
    }
