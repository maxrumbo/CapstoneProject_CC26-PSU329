import { useCallback, useEffect, useState } from "react";
import Icon from "../../../components/ui/Icon";
import { useAuth } from "../../../context/useAuth";
import {
  createWishlist,
  deleteWishlist,
  getWishlists,
} from "../../../services/wishlistApi";
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

const buildWishlistPlan = (wishlist) => ({
  ...wishlist,
  monthlySaving:
    wishlist.monthlySaving > 0
      ? wishlist.monthlySaving
      : wishlist.targetPrice / wishlist.targetMonths,
  weeklySaving:
    wishlist.weeklySaving > 0
      ? wishlist.weeklySaving
      : wishlist.targetPrice / wishlist.targetMonths / 4,
  dailySaving:
    wishlist.dailySaving > 0
      ? wishlist.dailySaving
      : wishlist.targetPrice / wishlist.targetMonths / 30,
});

function WishlistCalculator() {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [result, setResult] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [expandedWishlistId, setExpandedWishlistId] = useState(null);

  const loadWishlists = useCallback(async () => {
    if (!token) {
      setWishlists([]);
      return;
    }

    setIsLoadingList(true);
    setApiError("");

    try {
      const response = await getWishlists(token);
      setWishlists(response.data || []);
    } catch (err) {
      setApiError(err.message || "Gagal memuat wishlist.");
    } finally {
      setIsLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    Promise.resolve().then(loadWishlists);
  }, [loadWishlists]);

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
      const savedWishlist = response.data || wishlistResult;
      setResult(savedWishlist);
      setWishlists((prevWishlists) => [
        savedWishlist,
        ...prevWishlists.filter((item) => item.id !== savedWishlist.id),
      ]);
    } catch (validationError) {
      setError(validationError.message || "Gagal menyimpan wishlist.");
      setResult(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWishlist = async (wishlistId) => {
    if (!token) {
      setApiError("Silakan login terlebih dahulu.");
      return;
    }

    setDeletingId(wishlistId);
    setApiError("");

    try {
      await deleteWishlist(token, wishlistId);
      setWishlists((prevWishlists) =>
        prevWishlists.filter((wishlist) => wishlist.id !== wishlistId)
      );
      setExpandedWishlistId((currentId) =>
        currentId === wishlistId ? null : currentId
      );

      if (result?.id === wishlistId) {
        setResult(null);
      }
    } catch (err) {
      setApiError(err.message || "Gagal menghapus wishlist.");
    } finally {
      setDeletingId(null);
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
            <p className="eyebrow">Wishlist</p>
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
              step="1"
              inputMode="numeric"
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

      {token && (
        <section className="wishlist-list-section" aria-label="Wishlist tersimpan">
          <div className="wishlist-list-header">
            <p className="eyebrow">Wishlist Tersimpan</p>
            {isLoadingList && <span className="wishlist-loading-label">Memuat...</span>}
          </div>

          <div className="wishlist-list">
            {wishlists.length ? (
              wishlists.map((wishlist) => {
                const isExpanded = expandedWishlistId === wishlist.id;
                const wishlistPlan = isExpanded ? buildWishlistPlan(wishlist) : null;

                return (
                  <article
                    className={
                      isExpanded
                        ? "wishlist-list-item wishlist-list-item-expanded"
                        : "wishlist-list-item"
                    }
                    key={wishlist.id}
                  >
                    <div className="wishlist-list-summary-row">
                      <div>
                        <strong>{wishlist.itemName}</strong>
                        <span>
                          {formatRupiah(wishlist.targetPrice)} / {wishlist.targetMonths} bulan
                        </span>
                      </div>
                      <div className="wishlist-list-actions">
                        <button
                          className="status-pill wishlist-status-button"
                          type="button"
                          onClick={() =>
                            setExpandedWishlistId((currentId) =>
                              currentId === wishlist.id ? null : wishlist.id
                            )
                          }
                          aria-expanded={isExpanded}
                          aria-controls={`wishlist-plan-${wishlist.id}`}
                        >
                          {wishlist.status}
                        </button>
                        <button
                          className="wishlist-delete-button"
                          type="button"
                          disabled={deletingId === wishlist.id}
                          onClick={() => handleDeleteWishlist(wishlist.id)}
                          aria-label={`Hapus wishlist ${wishlist.itemName}`}
                        >
                          x
                        </button>
                      </div>
                    </div>

                    {wishlistPlan && (
                      <div
                        className="wishlist-saved-plan"
                        id={`wishlist-plan-${wishlist.id}`}
                        aria-live="polite"
                      >
                        <div className="wishlist-result-header">
                          <div>
                            <p className="eyebrow">Rencana Tabungan</p>
                            <h4>{wishlistPlan.itemName}</h4>
                          </div>
                        </div>

                        <dl className="wishlist-summary">
                          <div>
                            <dt>
                              <Icon name="wallet" size={14} />
                              Harga Target
                            </dt>
                            <dd>{formatRupiah(wishlistPlan.targetPrice)}</dd>
                          </div>
                          <div>
                            <dt>
                              <Icon name="clock" size={14} />
                              Target Waktu
                            </dt>
                            <dd>{wishlistPlan.targetMonths} bulan</dd>
                          </div>
                          <div>
                            <dt>
                              <Icon name="calendar" size={14} />
                              Per Bulan
                            </dt>
                            <dd>{formatRupiah(wishlistPlan.monthlySaving)}</dd>
                          </div>
                          <div>
                            <dt>
                              <Icon name="calendar" size={14} />
                              Per Minggu
                            </dt>
                            <dd>{formatRupiah(wishlistPlan.weeklySaving)}</dd>
                          </div>
                          <div className="wishlist-summary-wide">
                            <dt>
                              <Icon name="calendar" size={14} />
                              Per Hari
                            </dt>
                            <dd>{formatRupiah(wishlistPlan.dailySaving)}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                Belum ada wishlist tersimpan.
              </div>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

export default WishlistCalculator;
