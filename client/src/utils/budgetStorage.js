const BUDGET_STORAGE_KEY = "sawit_budget_settings";

export const BUDGET_CATEGORY_COLORS = {
  Makanan: "#D85A30",
  Transportasi: "#378ADD",
  Langganan: "#7F77DD",
  Belanja: "#D4537E",
  Tagihan: "#EF9F27",
  Wishlist: "#1D9E75",
  Investasi: "#6750A4",
  Lainnya: "#667889",
};

export const BUDGET_CATEGORIES = Object.entries(BUDGET_CATEGORY_COLORS).map(
  ([name, color]) => ({
    name,
    color,
    type: "expense",
  })
);

export const createEmptyCategoryLimits = () =>
  BUDGET_CATEGORIES.reduce(
    (limits, category) => ({
      ...limits,
      [category.name]: 0,
    }),
    {}
  );

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeCategoryLimits = (categoryLimits = {}) =>
  BUDGET_CATEGORIES.reduce(
    (limits, category) => ({
      ...limits,
      [category.name]: toNumber(categoryLimits[category.name]),
    }),
    {}
  );

const getUserBudgetKey = (user) => {
  if (user?.id) {
    return `id:${user.id}`;
  }

  if (user?.email) {
    return `email:${user.email}`;
  }

  return "guest";
};

const readAllBudgetSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const createEmptyBudgetSetting = () => ({
  category_limits: createEmptyCategoryLimits(),
  income_target: 0,
  updated_at: null,
});

const normalizeBudgetSetting = (setting) => {
  if (!setting) {
    return createEmptyBudgetSetting();
  }

  const categoryLimits = normalizeCategoryLimits(setting.category_limits);

  return {
    category_limits: categoryLimits,
    income_target: toNumber(categoryLimits.Pemasukan),
    updated_at: setting.updated_at || null,
  };
};

export const readBudgetSetting = (user) => {
  const settings = readAllBudgetSettings();
  const key = getUserBudgetKey(user);
  const userSettings = settings[key];

  if (!userSettings) {
    return createEmptyBudgetSetting();
  }

  if (userSettings.category_limits) {
    return normalizeBudgetSetting(userSettings);
  }

  return createEmptyBudgetSetting();
};

export const writeBudgetSetting = (user, payload) => {
  const settings = readAllBudgetSettings();
  const key = getUserBudgetKey(user);
  const previousSetting = readBudgetSetting(user);
  const categoryLimits = normalizeCategoryLimits(
    payload.category_limits || previousSetting.category_limits
  );
  const nextSetting = {
    ...previousSetting,
    category_limits: categoryLimits,
    income_target: toNumber(categoryLimits.Pemasukan),
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(
    BUDGET_STORAGE_KEY,
    JSON.stringify({
      ...settings,
      [key]: nextSetting,
    })
  );

  return nextSetting;
};
