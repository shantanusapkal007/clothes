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
    <div className="glass-panel rounded-[28px] p-4 shadow-sm md:p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-all active:scale-95 hover:bg-primary-container sm:h-14 sm:w-14 sm:rounded-lg shrink-0"
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
