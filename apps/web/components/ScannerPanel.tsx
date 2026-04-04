"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";

type ScannerPanelProps = {
  barcodeInput: string;
  setBarcodeInput: (value: string) => void;
  onBarcodeSubmit: (barcode: string) => Promise<void>;
};

export function ScannerPanel({
  barcodeInput,
  setBarcodeInput,
  onBarcodeSubmit
}: ScannerPanelProps) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerId = useId().replace(/:/g, "");
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const submitRef = useRef(onBarcodeSubmit);

  useEffect(() => {
    submitRef.current = onBarcodeSubmit;
  }, [onBarcodeSubmit]);

  useEffect(() => {
    if (!cameraEnabled) {
      return;
    }

    let cancelled = false;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 120 } },
          async (decodedText) => {
            if (cancelled) {
              return;
            }

            await scanner.stop();
            await scanner.clear();
            scannerRef.current = null;
            setCameraEnabled(false);
            setBarcodeInput(decodedText);
            await submitRef.current(decodedText);
          },
          () => undefined
        );

        if (!cancelled) {
          setScannerReady(true);
          setScannerError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setScannerError(
            error instanceof Error ? error.message : "Unable to start camera scanner"
          );
          setCameraEnabled(false);
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      setScannerReady(false);
      const scanner = scannerRef.current;
      if (scanner) {
        void scanner
          .stop()
          .catch(() => undefined)
          .then(() => {
            scanner.clear();
          });
        scannerRef.current = null;
      }
    };
  }, [cameraEnabled, scannerId, setBarcodeInput]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onBarcodeSubmit(barcodeInput);
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Scanner</p>
          <h2>Barcode-first checkout</h2>
        </div>
        <span className="badge badge-muted">USB + Camera</span>
      </div>

      <form className="scanner-form" onSubmit={handleSubmit}>
        <input
          className="text-input"
          placeholder="Scan with USB or type barcode"
          value={barcodeInput}
          onChange={(event) => setBarcodeInput(event.target.value)}
        />
        <button className="button button-primary" type="submit">
          Find product
        </button>
      </form>

      <div className="scanner-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() => setCameraEnabled((value) => !value)}
        >
          {cameraEnabled ? "Stop camera" : "Open camera"}
        </button>
        <p className="muted">
          If a barcode matches, the product is added to the cart immediately.
        </p>
      </div>

      {cameraEnabled ? (
        <div className="scanner-box">
          <div id={scannerId} />
          <p className="muted">{scannerReady ? "Camera is live" : "Starting camera..."}</p>
        </div>
      ) : null}

      {scannerError ? <p className="error-text">{scannerError}</p> : null}
    </section>
  );
}
