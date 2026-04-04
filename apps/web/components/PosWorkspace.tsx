"use client";

import { useEffect, useMemo, useState } from "react";
import { CartPanel } from "./CartPanel";
import { CreateProductModal } from "./CreateProductModal";
import { ProductGrid } from "./ProductGrid";
import { ScannerPanel } from "./ScannerPanel";
import { checkoutBill, createProduct, getProductByBarcode, getProducts } from "../lib/api";
import { useCartStore } from "../lib/cart-store";
import type { Product } from "../types";

export function PosWorkspace() {
  const { addItem, items, clearCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createBarcode, setCreateBarcode] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }

    const query = search.toLowerCase();
    return products.filter((product) =>
      [product.name, product.category || "", product.barcode || ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [products, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const nextProducts = await getProducts();
      setProducts(nextProducts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleProductAdd = (product: Product) => {
    addItem(product);
    setMessage(`${product.name} added to cart`);
    setError(null);
  };

  const handleBarcodeSubmit = async (barcode: string) => {
    if (!barcode.trim()) {
      return;
    }

    try {
      const product = await getProductByBarcode(barcode.trim());
      handleProductAdd(product);
      setBarcodeInput("");
    } catch {
      setCreateBarcode(barcode.trim());
      setCreateModalOpen(true);
      setMessage(null);
      setError("Barcode not found. Create the product and continue.");
    }
  };

  const handleCreateProduct = async (payload: {
    name: string;
    category?: string;
    barcode?: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number;
    discountPercent: number;
    taxPercent: number;
  }) => {
    const product = await createProduct(payload);
    setProducts((current) => [product, ...current]);
    addItem(product);
    setBarcodeInput("");
    setMessage(`${product.name} created and added to cart`);
    setError(null);
    return product;
  };

  const handleCheckout = async (paymentMethod: string) => {
    try {
      setCheckoutPending(true);
      setError(null);
      const result = await checkoutBill(items, paymentMethod);
      clearCart();
      setMessage(`Bill ${result.id.slice(0, 8)} saved successfully`);
      await loadProducts();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
    } finally {
      setCheckoutPending(false);
    }
  };

  return (
    <>
      <div className="workspace-grid">
        <div className="workspace-left">
          <ScannerPanel
            barcodeInput={barcodeInput}
            setBarcodeInput={setBarcodeInput}
            onBarcodeSubmit={handleBarcodeSubmit}
          />

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Search</p>
                <h2>Fast product lookup</h2>
              </div>
              {loading ? <span className="badge badge-muted">Loading</span> : null}
            </div>
            <input
              className="text-input"
              placeholder="Search by name, category, or barcode"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </section>

          <ProductGrid products={visibleProducts} onAdd={handleProductAdd} />
        </div>

        <div className="workspace-right">
          <CartPanel onCheckout={handleCheckout} checkoutPending={checkoutPending} />
        </div>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <CreateProductModal
        barcode={createBarcode}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </>
  );
}
