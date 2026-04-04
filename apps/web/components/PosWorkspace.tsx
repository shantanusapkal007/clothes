"use client";

import { useEffect, useMemo, useState } from "react";
import { CartPanel } from "./CartPanel";
import { CreateProductModal } from "./CreateProductModal";
import { ProductGrid } from "./ProductGrid";
import { ScannerPanel } from "./ScannerPanel";
import { BillPrintPreview } from "./BillPrintPreview";
import { PrinterSettings } from "./PrinterSettings";
import { checkoutBill, createProduct, getProductByBarcode, getProducts } from "../lib/api";
import { useCartStore } from "../lib/cart-store";
import { parseBarcodeData } from "../lib/barcode-parser";
import { calculateCheckout } from "../lib/billing";
import type { Product } from "../types";
import type { CheckoutSummary } from "../lib/billing";

export function PosWorkspace() {
  const { addItem, items, clearCart, updateItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createBarcode, setCreateBarcode] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printerSettingsOpen, setPrinterSettingsOpen] = useState(false);
  const [billPreviewOpen, setBillPreviewOpen] = useState(false);
  const [billData, setBillData] = useState<CheckoutSummary | null>(null);

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
      // Parse barcode data (may contain price/discount embedded)
      const barcodeData = parseBarcodeData(barcode.trim());

      const product = await getProductByBarcode(barcodeData.barcode);
      
      // Add product to cart
      handleProductAdd(product);

      // Apply price/discount override if embedded in barcode
      const cartItem = items.find((item) => item.productId === product.id);
      if (cartItem) {
        if (barcodeData.price !== undefined) {
          updateItem(product.id, "price", barcodeData.price);
          setMessage(`${product.name} added (price: Rs ${barcodeData.price.toFixed(2)})`);
        } else {
          setMessage(`${product.name} added to cart`);
        }

        if (barcodeData.discount !== undefined && barcodeData.discount > 0) {
          updateItem(product.id, "discountPercent", barcodeData.discount);
        }

        if (barcodeData.quantity !== undefined && barcodeData.quantity > 1) {
          updateItem(product.id, "quantity", barcodeData.quantity);
        }
      }

      setBarcodeInput("");
    } catch {
      setCreateBarcode(barcode.trim().split("|")[0]); // Create product with just barcode
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

      // Calculate bill summary
      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discountPercent: item.discountPercent,
        taxPercent: item.taxPercent
      }));

      const summary = calculateCheckout(checkoutItems);

      // Show bill preview before actual checkout
      setBillData({
        ...summary,
        items: items.map((item) => ({
          ...summary.items.find((si) => si.productId === item.productId) || {},
          productName: item.name
        }))
      });
      setBillPreviewOpen(true);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
      setCheckoutPending(false);
    }
  };

  const handleConfirmCheckout = async (paymentMethod: string) => {
    try {
      const result = await checkoutBill(items, paymentMethod);
      clearCart();
      setBillPreviewOpen(false);
      setBillData(null);
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
          <div className="panel-options">
            <button
              className="button button-secondary button-small"
              onClick={() => setPrinterSettingsOpen(true)}
              title="Configure thermal printer and bill layout"
            >
              ⚙️ Printer Settings
            </button>
          </div>
          <CartPanel
            onCheckout={handleCheckout}
            checkoutPending={checkoutPending}
          />
        </div>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {billPreviewOpen && billData && (
        <BillPrintPreview
          bill={billData}
          billNumber={Math.random().toString(36).substring(7).toUpperCase()}
          onPrint={() => handleConfirmCheckout("cash")}
          onClose={() => {
            setBillPreviewOpen(false);
            setBillData(null);
            setCheckoutPending(false);
          }}
        />
      )}

      {printerSettingsOpen && (
        <PrinterSettings onClose={() => setPrinterSettingsOpen(false)} />
      )}

      <CreateProductModal
        barcode={createBarcode}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </>
  );
}
