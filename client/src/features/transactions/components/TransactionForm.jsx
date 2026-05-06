import { TRANSACTION_CATEGORIES } from "../constants/transactionCategories";
import { useTransactionForm } from "../hooks/useTransactionForm";
import { formatCurrency } from "../../../utils/formatCurrency";

function TransactionForm({ availableBalance, onAddTransaction }) {
  const {
    formData,
    isExpense,
    isSubmitDisabled,
    message,
    handleChange,
    handleSubmit,
    handleTypeChange,
  } = useTransactionForm({ availableBalance, onAddTransaction });

  return (
    <section className="panel transaction-form-card" id="transaksi">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Fitur Aktif</p>
          <h3>Input Transaksi</h3>
        </div>
        <span className="status-pill">Berfungsi</span>
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="type-toggle" aria-label="Pilih tipe transaksi">
          <button
            className={isExpense ? "active" : ""}
            type="button"
            onClick={() => handleTypeChange("expense")}
          >
            Pengeluaran
          </button>
          <button
            className={formData.type === "income" ? "active" : ""}
            type="button"
            onClick={() => handleTypeChange("income")}
          >
            Pemasukan
          </button>
        </div>

        <label>
          Deskripsi
          <input
            type="text"
            name="description"
            placeholder="Contoh: beli makan siang"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <div className={isExpense ? "form-grid" : "form-grid single-field"}>
          <label>
            Nominal
            <input
              type="number"
              name="amount"
              min="1"
              max={isExpense ? availableBalance : undefined}
              placeholder="25000"
              value={formData.amount}
              onChange={handleChange}
            />
            {isExpense && (
              <small className="field-hint">
                Maksimal: {formatCurrency(availableBalance)}
              </small>
            )}
          </label>

          <label>
            Tanggal
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className={isExpense ? "form-grid" : "form-grid single-field"}>
          {isExpense && (
            <label>
              Kategori
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {TRANSACTION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Metode
            <select name="method" value={formData.method} onChange={handleChange}>
              <option value="Tunai">Tunai</option>
              <option value="Bank">Bank</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </label>
        </div>

        <button
          className="submit-button"
          type="submit"
          disabled={isSubmitDisabled}
        >
          Simpan Transaksi
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </section>
  );
}

export default TransactionForm;
