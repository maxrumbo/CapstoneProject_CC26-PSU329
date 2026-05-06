export const initialTransactions = [
  {
    id: "TRX-003",
    description: "Uang saku bulanan",
    amount: 1500000,
    type: "income",
    date: "2026-04-30",
    category: "",
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

export const menuItems = [
  {
    label: "Dashboard",
    icon: "dashboard",
    status: "Aktif",
    active: true,
    page: "dashboard",
  },
  {
    label: "Transaksi",
    icon: "receipt",
    status: "Aktif",
    active: true,
    page: "transactions",
  },
  { label: "Budget", icon: "budget", status: "Segera" },
  { label: "Subscription", icon: "subscription", status: "Segera" },
  {
    label: "Wishlist Calculator",
    icon: "target",
    status: "Aktif",
    active: true,
    page: "wishlist",
  },
  { label: "Investasi", icon: "investment", status: "Segera" },
  { label: "Analisis AI", icon: "ai", status: "Segera" },
];

export const featureCards = [
  {
    title: "Subscription Tracker",
    icon: "subscription",
    description: "Pantau biaya langganan rutin agar tidak bocor tiap bulan.",
  },
  {
    title: "Wishlist Calculator",
    icon: "target",
    description: "Hitung target tabungan untuk barang yang ingin dibeli.",
    active: true,
    page: "wishlist",
  },
  {
    title: "Analisis Konsumsi",
    icon: "chart",
    description: "Baca pola pemasukan dan pengeluaran secara ringkas.",
  },
  {
    title: "Edukasi Investasi",
    icon: "investment",
    description: "Preview pembelajaran saham berbasis data sederhana.",
  },
];

export const previewChartBars = [
  { month: "Jan", income: "72%", expense: "36%" },
  { month: "Feb", income: "58%", expense: "48%" },
  { month: "Mar", income: "82%", expense: "42%" },
  { month: "Apr", income: "64%", expense: "54%" },
];
