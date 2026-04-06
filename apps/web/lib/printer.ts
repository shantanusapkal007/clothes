/**
 * Thermal Printer Integration
 * Supports ESC/POS protocol for thermal printers via USB and Bluetooth
 */

export type ConnectionType = "usb" | "bluetooth" | "none";

export interface PrinterConfig {
  name: string;
  connectionType: ConnectionType;
  deviceId?: string;
  vendorId?: string;
  productId?: string;
  bluetoothDeviceId?: string;
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
  connectionType: "none",
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
      const parsed = JSON.parse(stored) as PrinterConfig;
      // Migrate old configs that don't have connectionType
      if (!parsed.connectionType) {
        parsed.connectionType = "none";
      }
      return parsed;
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

// ─── USB Printer Functions ───────────────────────────────────────────────────

/**
 * List available USB printers (requires appropriate browser/OS permissions)
 */
export async function getAvailableUsbPrinters(): Promise<PrinterConfig[]> {
  if (typeof navigator === "undefined" || !("usb" in navigator)) {
    return [];
  }

  try {
    const devices = await (navigator as any).usb.getDevices();
    return devices.map((device: any) => ({
      name: device.productName || `USB Printer (${device.productId})`,
      connectionType: "usb" as ConnectionType,
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
  if (typeof navigator === "undefined" || !("usb" in navigator)) {
    return null;
  }

  try {
    const device = await (navigator as any).usb.requestDevice({
      filters: [
        { vendorId: 0x0416 }, // Zebra
        { vendorId: 0x04b8 }, // Epson
        { vendorId: 0x0fe6 }  // ILI
      ]
    });

    return {
      name: device.productName || "Thermal Printer (USB)",
      connectionType: "usb",
      deviceId: device.serialNumber,
      vendorId: device.vendorId.toString(),
      productId: device.productId.toString(),
      width: 80,
      connected: true
    };
  } catch {
    return null;
  }
}

// ─── Bluetooth Printer Functions ─────────────────────────────────────────────

/**
 * Common Bluetooth service UUIDs for ESC/POS thermal printers
 */
const BT_PRINTER_SERVICE_UUIDS = [
  "000018f0-0000-1000-8000-00805f9b34fb", // Common ESC/POS printers
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Generic serial
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Microchip ISSC / many BT printers
];

const BT_PRINTER_CHAR_UUIDS = [
  "00002af1-0000-1000-8000-00805f9b34fb", // Common write characteristic
  "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f", // Generic serial write
  "49535343-8841-43f4-a8d4-ecbe34729bb3", // ISSC write characteristic
];

// In-memory cache for active Bluetooth connection
let _btDevice: any = null;
let _btCharacteristic: any = null;

/**
 * Check if Web Bluetooth is available
 */
export function isBluetoothAvailable(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

/**
 * Request a Bluetooth printer from the user via system picker
 */
export async function requestBluetoothPrinter(): Promise<PrinterConfig | null> {
  if (!isBluetoothAvailable()) {
    return null;
  }

  try {
    // Request device — use acceptAllDevices with optionalServices since
    // many cheap thermal printers don't advertise standard service UUIDs
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BT_PRINTER_SERVICE_UUIDS
    });

    if (!device) return null;

    // Cache device reference
    _btDevice = device;

    return {
      name: device.name || "Bluetooth Printer",
      connectionType: "bluetooth",
      bluetoothDeviceId: device.id,
      width: 80,
      connected: true
    };
  } catch {
    return null;
  }
}

/**
 * Connect to a previously paired Bluetooth printer and discover the write characteristic
 */
export async function connectBluetoothPrinter(): Promise<any> {
  if (!_btDevice) return null;

  try {
    const server = await _btDevice.gatt!.connect();

    // Try each known service UUID until we find a writable characteristic
    for (const serviceUuid of BT_PRINTER_SERVICE_UUIDS) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const characteristics = await service.getCharacteristics();

        for (const char of characteristics) {
          // Look for a writable characteristic
          if (
            char.properties.write ||
            char.properties.writeWithoutResponse
          ) {
            _btCharacteristic = char;
            return char;
          }
        }
      } catch {
        // This service UUID doesn't exist on the device, try next
        continue;
      }
    }

    // Fallback: try known characteristic UUIDs directly
    const services = await server.getPrimaryServices();
    for (const service of services) {
      for (const charUuid of BT_PRINTER_CHAR_UUIDS) {
        try {
          const char = await service.getCharacteristic(charUuid);
          if (char.properties.write || char.properties.writeWithoutResponse) {
            _btCharacteristic = char;
            return char;
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Send raw data to the connected Bluetooth printer
 * Splits data into chunks to respect BLE MTU limits (typically 512 bytes max)
 */
export async function sendBluetoothData(data: Uint8Array): Promise<boolean> {
  if (!_btCharacteristic) {
    // Try to reconnect
    const char = await connectBluetoothPrinter();
    if (!char) return false;
  }

  try {
    const CHUNK_SIZE = 200; // Safe chunk size for most BLE printers
    for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
      const chunk = data.slice(offset, offset + CHUNK_SIZE);
      if (_btCharacteristic!.properties.writeWithoutResponse) {
        await _btCharacteristic!.writeValueWithoutResponse(chunk);
      } else {
        await _btCharacteristic!.writeValueWithResponse(chunk);
      }
      // Small delay between chunks to let the printer buffer
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Disconnect the current Bluetooth printer
 */
export function disconnectBluetoothPrinter(): void {
  if (_btDevice?.gatt?.connected) {
    _btDevice.gatt.disconnect();
  }
  _btDevice = null;
  _btCharacteristic = null;
}

// ─── Unified Print Function ──────────────────────────────────────────────────

/**
 * Send print data using the appropriate connection method
 * Returns true if printed successfully, false if fallback to browser print is needed
 */
export async function sendPrintData(
  content: string,
  config: PrinterConfig
): Promise<boolean> {
  const data = new TextEncoder().encode(content);

  if (config.connectionType === "bluetooth" && config.connected) {
    return sendBluetoothData(data);
  }

  if (config.connectionType === "usb" && config.connected) {
    try {
      const devices = await (navigator as any).usb.getDevices();
      if (devices.length > 0) {
        const device = devices[0];
        await device.open();
        if (device.configuration === null) {
          await device.selectConfiguration(1);
        }
        await device.claimInterface(0);
        await device.transferOut(1, data);
        await device.close();
        return true;
      }
    } catch {
      return false;
    }
  }

  return false; // Fallback to browser print needed
}
