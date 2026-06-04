"""Cached loading for transaction classifier model artifacts."""

import json
import os
from functools import lru_cache
from pathlib import Path


class TransactionClassifierError(RuntimeError):
    """Raised when the transaction classifier cannot run safely."""


def configure_tensorflow_runtime() -> None:
    """Set TensorFlow runtime flags before TensorFlow is imported."""
    os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")


def _model_dir() -> Path:
    # Use os.path.join with a relative path to the repository's machine-learning/FixedMLP
    base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "machine-learning", "FixedMLP")
    return Path(base_dir).resolve()


@lru_cache(maxsize=1)
def load_model_artifacts():
    """Load and cache the Keras model, tokenizer, and training config."""
    configure_tensorflow_runtime()

    model_dir = _model_dir()
    model_path = model_dir / "mlp_functional.keras"
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
    except ModuleNotFoundError as exc:
        if exc.name and exc.name.startswith("tensorflow"):
            raise TransactionClassifierError(
                "TensorFlow belum terinstall. Jalankan `pip install -r requirements.txt`."
            ) from exc
        raise TransactionClassifierError(
            "Dependensi model klasifikasi transaksi belum lengkap."
        ) from exc

    try:
        model = load_model(str(model_path), compile=False)
        tokenizer = tokenizer_from_json(tokenizer_path.read_text(encoding="utf-8"))
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except TransactionClassifierError:
        raise
    except Exception as exc:
        raise TransactionClassifierError(
            "Gagal memuat model klasifikasi transaksi."
        ) from exc

    if not config.get("classes"):
        raise TransactionClassifierError("Konfigurasi model tidak memiliki daftar kelas.")
    if not config.get("max_len"):
        raise TransactionClassifierError("Konfigurasi model tidak memiliki max_len.")

    return model, tokenizer, config
