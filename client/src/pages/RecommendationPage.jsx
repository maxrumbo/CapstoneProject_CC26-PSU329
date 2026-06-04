import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import Icon from "../components/ui/Icon";
import { useAuth } from "../context/useAuth";
import { getFinancialAdvice } from "../services/adviceApi";
import { formatCurrency } from "../utils/formatCurrency";

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

function RecommendationPage({ onProfileClick, userName }) {
  const { token } = useAuth();
  const [adviceData, setAdviceData] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(token));
  const [error, setError] = useState("");

  const loadAdvice = useCallback(async () => {
    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      setIsLoading(false);
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
  }, [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isActive = true;

    getFinancialAdvice(token)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setAdviceData(response.data);
        setError("");
      })
      .catch((err) => {
        if (!isActive) {
          return;
        }

        setAdviceData(null);
        setError(err.message || "Gagal memuat rekomendasi AI.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const advice = adviceData?.advice;
  const meta = adviceData?.meta;
  const status = advice?.status || "AMAN";
  const statusClass = getStatusClass(status);
  const suggestions = Array.isArray(advice?.saran) ? advice.saran : [];
  const displayError =
    error || (!token ? "Sesi login tidak ditemukan. Silakan login ulang." : "");

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
    <>
      <DashboardHeader
        eyebrow="Rekomendasi AI"
        title="Rekomendasi AI"
        description="Pantau status pengeluaran dan dapatkan saran hemat personal dari Gemini AI."
        icon="ai"
        onProfileClick={onProfileClick}
        userName={userName}
      />

      {isLoading ? (
        <div className="page-loading" role="status">
          Memuat rekomendasi AI...
        </div>
      ) : displayError ? (
        <section className="panel recommendation-error" role="alert">
          <span className="recommendation-error-icon">
            <Icon name="ai" size={22} />
          </span>
          <div>
            <p className="eyebrow">Rekomendasi belum tersedia</p>
            <h3>Perlu sedikit setup dulu</h3>
            <p>{displayError}</p>
            <button className="submit-button" type="button" onClick={loadAdvice}>
              Coba lagi
            </button>
          </div>
        </section>
      ) : (
        <section className="recommendation-stack">
          <article className={`recommendation-hero ${statusClass}`}>
            <div className="recommendation-hero-content">
              <p className="eyebrow">Status bulan ini</p>
              <div className="recommendation-status-line">
                <span className="recommendation-emoji">
                  {advice?.emoji || ""}
                </span>
                <h3>{statusLabels[status] || status}</h3>
              </div>
              <p>{advice?.ringkasan || statusDescriptions[status]}</p>
            </div>

            {meta && (
              <div className="recommendation-month-card">
                <span>{meta.month}</span>
                <strong>
                  Hari {meta.day_of_month} dari {meta.days_in_month}
                </strong>
                <small>{meta.remaining_days} hari tersisa</small>
              </div>
            )}
          </article>

          <div className="recommendation-metric-grid">
            {metrics.map((metric) => (
              <article className="recommendation-metric" key={metric.label}>
                <span>
                  <Icon name={metric.icon} size={17} />
                </span>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>

          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <span className="panel-icon">
                  <Icon name="ai" size={18} />
                </span>
                <div>
                  <p className="eyebrow">Saran Hemat</p>
                  <h3>Langkah yang bisa kamu lakukan</h3>
                </div>
              </div>
              <button
                className="budget-update-button"
                type="button"
                onClick={loadAdvice}
              >
                Refresh
              </button>
            </div>

            <div className="recommendation-list">
              {suggestions.map((suggestion) => (
                <article className="recommendation-suggestion" key={suggestion}>
                  <span>
                    <Icon name="check" size={15} />
                  </span>
                  <p>{suggestion}</p>
                </article>
              ))}
            </div>

            {advice?.motivasi && (
              <p className="recommendation-motivation">{advice.motivasi}</p>
            )}
          </section>
        </section>
      )}
    </>
  );
}

export default RecommendationPage;
