import { useState } from "react";
import { TRANSACTION_CATEGORIES } from "../constants/transactionCategories";

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
    return "Pemasukan";
  }

  if (currentCategory === "Pemasukan") {
    return TRANSACTION_CATEGORIES[0];
  }

  return currentCategory;
};

function TransactionForm({ onAddTransaction }) {
  const [formData, setFormData] = useState(createInitialFormData);
  const [message, setMessage] = useState("");
  const categoryOptions =
    formData.type === "income"
      ? ["Pemasukan"]
      : TRANSACTION_CATEGORIES.filter((category) => category !== "Pemasukan");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: getCategoryByType(type, prev.category),
    }));
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

    onAddTransaction({
      ...formData,
      amount: Number(formData.amount),
    });

    setMessage("Transaksi berhasil ditambahkan ke riwayat.");
    setFormData(createInitialFormData());
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

        <div className="form-grid">
          <label>
            Nominal
            <input
              type="number"
              name="amount"
              min="1"
              placeholder="25000"
              value={formData.amount}
              onChange={handleChange}
            />
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
          <label>
            Kategori
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Metode
            <select name="method" value={formData.method} onChange={handleChange}>
              <option value="Tunai">Tunai</option>
              <option value="Bank">Bank</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </label>
        </div>

        <button className="submit-button" type="submit">
          Simpan Transaksi
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </section>
  );
}

export default TransactionForm;
