import type { BillResponse, Product } from "../types";
import type { CartItem } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getProducts(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<Product[]>(`/products${query}`);
}

export function getProductByBarcode(code: string) {
  return request<Product>(`/products/barcode/${encodeURIComponent(code)}`);
}

export function createProduct(product: Partial<Product> & Pick<Product, "name" | "price">) {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(product)
  });
}

export function updateProduct(id: string, product: Partial<Product>) {
  return request<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product)
  });
}

export function deleteProduct(id: string) {
  return request<void>(`/products/${id}`, {
    method: "DELETE"
  });
}

export function checkoutBill(items: CartItem[], paymentMethod: string) {
  return request<BillResponse & { summary: unknown }>("/bills", {
    method: "POST",
    body: JSON.stringify({
      paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discountPercent: item.discountPercent,
        taxPercent: item.taxPercent
      }))
    })
  });
}
