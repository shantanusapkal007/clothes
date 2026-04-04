import { PosWorkspace } from "../components/PosWorkspace";

export default function HomePage() {
  return (
    <section className="page">
      <div className="hero">
        <div>
          <p className="eyebrow">Sales floor</p>
          <h2>Scan fast. Edit anything. Checkout once.</h2>
        </div>
        <p>
          Built for apparel stores that need flexible pricing, barcode speed, and simple billing
          without rigid rules.
        </p>
      </div>
      <PosWorkspace />
    </section>
  );
}
