"use client";

import { useState, useEffect } from "react";
import {
  getPrinterConfig,
  savePrinterConfig,
  getBillLayoutConfig,
  saveBillLayoutConfig,
  DEFAULT_PRINTER_CONFIG,
  DEFAULT_BILL_LAYOUT,
  type PrinterConfig,
  type BillLayoutConfig,
  getAvailableUsbPrinters,
  requestUsbPrinter
} from "../lib/printer";
import type { FormEvent } from "react";

interface PrinterSettingsProps {
  onClose?: () => void;
}

export function PrinterSettings({ onClose }: PrinterSettingsProps) {
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(DEFAULT_PRINTER_CONFIG);
  const [billLayout, setBillLayout] = useState<BillLayoutConfig>(DEFAULT_BILL_LAYOUT);
  const [activeTab, setActiveTab] = useState<"printer" | "layout">("printer");
  const [message, setMessage] = useState<string | null>(null);
  const [availablePrinters, setAvailablePrinters] = useState<PrinterConfig[]>([]);
  const [testPrintPending, setTestPrintPending] = useState(false);

  useEffect(() => {
    setPrinterConfig(getPrinterConfig());
    setBillLayout(getBillLayoutConfig());
    loadAvailablePrinters();
  }, []);

  const loadAvailablePrinters = async () => {
    try {
      const printers = await getAvailableUsbPrinters();
      setAvailablePrinters(printers);
    } catch {
      // USB not available
    }
  };

  const handleRequestPrinter = async () => {
    try {
      const printer = await requestUsbPrinter();
      if (printer) {
        setPrinterConfig(printer);
        savePrinterConfig(printer);
        setMessage("Printer connected successfully!");
      }
    } catch {
      setMessage("Failed to connect printer");
    }
  };

  const handleSavePrinterConfig = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    savePrinterConfig(printerConfig);
    setMessage("Printer configuration saved!");
  };

  const handleSaveBillLayout = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveBillLayoutConfig(billLayout);
    setMessage("Bill layout saved!");
  };

  const handleTestPrint = async () => {
    try {
      setTestPrintPending(true);
      // Generate test print data
      const testContent = [
        "================================",
        `${billLayout.companyName}`,
        billLayout.companyPhone ? `Phone: ${billLayout.companyPhone}` : "",
        billLayout.companyAddress ? billLayout.companyAddress : "",
        "================================",
        "TEST PRINT - Sample Bill",
        "================================",
        "",
        "Item                    Qty  Price  Total",
        "------- ----- ----- -----",
        "Sample Item              1  100.00  100.00",
        "------- ----- ----- -----",
        "",
        "Items Total:              Rs 100.00",
        "Tax (5%):                 Rs 5.00",
        "TOTAL PAYABLE:            Rs 105.00",
        "",
        "Thank you!",
        ""
      ];

      // Try to print via ESC/POS if USB printer available
      if (printerConfig.connected && navigator.usb) {
        const devices = await navigator.usb.getDevices();
        if (devices.length > 0) {
          const device = devices[0];
          await device.open();
          if (device.configuration === null) {
            await device.selectConfiguration(1);
          }
          await device.claimInterface(0);

          const data = new TextEncoder().encode(testContent.join("\n"));
          await device.transferOut(1, data);
          await device.close();

          setMessage("Test print sent to printer!");
        }
      } else {
        // Fallback to browser print
        const printWindow = window.open("", "PRINT", "height=600,width=800");
        if (printWindow) {
          printWindow.document.write("<pre>" + testContent.join("\n") + "</pre>");
          printWindow.document.close();
          printWindow.print();
          setMessage("Test print opened in new window");
        }
      }
    } catch (error) {
      setMessage(`Test print failed: ${error}`);
    } finally {
      setTestPrintPending(false);
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-container">
        <div className="settings-header">
          <h2>Printer & Bill Settings</h2>
          <button className="button button-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {message && <div className="settings-message">{message}</div>}

        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === "printer" ? "active" : ""}`}
            onClick={() => setActiveTab("printer")}
          >
            Printer Setup
          </button>
          <button
            className={`tab-button ${activeTab === "layout" ? "active" : ""}`}
            onClick={() => setActiveTab("layout")}
          >
            Bill Layout
          </button>
        </div>

        {activeTab === "printer" && (
          <form onSubmit={handleSavePrinterConfig} className="settings-form">
            <h3>Printer Configuration</h3>

            <div className="form-section">
              <h4>Connect Printer</h4>
              <p className="form-help">
                Connect your thermal printer via USB. Requires browser support for WebUSB API.
              </p>

              {availablePrinters.length > 0 && (
                <div className="form-group">
                  <label>Available Printers</label>
                  <select
                    className="text-input"
                    value={printerConfig.name}
                    onChange={(e) => {
                      const selected = availablePrinters.find((p) => p.name === e.target.value);
                      if (selected) {
                        setPrinterConfig(selected);
                      }
                    }}
                  >
                    <option value="">Select printer...</option>
                    {availablePrinters.map((printer) => (
                      <option key={printer.name} value={printer.name}>
                        {printer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                className="button button-secondary"
                onClick={handleRequestPrinter}
              >
                Connect New Printer
              </button>
            </div>

            <div className="form-group">
              <label>
                Printer Name
                <input
                  className="text-input"
                  type="text"
                  value={printerConfig.name}
                  onChange={(e) => setPrinterConfig({ ...printerConfig, name: e.target.value })}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Paper Width (mm)
                <select
                  className="text-input"
                  value={printerConfig.width}
                  onChange={(e) =>
                    setPrinterConfig({
                      ...printerConfig,
                      width: parseInt(e.target.value, 10)
                    })
                  }
                >
                  <option value={80}>80mm (Standard)</option>
                  <option value={58}>58mm (Compact)</option>
                  <option value={110}>110mm (Wide)</option>
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={printerConfig.connected}
                  onChange={(e) =>
                    setPrinterConfig({
                      ...printerConfig,
                      connected: e.target.checked
                    })
                  }
                />
                Connected & Ready
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="button button-primary">
                Save Printer Config
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleTestPrint}
                disabled={testPrintPending}
              >
                {testPrintPending ? "Printing..." : "Test Print"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "layout" && (
          <form onSubmit={handleSaveBillLayout} className="settings-form">
            <h3>Bill Layout Configuration</h3>

            <div className="form-group">
              <label>
                Company Name
                <input
                  className="text-input"
                  type="text"
                  value={billLayout.companyName}
                  onChange={(e) => setBillLayout({ ...billLayout, companyName: e.target.value })}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Phone Number
                <input
                  className="text-input"
                  type="tel"
                  value={billLayout.companyPhone || ""}
                  onChange={(e) => setBillLayout({ ...billLayout, companyPhone: e.target.value })}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Address
                <textarea
                  className="text-input"
                  value={billLayout.companyAddress || ""}
                  onChange={(e) => setBillLayout({ ...billLayout, companyAddress: e.target.value })}
                  style={{ minHeight: "80px", fontFamily: "monospace" }}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Footer Message
                <input
                  className="text-input"
                  type="text"
                  value={billLayout.footerText || ""}
                  onChange={(e) => setBillLayout({ ...billLayout, footerText: e.target.value })}
                  placeholder="e.g., Thank you for shopping!"
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Font Size
                <select
                  className="text-input"
                  value={billLayout.fontSize}
                  onChange={(e) =>
                    setBillLayout({
                      ...billLayout,
                      fontSize: e.target.value as "small" | "medium" | "large"
                    })
                  }
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                Characters Per Line
                <input
                  className="text-input"
                  type="number"
                  min={30}
                  max={80}
                  value={billLayout.itemsPerLine}
                  onChange={(e) =>
                    setBillLayout({
                      ...billLayout,
                      itemsPerLine: parseInt(e.target.value, 10)
                    })
                  }
                />
              </label>
            </div>

            <fieldset className="form-fieldset">
              <legend>Display Options</legend>

              <label>
                <input
                  type="checkbox"
                  checked={billLayout.showItemDetails}
                  onChange={(e) =>
                    setBillLayout({ ...billLayout, showItemDetails: e.target.checked })
                  }
                />
                Show Item Details
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={billLayout.showTaxBreakdown}
                  onChange={(e) =>
                    setBillLayout({ ...billLayout, showTaxBreakdown: e.target.checked })
                  }
                />
                Show Tax Breakdown
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={billLayout.showDiscountBreakdown}
                  onChange={(e) =>
                    setBillLayout({
                      ...billLayout,
                      showDiscountBreakdown: e.target.checked
                    })
                  }
                />
                Show Discount Breakdown
              </label>
            </fieldset>

            <button type="submit" className="button button-primary">
              Save Bill Layout
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
