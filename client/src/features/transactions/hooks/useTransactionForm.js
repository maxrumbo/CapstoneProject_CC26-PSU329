import { useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { TRANSACTION_CATEGORIES } from "../constants/transactionCategories";

const DEFAULT_EXPENSE_CATEGORY = "Lainnya";
const DEFAULT_METHOD = "Tunai";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

const createInitialFormData = () => ({
  description: "",
  amount: "",
  type: "expense",
  date: getToday(),
  category: DEFAULT_EXPENSE_CATEGORY,
  method: DEFAULT_METHOD,
});

const getCategoryByType = (type, currentCategory) => {
  if (type === "income") {
    return "";
  }

  return currentCategory || DEFAULT_EXPENSE_CATEGORY;
};

export function useTransactionForm({
  availableBalance,
  onAddTransaction,
}) {
  const [formData, setFormData] = useState(createInitialFormData);
  const [message, setMessage] = useState("");
  const isExpense = formData.type === "expense";

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "amount" && isExpense && value) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.description.trim()) {
      setMessage("Deskripsi transaksi wajib diisi.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setMessage("Nominal transaksi harus lebih dari 0.");
      return;
    }

    if (isExpense && Number(formData.amount) > availableBalance) {
      setMessage(
        `Maksimal pengeluaran saat ini ${formatCurrency(availableBalance)}.`
      );
      return;
    }

    if (isExpense && !TRANSACTION_CATEGORIES.includes(formData.category)) {
      setMessage("Pilih kategori pengeluaran yang valid.");
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      category: isExpense ? formData.category : null,
    };

    const result = await onAddTransaction(payload);

    setMessage(result.message);

    if (result.success) {
      setFormData(createInitialFormData());
    }
  };

  return {
    formData,
    isExpense,
    isSubmitDisabled: isExpense && availableBalance <= 0,
    message,
    handleChange,
    handleSubmit,
    handleTypeChange,
  };
}
