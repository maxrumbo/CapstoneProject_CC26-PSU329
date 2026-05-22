export const formatCurrency = (value) => {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};