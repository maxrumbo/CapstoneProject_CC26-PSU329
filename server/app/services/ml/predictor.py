"""Inference pipeline for the notebook-trained transaction classifier."""

from app.services.ml.artifacts import (
    TransactionClassifierError,
    configure_tensorflow_runtime,
    load_model_artifacts,
)
from app.services.ml.label_map import MODEL_LABEL_TO_CATEGORY
from app.services.ml.preprocessing import preprocess_text

# The inference order mirrors Notebook_Cleaning_Data.ipynb preprocessing before
# tokenization, then asks the LSTM model for the final classification.


def predict_transaction_category(
    description: str,
    confidence_threshold: float | None = None,
) -> dict:
    """Predict the transaction category from a user-provided description."""
    cleaned_description = _validate_description(description)
    processed_text = preprocess_text(cleaned_description)

    try:
        model, tokenizer, config = load_model_artifacts()
        max_len = int(config.get("max_len") or 20)
        classes = list(config.get("classes") or [])
        if not classes:
            raise TransactionClassifierError(
                "Konfigurasi model tidak memiliki daftar kelas."
            )

        sequence = tokenizer.texts_to_sequences([processed_text])
        padded_sequence = _pad_sequences(
            sequence,
            maxlen=max_len,
            padding="post",
            truncating="post",
        )
        predictions = model.predict(padded_sequence, verbose=0)
        scores = _first_prediction_row(predictions)
        class_index, confidence = _argmax(scores)
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

    category = MODEL_LABEL_TO_CATEGORY.get(model_label)
    if not category:
        raise TransactionClassifierError(f"Label model tidak dikenali: {model_label}")

    return {
        "category": category,
        "confidence": confidence,
        "model_label": model_label,
    }


def _validate_description(description: str) -> str:
    if not isinstance(description, str):
        raise ValueError("Deskripsi harus berupa teks")
    cleaned_description = description.strip()
    if not cleaned_description:
        raise ValueError("Deskripsi tidak boleh kosong")
    if len(cleaned_description) > 255:
        raise ValueError("Deskripsi maksimal 255 karakter")
    return cleaned_description


def _pad_sequences(sequences, maxlen: int, padding: str, truncating: str):
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
