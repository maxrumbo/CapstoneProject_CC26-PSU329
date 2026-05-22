import { useEffect, useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import Icon from "../components/ui/Icon";
import { useAuth } from "../context/useAuth";
import { getBudgetSummary, setBudget as setBudgetApi } from "../services/budgetApi";
import {
  BUDGET_CATEGORIES,
  createEmptyCategoryLimits,
} from "../utils/budgetStorage";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeCategoryInputValues = (categoryLimits = {}) =>
  BUDGET_CATEGORIES.reduce(
    (values, category) => ({
      ...values,
      [category.name]:
        categoryLimits[category.name] > 0 ? String(categoryLimits[category.name]) : "",
    }),
    {}
  );

const toCategoryNumbers = (categoryInputs = {}) =>
  BUDGET_CATEGORIES.reduce(
    (values, category) => ({
      ...values,
      [category.name]: toNumber(categoryInputs[category.name]),
    }),
    {}
  );

const getConfiguredExpenseCategoryCount = (categoryLimits = {}) =>
  BUDGET_CATEGORIES.filter(
    (category) =>
      category.type === "expense" && toNumber(categoryLimits[category.name]) > 0
  ).length;

const getCurrentMonth = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${today.getFullYear()}-${month}`;
};

const createBudgetSettingFromSummary = (summary) => {
  const categoryLimits = createEmptyCategoryLimits();
  const categories = summary?.categories || [];

  categories.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(categoryLimits, item.category)) {
      categoryLimits[item.category] = toNumber(item.budget);
    }
  });

  return {
    category_limits: categoryLimits,
    month: summary?.month || getCurrentMonth(),
    updated_at: categories.length > 0 ? summary?.month || getCurrentMonth() : null,
  };
};

const buildBudgetPayload = (month, categoryLimits) => ({
  month,
  budgets: BUDGET_CATEGORIES.map((category) => ({
    category: category.name,
    amount: toNumber(categoryLimits[category.name]),
  })),
});

function ProfilePage({ onLogout, onProfileClick, user, userName }) {
  const { token } = useAuth();
  const displayName = user?.display_name || userName || "Pengguna SAWIT";
  const email = user?.email || "-";
  const initial = displayName.trim() ? displayName.trim()[0].toUpperCase() : "S";
  const [budgetMonth] = useState(getCurrentMonth);

  const [budget, setBudget] = useState(null);
  const [categoryInputs, setCategoryInputs] = useState(() =>
    normalizeCategoryInputValues(createEmptyCategoryLimits())
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasSavedBudget = Boolean(budget?.updated_at);
  const isBudgetEditable = !hasSavedBudget || isEditingBudget;
  const categoryLimits = budget?.category_limits || createEmptyCategoryLimits();
  const configuredExpenseCategoryCount =
    getConfiguredExpenseCategoryCount(categoryLimits);
  const budgetStatus =
    configuredExpenseCategoryCount <= 0
      ? "Belum ada kategori"
      : "Kategori aktif";

  useEffect(() => {
    let isActive = true;

    const loadProfileData = async () => {
      setIsLoading(true);
      setError("");

      try {
        if (!token) {
          throw new Error("Token belum tersedia. Silakan login ulang.");
        }

        const response = await getBudgetSummary(token, budgetMonth);
        const nextBudget = createBudgetSettingFromSummary(response.data);

        if (!isActive) {
          return;
        }

        setBudget(nextBudget);
        setCategoryInputs(normalizeCategoryInputValues(nextBudget.category_limits));
        setIsEditingBudget(!nextBudget.updated_at);
      } catch (err) {
        if (isActive) {
          setError(err.message || "Gagal memuat profil.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (token) {
      loadProfileData();
    }

    return () => {
      isActive = false;
    };
  }, [budgetMonth, token]);

  const handleCategoryBudgetChange = (categoryName, value) => {
    if (!isBudgetEditable) {
      return;
    }

    setCategoryInputs((prevValues) => ({
      ...prevValues,
      [categoryName]: value,
    }));
    setMessage("");
    setError("");
  };

  const handleBudgetEdit = () => {
    setIsEditingBudget(true);
    setMessage("Mode update aktif. Ubah nominal kategori lalu tekan Simpan.");
    setError("");
  };

  const handleBudgetSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!isBudgetEditable) {
      setError("Tekan tombol Update terlebih dahulu untuk mengubah budget.");
      return;
    }

    const categoryLimits = toCategoryNumbers(categoryInputs);
    const hasNegativeBudget = Object.values(categoryLimits).some((value) => value < 0);

    if (hasNegativeBudget) {
      setError("Budget kategori tidak boleh negatif.");
      return;
    }

    setIsSaving(true);

    try {
      if (!token) {
        throw new Error("Token belum tersedia. Silakan login ulang.");
      }

      await setBudgetApi(token, buildBudgetPayload(budgetMonth, categoryLimits));
      const response = await getBudgetSummary(token, budgetMonth);
      const nextBudget = createBudgetSettingFromSummary(response.data);

      setBudget(nextBudget);
      setCategoryInputs(normalizeCategoryInputValues(nextBudget.category_limits));
      setIsEditingBudget(false);
      setMessage(
        hasSavedBudget
          ? "Budget kategori berhasil di-update."
          : "Budget kategori berhasil disimpan."
      );
    } catch (err) {
      setError(err.message || "Gagal menyimpan budget.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DashboardHeader
        eyebrow="Akun"
        title="Profil"
        description="Update nominal kategori yang berlaku sampai kamu mengubahnya lagi."
        icon="user"
        userName={userName}
        onProfileClick={onProfileClick}
      />

      <section className="profile-stack" aria-label="Profil pengguna">
        <section className="panel profile-hero">
          <span className="profile-avatar-large" aria-hidden="true">
            {initial}
          </span>
          <div className="profile-hero-content">
            <p className="eyebrow">Profil SAWIT</p>
            <h3>{displayName}</h3>
            <p>{email}</p>
          </div>
          {onLogout && (
            <button className="profile-logout-button" type="button" onClick={onLogout}>
              <span className="button-content">
                <Icon name="arrowRight" size={15} />
                Keluar
              </span>
            </button>
          )}
        </section>

        <section className="panel profile-budget-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-icon">
                <Icon name="budget" size={18} />
              </span>
              <div>
                <p className="eyebrow">Pengaturan Kategori</p>
                <h3>Alokasi Per Kategori</h3>
              </div>
            </div>
            <span className="status-pill">
              {budgetStatus}
            </span>
          </div>

          {isLoading ? (
            <div className="profile-budget-loading" role="status">
              Memuat budget...
            </div>
          ) : (
            <>
              <form className="budget-form" onSubmit={handleBudgetSubmit} noValidate>
                <div className="category-budget-grid">
                  {BUDGET_CATEGORIES.map((category) => {
                    return (
                      <label
                        className={
                          isBudgetEditable
                            ? "category-budget-card"
                            : "category-budget-card locked"
                        }
                        key={category.name}
                      >
                        <span className="category-budget-heading">
                          <span
                            className="category-color-dot"
                            style={{ backgroundColor: category.color }}
                            aria-hidden="true"
                          />
                          {category.name}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          inputMode="numeric"
                          value={categoryInputs[category.name]}
                          placeholder="Budget"
                          disabled={!isBudgetEditable || isSaving}
                          onChange={(event) =>
                            handleCategoryBudgetChange(category.name, event.target.value)
                          }
                          aria-label={`Budget ${category.name}`}
                        />
                        <span className="category-usage">
                          Nilai berlaku sampai di-update
                        </span>
                      </label>
                    );
                  })}
                </div>

                <button
                  className="submit-button budget-save-button"
                  type="submit"
                  disabled={!isBudgetEditable || isSaving}
                >
                  <span className="button-content">
                    <Icon name="save" size={15} />
                    {isSaving ? "Menyimpan..." : "Simpan Budget Kategori"}
                  </span>
                </button>

                <button
                  className="budget-update-button"
                  type="button"
                  disabled={!hasSavedBudget || isBudgetEditable || isSaving}
                  onClick={handleBudgetEdit}
                >
                  <span className="button-content">
                    <Icon name="form" size={15} />
                    Update
                  </span>
                </button>
              </form>
            </>
          )}

          {(message || error) && (
            <p
              className={error ? "form-message danger-message" : "form-message"}
              role={error ? "alert" : "status"}
            >
              {error || message}
            </p>
          )}
        </section>

      </section>
    </>
  );
}

export default ProfilePage;
