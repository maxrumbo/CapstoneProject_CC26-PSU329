"""Backward-compatible public service for transaction classification."""

from app.services.ml.artifacts import TransactionClassifierError


def predict_transaction_category(description: str) -> dict:
    try:
        from app.services.ml.predictor import predict_transaction_category as _predict

        return _predict(description)
    except ValueError:
        raise
    except TransactionClassifierError:
        raise
    except Exception as exc:
        raise TransactionClassifierError("Gagal melakukan prediksi kategori.") from exc
