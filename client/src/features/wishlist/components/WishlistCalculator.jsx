import { useState } from "react";
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

const getStatusClassName = (status) => {
  return status.toLowerCase().replace(/\s+/g, "-");
};

function WishlistCalculator() {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
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

    if (result) {
      try {
        setResult(calculateWishlist(nextFormData));
      } catch {
        setResult(null);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    try {
      const wishlistResult = calculateWishlist(formData);
      setResult(wishlistResult);
      setError("");
    } catch (validationError) {
      setError(validationError.message);
      setResult(null);
    }
  };

  return (
    <section
      className="panel wishlist-section wishlist-card"
      id="wishlist-calculator"
    >
      <div className="panel-header">
        <div>
          <p className="eyebrow">Fitur Aktif</p>
          <h3>Wishlist Calculator</h3>
        </div>
        <span className="status-pill">Frontend-only</span>
      </div>

      <form className="wishlist-form" onSubmit={handleSubmit} noValidate>
        <label>
          Nama Barang
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
            Harga Barang
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
            Target Waktu (Bulan)
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

        <button className="submit-button wishlist-submit" type="submit">
          Hitung Rencana
        </button>
      </form>

      {error && (
        <p className="wishlist-error" id="wishlist-error" role="alert">
          {error}
        </p>
      )}

      {result && (
        <article className="wishlist-result-card" aria-live="polite">
          <div className="wishlist-result-header">
            <div>
              <p className="eyebrow">Rencana Tabungan</p>
              <h4>{result.itemName}</h4>
            </div>
            <span
              className={`wishlist-status ${getStatusClassName(result.status)}`}
            >
              {result.status}
            </span>
          </div>

          <dl className="wishlist-summary">
            <div>
              <dt>Harga Target</dt>
              <dd>{formatRupiah(result.targetPrice)}</dd>
            </div>
            <div>
              <dt>Target Waktu</dt>
              <dd>{result.targetMonths} bulan</dd>
            </div>
            <div>
              <dt>Per Bulan</dt>
              <dd>{formatRupiah(result.monthlySaving)}</dd>
            </div>
            <div>
              <dt>Per Minggu</dt>
              <dd>{formatRupiah(result.weeklySaving)}</dd>
            </div>
            <div className="wishlist-summary-wide">
              <dt>Per Hari</dt>
              <dd>{formatRupiah(result.dailySaving)}</dd>
            </div>
          </dl>

          <p className="wishlist-message">{result.message}</p>
        </article>
      )}
    </section>
  );
}

export default WishlistCalculator;
