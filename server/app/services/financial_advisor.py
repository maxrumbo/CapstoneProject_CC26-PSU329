import json
import re
from importlib import import_module
from app.core.config import settings


def _generate_gemini_text(prompt: str) -> str:
    try:
        genai = import_module("google.genai")
    except ImportError as exc:
        raise RuntimeError(
            "Dependency Gemini belum terinstall. Jalankan: pip install google-genai"
        ) from exc

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return response.text


def calculate_warning_metrics(
    budget: float,
    total_spent: float,
    day_of_month: int,
    days_in_month: int,
) -> dict:
    safe_day = max(day_of_month, 1)
    safe_days_in_month = max(days_in_month, safe_day)
    time_progress = safe_day / safe_days_in_month
    spending_ratio = total_spent / budget if budget > 0 else 0
    daily_average = total_spent / safe_day
    projected_monthly_spending = daily_average * safe_days_in_month
    remaining_budget = budget - total_spent
    remaining_days = max(safe_days_in_month - safe_day, 0)

    is_budget_used_too_fast = spending_ratio >= 0.8 and time_progress < 0.8

    if total_spent > budget or projected_monthly_spending > budget * 1.2:
        status = "BAHAYA"
    elif projected_monthly_spending > budget or is_budget_used_too_fast:
        status = "WASPADA"
    else:
        status = "AMAN"

    return {
        "status": status,
        "time_progress": time_progress,
        "spending_ratio": spending_ratio,
        "daily_average": daily_average,
        "projected_monthly_spending": projected_monthly_spending,
        "remaining_budget": remaining_budget,
        "remaining_days": remaining_days,
    }


def get_financial_advice(
    budget: float,
    total_spent: float,
    day_of_month: int,
    days_in_month: int,
    top_categories: list[str],
) -> dict:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY belum dikonfigurasi di environment backend.")

    metrics = calculate_warning_metrics(
        budget=budget,
        total_spent=total_spent,
        day_of_month=day_of_month,
        days_in_month=days_in_month,
    )
    status = metrics["status"]
    time_progress = metrics["time_progress"]
    spending_ratio = metrics["spending_ratio"]
    remaining_budget = metrics["remaining_budget"]
    remaining_days = metrics["remaining_days"]
    daily_average = metrics["daily_average"]
    projected_monthly_spending = metrics["projected_monthly_spending"]

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
- Rata-rata pengeluaran harian: Rp{daily_average:,.0f}
- Proyeksi pengeluaran akhir bulan: Rp{projected_monthly_spending:,.0f}
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

    raw = _generate_gemini_text(prompt)
    clean = re.sub(r"```json|```", "", raw).strip()
    advice = json.loads(clean)
    advice["status"] = status
    return advice
