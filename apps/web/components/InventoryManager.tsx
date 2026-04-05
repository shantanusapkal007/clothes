"use client";

import { useEffect, useState, useMemo } from "react";
import { type Product } from "../types";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../lib/api";

type FormState = {
  name: string;
  category: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  discountPercent: number;
  taxPercent: number;
};

const DEFAULT_FORM: FormState = {
  name: "",
  category: "Tops",
  barcode: "",
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 2,
  discountPercent: 0,
  taxPercent: 5
};

export function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{Text: string, Type: "success" | "error"} | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch {
      showMessage("Failed to load inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage({Text: msg, Type: type});
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) {
      showMessage("Please provide valid name and price", "error");
      return;
    }
    try {
      const newProduct = await createProduct(form);
      setProducts([newProduct, ...products]);
      setForm(DEFAULT_FORM);
      showMessage("Product added to stock");
    } catch {
      showMessage("Failed to add product", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showMessage("Product deleted");
    } catch {
      showMessage("Failed to delete product", "error");
    }
  };

  const handleUpdateField = async (id: string, field: keyof Product, value: number | string) => {
    try {
      await updateProduct(id, { [field]: value });
      setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
      showMessage("Updated successfully");
    } catch {
      showMessage("Failed to update", "error");
    }
  };

  const visibleProducts = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }, [products, search]);

  const getProductImage = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=e9e1d7&color=774420&size=128&font-size=0.3`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
      
      {/* Global Alerts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {message && (
          <div className={`px-6 py-3 rounded-full text-sm shadow-[0_10px_30px_rgba(0,0,0,0.1)] pointer-events-auto flex items-center gap-2 ${
            message.Type === 'error' ? 'bg-error-container text-error' : 'bg-emerald-100 text-emerald-800'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {message.Type === 'error' ? 'error' : 'check_circle'}
            </span>
            {message.Text}
          </div>
        )}
      </div>

      {/* New Product Form Panel */}
      <section className="lg:col-span-4 bg-surface-container-low p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/20">
        <div className="mb-6">
          <h3 className="text-2xl font-serif text-primary mb-1">Add clothing stock fast</h3>
          <p className="text-on-secondary-container text-sm">Quick register for new seasonal items.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleCreateProduct}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              Product Title <span className="text-error">*</span>
            </label>
            <input 
              className="w-full bg-surface-container-lowest border-none rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:opacity-30 ring-1 ring-outline-variant/30" 
              placeholder="e.g. Linen Blouse Ivory" 
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Category</label>
              <select 
                className="w-full bg-surface-container-lowest border-none rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-primary/20 text-on-surface ring-1 ring-outline-variant/30"
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              >
                <option>Tops</option>
                <option>Dresses</option>
                <option>Bottoms</option>
                <option>Accessories</option>
                <option>Outerwear</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Barcode (SKU)</label>
              <input 
                className="w-full bg-surface-container-lowest border-none rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-primary/20 text-on-surface ring-1 ring-outline-variant/30" 
                placeholder="Auto-generate" 
                type="text"
                value={form.barcode}
                onChange={(e) => setForm({...form, barcode: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                Price ($) <span className="text-error">*</span>
              </label>
              <input 
                className="w-full bg-surface-container-lowest border-none rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-primary/20 text-on-surface ring-1 ring-outline-variant/30" 
                placeholder="0.00" 
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price || ""}
                onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cost Price</label>
              <input 
                className="w-full bg-surface-container-lowest border-none rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-primary/20 text-on-surface ring-1 ring-outline-variant/30" 
                placeholder="0.00" 
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice || ""}
                onChange={(e) => setForm({...form, costPrice: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Initial Stock</label>
              <input 
                className="w-full bg-surface-container-lowest border-none rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-primary/20 text-on-surface ring-1 ring-outline-variant/30" 
                placeholder="0" 
                type="number"
                min="0"
                value={form.stock || ""}
                onChange={(e) => setForm({...form, stock: parseInt(e.target.value, 10) || 0})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tax %</label>
              <input 
                className="w-full bg-surface-container-lowest border-none rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-primary/20 text-on-surface ring-1 ring-outline-variant/30" 
                placeholder="0" 
                type="number"
                min="0"
                max="100"
                value={form.taxPercent || ""}
                onChange={(e) => setForm({...form, taxPercent: parseInt(e.target.value, 10) || 0})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add to Catalog
          </button>
        </form>
      </section>

      {/* Product Table Panel (Main Content) */}
      <section className="lg:col-span-8 bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_20px_40px_rgba(49,19,0,0.04)] border border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h3 className="text-3xl font-serif text-on-surface">Current Stock</h3>
            <p className="text-on-secondary-container">{products.length} items currently in floor rotation.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="bg-surface-container-low px-4 py-2 flex-grow md:flex-grow-0 rounded-full flex items-center gap-2 border border-outline-variant/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <span className="material-symbols-outlined text-sm md:text-base text-primary">search</span>
              <input 
                className="bg-transparent border-none text-sm focus:ring-0 p-0 w-full md:w-48 placeholder:text-on-surface-variant/40" 
                placeholder="Search catalog..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="material-symbols-outlined p-2 text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high rounded-full transition-colors shrink-0">
              filter_list
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center opacity-50">
            <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="p-8 text-center text-secondary border border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/50">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-50">inventory_2</span>
            <h3 className="font-headline text-lg mb-1">No products found</h3>
            <p className="text-sm">Store looks empty. Add some new stock!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] text-on-surface-variant/60 border-b border-outline-variant/20">
                  <th className="pb-4 font-bold pl-2">Item Detail</th>
                  <th className="pb-4 font-bold text-center">In Stock</th>
                  <th className="pb-4 font-bold text-right">Price</th>
                  <th className="pb-4 font-bold text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {visibleProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 md:py-6 pl-2">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-surface-container-high overflow-hidden shrink-0 ring-1 ring-outline-variant/20">
                          <img 
                            alt={p.name} 
                            src={getProductImage(p.name)} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif text-base md:text-lg text-on-surface leading-tight truncate px-1">
                            {p.name}
                          </div>
                          <div className="text-[10px] md:text-xs text-on-secondary-container mt-1 uppercase tracking-widest px-1 truncate">
                            {p.category ? `${p.category} • ` : ''}SKU: {p.barcode || p.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 md:py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <input 
                          className={`w-14 md:w-16 border-none rounded-lg p-2 text-center text-sm font-bold focus:ring-1 focus:ring-primary/20 hover:bg-surface-container-high transition-colors ${
                            p.stock <= p.minStock 
                              ? "bg-error-container/30 text-error ring-1 ring-error/20" 
                              : "bg-surface-container-low/50"
                          }`}
                          type="number" 
                          value={p.stock}
                          onChange={(e) => handleUpdateField(p.id, "stock", parseInt(e.target.value, 10) || 0)}
                        />
                        {p.stock <= p.minStock && (
                          <span className="text-[9px] font-bold text-error uppercase mt-1">Low Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 md:py-6 text-right font-serif text-on-surface text-base md:text-lg">
                      <div className="inline-flex items-center justify-end">
                        <span className="text-sm text-secondary mr-1">$</span>
                        <input 
                          className="w-20 md:w-24 bg-transparent border-none rounded-lg p-2 text-right font-serif text-base md:text-lg focus:ring-1 focus:ring-primary/20 hover:bg-surface-container-low transition-colors"
                          type="number" 
                          value={p.price}
                          step="0.01"
                          onChange={(e) => handleUpdateField(p.id, "price", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </td>
                    <td className="py-4 md:py-6 text-right pr-2">
                      <div className="flex justify-end gap-1 md:gap-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(p.id, p.name)}
                          className="material-symbols-outlined text-error/60 p-2 hover:bg-error-container hover:text-error rounded-full transition-colors" 
                          title="Delete"
                        >
                          delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && visibleProducts.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant/20 pt-6 gap-4">
            <button className="text-sm font-bold text-primary hover:underline transition-all order-2 sm:order-1">
              Download Inventory Report (CSV)
            </button>
            <div className="flex items-center gap-4 order-1 sm:order-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20">
              <span className="text-xs text-on-secondary-container font-medium">{visibleProducts.length} results</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
