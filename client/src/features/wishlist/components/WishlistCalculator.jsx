import { useState } from "react";
import Icon from "../../../components/ui/Icon";
import { useAuth } from "../../../context/useAuth";
import { createWishlist } from "../../../services/wishlistApi";
import { calculateWishlist } from "../utils/calculateWishlist";

const initialFormData = {
  itemName: "",
  targetPrice: "",
  targetMonths: "",
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const formatRupiah = (value) => rupiahFormatter.format(value);

function WishlistCalculator() {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(nextFormData);

    if (error) {
      setError("");
    }

    if (apiError) {
      setApiError("");
    }

    if (result) {
      setResult(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setApiError("");

    try {
      const wishlistResult = calculateWishlist(formData);

      if (!token) {
        setApiError("Silakan login terlebih dahulu untuk menyimpan.");
        setResult(wishlistResult);
        return;
      }

      setIsSaving(true);
      const response = await createWishlist(token, {
        itemName: wishlistResult.itemName,
        targetPrice: wishlistResult.targetPrice,
        targetMonths: wishlistResult.targetMonths,
      });
      setResult(response.data || wishlistResult);
    } catch (validationError) {
      setError(validationError.message || "Gagal menyimpan wishlist.");
      setResult(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      className="panel wishlist-section wishlist-card"
      id="wishlist-calculator"
    >
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name="target" size={18} />
          </span>
          <div>
            <p className="eyebrow">Fitur Aktif</p>
            <h3>Wishlist Calculator</h3>
          </div>
        </div>
        <span className="status-pill">Aktif</span>
      </div>

      <form className="wishlist-form" onSubmit={handleSubmit} noValidate>
        <label>
          <span className="field-label">
            <Icon name="tag" size={14} />
            Nama Barang
          </span>
          <input
            type="text"
            name="itemName"
            autoComplete="off"
            placeholder="Contoh: Laptop Baru"
            value={formData.itemName}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "wishlist-error" : undefined}
            onChange={handleChange}
          />
        </label>

        <div className="wishlist-form-grid">
          <label>
            <span className="field-label">
              <Icon name="wallet" size={14} />
              Harga Barang
            </span>
            <input
              type="number"
              name="targetPrice"
              min="1"
              inputMode="numeric"
              placeholder="8000000"
              value={formData.targetPrice}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "wishlist-error" : undefined}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="field-label">
              <Icon name="clock" size={14} />
              Target Waktu (Bulan)
            </span>
            <input
              type="number"
              name="targetMonths"
              min="1"
              step="any"
              inputMode="decimal"
              placeholder="8"
              value={formData.targetMonths}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "wishlist-error" : undefined}
              onChange={handleChange}
            />
          </label>
        </div>

        <button
          className="submit-button wishlist-submit"
          type="submit"
          disabled={isSaving}
        >
          <span className="button-content">
            <Icon name="target" size={15} />
            {isSaving ? "Menyimpan..." : "Hitung Rencana"}
          </span>
        </button>
      </form>

      {(error || apiError) && (
        <p className="wishlist-error" id="wishlist-error" role="alert">
          {error || apiError}
        </p>
      )}

      {result && (
        <article className="wishlist-result-card" aria-live="polite">
          <div className="wishlist-result-header">
            <div>
              <p className="eyebrow">Rencana Tabungan</p>
              <h4>{result.itemName}</h4>
            </div>
            <button
              className="wishlist-result-close"
              type="button"
              onClick={() => setResult(null)}
              aria-label="Hapus hasil perhitungan"
            >
              x
            </button>
          </div>

          <dl className="wishlist-summary">
            <div>
              <dt>
                <Icon name="wallet" size={14} />
                Harga Target
              </dt>
              <dd>{formatRupiah(result.targetPrice)}</dd>
            </div>
            <div>
              <dt>
                <Icon name="clock" size={14} />
                Target Waktu
              </dt>
              <dd>{result.targetMonths} bulan</dd>
            </div>
            <div>
              <dt>
                <Icon name="calendar" size={14} />
                Per Bulan
              </dt>
              <dd>{formatRupiah(result.monthlySaving)}</dd>
            </div>
            <div>
              <dt>
                <Icon name="calendar" size={14} />
                Per Minggu
              </dt>
              <dd>{formatRupiah(result.weeklySaving)}</dd>
            </div>
            <div className="wishlist-summary-wide">
              <dt>
                <Icon name="calendar" size={14} />
                Per Hari
              </dt>
              <dd>{formatRupiah(result.dailySaving)}</dd>
            </div>
          </dl>

        </article>
      )}
    </section>
  );
}

export default WishlistCalculator;
