import { useCallback, useMemo, useState } from "react";
import Icon from "../ui/Icon";
import { useAuth } from "../../context/useAuth";
import { getFinancialAdvice } from "../../services/adviceApi";
import { formatCurrency } from "../../utils/formatCurrency";

const statusLabels = {
  AMAN: "Aman",
  WASPADA: "Waspada",
  BAHAYA: "Bahaya",
};

const statusDescriptions = {
  AMAN: "Pengeluaran masih selaras dengan budget bulan ini.",
  WASPADA: "Pola pengeluaran mulai lebih cepat dari budget.",
  BAHAYA: "Pengeluaran berisiko besar melewati batas budget.",
};

const getStatusClass = (status = "") => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "bahaya") {
    return "danger";
  }

  if (normalizedStatus === "waspada") {
    return "warning";
  }

  return "safe";
};

const formatPercent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

function FloatingAnalisisAi() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [adviceData, setAdviceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAdvice = useCallback(async () => {
    if (isLoading) {
      return;
    }

    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getFinancialAdvice(token);
      setAdviceData(response.data);
    } catch (err) {
      setAdviceData(null);
      setError(err.message || "Gagal memuat rekomendasi AI.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, token]);

  const handleToggle = () => {
    const nextOpenState = !isOpen;
    setIsOpen(nextOpenState);

    if (nextOpenState && !adviceData && !error) {
      loadAdvice();
    }
  };

  const advice = adviceData?.advice;
  const meta = adviceData?.meta;
  const status = advice?.status || "AMAN";
  const statusClass = getStatusClass(status);
  const suggestions = Array.isArray(advice?.saran) ? advice.saran : [];

  const metrics = useMemo(() => {
    if (!meta) {
      return [];
    }

    return [
      {
        label: "Budget Bulanan",
        value: formatCurrency(meta.total_budget),
        icon: "budget",
      },
      {
        label: "Pengeluaran",
        value: formatCurrency(meta.total_spent),
        icon: "expense",
      },
      {
        label: "Sisa Budget",
        value: formatCurrency(meta.remaining),
        icon: "wallet",
      },
      {
        label: "Rata-rata Harian",
        value: formatCurrency(meta.daily_average),
        icon: "chart",
      },
      {
        label: "Proyeksi Akhir Bulan",
        value: formatCurrency(meta.projected_monthly_spending),
        icon: "calendar",
      },
      {
        label: "Budget Terpakai",
        value: formatPercent(meta.spending_ratio),
        icon: "target",
      },
    ];
  }, [meta]);

  return (
    <section
      className={`analisis-ai ${isOpen ? "open" : ""}`}
      aria-label="Analisis AI mengambang"
    >
      {isOpen && (
        <aside className="analisis-ai-panel">
          <header className="analisis-ai-header">
            <div className="analisis-ai-title">
              <span aria-hidden="true">
                <Icon name="ai" size={18} />
              </span>
              <div>
                <strong>Analisis AI</strong>
                <small>Rekomendasi keuangan personal</small>
              </div>
            </div>

            <button
              className="analisis-ai-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup analisis AI"
            >
              x
            </button>
          </header>

          <div className="analisis-ai-body">
            {isLoading ? (
              <div className="analisis-ai-loading" role="status">
                Memuat rekomendasi AI...
              </div>
            ) : error ? (
              <div className="analisis-ai-empty" role="alert">
                <span aria-hidden="true">
                  <Icon name="ai" size={22} />
                </span>
                <p className="eyebrow">Rekomendasi belum tersedia</p>
                <h3>Perlu sedikit setup dulu</h3>
                <p>{error}</p>
                <button type="button" onClick={loadAdvice}>
                  Coba lagi
                </button>
              </div>
            ) : adviceData ? (
              <div className="analisis-ai-result">
                <article className={`analisis-ai-hero ${statusClass}`}>
                  <div>
                    <p className="eyebrow">Status bulan ini</p>
                    <div className="analisis-ai-status-line">
                      <span>{advice?.emoji || ""}</span>
                      <h3>{statusLabels[status] || status}</h3>
                    </div>
                    <p>{advice?.ringkasan || statusDescriptions[status]}</p>
                  </div>

                  {meta && (
                    <div className="analisis-ai-month">
                      <span>{meta.month}</span>
                      <strong>
                        Hari {meta.day_of_month} dari {meta.days_in_month}
                      </strong>
                      <small>{meta.remaining_days} hari tersisa</small>
                    </div>
                  )}
                </article>

                <div className="analisis-ai-metrics">
                  {metrics.map((metric) => (
                    <article key={metric.label}>
                      <span aria-hidden="true">
                        <Icon name={metric.icon} size={16} />
                      </span>
                      <p>{metric.label}</p>
                      <strong>{metric.value}</strong>
                    </article>
                  ))}
                </div>

                <section className="analisis-ai-suggestions">
                  <div className="analisis-ai-section-header">
                    <div>
                      <p className="eyebrow">Saran Hemat</p>
                      <h3>Langkah yang bisa kamu lakukan</h3>
                    </div>
                    <button type="button" onClick={loadAdvice}>
                      Refresh
                    </button>
                  </div>

                  <div className="analisis-ai-list">
                    {suggestions.map((suggestion) => (
                      <article key={suggestion}>
                        <span aria-hidden="true">
                          <Icon name="check" size={14} />
                        </span>
                        <p>{suggestion}</p>
                      </article>
                    ))}
                  </div>

                  {advice?.motivasi && (
                    <p className="analisis-ai-motivation">{advice.motivasi}</p>
                  )}
                </section>
              </div>
            ) : (
              <div className="analisis-ai-empty">
                <span aria-hidden="true">
                  <Icon name="ai" size={22} />
                </span>
                <p className="eyebrow">Analisis AI</p>
                <h3>Cek kondisi budget bulan ini</h3>
                <p>
                  Tekan tombol di bawah untuk menampilkan analisis AI dari data
                  budget dan pengeluaranmu.
                </p>
                <button type="button" onClick={loadAdvice}>
                  Mulai analisis
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      <button
        className="analisis-ai-toggle"
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Tutup analisis AI" : "Buka analisis AI"}
      >
        <Icon name="ai" size={21} />
        <span>Analisis AI</span>
      </button>
    </section>
  );
}

export default FloatingAnalisisAi;
