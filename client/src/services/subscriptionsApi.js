import { apiRequest } from "./apiClient";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeSubscription = (subscription) => {
  if (!subscription) {
    return subscription;
  }

  return {
    ...subscription,
    amount: toNumber(subscription.amount),
    billingCycle:
      subscription.billingCycle ?? subscription.billing_cycle ?? "monthly",
    nextBillingDate:
      subscription.nextBillingDate ?? subscription.next_billing_date,
    createdAt: subscription.createdAt ?? subscription.created_at,
    updatedAt: subscription.updatedAt ?? subscription.updated_at,
  };
};

const normalizeSubscriptionResponse = (response) => ({
  ...response,
  data: Array.isArray(response.data)
    ? response.data.map(normalizeSubscription)
    : normalizeSubscription(response.data),
});

const normalizeSummary = (summary) => ({
  ...summary,
  totalCost: toNumber(summary?.totalCost ?? summary?.total_cost),
});

const normalizeSummaryResponse = (response) => ({
  ...response,
  data: normalizeSummary(response.data),
});

const buildSubscriptionPayload = (payload) => ({
  name: payload.name?.trim(),
  amount: toNumber(payload.amount),
  billing_cycle: payload.billingCycle ?? payload.billing_cycle ?? "monthly",
  next_billing_date: payload.nextBillingDate ?? payload.next_billing_date,
});

export const getSubscriptions = async (token, filters = {}) => {
  const params = new URLSearchParams();

  if (filters.skip !== undefined) params.append("skip", String(filters.skip));
  if (filters.limit !== undefined) params.append("limit", String(filters.limit));

  const query = params.toString();
  const response = await apiRequest(`/subscriptions/${query ? `?${query}` : ""}`, {
    method: "GET",
    token,
  });

  return normalizeSubscriptionResponse(response);
};

export const getSubscriptionSummary = async (token) => {
  const response = await apiRequest("/subscriptions/summary", {
    method: "GET",
    token,
  });

  return normalizeSummaryResponse(response);
};

export const createSubscription = async (token, payload) => {
  const response = await apiRequest("/subscriptions/", {
    method: "POST",
    token,
    body: buildSubscriptionPayload(payload),
  });

  return normalizeSubscriptionResponse(response);
};

export const updateSubscription = async (token, subscriptionId, payload) => {
  const response = await apiRequest(`/subscriptions/${subscriptionId}`, {
    method: "PUT",
    token,
    body: buildSubscriptionPayload(payload),
  });

  return normalizeSubscriptionResponse(response);
};

export const deleteSubscription = async (token, subscriptionId) =>
  apiRequest(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    token,
  });
