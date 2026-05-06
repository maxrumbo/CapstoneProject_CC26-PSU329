import DashboardHeader from "../components/dashboard/DashboardHeader";
import WishlistCalculator from "../features/wishlist/components/WishlistCalculator";

function WishlistPage() {
  return (
    <>
      <DashboardHeader
        eyebrow="Fitur Aktif"
        title="Wishlist Calculator"
        description="Hitung estimasi tabungan dari nol untuk mencapai target barang impian."
        icon="target"
      />

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <WishlistCalculator />
        </div>
      </section>
    </>
  );
}

export default WishlistPage;
