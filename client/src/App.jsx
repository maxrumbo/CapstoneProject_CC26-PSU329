import { useMemo, useState } from "react";
import TransactionForm from "./features/transactions/components/TransactionForm";
import { formatCurrency } from "./utils/formatCurrency";
import "./App.css";

const initialTransactions = [
  {
    id: "TRX-003",
    description: "Uang saku bulanan",
    amount: 1500000,
    type: "income",
    date: "2026-04-30",
    category: "Pemasukan",
    method: "Bank",
  },
  {
    id: "TRX-002",
    description: "Langganan internet",
    amount: 275000,
    type: "expense",
    date: "2026-04-29",
    category: "Langganan",
    method: "E-Wallet",
  },
  {
    id: "TRX-001",
    description: "Makan siang",
    amount: 25000,
    type: "expense",
    date: "2026-04-29",
    category: "Makanan",
    method: "Tunai",
  },
];

const menuItems = [
  { label: "Dashboard", status: "Preview" },
  { label: "Transaksi", status: "Aktif", active: true },
  { label: "Budget", status: "Segera" },
  { label: "Subscription", status: "Segera" },
  { label: "Wishlist", status: "Segera" },
  { label: "Investasi", status: "Segera" },
  { label: "Analisis AI", status: "Segera" },
];

const featureCards = [
  {
    title: "Subscription Tracker",
    description: "Pantau biaya langganan rutin agar tidak bocor tiap bulan.",
  },
  {
    title: "Wishlist Calculator",
    description: "Hitung target tabungan untuk barang yang ingin dibeli.",
  },
  {
    title: "Analisis Konsumsi",
    description: "Baca pola pemasukan dan pengeluaran secara ringkas.",
  },
  {
    title: "Edukasi Investasi",
    description: "Preview pembelajaran saham berbasis data sederhana.",
  },
];

function App() {
  const [transactions, setTransactions] = useState(initialTransactions);

  const summary = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const expense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      total: transactions.length,
    };
  }, [transactions]);

  const addTransaction = (transaction) => {
    setTransactions((prev) => [
      {
        ...transaction,
        id: `TRX-${String(prev.length + 1).padStart(3, "0")}`,
      },
      ...prev,
    ]);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <h1>SAWIT</h1>
            <p>Sahabat Duwit</p>
          </div>
        </div>

        <button
          className="create-button"
          type="button"
          onClick={() => document.getElementById("transaksi")?.scrollIntoView()}
        >
          + Buat Transaksi
        </button>

        <nav className="menu" aria-label="Menu utama">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={item.active ? "menu-item active" : "menu-item"}
              type="button"
              disabled={!item.active}
            >
              <span>{item.label}</span>
              <small>{item.status}</small>
            </button>
          ))}
        </nav>

        <div className="project-card">
          <p>Project Plan</p>
          <strong>CC26-PSU329</strong>
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace SAWIT</p>
            <h2>Transaction Report</h2>
            <span>Ringkasan pemasukan dan pengeluaran dari transaksi aktif.</span>
          </div>
        </header>

        <section className="report-card" aria-label="Ringkasan transaksi">
          <div className="report-equation">
            <article>
              <span>Pemasukan</span>
              <strong>{formatCurrency(summary.income)}</strong>
            </article>

            <b>-</b>

            <article>
              <span>Pengeluaran</span>
              <strong>{formatCurrency(summary.expense)}</strong>
            </article>

            <b>=</b>

            <article>
              <span>Saldo Aktif</span>
              <strong className="net-profit">
                {formatCurrency(summary.balance)}
              </strong>
            </article>
          </div>

          <p className="report-note">{summary.total} transaksi tercatat</p>
        </section>

        <section className="workspace-grid">
          <div className="primary-column">
            <TransactionForm onAddTransaction={addTransaction} />

            <section className="panel transaction-table-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Transaksi Aktif</p>
                  <h3>Riwayat Terbaru</h3>
                </div>
                <span className="status-pill">Berfungsi</span>
              </div>

              <div className="report-toolbar">
                <label>
                  Periode
                  <select defaultValue="2026" disabled>
                    <option value="2026">2026</option>
                  </select>
                </label>

                <label>
                  Dari
                  <input type="date" value="2026-04-01" readOnly />
                </label>

                <label>
                  Sampai
                  <input type="date" value="2026-04-30" readOnly />
                </label>

                <button type="button" disabled>
                  Update Report
                </button>
              </div>

              <div className="transaction-table">
                {transactions.map((transaction) => (
                  <article className="transaction-row" key={transaction.id}>
                    <div>
                      <strong>{transaction.description}</strong>
                      <span>
                        {transaction.category} / {transaction.method} /{" "}
                        {transaction.date}
                      </span>
                    </div>

                    <strong
                      className={
                        transaction.type === "income"
                          ? "amount income"
                          : "amount expense"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="side-column">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Rencana Fitur</p>
                  <h3>Kebutuhan Keuangan</h3>
                </div>
              </div>

              <div className="feature-grid">
                {featureCards.map((feature) => (
                  <article className="feature-card" key={feature.title}>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                    <button type="button" disabled>
                      Belum aktif
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel chart-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Preview Analisis</p>
                  <h3>Income & Expense</h3>
                </div>
              </div>

              <div className="bar-chart" aria-hidden="true">
                <div style={{ "--income": "72%", "--expense": "36%" }}>
                  <span></span>
                  <span></span>
                  <small>Jan</small>
                </div>
                <div style={{ "--income": "58%", "--expense": "48%" }}>
                  <span></span>
                  <span></span>
                  <small>Feb</small>
                </div>
                <div style={{ "--income": "82%", "--expense": "42%" }}>
                  <span></span>
                  <span></span>
                  <small>Mar</small>
                </div>
                <div style={{ "--income": "64%", "--expense": "54%" }}>
                  <span></span>
                  <span></span>
                  <small>Apr</small>
                </div>
              </div>

              <p className="muted-note">
                Grafik ini masih preview. Data aktif saat ini hanya dari form
                transaksi.
              </p>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
