const RECOMMENDATIONS = [
  {
    maxMonthlySaving: 500000,
    status: "Ringan",
    message:
      "Target ini cukup ringan untuk dicapai jika kamu konsisten menabung.",
  },
  {
    maxMonthlySaving: 1500000,
    status: "Realistis",
    message:
      "Target ini cukup realistis jika kamu menjaga konsistensi tabungan setiap bulan.",
  },
];

const HIGH_COMMITMENT_RECOMMENDATION = {
  status: "Perlu Usaha Lebih",
  message:
    "Target ini membutuhkan komitmen tabungan yang cukup tinggi setiap bulan.",
};

const parsePositiveNumber = (value, emptyMessage, invalidMessage) => {
  if (String(value).trim() === "") {
    throw new Error(emptyMessage);
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(invalidMessage);
  }

  return parsedValue;
};

export const calculateWishlist = ({ itemName, targetPrice, targetMonths }) => {
  const normalizedItemName = String(itemName ?? "").trim();

  if (!normalizedItemName) {
    throw new Error("Nama barang wajib diisi.");
  }

  const parsedTargetPrice = parsePositiveNumber(
    targetPrice,
    "Harga barang wajib diisi.",
    "Harga barang harus lebih dari 0."
  );
  const parsedTargetMonths = parsePositiveNumber(
    targetMonths,
    "Target waktu wajib diisi.",
    "Target waktu harus lebih dari 0."
  );

  const monthlySaving = parsedTargetPrice / parsedTargetMonths;
  const weeklySaving = monthlySaving / 4;
  const dailySaving = monthlySaving / 30;
  const recommendation =
    RECOMMENDATIONS.find(
      ({ maxMonthlySaving }) => monthlySaving <= maxMonthlySaving
    ) ?? HIGH_COMMITMENT_RECOMMENDATION;

  return {
    itemName: normalizedItemName,
    targetPrice: parsedTargetPrice,
    targetMonths: parsedTargetMonths,
    monthlySaving,
    weeklySaving,
    dailySaving,
    status: recommendation.status,
    message: recommendation.message,
  };
};
