import WishlistCalculator from "../features/wishlist/components/WishlistCalculator";

function WishlistPage() {
  return (
    <>
      <header className="dashboard-section">
        <p className="dashboard-section-kicker">Wishlist</p>
        <h2>Wishlist Calculator</h2>
        <span>
          Hitung estimasi tabungan dari nol untuk mencapai target barang impian.
        </span>
      </header>

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <WishlistCalculator />
        </div>
      </section>
    </>
  );
}

export default WishlistPage;
