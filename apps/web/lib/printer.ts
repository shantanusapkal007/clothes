/**
 * Thermal Printer Integration
 * Supports ESC/POS protocol for thermal printers
 */

export interface PrinterConfig {
  name: string;
  deviceId?: string;
  vendorId?: string;
  productId?: string;
  width: number; // in mm, typically 80 or 58
  connected: boolean;
}

export interface BillLayoutConfig {
  companyName: string;
  companyPhone?: string;
  companyAddress?: string;
  showItemDetails: boolean;
  showTaxBreakdown: boolean;
  showDiscountBreakdown: boolean;
  printLogoUrl?: string;
  footerText?: string;
  itemsPerLine: number;
  fontSize: "small" | "medium" | "large";
  paperWidth: number; // in mm
  marginLeft: number; // in mm
  marginRight: number; // in mm
}

// Default printer configuration
export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  name: "Default Thermal Printer",
  width: 80,
  connected: false
};

// Default bill layout configuration  
export const DEFAULT_BILL_LAYOUT: BillLayoutConfig = {
  companyName: "Friends Clothing",
  showItemDetails: true,
  showTaxBreakdown: true,
  showDiscountBreakdown: true,
  itemsPerLine: 48,
  fontSize: "medium",
  paperWidth: 80,
  marginLeft: 2,
  marginRight: 2
};

/**
 * Get printer config from localStorage
 */
export function getPrinterConfig(): PrinterConfig {
  if (typeof window === "undefined") {
    return DEFAULT_PRINTER_CONFIG;
  }

  const stored = localStorage.getItem("printer-config");
  if (stored) {
    try {
      return JSON.parse(stored) as PrinterConfig;
    } catch {
      return DEFAULT_PRINTER_CONFIG;
    }
  }
  return DEFAULT_PRINTER_CONFIG;
}

/**
 * Save printer config to localStorage
 */
export function savePrinterConfig(config: PrinterConfig): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("printer-config", JSON.stringify(config));
}

/**
 * Get bill layout config from localStorage
 */
export function getBillLayoutConfig(): BillLayoutConfig {
  if (typeof window === "undefined") {
    return DEFAULT_BILL_LAYOUT;
  }

  const stored = localStorage.getItem("bill-layout-config");
  if (stored) {
    try {
      return { ...DEFAULT_BILL_LAYOUT, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_BILL_LAYOUT;
    }
  }
  return DEFAULT_BILL_LAYOUT;
}

/**
 * Save bill layout config to localStorage
 */
export function saveBillLayoutConfig(config: Partial<BillLayoutConfig>): void {
  if (typeof window === "undefined") {
    return;
  }

  const current = getBillLayoutConfig();
  const updated = { ...current, ...config };
  localStorage.setItem("bill-layout-config", JSON.stringify(updated));
}

/**
 * ESC/POS Commands for thermal printer
 */
export const ESC_POS = {
  // Control
  INIT: "\x1b\x40", // Initialize printer
  RESET: "\x1b\x3f\x05", // Soft reset
  
  // Text formatting
  BOLD_ON: "\x1b\x45\x01",
  BOLD_OFF: "\x1b\x45\x00",
  UNDERLINE_ON: "\x1b\x2d\x01",
  UNDERLINE_OFF: "\x1b\x2d\x00",
  
  // Character size
  SIZE_1X: "\x1b\x21\x00",
  SIZE_2X: "\x1b\x21\x01",
  SIZE_2X_2H: "\x1b\x21\x11",
  SIZE_2X_2W: "\x1b\x21\x20",
  SIZE_2X_BOTH: "\x1b\x21\x30",
  
  // Alignment
  ALIGN_LEFT: "\x1b\x61\x00",
  ALIGN_CENTER: "\x1b\x61\x01",
  ALIGN_RIGHT: "\x1b\x61\x02",
  
  // Line ending
  NEWLINE: "\x0a",
  
  // Paper control
  CUT_PAPER: "\x1d\x56\x42\x00", // Partial cut
  FULL_CUT: "\x1d\x56\x41\x00", // Full cut
  FEED_LINES: (lines: number) => `\x1b\x64${String.fromCharCode(lines)}`,
  
  // Open drawer
  OPEN_DRAWER: "\x1b\x70\x00\x32\x32",
};

/**
 * Generate ESC/POS command string for bill content
 */
export function generateEscPos(
  lines: string[],
  billLayout: BillLayoutConfig
): string {
  let commands = ESC_POS.INIT;
  
  // Set alignment and size
  commands += ESC_POS.ALIGN_CENTER;
  commands += ESC_POS.SIZE_1X;

  // Add content
  for (const line of lines) {
    // Auto-truncate line if too long for paper width
    const maxChars = billLayout.itemsPerLine;
    const truncated = line.length > maxChars ? line.substring(0, maxChars) : line;
    commands += truncated + ESC_POS.NEWLINE;
  }

  // Add feed and cut
  commands += ESC_POS.FEED_LINES(4);
  commands += ESC_POS.CUT_PAPER;

  return commands;
}

/**
 * List available USB printers (requires appropriate browser/OS permissions)
 */
export async function getAvailableUsbPrinters(): Promise<PrinterConfig[]> {
  if (!navigator.usb) {
    return [];
  }

  try {
    const devices = await navigator.usb.getDevices();
    return devices.map((device) => ({
      name: device.productName || `USB Printer (${device.productId})`,
      deviceId: device.serialNumber,
      vendorId: device.vendorId.toString(),
      productId: device.productId.toString(),
      width: 80,
      connected: false
    }));
  } catch {
    return [];
  }
}

/**
 * Request USB printer from user
 */
export async function requestUsbPrinter(): Promise<PrinterConfig | null> {
  if (!navigator.usb) {
    return null;
  }

  try {
    const device = await navigator.usb.requestDevice({
      filters: [
        { vendorId: 0x0416 }, // Zebra
        { vendorId: 0x04b8 }, // Epson
        { vendorId: 0x0fe6 }  // ILI
      ]
    });

    return {
      name: device.productName || "Thermal Printer",
      deviceId: device.serialNumber,
      vendorId: device.vendorId.toString(),
      productId: device.productId.toString(),
      width: 80,
      connected: false
    };
  } catch {
    return null;
  }
}
