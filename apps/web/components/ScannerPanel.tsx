"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void | Promise<void>;
    isScanning?: boolean;
  } | null>(null);
  const scanHandledRef = useRef(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraPending, setCameraPending] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(false);

  const focusInput = () => {
    window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const clearScanner = (scanner: NonNullable<typeof scannerRef.current>) => {
    const result = scanner.clear();
    if (result && typeof (result as Promise<void>).catch === "function") {
      void (result as Promise<void>).catch(() => undefined);
    }
  };

  const submitBarcode = (value: string) => {
    const nextValue = value.trim();
    if (!nextValue) {
      focusInput();
      return;
    }

    onBarcodeSubmit(nextValue);
    focusInput();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitBarcode(barcodeInput);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Enter" || event.key === "Tab") && barcodeInput.trim()) {
      event.preventDefault();
      submitBarcode(barcodeInput);
    }
  };

  useEffect(() => {
    setCameraSupported(
      typeof navigator !== "undefined" &&
        typeof window !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        window.isSecureContext
    );
    focusInput();
  }, []);

  useEffect(() => {
    if (!cameraOpen) {
      focusInput();
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      setCameraPending(true);
      setCameraError(null);
      scanHandledRef.current = false;

      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

        if (cancelled) {
          return;
        }

        const scanner = new Html5Qrcode(scannerRegionId);
        const scannerInstance = scanner as unknown as NonNullable<typeof scannerRef.current>;
        scannerInstance.isScanning = false;
        scannerRef.current = scannerInstance;

        const formatsToSupport = [
          Html5QrcodeSupportedFormats?.CODE_128,
          Html5QrcodeSupportedFormats?.CODE_39,
          Html5QrcodeSupportedFormats?.EAN_13,
          Html5QrcodeSupportedFormats?.EAN_8,
          Html5QrcodeSupportedFormats?.UPC_A,
          Html5QrcodeSupportedFormats?.UPC_E,
          Html5QrcodeSupportedFormats?.QR_CODE
        ].filter(Boolean);

        const cameras = typeof Html5Qrcode.getCameras === "function" ? await Html5Qrcode.getCameras() : [];
        const preferredCamera = cameras.find((camera: { label?: string }) =>
          /(rear|back|environment)/i.test(camera.label || "")
        );

        const scannerConfig = {
          fps: 10,
          qrbox: { width: 280, height: 140 },
          formatsToSupport: formatsToSupport.length > 0 ? formatsToSupport : undefined
        };

        try {
          await scanner.start(
            preferredCamera?.id ?? { facingMode: "environment" },
            scannerConfig,
            async (decodedText: string) => {
              if (scanHandledRef.current) {
                return;
              }

              scanHandledRef.current = true;
              setBarcodeInput(decodedText);
              onBarcodeSubmit(decodedText);
              setCameraOpen(false);
            },
            () => {
              // Ignore per-frame decode noise.
            }
          );
        } catch {
          if (!preferredCamera && cameras[0]?.id) {
            await scanner.start(
              cameras[0].id,
              scannerConfig,
              async (decodedText: string) => {
                if (scanHandledRef.current) {
                  return;
                }

                scanHandledRef.current = true;
                setBarcodeInput(decodedText);
                onBarcodeSubmit(decodedText);
                setCameraOpen(false);
              },
              () => {
                // Ignore per-frame decode noise.
              }
            );
          } else {
            throw new Error("No compatible camera source found.");
          }
        }

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
              focusInput();
            });
        } else {
          clearScanner(activeScanner);
          focusInput();
        }
      }
    };
  }, [cameraOpen, onBarcodeSubmit, scannerRegionId, setBarcodeInput]);

  return (
    <>
      <div className="glass-panel rounded-[28px] p-4 shadow-sm md:p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="relative flex-1" onClick={focusInput}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm md:text-base">
              barcode_scanner
            </span>
            <input
              ref={inputRef}
              className="w-full rounded-lg border-none bg-surface-container-lowest py-3 pl-10 pr-4 font-body text-sm ring-1 ring-outline-variant/30 transition-all focus:ring-2 focus:ring-primary/20 md:py-4 md:pl-12 md:text-base"
              placeholder="Scan or enter SKU number..."
              type="text"
              value={barcodeInput}
              onChange={(event) => setBarcodeInput(event.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          <button
            type="button"
            onClick={focusInput}
            className="flex h-12 items-center justify-center rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-on-surface transition-all hover:bg-surface-container-high sm:h-14"
            title="Focus scanner input"
          >
            Ready
          </button>

          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            disabled={!cameraSupported}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 active:scale-95 sm:h-14 sm:w-14 sm:rounded-lg shrink-0"
            title={cameraSupported ? "Open Camera Scanner" : "Camera scanning requires HTTPS and camera permission"}
          >
            <span className="material-symbols-outlined" data-weight="fill">
              photo_camera
            </span>
          </button>

          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-2xl bg-primary-fixed px-5 font-semibold text-on-primary-fixed transition-all hover:bg-primary-fixed-dim sm:h-14"
          >
            Add
          </button>
        </form>

        <div className="mt-3 flex flex-col gap-1 text-xs text-on-secondary-container md:text-sm">
          <p>Keyboard-style barcode scanners can type directly here and submit with Enter or Tab.</p>
          {!cameraSupported ? (
            <p>Camera scanning is available only in a secure browser context with camera permission enabled.</p>
          ) : null}
        </div>
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
                <p className="text-sm text-on-secondary-container">Starting camera scanner...</p>
              ) : null}

              {cameraError ? <p className="error-text">{cameraError}</p> : null}

              <p className="text-sm text-on-secondary-container">
                Embedded formats like <code>barcode|price|discount|qty</code> are supported.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
