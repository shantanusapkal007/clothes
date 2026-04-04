"use client";

import type { Product } from "../types";

type ProductGridProps = {
  products: Product[];
  onAdd: (product: Product) => void;
};

export function ProductGrid({ products, onAdd }: ProductGridProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Products</p>
          <h2>Ready-to-sell catalog</h2>
        </div>
        <span className="badge">{products.length} items</span>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <button
            key={product.id}
            className="product-card"
            type="button"
            onClick={() => onAdd(product)}
          >
            <div>
              <h3>{product.name}</h3>
              <p>{product.category || "Uncategorized"}</p>
            </div>
            <div className="product-meta">
              <strong>Rs {product.price.toFixed(2)}</strong>
              <span className={product.stock <= product.minStock ? "badge badge-alert" : "badge"}>
                Stock {product.stock}
              </span>
            </div>
          </button>
        ))}

        {products.length === 0 ? (
          <div className="empty-card">
            <h3>No products found</h3>
            <p>Try another search term or create a product from a scanned barcode.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
