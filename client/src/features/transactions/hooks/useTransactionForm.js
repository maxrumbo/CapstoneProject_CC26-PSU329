import { useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

const DEFAULT_EXPENSE_CATEGORY = "Lainnya";

const createInitialFormData = () => ({
  description: "",
  amount: "",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
  category: DEFAULT_EXPENSE_CATEGORY,
  method: "Tunai",
});

const getCategoryByType = (type, currentCategory) => {
  if (type === "income") {
    return "";
  }

  return currentCategory || DEFAULT_EXPENSE_CATEGORY;
};

export function useTransactionForm({ availableBalance, onAddTransaction }) {
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

    const result = await onAddTransaction({
      ...formData,
      amount: Number(formData.amount),
      category: isExpense ? DEFAULT_EXPENSE_CATEGORY : "",
    });

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
