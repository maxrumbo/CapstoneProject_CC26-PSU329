import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import { useAuth } from "../context/useAuth";
import { changePasswordWithOtp, requestProfileOtp } from "../services/authApi";
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

function ProfilePage() {
  const navigate = useNavigate();
  const { token, user, clearSession } = useAuth();
  const [profileOverrides, setProfileOverrides] = useState({
    name: "",
    email: "",
    photoUrl: "",
  });
  const displayName =
    profileOverrides.name || user?.display_name || user?.email || "Pengguna SAWIT";
  const email = profileOverrides.email || user?.email || "-";
  const initial = displayName.trim() ? displayName.trim()[0].toUpperCase() : "S";
  const [budgetMonth] = useState(getCurrentMonth);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [profileOtp, setProfileOtp] = useState("");
  const [profileOtpMessage, setProfileOtpMessage] = useState("");
  const [profileOtpError, setProfileOtpError] = useState("");
  const [isSendingProfileOtp, setIsSendingProfileOtp] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editDraft, setEditDraft] = useState({
    name: displayName,
    email,
    password: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");

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

  useEffect(() => {
    setEditDraft({ name: displayName, email, password: "" });
    setIsPasswordEditing(false);
    setProfileOtp("");
    setProfileOtpMessage("");
    setProfileOtpError("");
  }, [displayName, email]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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

  const handleLogout = () => {
    clearSession();
    navigate("/auth", { replace: true });
  };

  const handleOpenEdit = () => {
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setIsPasswordEditing(false);
    setProfileOtp("");
    setProfileOtpMessage("");
    setProfileOtpError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const nextUrl = URL.createObjectURL(file);
    setPhotoPreview(nextUrl);
  };

  const handleSendProfileOtp = async () => {
    setIsSendingProfileOtp(true);
    setProfileOtpMessage("");
    setProfileOtpError("");

    try {
      const response = await requestProfileOtp(token);
      const otpCode = response?.data?.otp_code;
      setProfileOtpMessage(
        otpCode
          ? `OTP terkirim. (DEV) Kode: ${otpCode}`
          : "OTP terkirim ke email."
      );
    } catch (err) {
      setProfileOtpError(err.message || "Gagal mengirim OTP.");
    } finally {
      setIsSendingProfileOtp(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileOtpMessage("");
    setProfileOtpError("");

    if (isPasswordEditing) {
      if (!editDraft.password.trim()) {
        setProfileOtpError("Password baru wajib diisi.");
        return;
      }

      if (!profileOtp.trim()) {
        setProfileOtpError("Kode OTP wajib diisi.");
        return;
      }

      setIsChangingPassword(true);

      try {
        await changePasswordWithOtp(token, {
          code: profileOtp,
          new_password: editDraft.password,
        });
        setProfileOtpMessage("Password berhasil diperbarui.");
      } catch (err) {
        setProfileOtpError(err.message || "Gagal memperbarui password.");
        setIsChangingPassword(false);
        return;
      } finally {
        setIsChangingPassword(false);
      }
    }

    setProfileOverrides({
      name: editDraft.name.trim() || displayName,
      email: editDraft.email.trim() || email,
      photoUrl: photoPreview || profileOverrides.photoUrl,
    });
    setIsEditOpen(false);
    setIsPasswordEditing(false);
    setEditDraft((prev) => ({ ...prev, password: "" }));
    setProfileOtp("");
  };

  const handleHeroKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenEdit();
    }
  };

  return (
    <>
      <button className="profile-back-button" type="button" onClick={() => navigate(-1)}>
        <span className="button-content">
          <Icon name="arrowRight" size={15} />
          Kembali
        </span>
      </button>
      <header className="dashboard-section">
        <p className="dashboard-section-kicker">Akun</p>
        <h2>Profil</h2>
        <span>Update nominal kategori yang berlaku sampai kamu mengubahnya lagi.</span>
      </header>

      <section className="profile-stack" aria-label="Profil pengguna">
        <section
          className="panel profile-hero"
          role="button"
          tabIndex={0}
          onClick={handleOpenEdit}
          onKeyDown={handleHeroKeyDown}
          aria-label="Buka kartu edit profil"
        >
          <span className="profile-avatar-large" aria-hidden="true">
            {profileOverrides.photoUrl ? (
              <img
                className="profile-avatar-image"
                src={profileOverrides.photoUrl}
                alt="Foto profil"
              />
            ) : (
              initial
            )}
            <span className="profile-avatar-edit" aria-hidden="true">
              <Icon name="pencil" size={14} />
            </span>
          </span>
          <div className="profile-hero-content">
            <p className="eyebrow">Profil SAWIT</p>
            <h3>{displayName}</h3>
            <p>{email}</p>
          </div>
          <button
            className="profile-logout-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleLogout();
            }}
          >
            <span className="button-content">
              <Icon name="arrowRight" size={15} />
              Keluar
            </span>
          </button>
        </section>

        {isEditOpen && (
          <div className="profile-edit-overlay" role="dialog" aria-modal="true">
            <section className="panel profile-edit-card" aria-label="Edit profil">
              <div className="profile-edit-hero">
                <span className="profile-edit-avatar" aria-hidden="true">
                  {photoPreview || profileOverrides.photoUrl ? (
                    <img
                      src={photoPreview || profileOverrides.photoUrl}
                      alt="Pratinjau foto profil"
                    />
                  ) : (
                    initial
                  )}
                  <span className="profile-avatar-edit" aria-hidden="true">
                    <Icon name="pencil" size={12} />
                  </span>
                </span>
              </div>

              <form className="profile-edit-grid" onSubmit={handleSaveProfile}>
                <label className="profile-photo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  Ganti foto
                </label>

                <label className="profile-edit-field">
                  <span>Nama lengkap</span>
                  <input
                    type="text"
                    name="name"
                    value={editDraft.name}
                    onChange={handleEditChange}
                    placeholder="Nama lengkap"
                  />
                </label>

                <label className="profile-edit-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={editDraft.email}
                    onChange={handleEditChange}
                    placeholder="Email"
                  />
                </label>

                <label className="profile-edit-field">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    value={isPasswordEditing ? editDraft.password : "********"}
                    onChange={handleEditChange}
                    placeholder="Password baru"
                    readOnly={!isPasswordEditing}
                  />
                  <button
                    className="profile-password-action"
                    type="button"
                    onClick={() => {
                      setIsPasswordEditing(true);
                      setEditDraft((prev) => ({ ...prev, password: "" }));
                    }}
                  >
                    Ganti password
                  </button>
                </label>

                {isPasswordEditing && (
                  <>
                    <label className="profile-edit-field">
                      <span>Kode OTP</span>
                      <input
                        type="text"
                        name="profileOtp"
                        value={profileOtp}
                        onChange={(event) => setProfileOtp(event.target.value)}
                        placeholder="Masukkan OTP"
                      />
                    </label>
                    <div className="profile-edit-inline">
                      <button
                        className="profile-password-action"
                        type="button"
                        onClick={handleSendProfileOtp}
                        disabled={isSendingProfileOtp}
                      >
                        {isSendingProfileOtp ? "Mengirim OTP..." : "Kirim OTP"}
                      </button>
                      {profileOtpMessage && (
                        <span className="profile-edit-hint">{profileOtpMessage}</span>
                      )}
                    </div>
                  </>
                )}

                {profileOtpError && (
                  <p className="profile-edit-message danger-message" role="alert">
                    {profileOtpError}
                  </p>
                )}

                <div className="profile-edit-actions">
                  <button className="submit-button" type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Menyimpan..." : "Simpan perubahan"}
                  </button>
                  <button
                    className="budget-update-button"
                    type="button"
                    onClick={handleCloseEdit}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

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
