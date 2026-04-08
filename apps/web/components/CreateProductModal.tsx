"use client";

import { FormEvent, useEffect, useState } from "react";
import type { BarcodeData } from "../lib/barcode-parser";
import type { Product } from "../types";

type CreateProductModalProps = {
  barcode: string;
  seed?: BarcodeData | null;
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    category?: string;
    barcode?: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number;
    discountPercent: number;
    taxPercent: number;
  }) => Promise<Product>;
};

export function CreateProductModal({
  barcode,
  seed,
  open,
  onClose,
  onCreate
}: CreateProductModalProps) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    barcode,
    price: 0,
    costPrice: 0,
    stock: 1,
    minStock: 0,
    discountPercent: 0,
    taxPercent: 0
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setForm({
      name: "",
      category: "",
      barcode: seed?.barcode ?? barcode,
      price: seed?.price ?? 0,
      costPrice: 0,
      stock: 1,
      minStock: 0,
      discountPercent: seed?.discount ?? 0,
      taxPercent: 0
    });
  }, [open, barcode, seed]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      await onCreate(form);
      onClose();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">New product</p>
            <h2>Create scanned item</h2>
          </div>
          <button
            className="button button-ghost self-start sm:self-auto"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="inventory-form" onSubmit={handleSubmit}>
          <section className="space-y-3">
            <input
              className="text-input"
              placeholder="Product name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />

            <div className="inventory-grid">
              <input
                className="text-input"
                placeholder="Barcode"
                value={form.barcode}
                onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
              />
              <input
                className="text-input"
                type="number"
                step="0.01"
                min={0}
                placeholder="Selling price (Rs)"
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
                }
                required
              />
            </div>

            <div className="inventory-grid">
              <input
                className="text-input"
                placeholder="Category (optional)"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              />
              <input
                className="text-input"
                type="number"
                min={0}
                step="0.01"
                placeholder="Default tax % (optional)"
                value={form.taxPercent}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, taxPercent: Number(event.target.value) }))
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-4">
            <p className="eyebrow">Inventory & cost</p>
            <div className="inventory-grid">
              <input
                className="text-input"
                type="number"
                min={0}
                placeholder="Stock"
                value={form.stock}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))
                }
              />
              <input
                className="text-input"
                type="number"
                min={0}
                placeholder="Min stock"
                value={form.minStock}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, minStock: Number(event.target.value) }))
                }
              />
              <input
                className="text-input"
                type="number"
                step="0.01"
                min={0}
                placeholder="Cost price (optional)"
                value={form.costPrice}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, costPrice: Number(event.target.value) }))
                }
              />
              <input
                className="text-input"
                type="number"
                min={0}
                step="0.01"
                placeholder="Default discount % (optional)"
                value={form.discountPercent}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, discountPercent: Number(event.target.value) }))
                }
              />
            </div>
          </section>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="button button-primary w-full" disabled={pending} type="submit">
            {pending ? "Creating..." : "Create product"}
          </button>

          <p className="text-xs text-on-secondary-container">
            Tip: To auto-fill price/discount/qty from stickers, use QR/CODE128 data like{" "}
            <code>BARCODE|299.99|10|2</code>.
          </p>
        </form>
      </div>
    </div>
  );
}
