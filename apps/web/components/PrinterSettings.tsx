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
  requestUsbPrinter,
  isBluetoothAvailable,
  requestBluetoothPrinter,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  sendPrintData
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
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [availablePrinters, setAvailablePrinters] = useState<PrinterConfig[]>([]);
  const [testPrintPending, setTestPrintPending] = useState(false);
  const [btAvailable, setBtAvailable] = useState(false);
  const [btConnecting, setBtConnecting] = useState(false);

  useEffect(() => {
    setPrinterConfig(getPrinterConfig());
    setBillLayout(getBillLayoutConfig());
    loadAvailablePrinters();
    setBtAvailable(isBluetoothAvailable());
  }, []);

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const loadAvailablePrinters = async () => {
    try {
      const printers = await getAvailableUsbPrinters();
      setAvailablePrinters(printers);
    } catch {
      // USB not available
    }
  };

  const handleRequestUsbPrinter = async () => {
    try {
      const printer = await requestUsbPrinter();
      if (printer) {
        setPrinterConfig(printer);
        savePrinterConfig(printer);
        showMessage("USB printer connected successfully!", "success");
      } else {
        showMessage("No USB printer selected", "error");
      }
    } catch {
      showMessage("Failed to connect USB printer", "error");
    }
  };

  const handleRequestBluetoothPrinter = async () => {
    setBtConnecting(true);
    try {
      const printer = await requestBluetoothPrinter();
      if (printer) {
        const char = await connectBluetoothPrinter();
        if (char) {
          setPrinterConfig(printer);
          savePrinterConfig(printer);
          showMessage("Bluetooth printer paired and connected!", "success");
        } else {
          setPrinterConfig(printer);
          savePrinterConfig(printer);
          showMessage("Bluetooth printer paired. Characteristic discovery will happen on first print.", "info");
        }
      } else {
        showMessage("No Bluetooth printer selected", "error");
      }
    } catch {
      showMessage("Failed to connect Bluetooth printer", "error");
    } finally {
      setBtConnecting(false);
    }
  };

  const handleDisconnectBluetooth = () => {
    disconnectBluetoothPrinter();
    const updated: PrinterConfig = {
      ...DEFAULT_PRINTER_CONFIG,
      connectionType: "none",
      connected: false
    };
    setPrinterConfig(updated);
    savePrinterConfig(updated);
    showMessage("Bluetooth printer disconnected", "info");
  };

  const handleSavePrinterConfig = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    savePrinterConfig(printerConfig);
    showMessage("Printer configuration saved!", "success");
  };

  const handleSaveBillLayout = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveBillLayoutConfig(billLayout);
    showMessage("Bill layout saved!", "success");
  };

  const handleTestPrint = async () => {
    try {
      setTestPrintPending(true);
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
      ].join("\n");

      const printed = await sendPrintData(testContent, printerConfig);
      if (printed) {
        showMessage(`Test print sent via ${printerConfig.connectionType.toUpperCase()}!`, "success");
      } else {
        const printWindow = window.open("", "PRINT", "height=600,width=800");
        if (printWindow) {
          printWindow.document.write("<pre>" + testContent + "</pre>");
          printWindow.document.close();
          printWindow.print();
          showMessage("Test print opened in browser dialog (no printer hardware connected)", "info");
        }
      }
    } catch (error) {
      showMessage(`Test print failed: ${error}`, "error");
    } finally {
      setTestPrintPending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#311300]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-low w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-[0_40px_80px_rgba(49,19,0,0.15)] overflow-hidden flex flex-col ring-1 ring-outline-variant/30">
        
        {/* Header */}
        <div className="px-6 md:px-10 pt-8 pb-6 border-b border-outline-variant/20 bg-surface-container-lowest">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold tracking-tight">Printer &amp; Bill Settings</h1>
              <p className="text-on-secondary-container mt-2 text-sm md:text-base">Tailor your boutique's transaction experience</p>
            </div>
            <button 
              className="material-symbols-outlined text-secondary hover:text-error hover:bg-error-container/50 transition-colors p-2 rounded-full cursor-pointer"
              onClick={onClose}
              title="Close modal"
            >
              close
            </button>
          </div>
          
          <div className="flex gap-2 mt-6 p-1.5 bg-surface-container-high w-fit rounded-full ring-1 ring-outline-variant/20">
            <button 
              className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all ${activeTab === 'printer' ? 'bg-primary text-on-primary shadow-md' : 'text-on-secondary-container hover:bg-surface-container-highest'}`}
              onClick={() => setActiveTab('printer')}
            >
              Printer Setup
            </button>
            <button 
              className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all ${activeTab === 'layout' ? 'bg-primary text-on-primary shadow-md' : 'text-on-secondary-container hover:bg-surface-container-highest'}`}
              onClick={() => setActiveTab('layout')}
            >
              Bill Layout
            </button>
          </div>
        </div>

        {/* Global Alerts inside modal */}
        {message && (
          <div className="relative pointer-events-none">
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm shadow-[0_10px_30px_rgba(0,0,0,0.1)] pointer-events-auto flex items-center gap-2 z-50 ${
              messageType === 'error' ? 'bg-error-container text-error' : 
              messageType === 'success' ? 'bg-emerald-100 text-emerald-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              <span className="material-symbols-outlined text-sm">
                {messageType === 'error' ? 'error' : messageType === 'success' ? 'check_circle' : 'info'}
              </span>
              {message}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'printer' ? (
            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-8">
                
                <section>
                  <label className="block text-xs font-bold text-primary mb-4 uppercase tracking-widest flex items-center justify-between">
                    Connection Interface
                    {!btAvailable && (
                      <span className="text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full text-[9px] lowercase font-medium tracking-normal">
                        bluetooth unavailable
                      </span>
                    )}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={handleRequestUsbPrinter}
                      className={`flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl bg-surface-container-highest border-2 transition-all hover:-translate-y-1 ${
                        printerConfig.connectionType === 'usb' && printerConfig.connected
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-transparent hover:bg-secondary-container'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-3xl md:text-4xl ${printerConfig.connectionType === 'usb' && printerConfig.connected ? 'text-emerald-600' : 'text-on-surface-variant'}`}>usb</span>
                      <div className="text-center">
                        <span className="font-bold text-sm md:text-base block mb-1">Connect via USB</span>
                        <span className="text-[10px] md:text-xs text-on-secondary-container font-medium uppercase tracking-wider block">Wired connection</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={printerConfig.connectionType === 'bluetooth' && printerConfig.connected ? handleDisconnectBluetooth : handleRequestBluetoothPrinter}
                      disabled={!btAvailable || btConnecting}
                      className={`flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl bg-surface-container-highest border-2 transition-all hover:-translate-y-1 disabled:-translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                        printerConfig.connectionType === 'bluetooth' && printerConfig.connected
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-transparent hover:bg-secondary-container'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-3xl md:text-4xl ${printerConfig.connectionType === 'bluetooth' && printerConfig.connected ? 'text-blue-600' : 'text-on-surface-variant'}`}>
                        {printerConfig.connectionType === 'bluetooth' && printerConfig.connected ? 'bluetooth_connected' : 'bluetooth'}
                      </span>
                      <div className="text-center">
                        <span className="font-bold text-sm md:text-base block mb-1">
                          {printerConfig.connectionType === 'bluetooth' && printerConfig.connected ? 'Disconnect BT' : btConnecting ? 'Scanning...' : 'Connect Bluetooth'}
                        </span>
                        <span className="text-[10px] md:text-xs text-on-secondary-container font-medium uppercase tracking-wider block">Wireless POS</span>
                      </div>
                    </button>
                  </div>
                </section>

                <section className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Printer Name</label>
                    <input 
                      className="w-full bg-surface-container-lowest rounded-xl px-5 py-4 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/20 transition-all font-body text-sm md:text-base" 
                      type="text" 
                      value={printerConfig.name}
                      onChange={(e) => {
                        setPrinterConfig({...printerConfig, name: e.target.value});
                        savePrinterConfig({...printerConfig, name: e.target.value});
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Paper Width</label>
                      <select 
                        className="w-full bg-surface-container-lowest rounded-xl px-5 py-4 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/20 transition-all text-sm md:text-base font-body"
                        value={printerConfig.width}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setPrinterConfig({...printerConfig, width: val});
                          savePrinterConfig({...printerConfig, width: val});
                        }}
                      >
                        <option value={80}>80mm (Standard)</option>
                        <option value={58}>58mm (Compact)</option>
                        <option value={110}>110mm (Wide)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Char Encoding</label>
                      <input 
                        className="w-full bg-surface-container-lowest rounded-xl px-5 py-4 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/20 transition-all text-sm md:text-base font-body opacity-60 cursor-not-allowed" 
                        type="text"
                        disabled
                        value="UTF-8 (Default)"
                      />
                    </div>
                  </div>
                </section>

              </div>

              {/* Right Column: Visual Preview Card */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-inner flex flex-col items-center border border-outline-variant/20 relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-surface-container-lowest to-transparent z-10"></div>
                  
                  <span className="text-[10px] text-on-secondary-container uppercase tracking-widest mb-6 font-bold">Live Print Feedback</span>
                  
                  {/* Simulated Receipt Preview */}
                  <div className="w-full max-w-[220px] text-center space-y-4 text-xs font-mono text-stone-800 bg-[#fafafa] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-stone-200 transform group-hover:scale-105 transition-transform duration-500">
                    <div className="font-serif text-lg md:text-xl font-bold text-stone-900 border-b border-dashed border-stone-300 pb-2">
                      {billLayout.companyName}
                    </div>
                    <div className="text-[10px] uppercase">
                      Test Print<br/>Connection Verify
                    </div>
                    <div className="space-y-1 text-left pt-2 pb-2">
                      <div className="flex justify-between"><span>Status</span><span>OK</span></div>
                      <div className="flex justify-between"><span>Width</span><span>{printerConfig.width}mm</span></div>
                    </div>
                    <div className="flex justify-center pt-2 border-t border-dashed border-stone-200">
                      <span className="material-symbols-outlined text-4xl opacity-50">barcode_scanner</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge below preview */}
                <div className="bg-surface-container-lowest ring-1 ring-outline-variant/30 p-6 rounded-2xl flex items-center gap-4">
                  <div className="relative shrink-0">
                    <span className="material-symbols-outlined text-primary text-3xl">print</span>
                    {printerConfig.connected ? (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface-container-lowest"></span>
                    ) : (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-surface-container-lowest"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      {printerConfig.connected ? 'Printer Ready' : 'Not Connected'}
                    </p>
                    <p className="text-xs text-on-secondary-container">
                      {printerConfig.connectionType === 'usb' ? 'USB interface active' : 
                       printerConfig.connectionType === 'bluetooth' ? 'Bluetooth connection open' : 
                       'Please configure connection'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBillLayout} className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Company Name</label>
                  <input 
                    className="w-full bg-surface-container-lowest rounded-xl px-5 py-3 md:py-4 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/20 transition-all font-body" 
                    type="text"
                    value={billLayout.companyName}
                    onChange={(e) => setBillLayout({ ...billLayout, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Phone</label>
                  <input 
                    className="w-full bg-surface-container-lowest rounded-xl px-5 py-3 md:py-4 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/20 transition-all font-body" 
                    type="text"
                    value={billLayout.companyPhone || ""}
                    onChange={(e) => setBillLayout({ ...billLayout, companyPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Address</label>
                <textarea 
                  className="w-full bg-surface-container-lowest rounded-xl px-5 py-3 md:py-4 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm resize-none" 
                  rows={3}
                  value={billLayout.companyAddress || ""}
                  onChange={(e) => setBillLayout({ ...billLayout, companyAddress: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1 uppercase tracking-wider">Footer Message</label>
                <input 
                  className="w-full bg-surface-container-lowest rounded-xl px-5 py-3 md:py-4 border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/20 transition-all font-body text-center italic" 
                  type="text"
                  placeholder="e.g. Thanks for shopping!"
                  value={billLayout.footerText || ""}
                  onChange={(e) => setBillLayout({ ...billLayout, footerText: e.target.value })}
                />
              </div>

              <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-outline-variant/30 rounded-xl p-4 md:p-6 bg-surface-container-lowest">
                <legend className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container px-2 bg-surface-container-lowest mx-2">Display Flags</legend>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 md:w-6 md:h-6 shrink-0">
                    <input 
                      type="checkbox" 
                      className="peer w-5 h-5 md:w-6 md:h-6 opacity-0 absolute cursor-pointer rounded-md"
                      checked={billLayout.showItemDetails}
                      onChange={(e) => setBillLayout({ ...billLayout, showItemDetails: e.target.checked })}
                    />
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-surface-container-low border-2 border-outline-variant/50 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-primary text-[14px] md:text-[16px] opacity-0 peer-checked:opacity-100 font-bold transition-opacity">check</span>
                    </div>
                  </div>
                  <span className="text-sm md:text-base font-medium text-on-surface group-hover:text-primary transition-colors">Item Details</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 md:w-6 md:h-6 shrink-0">
                    <input 
                      type="checkbox" 
                      className="peer w-5 h-5 md:w-6 md:h-6 opacity-0 absolute cursor-pointer rounded-md"
                      checked={billLayout.showTaxBreakdown}
                      onChange={(e) => setBillLayout({ ...billLayout, showTaxBreakdown: e.target.checked })}
                    />
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-surface-container-low border-2 border-outline-variant/50 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-primary text-[14px] md:text-[16px] opacity-0 peer-checked:opacity-100 font-bold transition-opacity">check</span>
                    </div>
                  </div>
                  <span className="text-sm md:text-base font-medium text-on-surface group-hover:text-primary transition-colors">Tax Breakdown</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 md:w-6 md:h-6 shrink-0">
                    <input 
                      type="checkbox" 
                      className="peer w-5 h-5 md:w-6 md:h-6 opacity-0 absolute cursor-pointer rounded-md"
                      checked={billLayout.showDiscountBreakdown}
                      onChange={(e) => setBillLayout({ ...billLayout, showDiscountBreakdown: e.target.checked })}
                    />
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-surface-container-low border-2 border-outline-variant/50 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-primary text-[14px] md:text-[16px] opacity-0 peer-checked:opacity-100 font-bold transition-opacity">check</span>
                    </div>
                  </div>
                  <span className="text-sm md:text-base font-medium text-on-surface group-hover:text-primary transition-colors">Discount Rules</span>
                </label>
              </fieldset>
              
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pl-6 px-6 md:px-10 py-6 md:py-8 bg-surface-container-highest border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 mt-auto">
          {activeTab === 'printer' ? (
            <>
              <button 
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 text-on-secondary-container font-medium hover:text-primary border border-outline-variant/50 transition-all px-6 py-3 md:py-4 rounded-full hover:bg-surface-container-low text-sm bg-surface-container-lowest"
                disabled={testPrintPending || !printerConfig.connected}
                onClick={handleTestPrint}
              >
                <span className="material-symbols-outlined text-[20px]">{testPrintPending ? 'sync' : 'print'}</span>
                {testPrintPending ? "Sending..." : "Test Print"}
              </button>
              
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 md:py-4 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">done</span>
                Close Configuration
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button 
                onClick={(e: any) => handleSaveBillLayout(e)}
                className="w-full sm:w-auto px-10 py-3 md:py-4 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Preferences
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
