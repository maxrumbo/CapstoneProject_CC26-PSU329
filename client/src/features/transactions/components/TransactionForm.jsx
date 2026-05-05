import { useState } from "react";
import { TRANSACTION_CATEGORIES } from "../constants/transactionCategories";
import { formatCurrency } from "../../../utils/formatCurrency";

const createInitialFormData = () => ({
  description: "",
  amount: "",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
  category: TRANSACTION_CATEGORIES[0],
  method: "Tunai",
});

const getCategoryByType = (type, currentCategory) => {
  if (type === "income") {
    return "";
  }

  return currentCategory;
};

function TransactionForm({ availableBalance, onAddTransaction }) {
  const [formData, setFormData] = useState(createInitialFormData);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "amount" && formData.type === "expense" && value) {
      const numericValue = Number(value);

      if (availableBalance <= 0) {
        nextValue = "";
        setMessage("Saldo tersedia saat ini Rp 0. Tambahkan pemasukan dulu.");
      } else if (numericValue > availableBalance) {
        nextValue = String(availableBalance);
        setMessage(
          `Maksimal pengeluaran saat ini ${formatCurrency(availableBalance)}.`
        );
      } else if (message) {
        setMessage("");
      }
    }

    if (name === "amount" && formData.type === "income" && message) {
      setMessage("");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      amount:
        type === "expense" && Number(prev.amount) > availableBalance
          ? availableBalance > 0
            ? String(availableBalance)
            : ""
          : prev.amount,
      category: getCategoryByType(type, prev.category),
    }));

    if (type === "expense" && availableBalance <= 0) {
      setMessage("Saldo tersedia saat ini Rp 0. Tambahkan pemasukan dulu.");
    } else if (message) {
      setMessage("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.description.trim()) {
      setMessage("Deskripsi transaksi wajib diisi.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setMessage("Nominal transaksi harus lebih dari 0.");
      return;
    }

    if (formData.type === "expense" && Number(formData.amount) > availableBalance) {
      setMessage(
        `Maksimal pengeluaran saat ini ${formatCurrency(availableBalance)}.`
      );
      return;
    }

    const result = onAddTransaction({
      ...formData,
      amount: Number(formData.amount),
      category: formData.type === "income" ? "" : formData.category,
    });

    setMessage(result.message);

    if (result.success) {
      setFormData(createInitialFormData());
    }
  };

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
            className={formData.type === "expense" ? "active" : ""}
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

        <div
          className={
            formData.type === "income" ? "form-grid single-field" : "form-grid"
          }
        >
          <label>
            Nominal
            <input
              type="number"
              name="amount"
              min="1"
              max={formData.type === "expense" ? availableBalance : undefined}
              placeholder="25000"
              value={formData.amount}
              onChange={handleChange}
            />
            {formData.type === "expense" && (
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

        <div className="form-grid">
          {formData.type === "expense" && (
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
          disabled={formData.type === "expense" && availableBalance <= 0}
        >
          Simpan Transaksi
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </section>
  );
}

export default TransactionForm;
