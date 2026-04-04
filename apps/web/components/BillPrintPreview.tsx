"use client";

import { useMemo } from "react";
import { getBillLayoutConfig } from "../lib/printer";
import type { CheckoutSummary } from "../lib/billing";
import type { Product } from "../types";

interface BillPrintPreviewProps {
  bill: CheckoutSummary & { items?: Array<{ productName: string } & Record<string, unknown>> };
  products?: Product[];
  billNumber?: string;
  onPrint?: () => void;
  onClose?: () => void;
}

export function BillPrintPreview({
  bill,
  billNumber = "N/A",
  onPrint,
  onClose
}: BillPrintPreviewProps) {
  const billLayout = getBillLayoutConfig();

  const contentLines = useMemo(() => {
    const lines: string[] = [];

    // Header
    if (billLayout.companyName) {
      lines.push(billLayout.companyName);
    }
    if (billLayout.companyPhone) {
      lines.push(`Phone: ${billLayout.companyPhone}`);
    }
    if (billLayout.companyAddress) {
      lines.push(billLayout.companyAddress);
    }

    lines.push("");
    lines.push("=".repeat(billLayout.itemsPerLine));
    lines.push(`Bill #${billNumber}`);
    lines.push(new Date().toLocaleString());
    lines.push("=".repeat(billLayout.itemsPerLine));
    lines.push("");

    // Items header
    if (billLayout.showItemDetails) {
      const itemLine = padLineFormat("Item", "Qty", "Price", "Total", billLayout.itemsPerLine);
      lines.push(itemLine);
      lines.push("-".repeat(billLayout.itemsPerLine));
    }

    // Items
    if (bill.items && bill.items.length > 0) {
      for (const item of bill.items) {
        const itemName = (item.productName || "Item").substring(0, 20);
        const quantity = (item.quantity as number)?.toString() || "1";
        const price = `Rs ${((item.price as number) || 0).toFixed(2)}`;
        const total = `Rs ${((item.total as number) || 0).toFixed(2)}`;

        const itemLine = padLineFormat(itemName, quantity, price, total, billLayout.itemsPerLine);
        lines.push(itemLine);

        // Show discount if item has discount
        if (billLayout.showDiscountBreakdown && (item.discountAmount as number) > 0) {
          const discountLine = `  Discount: -Rs ${((item.discountAmount as number) || 0).toFixed(2)}`;
          lines.push(discountLine);
        }

        // Show tax if item has tax
        if (billLayout.showTaxBreakdown && (item.taxAmount as number) > 0) {
          const taxLine = `  Tax: +Rs ${((item.taxAmount as number) || 0).toFixed(2)}`;
          lines.push(taxLine);
        }
      }
    }

    lines.push("");
    lines.push("-".repeat(billLayout.itemsPerLine));

    // Summary
    lines.push(
      formatSummaryLine("Items Total", `Rs ${bill.totalAmount.toFixed(2)}`, billLayout.itemsPerLine)
    );

    if (billLayout.showDiscountBreakdown && bill.discountAmount > 0) {
      lines.push(
        formatSummaryLine("Discount", `-Rs ${bill.discountAmount.toFixed(2)}`, billLayout.itemsPerLine)
      );
    }

    if (billLayout.showTaxBreakdown && bill.taxAmount > 0) {
      lines.push(
        formatSummaryLine("Tax", `+Rs ${bill.taxAmount.toFixed(2)}`, billLayout.itemsPerLine)
      );
    }

    lines.push("=".repeat(billLayout.itemsPerLine));
    lines.push(
      formatSummaryLine(
        "TOTAL PAYABLE",
        `Rs ${bill.finalAmount.toFixed(2)}`,
        billLayout.itemsPerLine,
        true
      )
    );
    lines.push("=".repeat(billLayout.itemsPerLine));

    // Footer
    lines.push("");
    if (billLayout.footerText) {
      lines.push(billLayout.footerText);
    }
    lines.push("Thank you for your purchase!");
    lines.push("");

    return lines;
  }, [bill, billNumber, billLayout]);

  const printBill = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print using window.print()
      window.print();
    }
  };

  return (
    <div className="bill-preview-modal">
      <div className="bill-preview-container">
        <div className="bill-preview-header">
          <h2>Bill Preview</h2>
          <button className="button button-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="bill-preview-content">
          <pre>{contentLines.join("\n")}</pre>
        </div>

        <div className="bill-preview-actions">
          <button className="button button-primary" onClick={printBill}>
            Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to pad line for fixed-width font display
function padLineFormat(
  left: string,
  qty: string,
  price: string,
  right: string,
  totalWidth: number
): string {
  const availableWidth = totalWidth - 4; // Reserve space
  const qtyWidth = 4;
  const priceWidth = 12;
  const rightWidth = 12;
  const leftWidth = availableWidth - qtyWidth - priceWidth - rightWidth;

  const paddedLeft = left.padEnd(leftWidth);
  const paddedQty = qty.padStart(qtyWidth);
  const paddedPrice = price.padStart(priceWidth);
  const paddedRight = right.padStart(rightWidth);

  return `${paddedLeft}${paddedQty}${paddedPrice}${paddedRight}`;
}

function formatSummaryLine(label: string, value: string, totalWidth: number, bold = false): string {
  const availableWidth = totalWidth - 4;
  const paddedLabel = label.padEnd(availableWidth - value.length);
  const line = `${paddedLabel}${value}`;
  return bold ? line.toUpperCase() : line;
}
