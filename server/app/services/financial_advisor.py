import json
import re
from google import genai
from app.core.config import settings


def get_financial_advice(
    budget: float,
    total_spent: float,
    day_of_month: int,
    days_in_month: int,
    top_categories: list[str],
) -> dict:

    time_progress = day_of_month / days_in_month
    spending_ratio = total_spent / budget if budget > 0 else 0
    burn_rate = spending_ratio / time_progress if time_progress > 0 else 0
    remaining_budget = budget - total_spent
    remaining_days = days_in_month - day_of_month

    if burn_rate > 1.5:
        status = "BAHAYA"
    elif burn_rate > 1.2:
        status = "WASPADA"
    else:
        status = "AMAN"

    top_cat_str = ', '.join(top_categories) if top_categories else "belum ada data"

    prompt = f"""
Kamu adalah asisten keuangan pribadi untuk pengguna muda Indonesia (Gen Z).
Gunakan bahasa yang santai, tidak menggurui, dan tetap informatif.

DATA KEUANGAN PENGGUNA BULAN INI:
- Budget bulanan: Rp{budget:,.0f}
- Total pengeluaran saat ini: Rp{total_spent:,.0f}
- Sisa budget: Rp{remaining_budget:,.0f}
- Hari ke-{day_of_month} dari {days_in_month} hari ({time_progress*100:.0f}% bulan sudah berjalan)
- Sisa hari dalam bulan ini: {remaining_days} hari
- Persentase budget yang sudah terpakai: {spending_ratio*100:.0f}%
- Kategori pengeluaran terboros: {top_cat_str}
- Status keuangan terdeteksi: {status}

Balas HANYA dalam format JSON ini, tanpa teks apapun di luar JSON:
{{
  "status": "{status}",
  "emoji": "<1 emoji yang cocok>",
  "ringkasan": "<1 kalimat ringkasan kondisi keuangan, sebut angkanya>",
  "saran": [
    "<saran konkret 1>",
    "<saran konkret 2>",
    "<saran konkret 3>"
  ],
  "motivasi": "<1 kalimat motivasi singkat khas Gen Z>"
}}
"""

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        # model="gemini-2.0-flash",
        # model="gemini-2.0-flash-lite",
        # model="gemini-1.5-flash",
        # model="gemini-1.5-flash-lite",
        contents=prompt
    )

    raw = response.text
    clean = re.sub(r"```json|```", "", raw).strip()
    return json.loads(clean)