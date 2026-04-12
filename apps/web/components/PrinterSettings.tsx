"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  DEFAULT_BILL_LAYOUT,
  DEFAULT_PRINTER_CONFIG,
  buildReceiptText,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  disconnectSerialPrinter,
  getAvailableBluetoothPrinters,
  getAvailableSerialPrinters,
  getAvailableUsbPrinters,
  getBillLayoutConfig,
  getPrinterConfig,
  isBluetoothAvailable,
  isRawBtAvailable,
  isSerialAvailable,
  isUsbAvailable,
  normalizeBillLayoutConfig,
  openBrowserPrintWindow,
  requestBluetoothPrinter,
  requestSerialPrinter,
  requestUsbPrinter,
  saveBillLayoutConfig,
  savePrinterConfig,
  sendPrintData,
  type BillLayoutConfig,
  type PrinterConfig
} from "../lib/printer";

interface PrinterSettingsProps {
  onClose?: () => void;
}

function sameValue<T>(left: T, right: T) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function formatSavedLabel(savedAt: string | null) {
  if (!savedAt) {
    return "Stored in this browser";
  }

  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return "Stored in this browser";
  }

  return `Verified ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

export function PrinterSettings({ onClose }: PrinterSettingsProps) {
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(DEFAULT_PRINTER_CONFIG);
  const [billLayout, setBillLayout] = useState<BillLayoutConfig>(DEFAULT_BILL_LAYOUT);
  const [activeTab, setActiveTab] = useState<"printer" | "layout">("printer");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [availableUsbPrinters, setAvailableUsbPrinters] = useState<PrinterConfig[]>([]);
  const [availableSerialPrinters, setAvailableSerialPrinters] = useState<PrinterConfig[]>([]);
  const [availableBluetoothPrinters, setAvailableBluetoothPrinters] = useState<PrinterConfig[]>([]);
  const [testPrintPending, setTestPrintPending] = useState(false);
  const [usbAvailable, setUsbAvailable] = useState(false);
  const [serialAvailable, setSerialAvailable] = useState(false);
  const [btAvailable, setBtAvailable] = useState(false);
  const [rawbtAvailable, setRawbtAvailable] = useState(false);
  const [btConnecting, setBtConnecting] = useState(false);
  const [serialConnecting, setSerialConnecting] = useState(false);
  const [printerPersisted, setPrinterPersisted] = useState(true);
  const [layoutPersisted, setLayoutPersisted] = useState(true);
  const [printerSavedAt, setPrinterSavedAt] = useState<string | null>(null);
  const [layoutSavedAt, setLayoutSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const storedPrinter = getPrinterConfig();
    const storedLayout = getBillLayoutConfig();

    setPrinterConfig(storedPrinter);
    setBillLayout(storedLayout);
    setPrinterPersisted(true);
    setLayoutPersisted(true);
    setUsbAvailable(isUsbAvailable());
    setSerialAvailable(isSerialAvailable());
    setBtAvailable(isBluetoothAvailable());
    setRawbtAvailable(isRawBtAvailable());
    void loadAvailablePrinters();
  }, []);

  const showMessage = (text: string, type: "success" | "error" | "info" = "info") => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(null), 5000);
  };

  const loadAvailablePrinters = async () => {
    try {
      const [usbPrinters, serialPrinters, bluetoothPrinters] = await Promise.all([
        getAvailableUsbPrinters(),
        getAvailableSerialPrinters(),
        getAvailableBluetoothPrinters()
      ]);

      setAvailableUsbPrinters(usbPrinters);
      setAvailableSerialPrinters(serialPrinters);
      setAvailableBluetoothPrinters(bluetoothPrinters);
    } catch {
      try {
        setAvailableUsbPrinters(await getAvailableUsbPrinters());
      } catch {
        setAvailableUsbPrinters([]);
      }

      try {
        setAvailableSerialPrinters(await getAvailableSerialPrinters());
      } catch {
        setAvailableSerialPrinters([]);
      }

      try {
        setAvailableBluetoothPrinters(await getAvailableBluetoothPrinters());
      } catch {
        setAvailableBluetoothPrinters([]);
      }
    }
  };

  const persistPrinterConfig = (nextConfig: PrinterConfig) => {
    const normalized = {
      ...DEFAULT_PRINTER_CONFIG,
      ...nextConfig
    };

    setPrinterConfig(normalized);
    savePrinterConfig(normalized);

    const persisted = sameValue(getPrinterConfig(), normalized);
    setPrinterPersisted(persisted);
    if (persisted) {
      setPrinterSavedAt(new Date().toISOString());
    }

    return persisted;
  };

  const persistBillLayout = (nextLayout: BillLayoutConfig) => {
    setBillLayout(nextLayout);
    saveBillLayoutConfig(nextLayout);

    const persisted = sameValue(getBillLayoutConfig(), nextLayout);
    setLayoutPersisted(persisted);
    if (persisted) {
      setLayoutSavedAt(new Date().toISOString());
    }

    return persisted;
  };

  const updatePrinter = (nextConfig: PrinterConfig) => {
    persistPrinterConfig(nextConfig);
  };

  const updateLayout = (partial: Partial<BillLayoutConfig>) => {
    const nextLayout = normalizeBillLayoutConfig({ ...billLayout, ...partial });
    persistBillLayout(nextLayout);
  };

  const handleRequestUsbPrinter = async () => {
    if (!usbAvailable) {
      showMessage("USB printing requires Chrome/Edge over HTTPS (or localhost).", "error");
      return;
    }

    try {
      const printer = await requestUsbPrinter();
      if (!printer) {
        showMessage("No USB printer selected", "error");
        return;
      }

      updatePrinter({
        ...printer,
        width: billLayout.paperWidth
      });
      await loadAvailablePrinters();
      showMessage("USB printer connected successfully", "success");
    } catch {
      showMessage("Failed to connect USB printer", "error");
    }
  };

  const handleRequestSerialPrinter = async () => {
    if (!serialAvailable) {
      showMessage("Serial printing is available only in desktop Chrome/Edge over HTTPS.", "error");
      return;
    }

    setSerialConnecting(true);
    try {
      const printer = await requestSerialPrinter(printerConfig.serialBaudRate ?? 9600);
      if (!printer) {
        showMessage("No serial printer selected", "error");
        return;
      }

      updatePrinter({
        ...printer,
        width: billLayout.paperWidth
      });
      await loadAvailablePrinters();
      showMessage("Serial printer connected successfully", "success");
    } catch {
      showMessage("Failed to connect serial printer", "error");
    } finally {
      setSerialConnecting(false);
    }
  };

  const handleRequestBluetoothPrinter = async () => {
    setBtConnecting(true);
    try {
      const printer = await requestBluetoothPrinter();
      if (!printer) {
        showMessage("No Bluetooth printer selected", "error");
        return;
      }

      const characteristic = await connectBluetoothPrinter(printer);
      updatePrinter({
        ...printer,
        width: billLayout.paperWidth,
        connected: Boolean(characteristic ?? printer.connected)
      });

      showMessage(
        characteristic
          ? "Bluetooth printer paired and connected"
          : "Bluetooth printer paired. Printing will connect on first send.",
        characteristic ? "success" : "info"
      );
    } catch {
      showMessage("Failed to connect Bluetooth printer", "error");
    } finally {
      setBtConnecting(false);
    }
  };

  const handleDisconnectSerial = async () => {
    try {
      await disconnectSerialPrinter();
    } finally {
      updatePrinter({
        ...DEFAULT_PRINTER_CONFIG,
        width: printerConfig.width,
        name: printerConfig.name || DEFAULT_PRINTER_CONFIG.name
      });
      showMessage("Serial printer disconnected", "info");
    }
  };

  const handleDisconnectBluetooth = () => {
    disconnectBluetoothPrinter();
    updatePrinter({
      ...DEFAULT_PRINTER_CONFIG,
      width: printerConfig.width,
      name: printerConfig.name || DEFAULT_PRINTER_CONFIG.name
    });
    showMessage("Bluetooth printer disconnected", "info");
  };

  const handleSavePrinterConfig = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const persisted = persistPrinterConfig(printerConfig);
    showMessage(
      persisted
        ? "Printer configuration saved to this browser"
        : "Printer configuration could not be verified in browser storage",
      persisted ? "success" : "error"
    );
  };

  const handleSaveBillLayout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const persisted = persistBillLayout(billLayout);
    showMessage(
      persisted
        ? "Bill layout saved to this browser"
        : "Bill layout could not be verified in browser storage",
      persisted ? "success" : "error"
    );
  };

  const handleTestPrint = async () => {
    try {
      setTestPrintPending(true);
      const content = buildReceiptText(
        {
          items: [
            {
              productName: "Sample Cotton Shirt",
              quantity: 1,
              price: 599,
              total: 599,
              discountPercent: 0,
              taxPercent: 0
            },
            {
              productName: "Promo Jeans",
              quantity: 2,
              price: 999,
              total: 1798.2,
              discountPercent: 10,
              taxPercent: 0
            }
          ],
          totalAmount: 2597,
          discountAmount: 199.8,
          taxAmount: 0,
          finalAmount: 2397.2,
          paymentMethod: "cash",
          createdAt: new Date().toISOString()
        },
        "TEST-01",
        billLayout,
        "cash"
      );

      const printed = await sendPrintData(content, printerConfig, billLayout);
      if (printed) {
        showMessage(`Test print sent via ${printerConfig.connectionType.toUpperCase()}`, "success");
      } else {
        const opened = openBrowserPrintWindow(content, billLayout);
        showMessage(
          opened
            ? "No hardware printer was available, so browser print preview was opened instead"
            : "No hardware printer was available, and the browser blocked opening a print preview window",
          opened ? "info" : "error"
        );
      }
    } catch (error) {
      showMessage(`Test print failed: ${String(error)}`, "error");
    } finally {
      setTestPrintPending(false);
    }
  };

  const liveReceiptPreview = useMemo(
    () =>
      buildReceiptText(
        {
          items: [
            {
              productName: "Armani Overshirt",
              quantity: 1,
              price: 500,
              total: 450,
              discountPercent: 10,
              manualDiscountAmount: 0,
              taxPercent: 0
            },
            {
              productName: "Classic Denim",
              quantity: 2,
              price: 999,
              total: 1898,
              discountPercent: 0,
              manualDiscountAmount: 100,
              taxPercent: 0
            }
          ],
          totalAmount: 2498,
          discountAmount: 150,
          taxAmount: 0,
          finalAmount: 2348,
          paymentMethod: "cash",
          createdAt: new Date().toISOString()
        },
        "PREVIEW-01",
        billLayout,
        "cash"
      ),
    [billLayout]
  );

  const receiptFontSize =
    billLayout.fontSize === "small"
      ? "10px"
      : billLayout.fontSize === "large"
        ? "13px"
        : "11px";

  const statusTone =
    messageType === "error"
      ? "bg-error-container text-error"
      : messageType === "success"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-secondary-container text-on-secondary-fixed";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#042f2e]/40 p-4 backdrop-blur-md"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-surface-container-low shadow-[0_40px_100px_rgba(8,47,46,0.18)] border border-white/80 bg-white/90 backdrop-blur-xl"
      >
        <div className="border-b border-white/40 bg-white/50 px-6 pb-6 pt-8 md:px-10 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-primary md:text-4xl">
                Printer &amp; Bill Settings
              </h1>
              <p className="mt-2 text-sm text-on-secondary-container md:text-base">
                Configure direct thermal printing and control how the receipt is laid out.
              </p>
            </div>
            <button
              className="material-symbols-outlined cursor-pointer rounded-lg p-2 text-secondary transition-colors hover:bg-error-container/50 hover:text-error"
              onClick={onClose}
              title="Close modal"
              type="button"
            >
              close
            </button>
          </div>

          <div className="mt-6 flex w-full gap-2 overflow-x-auto rounded-lg bg-surface-container-high p-1.5 sm:w-fit">
            <button
              className={`flex-1 whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold transition-all md:px-8 md:py-2.5 md:text-sm ${
                activeTab === "printer"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-secondary-container hover:bg-surface-container-highest"
              }`}
              onClick={() => setActiveTab("printer")}
              type="button"
            >
              Printer Setup
            </button>
            <button
              className={`flex-1 whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold transition-all md:px-8 md:py-2.5 md:text-sm ${
                activeTab === "layout"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-secondary-container hover:bg-surface-container-highest"
              }`}
              onClick={() => setActiveTab("layout")}
              type="button"
            >
              Bill Layout
            </button>
          </div>
        </div>

        {message ? (
          <div className="pointer-events-none relative">
            <div className={`pointer-events-auto absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg px-6 py-3 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.1)] ${statusTone}`}>
              <span className="material-symbols-outlined text-sm">
                {messageType === "error" ? "error" : messageType === "success" ? "check_circle" : "info"}
              </span>
              {message}
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          {activeTab === "printer" ? (
            <form onSubmit={handleSavePrinterConfig} className="grid grid-cols-1 gap-8 p-6 md:grid-cols-12 md:p-10">
              <div className="space-y-8 md:col-span-7">
                <section>
                  <label className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-primary">
                    Connection Interface
                    {!btAvailable ? (
                      <span className="rounded-lg bg-secondary-container px-2 py-0.5 text-[9px] font-medium lowercase tracking-normal text-secondary">
                        bluetooth unavailable
                      </span>
                    ) : null}
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      onClick={handleRequestUsbPrinter}
                      type="button"
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 bg-surface-container-highest p-4 transition-all hover:-translate-y-1 md:p-6 ${
                        printerConfig.connectionType === "usb" && printerConfig.connected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-transparent hover:bg-secondary-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant md:text-4xl">usb</span>
                      <div className="text-center">
                        <span className="mb-1 block text-sm font-bold md:text-base">Connect via USB</span>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-on-secondary-container md:text-xs">
                          Wired thermal printer
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={
                        printerConfig.connectionType === "bluetooth" && printerConfig.connected
                          ? handleDisconnectBluetooth
                          : handleRequestBluetoothPrinter
                      }
                      type="button"
                      disabled={!btAvailable || btConnecting}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 bg-surface-container-highest p-4 transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 md:p-6 ${
                        printerConfig.connectionType === "bluetooth" && printerConfig.connected
                          ? "border-blue-500 bg-blue-50"
                          : "border-transparent hover:bg-secondary-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant md:text-4xl">
                        {printerConfig.connectionType === "bluetooth" && printerConfig.connected
                          ? "bluetooth_connected"
                          : "bluetooth"}
                      </span>
                      <div className="text-center">
                        <span className="mb-1 block text-sm font-bold md:text-base">
                          {printerConfig.connectionType === "bluetooth" && printerConfig.connected
                            ? "Disconnect BT"
                            : btConnecting
                              ? "Scanning..."
                              : "Connect Bluetooth"}
                        </span>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-on-secondary-container md:text-xs">
                          BLE POS printer
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={
                        printerConfig.connectionType === "serial" && printerConfig.connected
                          ? handleDisconnectSerial
                          : handleRequestSerialPrinter
                      }
                      type="button"
                      disabled={!serialAvailable || serialConnecting}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 bg-surface-container-highest p-4 transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 md:p-6 ${
                        printerConfig.connectionType === "serial" && printerConfig.connected
                          ? "border-secondary bg-secondary-container"
                          : "border-transparent hover:bg-secondary-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant md:text-4xl">cable</span>
                      <div className="text-center">
                        <span className="mb-1 block text-sm font-bold md:text-base">
                          {printerConfig.connectionType === "serial" && printerConfig.connected
                            ? "Disconnect Serial"
                            : serialConnecting
                              ? "Scanning..."
                              : "Connect Serial"}
                        </span>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-on-secondary-container md:text-xs">
                          USB-serial / COM port
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        updatePrinter({
                          ...DEFAULT_PRINTER_CONFIG,
                          name: "RawBT Bluetooth Printer",
                          connectionType: "rawbt",
                          width: billLayout.paperWidth,
                          connected: true
                        });
                        showMessage(
                          "RawBT bridge enabled. Make sure the RawBT app is installed and your Bluetooth printer is paired in it.",
                          "success"
                        );
                      }}
                      type="button"
                      disabled={!rawbtAvailable}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 bg-surface-container-highest p-4 transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 md:p-6 ${
                        printerConfig.connectionType === "rawbt" && printerConfig.connected
                          ? "border-tertiary bg-tertiary-fixed"
                          : "border-transparent hover:bg-secondary-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant md:text-4xl">print_connect</span>
                      <div className="text-center">
                        <span className="mb-1 block text-sm font-bold md:text-base">
                          {printerConfig.connectionType === "rawbt" && printerConfig.connected
                            ? "RawBT Active \u2713"
                            : "Connect via RawBT"}
                        </span>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-on-secondary-container md:text-xs">
                          Android BT bridge app
                        </span>
                      </div>
                    </button>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Printer Name
                    </span>
                    <input
                      className="field-input"
                      type="text"
                      value={printerConfig.name}
                      onChange={(event) => updatePrinter({ ...printerConfig, name: event.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Paper Width
                    </span>
                    <select
                      className="field-input"
                      value={printerConfig.width}
                      onChange={(event) => {
                        const width = Number(event.target.value);
                        updatePrinter({ ...printerConfig, width });
                        updateLayout({ paperWidth: width });
                      }}
                    >
                      <option value={58}>58mm (Compact)</option>
                      <option value={80}>80mm (Standard)</option>
                      <option value={110}>110mm (Wide)</option>
                    </select>
                  </label>
                </section>

                <section className="rounded-lg border border-outline-variant/25 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {printerConfig.connected ? "Printer Ready" : "Printer Not Connected"}
                      </p>
                      <p className="text-xs text-on-secondary-container">
                        {printerConfig.connectionType === "usb"
                          ? "USB interface active"
                          : printerConfig.connectionType === "bluetooth"
                            ? "Bluetooth BLE printer selected"
                            : printerConfig.connectionType === "serial"
                              ? "Serial COM port active"
                              : printerConfig.connectionType === "rawbt"
                                ? "RawBT Android bridge \u2014 pair your printer in the RawBT app"
                                : "Use browser print until a printer is connected"}
                      </p>
                    </div>
                    <button
                      className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-low px-5 py-3 text-sm font-medium text-on-secondary-container transition-all hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={testPrintPending}
                      onClick={handleTestPrint}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {testPrintPending ? "sync" : "print"}
                      </span>
                      {testPrintPending ? "Sending..." : "Test Print"}
                    </button>
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-6 md:col-span-5">
                <div className="rounded-lg border border-outline-variant/30 bg-white p-5 shadow-inner md:p-8">
                  <span className="mb-6 block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                    Detected Devices
                  </span>

                  {availableUsbPrinters.length > 0 ? (
                    <div className="mb-4">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-emerald-700">USB</span>
                      <div className="space-y-2">
                        {availableUsbPrinters.map((printer) => (
                          <div
                            key={`usb-${printer.vendorId}-${printer.productId}-${printer.deviceId}`}
                            className="rounded-lg border border-outline-variant/30 bg-white p-4"
                          >
                            <p className="font-semibold text-primary">{printer.name}</p>
                            <p className="mt-1 text-xs text-on-secondary-container">
                              Vendor {printer.vendorId || "-"} | Product {printer.productId || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {availableSerialPrinters.length > 0 ? (
                    <div className="mb-4">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-secondary">Serial</span>
                      <div className="space-y-2">
                        {availableSerialPrinters.map((printer, index) => (
                          <div
                            key={`serial-${printer.vendorId}-${printer.productId}-${index}`}
                            className="rounded-lg border border-outline-variant/30 bg-white p-4"
                          >
                            <p className="font-semibold text-primary">{printer.name}</p>
                            <p className="mt-1 text-xs text-on-secondary-container">
                              Baud {printer.serialBaudRate || 9600}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {availableBluetoothPrinters.length > 0 ? (
                    <div className="mb-4">
                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-blue-700">Bluetooth</span>
                      <div className="space-y-2">
                        {availableBluetoothPrinters.map((printer) => (
                          <div
                            key={`bt-${printer.bluetoothDeviceId}`}
                            className="rounded-lg border border-outline-variant/30 bg-white p-4"
                          >
                            <p className="font-semibold text-primary">{printer.name}</p>
                            <p className="mt-1 text-xs text-on-secondary-container">
                              ID {printer.bluetoothDeviceId || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {availableUsbPrinters.length === 0 && availableSerialPrinters.length === 0 && availableBluetoothPrinters.length === 0 ? (
                    <p className="text-sm text-on-secondary-container">
                      No previously approved printers found in this browser.{rawbtAvailable ? " Use RawBT for Android Bluetooth printing." : ""}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-lg border border-outline-variant/30 bg-white p-5">
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                    Current route
                  </span>
                  <p className="text-base font-semibold text-primary">
                    {printerConfig.connected
                      ? `${printerConfig.connectionType.toUpperCase()} - ${printerConfig.name}`
                      : "Browser fallback"}
                  </p>
                  <p className="mt-2 text-sm text-on-secondary-container">
                    The checkout screen will use this route automatically when you confirm printing.
                  </p>
                </div>

                <div className="rounded-lg border border-outline-variant/30 bg-white p-5">
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                    Save status
                  </span>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-on-secondary-container">Printer setup</span>
                      <span
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          printerPersisted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-error-container text-error"
                        }`}
                      >
                        {printerPersisted ? formatSavedLabel(printerSavedAt) : "Not verified"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-on-secondary-container">Bill layout</span>
                      <span
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          layoutPersisted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-error-container text-error"
                        }`}
                      >
                        {layoutPersisted ? formatSavedLabel(layoutSavedAt) : "Not verified"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-on-secondary-container">
                    Printer route, bill preview, and test print all read these saved browser values.
                  </p>
                </div>
              </div>

              <div className="md:col-span-12 flex justify-end">
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container active:scale-95"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save & Verify Printer
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveBillLayout} className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Company Name
                  </span>
                  <input
                    className="field-input"
                    type="text"
                    value={billLayout.companyName}
                    onChange={(event) => updateLayout({ companyName: event.target.value })}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Phone
                  </span>
                  <input
                    className="field-input"
                    type="text"
                    value={billLayout.companyPhone || ""}
                    onChange={(event) => updateLayout({ companyPhone: event.target.value })}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    WhatsApp Sender Number
                  </span>
                  <input
                    className="field-input"
                    type="tel"
                    value={billLayout.whatsappSenderPhone || ""}
                    onChange={(event) => updateLayout({ whatsappSenderPhone: event.target.value })}
                  />
                  <p className="mt-2 text-xs text-on-secondary-container">
                    This number is printed in the bill message. WhatsApp will send from the account active in the browser or phone.
                  </p>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Address
                </span>
                <textarea
                  className="field-input resize-none"
                  rows={3}
                  value={billLayout.companyAddress || ""}
                  onChange={(event) => updateLayout({ companyAddress: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Footer Message
                </span>
                <input
                  className="field-input italic"
                  type="text"
                  value={billLayout.footerText || ""}
                  onChange={(event) => updateLayout({ footerText: event.target.value })}
                />
              </label>

              <div className="grid grid-cols-1 gap-6 rounded-lg border border-outline-variant/30 bg-white p-5 md:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Receipt Width
                  </span>
                  <select
                    className="field-input"
                    value={billLayout.paperWidth}
                    onChange={(event) => {
                      const paperWidth = Number(event.target.value);
                      updateLayout({ paperWidth });
                      updatePrinter({ ...printerConfig, width: paperWidth });
                    }}
                  >
                    <option value={58}>58mm</option>
                    <option value={80}>80mm</option>
                    <option value={110}>110mm</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Font Size
                  </span>
                  <select
                    className="field-input"
                    value={billLayout.fontSize}
                    onChange={(event) =>
                      updateLayout({ fontSize: event.target.value as BillLayoutConfig["fontSize"] })
                    }
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Chars per Line
                  </span>
                  <input
                    className="field-input"
                    type="number"
                    min={20}
                    max={80}
                    value={billLayout.itemsPerLine}
                    onChange={(event) => updateLayout({ itemsPerLine: Number(event.target.value) })}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Left Margin
                    </span>
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      max={20}
                      value={billLayout.marginLeft}
                      onChange={(event) => updateLayout({ marginLeft: Number(event.target.value) })}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Right Margin
                    </span>
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      max={20}
                      value={billLayout.marginRight}
                      onChange={(event) => updateLayout({ marginRight: Number(event.target.value) })}
                    />
                  </label>
                </div>
              </div>

              <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-outline-variant/30 bg-white p-4 md:grid-cols-3 md:p-6">
                <legend className="mx-2 bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                  Display Flags
                </legend>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={billLayout.showItemDetails}
                    onChange={(event) => updateLayout({ showItemDetails: event.target.checked })}
                  />
                  <span className="text-sm font-medium text-on-surface">Item Details</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={billLayout.showTaxBreakdown}
                    onChange={(event) => updateLayout({ showTaxBreakdown: event.target.checked })}
                  />
                  <span className="text-sm font-medium text-on-surface">Tax Breakdown</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={billLayout.showDiscountBreakdown}
                    onChange={(event) => updateLayout({ showDiscountBreakdown: event.target.checked })}
                  />
                  <span className="text-sm font-medium text-on-surface">Discount Breakdown</span>
                </label>
              </fieldset>

              <div className="rounded-lg border border-outline-variant/30 bg-white p-5 shadow-inner">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                  Layout summary
                </span>
                <p className="text-sm text-on-secondary-container">
                  {billLayout.paperWidth}mm paper, {billLayout.fontSize} font, {billLayout.itemsPerLine} characters per line,
                  margins {billLayout.marginLeft}mm / {billLayout.marginRight}mm.
                </p>
              </div>

              <div className="rounded-lg border border-outline-variant/30 bg-white p-5 shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                    Live receipt preview
                  </span>
                  <span className="text-[11px] font-medium text-on-secondary-container">
                    {layoutPersisted ? formatSavedLabel(layoutSavedAt) : "Preview not verified"}
                  </span>
                </div>

                <div className="hide-scrollbar mt-4 overflow-x-auto rounded-lg border border-outline-variant/20 bg-[#f8fcfb] p-3">
                  <div
                    className="mx-auto w-fit min-w-full rounded-lg border border-outline-variant/20 bg-white p-4 shadow-sm sm:min-w-0"
                    style={{ width: `${billLayout.paperWidth}mm`, maxWidth: "100%" }}
                  >
                    <pre
                      className="m-0 whitespace-pre text-black"
                      style={{
                        fontSize: receiptFontSize,
                        lineHeight: 1.2,
                        letterSpacing: 0,
                        fontVariantNumeric: "tabular-nums",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }}
                    >
                      {liveReceiptPreview}
                    </pre>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-on-secondary-container">
                  This preview uses the same saved bill layout that checkout and test print use.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-10 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container active:scale-95 md:py-4"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save & Verify Layout
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
