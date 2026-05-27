"""Label mapping for the transaction classifier output."""

# Mirrors the labels produced by Notebook_Cleaning_Data.ipynb and the LSTM
# training config so API consumers receive user-friendly category names.
MODEL_LABEL_TO_CATEGORY = {
    "entertainment": "Entertainment",
    "kesehatan": "Kesehatan",
    "konsumsi": "Konsumsi",
    "langganan": "Langganan",
    "tagihan": "Tagihan",
    "transport": "Transportasi",
}

CATEGORY_TO_MODEL_LABEL = {
    category: label for label, category in MODEL_LABEL_TO_CATEGORY.items()
}
