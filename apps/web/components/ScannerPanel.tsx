import type { FormEvent } from "react";

interface ScannerPanelProps {
  barcodeInput: string;
  setBarcodeInput: (val: string) => void;
  onBarcodeSubmit: (barcode: string) => void;
}

export function ScannerPanel({
  barcodeInput,
  setBarcodeInput,
  onBarcodeSubmit
}: ScannerPanelProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onBarcodeSubmit(barcodeInput);
  };

  return (
    <div className="glass-panel p-6 md:p-8 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm md:text-base">
            barcode_scanner
          </span>
          <input
            className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 rounded-lg py-3 md:py-4 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-body text-sm md:text-base"
            placeholder="Scan or enter SKU number..."
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            // Auto focus for easy scanning
            autoFocus
          />
        </div>
        <button
          type="button"
          className="bg-primary text-on-primary w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center hover:bg-primary-container transition-all active:scale-95 shadow-lg shrink-0"
          title="Open Camera Scanner"
        >
          <span className="material-symbols-outlined" data-weight="fill">
            photo_camera
          </span>
        </button>
      </form>
    </div>
  );
}
