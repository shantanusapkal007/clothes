"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Product } from "../types";

type CreateProductModalProps = {
  barcode: string;
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
    setForm((prev) => ({
      ...prev,
      barcode
    }));
  }, [barcode]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      await onCreate(form);
      setForm({
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
          <button className="button button-ghost self-start sm:self-auto" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="inventory-form" onSubmit={handleSubmit}>
          <input
            className="text-input"
            placeholder="Product name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="text-input"
            placeholder="Category"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <input
            className="text-input"
            placeholder="Barcode"
            value={form.barcode}
            onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
          />
          <div className="inventory-grid">
            <input
              className="text-input"
              type="number"
              step="0.01"
              min={0}
              placeholder="Price"
              value={form.price}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
              }
            />
            <input
              className="text-input"
              type="number"
              step="0.01"
              min={0}
              placeholder="Cost price"
              value={form.costPrice}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, costPrice: Number(event.target.value) }))
              }
            />
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
              min={0}
              step="0.01"
              placeholder="Discount %"
              value={form.discountPercent}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, discountPercent: Number(event.target.value) }))
              }
            />
            <input
              className="text-input"
              type="number"
              min={0}
              step="0.01"
              placeholder="Tax %"
              value={form.taxPercent}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, taxPercent: Number(event.target.value) }))
              }
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="button button-primary w-full" disabled={pending} type="submit">
            {pending ? "Creating..." : "Create product"}
          </button>
        </form>
      </div>
    </div>
  );
}
