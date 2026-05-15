import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import {
  createTransaction,
  getBalanceSummary,
  getTransactions,
  predictTransactionCategory,
} from "../../../services/transactionsApi";
import { summarizeTransactions } from "../../../utils/summarizeTransactions";

const emptySummary = {
  income: 0,
  expense: 0,
  balance: 0,
  total: 0,
};

export function useTransactions(initialFilters) {
  const { token, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [balanceSummary, setBalanceSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState("");
  const filters = useMemo(() => initialFilters ?? {}, [initialFilters]);

  const refreshTransactions = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getTransactions(token, filters);
      const items = response.data || [];
      setTransactions(items);
      setSummary(summarizeTransactions(items));
    } catch (err) {
      setError(err.message || "Gagal memuat transaksi.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  const refreshBalance = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await getBalanceSummary(token);
      setBalanceSummary(response.data || null);
    } catch (err) {
      setError(err.message || "Gagal memuat saldo.");
    }
  }, [token]);

  const addTransaction = useCallback(
    async (payload) => {
      if (!token) {
        return { success: false, message: "Token belum tersedia." };
      }

      setIsMutating(true);
      setError("");

      try {
        const response = await createTransaction(token, payload);
        await refreshTransactions();
        await refreshBalance();
        return {
          success: true,
          message: response.message || "Transaksi berhasil ditambahkan.",
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || "Gagal menambahkan transaksi.",
        };
      } finally {
        setIsMutating(false);
      }
    },
    [refreshBalance, refreshTransactions, token]
  );

  const predictCategory = useCallback(
    async (description) => {
      if (!token) {
        throw new Error("Token belum tersedia.");
      }

      return predictTransactionCategory(token, description);
    },
    [token]
  );

  useEffect(() => {
    if (isAuthenticated) {
      Promise.resolve().then(() => {
        refreshTransactions();
        refreshBalance();
      });
    }
  }, [isAuthenticated, refreshBalance, refreshTransactions]);

  return {
    transactions,
    summary,
    balanceSummary,
    isLoading,
    isMutating,
    error,
    refreshTransactions,
    refreshBalance,
    addTransaction,
    predictCategory,
  };
}
