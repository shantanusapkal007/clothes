import { InventoryManager } from "../../components/InventoryManager";

export default function InventoryPage() {
  return (
    <section className="page">
      <div className="hero">
        <div>
          <p className="eyebrow">Back office</p>
          <h2>Inventory that stays fast under pressure.</h2>
        </div>
        <p>Update product pricing, stock, barcode, discounts, and tax inline without extra forms.</p>
      </div>
      <InventoryManager />
    </section>
  );
}
