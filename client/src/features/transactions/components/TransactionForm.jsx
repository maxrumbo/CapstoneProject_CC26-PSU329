import Icon from "../../../components/ui/Icon";
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
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name="form" size={18} />
          </span>
          <div>
            <p className="eyebrow">Fitur Aktif</p>
            <h3>Input Transaksi</h3>
          </div>
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
            <Icon name="expense" size={15} />
            Pengeluaran
          </button>
          <button
            className={formData.type === "income" ? "active" : ""}
            type="button"
            onClick={() => handleTypeChange("income")}
          >
            <Icon name="income" size={15} />
            Pemasukan
          </button>
        </div>

        <label>
          <span className="field-label">
            <Icon name="receipt" size={14} />
            Deskripsi
          </span>
          <input
            type="text"
            name="description"
            placeholder="Deskripsi transaksi"
            value={formData.description}
            onChange={handleChange}
          />
          <small className="field-hint">
            Kategori akan ditentukan otomatis oleh sistem.
          </small>
        </label>

        <div className={isExpense ? "form-grid" : "form-grid single-field"}>
          <label>
            <span className="field-label">
              <Icon name="wallet" size={14} />
              Nominal
            </span>
            <input
              type="number"
              name="amount"
              min="1"
              max={isExpense ? availableBalance : undefined}
              placeholder="Nominal"
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
            <span className="field-label">
              <Icon name="calendar" size={14} />
              Tanggal
            </span>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className={isExpense ? "form-grid" : "form-grid single-field"}>
          <label>
            <span className="field-label">
              <Icon name="card" size={14} />
              Metode
            </span>
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
          <span className="button-content">
            <Icon name="save" size={15} />
            Simpan Transaksi
          </span>
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </section>
  );
}

export default TransactionForm;
