import { apiRequest } from "./apiClient";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeTransaction = (transaction) => {
  if (!transaction) {
    return transaction;
  }

  return {
    ...transaction,
    amount: toNumber(transaction.amount),
  };
};

const normalizeBalanceSummary = (summary) => ({
  ...summary,
  total_income: toNumber(summary?.total_income),
  total_expense: toNumber(summary?.total_expense),
  balance: toNumber(summary?.balance),
});

const normalizeTransactionPayload = (payload) => ({
  ...payload,
  amount: toNumber(payload.amount),
  category: payload.type === "income" ? "Pemasukan" : payload.category,
});

const normalizeTransactionResponse = (response) => ({
  ...response,
  data: Array.isArray(response.data)
    ? response.data.map(normalizeTransaction)
    : normalizeTransaction(response.data),
});

const normalizeBalanceResponse = (response) => ({
  ...response,
  data: normalizeBalanceSummary(response.data),
});

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.skip !== undefined) params.append("skip", String(filters.skip));
  if (filters.limit !== undefined) params.append("limit", String(filters.limit));
  if (filters.type) params.append("type", filters.type);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.up_to_date) params.append("up_to_date", filters.up_to_date);

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const getTransactions = async (token, filters) => {
  const response = await apiRequest(
    `/transactions/${buildQueryString(filters)}`,
    {
      method: "GET",
      token,
    }
  );

  return normalizeTransactionResponse(response);
};

export const getBalanceSummary = async (token, filters) => {
  const response = await apiRequest(
    `/transactions/summary/balance${buildQueryString(filters)}`,
    {
      method: "GET",
      token,
    }
  );

  return normalizeBalanceResponse(response);
};

export const createTransaction = async (token, payload) => {
  const response = await apiRequest("/transactions/", {
    method: "POST",
    token,
    body: normalizeTransactionPayload(payload),
  });

  return normalizeTransactionResponse(response);
};

export const predictTransactionCategory = async (token, description) =>
  apiRequest("/transactions/predict-category", {
    method: "POST",
    token,
    body: { description },
  });
