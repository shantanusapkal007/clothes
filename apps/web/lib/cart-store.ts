"use client";

import { create } from "zustand";
import type { CartItem, Product } from "../types";

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  updateItem: (
    productId: string,
    field: "quantity" | "price" | "discountPercent" | "taxPercent",
    value: number
  ) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity:
                    product.stock > 0
                      ? Math.min(item.quantity + 1, product.stock)
                      : item.quantity,
                  stock: product.stock
                }
              : item
          )
        };
      }

      return {
        items: [
          {
            productId: product.id,
            name: product.name,
            barcode: product.barcode,
            quantity: 1,
            price: product.price,
            discountPercent: product.discountPercent,
            taxPercent: product.taxPercent,
            stock: product.stock
          },
          ...state.items
        ]
      };
    }),
  updateItem: (productId, field, value) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              [field]:
                field === "quantity"
                  ? Math.max(
                      1,
                      Math.min(
                        Math.trunc(Number.isFinite(value) ? value : 1),
                        Math.max(item.stock, 1)
                      )
                    )
                  : Math.max(0, Number.isFinite(value) ? value : 0)
            }
          : item
      )
    })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId)
    })),
  clearCart: () => set({ items: [] })
}));
