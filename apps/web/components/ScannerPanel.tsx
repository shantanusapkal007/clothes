import { useEffect, useId, useRef, useState, type FormEvent } from "react";

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
  const scannerRegionId = useId().replace(/:/g, "-");
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void | Promise<void>;
    isScanning?: boolean;
  } | null>(null);
  const scanHandledRef = useRef(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraPending, setCameraPending] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const clearScanner = (scanner: NonNullable<typeof scannerRef.current>) => {
    const result = scanner.clear();
    if (result && typeof (result as Promise<void>).catch === "function") {
      void (result as Promise<void>).catch(() => undefined);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onBarcodeSubmit(barcodeInput);
  };

  useEffect(() => {
    if (!cameraOpen) {
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      setCameraPending(true);
      setCameraError(null);
      scanHandledRef.current = false;

      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (cancelled) {
          return;
        }

        const scanner = new Html5Qrcode(scannerRegionId);
        const scannerInstance = scanner as unknown as NonNullable<typeof scannerRef.current>;
        scannerInstance.isScanning = false;
        scannerRef.current = scannerInstance;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 260, height: 120 }
          },
          async (decodedText) => {
            if (scanHandledRef.current) {
              return;
            }

            scanHandledRef.current = true;
            setBarcodeInput(decodedText);
            onBarcodeSubmit(decodedText);
            setCameraOpen(false);
          },
          () => {
            // Intentionally ignore per-frame decode noise.
          }
        );

        scannerInstance.isScanning = true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to access the camera. Check browser permission and HTTPS.";
        setCameraError(message);
      } finally {
        if (!cancelled) {
          setCameraPending(false);
        }
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      const activeScanner = scannerRef.current;
      scannerRef.current = null;

      if (activeScanner) {
        const isScanning = activeScanner.isScanning;
        if (isScanning) {
          void activeScanner
            .stop()
            .catch(() => undefined)
            .finally(() => {
              clearScanner(activeScanner);
            });
        } else {
          clearScanner(activeScanner);
        }
      }
    };
  }, [cameraOpen, onBarcodeSubmit, scannerRegionId, setBarcodeInput]);

  return (
    <>
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
          onClick={() => setCameraOpen(true)}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-all active:scale-95 hover:bg-primary-container sm:h-14 sm:w-14 sm:rounded-lg shrink-0"
          title="Open Camera Scanner"
        >
          <span className="material-symbols-outlined" data-weight="fill">
            photo_camera
          </span>
        </button>
        </form>
      </div>

      {cameraOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card max-w-lg">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Camera scanner</p>
                <h2>Scan barcode with camera</h2>
              </div>
              <button
                className="button button-ghost self-start sm:self-auto"
                type="button"
                onClick={() => setCameraOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-3">
                <div
                  id={scannerRegionId}
                  className="min-h-[280px] overflow-hidden rounded-2xl bg-black/10"
                />
              </div>

              {cameraPending ? (
                <p className="text-sm text-on-secondary-container">
                  Starting camera scanner...
                </p>
              ) : null}

              {cameraError ? <p className="error-text">{cameraError}</p> : null}

              <p className="text-sm text-on-secondary-container">
                Encoded formats like `barcode|price|discount|qty` are supported. The camera reads
                the barcode payload itself, not separate printed text near the code.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
