import { apiRequest } from "./apiClient";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeCategory = (category) => ({
  ...category,
  amount: toNumber(category.amount),
  budget: toNumber(category.budget ?? category.amount),
  spent: toNumber(category.spent),
  remaining: toNumber(category.remaining),
  percentage: toNumber(category.percentage),
});

const normalizeBudgetData = (data) => {
  if (!data) {
    return data;
  }

  return {
    ...data,
    budgets: Array.isArray(data.budgets)
      ? data.budgets.map(normalizeCategory)
      : data.budgets,
    categories: Array.isArray(data.categories)
      ? data.categories.map(normalizeCategory)
      : data.categories,
    total_budget: toNumber(data.total_budget),
    total_spent: toNumber(data.total_spent),
    total_remaining: toNumber(data.total_remaining),
  };
};

const normalizeBudgetResponse = (response) => ({
  ...response,
  data: normalizeBudgetData(response.data),
});

export const setBudget = async (token, payload) => {
  const response = await apiRequest("/budget/set", {
    method: "POST",
    token,
    body: payload,
  });

  return normalizeBudgetResponse(response);
};

export const getBudgetSummary = async (token, month) => {
  const response = await apiRequest(`/budget/summary/${month}`, {
    method: "GET",
    token,
  });

  return normalizeBudgetResponse(response);
};
