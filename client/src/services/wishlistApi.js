import { apiRequest } from "./apiClient";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeWishlist = (wishlist) => {
  if (!wishlist) {
    return wishlist;
  }

  return {
    ...wishlist,
    itemName: wishlist.itemName ?? wishlist.item_name,
    targetPrice: toNumber(wishlist.targetPrice ?? wishlist.target_price),
    targetMonths: toNumber(wishlist.targetMonths ?? wishlist.target_months),
    monthlySaving: toNumber(wishlist.monthlySaving ?? wishlist.monthly_saving),
    weeklySaving: toNumber(wishlist.weeklySaving ?? wishlist.weekly_saving),
    dailySaving: toNumber(wishlist.dailySaving ?? wishlist.daily_saving),
    progressAmount: toNumber(wishlist.progressAmount ?? wishlist.progress_amount),
    progressPercent: toNumber(wishlist.progressPercent ?? wishlist.progress_percent),
    remainingAmount: toNumber(wishlist.remainingAmount ?? wishlist.remaining_amount),
    createdAt: wishlist.createdAt ?? wishlist.created_at,
    updatedAt: wishlist.updatedAt ?? wishlist.updated_at,
  };
};

const normalizeWishlistResponse = (response) => ({
  ...response,
  data: Array.isArray(response.data)
    ? response.data.map(normalizeWishlist)
    : normalizeWishlist(response.data),
});

export const createWishlist = async (token, payload) => {
  const response = await apiRequest("/wishlists/", {
    method: "POST",
    token,
    body: payload,
  });

  return normalizeWishlistResponse(response);
};

export const getWishlists = async (token, filters = {}) => {
  const params = new URLSearchParams();

  if (filters.skip !== undefined) params.append("skip", String(filters.skip));
  if (filters.limit !== undefined) params.append("limit", String(filters.limit));
  if (filters.status) params.append("status", filters.status);

  const query = params.toString();
  const response = await apiRequest(`/wishlists/${query ? `?${query}` : ""}`, {
    method: "GET",
    token,
  });

  return normalizeWishlistResponse(response);
};

export const deleteWishlist = async (token, wishlistId) =>
  apiRequest(`/wishlists/${wishlistId}`, {
    method: "DELETE",
    token,
  });

export const updateWishlistProgress = async (token, wishlistId, progressAmount) => {
  const response = await apiRequest(`/wishlists/${wishlistId}/progress`, {
    method: "PATCH",
    token,
    body: {
      progressAmount,
    },
  });

  return normalizeWishlistResponse(response);
};
