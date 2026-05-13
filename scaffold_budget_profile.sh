#!/usr/bin/env bash
# =============================================================================
# scaffold_budget_profile.sh
# Jalankan dari root folder `server/`:
#   chmod +x scaffold_budget_profile.sh && ./scaffold_budget_profile.sh
# =============================================================================

set -e  # Hentikan script jika ada perintah yang gagal

BASE="app"

echo "🌴 SAWIT — Scaffolding fitur Budget & Profile"
echo "============================================="

# ── 1. Buat folder crud/ jika belum ada ──────────────────────────────────────
mkdir -p "${BASE}/crud"

# ── 2. Buat semua file kosong ─────────────────────────────────────────────────
FILES=(
    "${BASE}/crud/__init__.py"
    "${BASE}/crud/budget.py"
    "${BASE}/models/budget.py"
    "${BASE}/schemas/budget.py"
    "${BASE}/api/routes/budget.py"
    "${BASE}/api/routes/profile.py"
)

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo "  ⚠️  Sudah ada, dilewati  : $FILE"
    else
        touch "$FILE"
        echo "  ✅ Dibuat                : $FILE"
    fi
done

echo ""
echo "Struktur yang dibuat:"
echo ""
echo "  app/"
echo "  ├── crud/"
echo "  │   ├── __init__.py"
echo "  │   └── budget.py          ← logika UPSERT & query summary"
echo "  ├── models/"
echo "  │   └── budget.py          ← ORM UserBudget (tabel user_budgets)"
echo "  ├── schemas/"
echo "  │   └── budget.py          ← Pydantic request & response"
echo "  └── api/routes/"
echo "      ├── budget.py          ← POST /set, GET /summary/{month}"
echo "      └── profile.py         ← GET /profile"
echo ""
echo "Langkah berikutnya:"
echo "  1. Isi file-file di atas dengan kode yang sudah disiapkan."
echo "  2. Pastikan main.py sudah mendaftarkan kedua router."
echo "  3. Jalankan: uvicorn main:app --reload"
echo ""
echo "✅ Scaffolding selesai."
