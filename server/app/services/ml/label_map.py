"""Label mapping for the transaction classifier output."""

# FIX: Kunci harus PERSIS sama dengan nilai `classes` di model_config.json
# yaitu PascalCase (bukan lowercase seperti sebelumnya).
# Sebelumnya: "entertainment": "Entertainment" -> lookup selalu None
# Sekarang  : "Entertainment":  "Entertainment" -> lookup berhasil
MODEL_LABEL_TO_CATEGORY = {
    "Entertainment": "Entertainment",
    "Kesehatan": "Kesehatan",
    "Konsumsi": "Konsumsi",
    "Langganan": "Langganan",
    "Tagihan": "Tagihan",
    "Transport": "Transportasi",
}

CATEGORY_TO_MODEL_LABEL = {
    category: label for label, category in MODEL_LABEL_TO_CATEGORY.items()
}
