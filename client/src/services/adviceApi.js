import { apiRequest } from "./apiClient";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeAdviceData = (data) => {
  if (!data) {
    return data;
  }

  const meta = data.meta
    ? {
        ...data.meta,
        total_budget: toNumber(data.meta.total_budget),
        total_spent: toNumber(data.meta.total_spent),
        remaining: toNumber(data.meta.remaining),
        day_of_month: toNumber(data.meta.day_of_month),
        days_in_month: toNumber(data.meta.days_in_month),
        daily_average: toNumber(data.meta.daily_average),
        projected_monthly_spending: toNumber(
          data.meta.projected_monthly_spending
        ),
        spending_ratio: toNumber(data.meta.spending_ratio),
        remaining_days: toNumber(data.meta.remaining_days),
      }
    : data.meta;

  return {
    ...data,
    meta,
  };
};

const normalizeAdviceResponse = (response) => ({
  ...response,
  data: normalizeAdviceData(response.data),
});

export const getFinancialAdvice = async (token) => {
  const response = await apiRequest("/advice/", {
    method: "GET",
    token,
  });

  return normalizeAdviceResponse(response);
};
