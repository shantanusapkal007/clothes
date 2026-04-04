"use client";

import { FormEvent, useEffect, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../lib/api";
import type { Product } from "../types";

const emptyForm = {
  name: "",
  category: "",
  barcode: "",
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 0,
  discountPercent: 0,
  taxPercent: 0
};

export function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await getProducts();
      setProducts(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const product = await createProduct(form);
      setProducts((current) => [product, ...current]);
      setForm(emptyForm);
      setMessage("Product created");
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create product");
    }
  };

  const handleFieldChange = (id: string, field: keyof Product, value: string | number) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]: value
            }
          : product
      )
    );
  };

  const handleSave = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, {
        name: product.name,
        category: product.category,
        barcode: product.barcode,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        minStock: product.minStock,
        discountPercent: product.discountPercent,
        taxPercent: product.taxPercent
      });

      setProducts((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setMessage(`Saved ${updated.name}`);
      setError(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product");
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage(`${product.name} deleted`);
      setError(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product");
    }
  };

  return (
    <div className="inventory-layout">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">New product</p>
            <h2>Add clothing stock fast</h2>
          </div>
          <span className="badge badge-muted">Inline-first</span>
        </div>

        <form className="inventory-form" onSubmit={handleCreate}>
          <div className="inventory-grid">
            <input
              className="text-input"
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              className="text-input"
              placeholder="Category"
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
            />
            <input
              className="text-input"
              placeholder="Barcode"
              value={form.barcode}
              onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
            />
            <input
              className="text-input"
              type="number"
              min={0}
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
              }
            />
            <input
              className="text-input"
              type="number"
              min={0}
              step="0.01"
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
          <button className="button button-primary" type="submit">
            Add product
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Inventory</p>
            <h2>Edit catalog in place</h2>
          </div>
          <span className="badge">{loading ? "Loading..." : `${products.length} products`}</span>
        </div>

        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Discount %</th>
                <th>Tax %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      className="table-input"
                      value={product.name}
                      onChange={(event) =>
                        handleFieldChange(product.id, "name", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      value={product.category || ""}
                      onChange={(event) =>
                        handleFieldChange(product.id, "category", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      value={product.barcode || ""}
                      onChange={(event) =>
                        handleFieldChange(product.id, "barcode", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      min={0}
                      step="0.01"
                      value={product.price}
                      onChange={(event) =>
                        handleFieldChange(product.id, "price", Number(event.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      min={0}
                      value={product.stock}
                      onChange={(event) =>
                        handleFieldChange(product.id, "stock", Number(event.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      min={0}
                      step="0.01"
                      value={product.discountPercent}
                      onChange={(event) =>
                        handleFieldChange(
                          product.id,
                          "discountPercent",
                          Number(event.target.value)
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      min={0}
                      step="0.01"
                      value={product.taxPercent}
                      onChange={(event) =>
                        handleFieldChange(product.id, "taxPercent", Number(event.target.value))
                      }
                    />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary"
                        type="button"
                        onClick={() => void handleSave(product)}
                      >
                        Save
                      </button>
                      <button
                        className="button button-ghost"
                        type="button"
                        onClick={() => void handleDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
