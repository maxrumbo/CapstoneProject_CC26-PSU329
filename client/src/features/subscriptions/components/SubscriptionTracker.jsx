import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../../../components/ui/Icon";
import { useAuth } from "../../../context/useAuth";
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionSummary,
  getSubscriptions,
  updateSubscription,
} from "../../../services/subscriptionsApi";

const initialFormData = {
  name: "",
  amount: "",
  nextBillingDate: "",
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatRupiah = (value) => rupiahFormatter.format(value || 0);

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
};

const validateForm = (formData) => {
  const amount = Number(formData.amount);

  if (!formData.name.trim()) {
    return "Nama langganan tidak boleh kosong.";
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Nominal langganan harus lebih dari 0.";
  }

  if (!formData.nextBillingDate) {
    return "Tanggal tagihan berikutnya wajib diisi.";
  }

  return "";
};

function SubscriptionTracker() {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({ totalCost: 0 });
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeCount = subscriptions.length;
  const averageCost = useMemo(
    () => (activeCount ? summary.totalCost / activeCount : 0),
    [activeCount, summary.totalCost]
  );

  const loadSubscriptions = useCallback(async () => {
    if (!token) {
      setSubscriptions([]);
      setSummary({ totalCost: 0 });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [listResponse, summaryResponse] = await Promise.all([
        getSubscriptions(token),
        getSubscriptionSummary(token),
      ]);

      setSubscriptions(listResponse.data || []);
      setSummary(summaryResponse.data || { totalCost: 0 });
    } catch (err) {
      setError(err.message || "Gagal memuat subscription.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    Promise.resolve().then(loadSubscriptions);
  }, [loadSubscriptions]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingSubscription(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (message) {
      setMessage("");
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name || "",
      amount: subscription.amount ? String(subscription.amount) : "",
      nextBillingDate: subscription.nextBillingDate || "",
    });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm(formData);
    if (validationMessage) {
      setError(validationMessage);
      setMessage("");
      return;
    }

    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setMessage("");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingSubscription) {
        await updateSubscription(token, editingSubscription.id, formData);
        setMessage("Subscription berhasil diperbarui.");
      } else {
        await createSubscription(token, formData);
        setMessage("Subscription berhasil ditambahkan.");
      }

      resetForm();
      await loadSubscriptions();
    } catch (err) {
      setError(err.message || "Gagal menyimpan subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (subscriptionId) => {
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      return;
    }

    setDeletingId(subscriptionId);
    setError("");
    setMessage("");

    try {
      await deleteSubscription(token, subscriptionId);
      if (editingSubscription?.id === subscriptionId) {
        resetForm();
      }
      setMessage("Subscription berhasil dihapus.");
      await loadSubscriptions();
    } catch (err) {
      setError(err.message || "Gagal menghapus subscription.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="subscription-layout" id="subscription">
      <div className="subscription-summary-grid" aria-label="Ringkasan subscription">
        <article className="subscription-summary-card primary">
          <span className="subscription-summary-icon">
            <Icon name="wallet" size={18} />
          </span>
          <div>
            <p className="eyebrow">Total Bulanan</p>
            <strong>{formatRupiah(summary.totalCost)}</strong>
            <span>Diambil dari ringkasan backend</span>
          </div>
        </article>

        <article className="subscription-summary-card">
          <span className="subscription-summary-icon">
            <Icon name="subscription" size={18} />
          </span>
          <div>
            <p className="eyebrow">Langganan Aktif</p>
            <strong>{activeCount}</strong>
            <span>Siklus ditampilkan sebagai bulanan</span>
          </div>
        </article>

        <article className="subscription-summary-card">
          <span className="subscription-summary-icon">
            <Icon name="chart" size={18} />
          </span>
          <div>
            <p className="eyebrow">Rata-rata</p>
            <strong>{formatRupiah(averageCost)}</strong>
            <span>Per subscription aktif</span>
          </div>
        </article>
      </div>

      <div className="subscription-content-grid">
        <section className="panel subscription-form-card">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-icon">
                <Icon name="form" size={18} />
              </span>
              <div>
                <p className="eyebrow">Form Langganan</p>
                <h3>{editingSubscription ? "Edit Subscription" : "Tambah Subscription"}</h3>
              </div>
            </div>
            <span className="status-pill">Bulanan</span>
          </div>

          <form className="subscription-form" onSubmit={handleSubmit} noValidate>
            <label>
              <span className="field-label">
                <Icon name="tag" size={14} />
                Nama Langganan
              </span>
              <input
                type="text"
                name="name"
                autoComplete="off"
                placeholder="Contoh: Netflix"
                value={formData.name}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "subscription-feedback" : undefined}
                onChange={handleChange}
              />
            </label>

            <div className="subscription-form-grid">
              <label>
                <span className="field-label">
                  <Icon name="wallet" size={14} />
                  Nominal Bulanan
                </span>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  inputMode="numeric"
                  placeholder="65000"
                  value={formData.amount}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "subscription-feedback" : undefined}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span className="field-label">
                  <Icon name="calendar" size={14} />
                  Tagihan Berikutnya
                </span>
                <input
                  type="date"
                  name="nextBillingDate"
                  value={formData.nextBillingDate}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "subscription-feedback" : undefined}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              <span className="field-label">
                <Icon name="repeat" size={14} />
                Siklus Pembayaran
              </span>
              <input type="text" value="Bulanan" disabled readOnly />
              <span className="field-hint">
                Backend saat ini belum menyimpan pilihan siklus.
              </span>
            </label>

            <div className="form-actions">
              <button className="submit-button" type="submit" disabled={isSaving}>
                <span className="button-content">
                  <Icon name="save" size={15} />
                  {isSaving
                    ? "Menyimpan..."
                    : editingSubscription
                      ? "Simpan Perubahan"
                      : "Tambah Subscription"}
                </span>
              </button>

              {editingSubscription && (
                <button
                  className="subscription-secondary-button"
                  type="button"
                  disabled={isSaving}
                  onClick={resetForm}
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          {(error || message) && (
            <p
              className={error ? "subscription-feedback error" : "subscription-feedback"}
              id="subscription-feedback"
              role={error ? "alert" : "status"}
            >
              {error || message}
            </p>
          )}
        </section>

        <section className="panel subscription-list-card">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-icon">
                <Icon name="subscription" size={18} />
              </span>
              <div>
                <p className="eyebrow">Daftar Aktif</p>
                <h3>Subscription Tersimpan</h3>
              </div>
            </div>
            {isLoading && <span className="subscription-loading-label">Memuat...</span>}
          </div>

          {isLoading && !subscriptions.length ? (
            <div className="empty-state">Memuat subscription...</div>
          ) : subscriptions.length ? (
            <div className="subscription-list">
              {subscriptions.map((subscription) => (
                <article className="subscription-item" key={subscription.id}>
                  <div className="subscription-item-main">
                    <span className="subscription-item-icon">
                      <Icon name="subscription" size={16} />
                    </span>
                    <div>
                      <strong>{subscription.name}</strong>
                      <span>
                        {formatRupiah(subscription.amount)} / bulan
                      </span>
                    </div>
                  </div>

                  <div className="subscription-item-meta">
                    <span>
                      <Icon name="calendar" size={13} />
                      {formatDate(subscription.nextBillingDate)}
                    </span>
                    <span>
                      <Icon name="repeat" size={13} />
                      Bulanan
                    </span>
                  </div>

                  <div className="subscription-item-actions">
                    <button
                      className="subscription-action-button"
                      type="button"
                      onClick={() => handleEdit(subscription)}
                    >
                      Edit
                    </button>
                    <button
                      className="subscription-action-button danger"
                      type="button"
                      disabled={deletingId === subscription.id}
                      onClick={() => handleDelete(subscription.id)}
                    >
                      {deletingId === subscription.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Belum ada subscription tersimpan.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default SubscriptionTracker;
