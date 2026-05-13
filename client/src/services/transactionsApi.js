const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const buildAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      "Terjadi kesalahan saat menghubungi server";

    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
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
  category: payload.type === "expense" ? payload.category : null,
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
  const response = await fetch(
    `${API_BASE_URL}/transactions${buildQueryString(filters)}`,
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    }
  );

  return normalizeTransactionResponse(await handleResponse(response));
};

export const getBalanceSummary = async (token, filters) => {
  const response = await fetch(
    `${API_BASE_URL}/transactions/summary/balance${buildQueryString(filters)}`,
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    }
  );

  return normalizeBalanceResponse(await handleResponse(response));
};

export const createTransaction = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: buildAuthHeaders(token),
    body: JSON.stringify(normalizeTransactionPayload(payload)),
  });

  return normalizeTransactionResponse(await handleResponse(response));
};
