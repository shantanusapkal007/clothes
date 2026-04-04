"use client";

import { useMemo, useState } from "react";
import { calculateCart } from "../lib/cart-calculations";
import { useCartStore } from "../lib/cart-store";

type CartPanelProps = {
  onCheckout: (paymentMethod: string) => Promise<void>;
  checkoutPending: boolean;
};

export function CartPanel({ onCheckout, checkoutPending }: CartPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const { items, updateItem, removeItem } = useCartStore();
  const summary = useMemo(() => calculateCart(items), [items]);

  return (
    <section className="panel cart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Cart</p>
          <h2>Editable billing</h2>
        </div>
        <span className="badge badge-strong">{items.length} lines</span>
      </div>

      <div className="cart-list">
        {summary.lines.map((item) => (
          <article className="cart-item" key={item.productId}>
            <div className="cart-item-header">
              <div>
                <h3>{item.name}</h3>
                <p>{item.barcode || "Manual sale item"}</p>
              </div>
              <button
                className="button button-ghost"
                type="button"
                onClick={() => removeItem(item.productId)}
              >
                Remove
              </button>
            </div>

            <div className="cart-fields">
              <label>
                Qty
                <input
                  className="text-input"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(item.productId, "quantity", Number(event.target.value))
                  }
                />
              </label>
              <label>
                Price
                <input
                  className="text-input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.price}
                  onChange={(event) =>
                    updateItem(item.productId, "price", Number(event.target.value))
                  }
                />
              </label>
              <label>
                Discount %
                <input
                  className="text-input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.discountPercent}
                  onChange={(event) =>
                    updateItem(item.productId, "discountPercent", Number(event.target.value))
                  }
                />
              </label>
              <label>
                Tax %
                <input
                  className="text-input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.taxPercent}
                  onChange={(event) =>
                    updateItem(item.productId, "taxPercent", Number(event.target.value))
                  }
                />
              </label>
            </div>

            <div className="cart-totals">
              <span>Subtotal Rs {item.lineSubtotal.toFixed(2)}</span>
              <span>Discount Rs {item.discountAmount.toFixed(2)}</span>
              <span>Tax Rs {item.taxAmount.toFixed(2)}</span>
              <strong>Total Rs {item.total.toFixed(2)}</strong>
            </div>
          </article>
        ))}

        {items.length === 0 ? (
          <div className="empty-card">
            <h3>Cart is empty</h3>
            <p>Add a product from search or scan a barcode to begin billing.</p>
          </div>
        ) : null}
      </div>

      <div className="summary-box">
        <div>
          <span>Items total</span>
          <strong>Rs {summary.totalAmount.toFixed(2)}</strong>
        </div>
        <div>
          <span>Discount</span>
          <strong>Rs {summary.discountAmount.toFixed(2)}</strong>
        </div>
        <div>
          <span>Tax</span>
          <strong>Rs {summary.taxAmount.toFixed(2)}</strong>
        </div>
        <div className="summary-final">
          <span>Payable</span>
          <strong>Rs {summary.finalAmount.toFixed(2)}</strong>
        </div>
      </div>

      <div className="checkout-row">
        <select
          className="text-input"
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="mixed">Mixed</option>
        </select>
        <button
          className="button button-primary checkout-button"
          type="button"
          disabled={items.length === 0 || checkoutPending}
          onClick={() => onCheckout(paymentMethod)}
        >
          {checkoutPending ? "Saving bill..." : "Checkout"}
        </button>
      </div>
    </section>
  );
}
