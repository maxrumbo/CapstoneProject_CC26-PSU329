import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { INCOME_CATEGORY } from "../constants/transactionCategories";

const DEFAULT_METHOD = "Tunai";
const MIN_DESCRIPTION_LENGTH_FOR_AI = 3;

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
  category: "",
  method: DEFAULT_METHOD,
});

export function useTransactionForm({
  availableBalance,
  onAddTransaction,
  onPredictCategory,
}) {
  const [formData, setFormData] = useState(createInitialFormData);
  const [message, setMessage] = useState("");
  const [categoryPrediction, setCategoryPrediction] = useState({
    isLoading: false,
    category: "",
    confidence: null,
    error: "",
  });
  const latestDescriptionRef = useRef(formData.description);
  const isExpense = formData.type === "expense";

  useEffect(() => {
    latestDescriptionRef.current = formData.description;
  }, [formData.description]);

  useEffect(() => {
    const description = formData.description.trim();

    if (
      !isExpense ||
      !onPredictCategory ||
      description.length < MIN_DESCRIPTION_LENGTH_FOR_AI
    ) {
      return undefined;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(async () => {
      setCategoryPrediction({
        isLoading: true,
        category: "",
        confidence: null,
        error: "",
      });

      try {
        const response = await onPredictCategory(description);
        const prediction = response.data;

        if (!isActive || !prediction) {
          return;
        }

        if (!prediction.category) {
          setCategoryPrediction({
            isLoading: false,
            category: "",
            confidence: prediction.confidence ?? null,
            error: "Kategori hasil prediksi tidak tersedia.",
          });
          return;
        }

        setCategoryPrediction({
          isLoading: false,
          category: prediction.category,
          confidence: prediction.confidence,
          error: "",
        });

        setFormData((prev) => {
          const isCurrentExpense = prev.type === "expense";
          const isCurrentDescription =
            latestDescriptionRef.current.trim() === description;

          if (!isCurrentExpense || !isCurrentDescription) {
            return prev;
          }

          return {
            ...prev,
            category: prediction.category,
          };
        });
      } catch (err) {
        if (isActive) {
          setCategoryPrediction({
            isLoading: false,
            category: "",
            confidence: null,
            error: err.message || "Gagal memprediksi kategori.",
          });
        }
      }
    }, 500);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [formData.description, isExpense, onPredictCategory]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "description") {
      setCategoryPrediction({
        isLoading: false,
        category: "",
        confidence: null,
        error: "",
      });
    }

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
      ...(name === "description" && prev.type === "expense"
        ? { category: "" }
        : {}),
    }));
  };

  const handleTypeChange = (type) => {
    setCategoryPrediction({
      isLoading: false,
      category: "",
      confidence: null,
      error: "",
    });

    setFormData((prev) => ({
      ...prev,
      type,
      amount:
        type === "expense" && Number(prev.amount) > availableBalance
          ? availableBalance > 0
            ? String(availableBalance)
            : ""
          : prev.amount,
      category: type === "income" ? INCOME_CATEGORY : "",
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

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      category: isExpense ? formData.category || null : INCOME_CATEGORY,
    };

    const result = await onAddTransaction(payload);

    setMessage(result.message);

    if (result.success) {
      setFormData(createInitialFormData());
      setCategoryPrediction({
        isLoading: false,
        category: "",
        confidence: null,
        error: "",
      });
    }
  };

  return {
    formData,
    categoryPrediction,
    isExpense,
    isSubmitDisabled: isExpense && availableBalance <= 0,
    message,
    handleChange,
    handleSubmit,
    handleTypeChange,
  };
}
