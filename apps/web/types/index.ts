export type Product = {
  id: string;
  name: string;
  category: string | null;
  barcode: string | null;
  price: number;
  costPrice: number;
  discountPercent: number;
  taxPercent: number;
  stock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  productId: string;
  name: string;
  barcode: string | null;
  quantity: number;
  price: number;
  discountPercent: number;
  taxPercent: number;
  stock: number;
};

export type BillResponse = {
  id: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  paymentMethod: string;
  createdAt: string;
};
