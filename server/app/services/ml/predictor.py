"""Inference pipeline for the notebook-trained transaction classifier."""

from app.services.ml.artifacts import (
    TransactionClassifierError,
    configure_tensorflow_runtime,
    load_model_artifacts,
)
from app.services.ml.label_map import MODEL_LABEL_TO_CATEGORY
from app.services.ml.preprocessing import preprocess_text


def predict_transaction_category(
    description: str,
    confidence_threshold: float | None = None,
) -> dict:
    """Prediksi kategori transaksi dari deskripsi yang diberikan user."""
    cleaned_description = _validate_description(description)
    threshold = _validate_confidence_threshold(confidence_threshold)
    processed_text = preprocess_text(cleaned_description)

    try:
        model, tokenizer, config = load_model_artifacts()
        max_len = int(config["max_len"])   # FIX: tidak lagi config.get() agar error jelas
        classes = list(config["classes"])

        # Tokenisasi menggunakan Keras Tokenizer (sesuai tokenizer.json di FixedMLP/)
        sequence = tokenizer.texts_to_sequences([processed_text])
        padded = _pad_sequences(
            sequence,
            maxlen=max_len,
            padding="post",
            truncating="post",
        )

        predictions = model.predict(padded, verbose=0)
        scores = _first_prediction_row(predictions)
        class_index, confidence = _argmax(scores)

        # FIX: label diambil dari classes (PascalCase) sesuai model_config.json
        # agar cocok dengan kunci di label_map.py
        model_label = str(classes[class_index])

    except TransactionClassifierError:
        raise
    except ModuleNotFoundError as exc:
        if exc.name and exc.name.startswith("tensorflow"):
            raise TransactionClassifierError(
                "TensorFlow belum terinstall. Jalankan `pip install -r requirements.txt`."
            ) from exc
        raise TransactionClassifierError("Gagal melakukan prediksi kategori.") from exc
    except Exception as exc:
        raise TransactionClassifierError("Gagal melakukan prediksi kategori.") from exc

    # Lookup kategori — berhasil karena kunci label_map sudah PascalCase
    category = MODEL_LABEL_TO_CATEGORY.get(model_label)
    if not category:
        raise TransactionClassifierError(f"Label model tidak dikenali: {model_label}")

    if threshold is not None and confidence < threshold:
        raise TransactionClassifierError(
            "Prediksi kategori berada di bawah confidence threshold."
        )

    return {
        "category": category,
        "confidence": confidence,
        "model_label": model_label,
    }


def _validate_description(description: str) -> str:
    if not isinstance(description, str):
        raise ValueError("Deskripsi harus berupa teks")
    cleaned = description.strip()
    if not cleaned:
        raise ValueError("Deskripsi tidak boleh kosong")
    if len(cleaned) > 255:
        raise ValueError("Deskripsi maksimal 255 karakter")
    return cleaned


def _validate_confidence_threshold(confidence_threshold: float | None) -> float | None:
    if confidence_threshold is None:
        return None
    threshold = float(confidence_threshold)
    if threshold < 0 or threshold > 1:
        raise ValueError("confidence_threshold harus di antara 0 dan 1")
    return threshold


def _pad_sequences(sequences, maxlen: int, padding: str, truncating: str):
    """Pad sequences menggunakan TF jika tersedia, fallback ke pure-Python."""
    try:
        configure_tensorflow_runtime()
        from tensorflow.keras.preprocessing.sequence import pad_sequences
        return pad_sequences(
            sequences,
            maxlen=maxlen,
            padding=padding,
            truncating=truncating,
        )
    except ModuleNotFoundError:
        return [_pad_sequence(seq, maxlen=maxlen) for seq in sequences]


def _pad_sequence(sequence, maxlen: int) -> list[int]:
    sequence = list(sequence[:maxlen])
    return sequence + [0] * (maxlen - len(sequence))


def _first_prediction_row(predictions) -> list[float]:
    if hasattr(predictions, "tolist"):
        predictions = predictions.tolist()
    if not predictions:
        raise TransactionClassifierError("Model tidak mengembalikan prediksi.")
    row = predictions[0]
    if hasattr(row, "tolist"):
        row = row.tolist()
    if not row:
        raise TransactionClassifierError("Model tidak mengembalikan skor kelas.")
    return [float(score) for score in row]


def _argmax(scores: list[float]) -> tuple[int, float]:
    class_index = max(range(len(scores)), key=scores.__getitem__)
    return class_index, float(scores[class_index])
