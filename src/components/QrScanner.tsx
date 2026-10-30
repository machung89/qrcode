"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";

type Labels = Dictionary["scanner"];

type Detector = { detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]> };

/** Bộ quét có sẵn của trình duyệt (Chrome Android, Safari mới...), null nếu không có */
async function nativeDecode(source: ImageBitmapSource) {
  const BarcodeDetector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
  if (!BarcodeDetector) return null;
  try {
    const codes = await new BarcodeDetector({ formats: ["qr_code"] }).detect(source);
    return codes[0]?.rawValue ?? null;
  } catch {
    return null;
  }
}

/**
 * Quét bằng jsQR, lần lượt ở các cạnh dài trong `sizes` (px).
 * jsQR hay trượt với ảnh nét, ô vuông lớn (vd PNG 1000px xuất từ trang tạo mã) nhưng đọc được khi thu nhỏ,
 * nên ảnh tải lên thử vài kích thước. Lót nền trắng (ảnh PNG nền trong suốt) và thêm viền trắng (ảnh cắt sát mã).
 */
async function decode(source: CanvasImageSource, width: number, height: number, sizes: number[]) {
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const tried = new Set<number>();
  for (const size of sizes) {
    const scale = Math.min(1, size / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    // Ảnh nhỏ: các kích thước cho ra cùng một ảnh, khỏi quét lại
    if (tried.has(w)) continue;
    tried.add(w);
    const pad = Math.round(Math.max(w, h) / 12);
    canvas.width = w + pad * 2;
    canvas.height = h + pad * 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, pad, pad, w, h);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" })?.data;
    if (data) return data;
  }
  return null;
}

const UPLOAD_SIZES = [1200, 800, 500, 300];
const CAMERA_SIZES = [800];

export function QrScanner({ labels }: { labels: Labels }) {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;
      setError(null);
      setResult(null);
      try {
        const bitmap = await createImageBitmap(file);
        const data = (await nativeDecode(bitmap)) ?? (await decode(bitmap, bitmap.width, bitmap.height, UPLOAD_SIZES));
        if (data) setResult(data);
        else setError(labels.noResult);
      } catch {
        // Ảnh hỏng hoặc định dạng trình duyệt không đọc được
        setError(labels.noResult);
      }
    },
    [labels.noResult],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) handleFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  async function startCamera() {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      const tick = async () => {
        if (!streamRef.current) return;
        if (video.readyState >= 2) {
          const data = await decode(video, video.videoWidth, video.videoHeight, CAMERA_SIZES);
          if (data) {
            setResult(data);
            stopCamera();
            return;
          }
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      stopCamera();
      setError(labels.cameraError);
    }
  }

  const isLink = result && /^https?:\/\//i.test(result);

  return (
    <div className="card p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition ${
            dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-brand-500 hover:bg-slate-50"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span className="font-semibold text-slate-800">{labels.upload}</span>
          <span className="text-sm text-slate-500">{labels.dropHint}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>

        <div className="flex min-h-56 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-slate-900 p-3">
          <video ref={videoRef} className={`max-h-72 w-full rounded-lg object-cover ${scanning ? "" : "hidden"}`} muted playsInline />
          {scanning ? (
            <button type="button" className="btn bg-white text-slate-900 hover:bg-slate-100" onClick={stopCamera}>
              {labels.stopCamera}
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={startCamera}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                <circle cx="12" cy="12.5" r="3.5" />
              </svg>
              {labels.camera}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}

      {result && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-green-800">{labels.result}</h2>
          <pre className="max-h-60 overflow-auto rounded-lg bg-white p-3 text-sm break-all whitespace-pre-wrap text-slate-800">{result}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={async () => {
                await navigator.clipboard.writeText(result);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? labels.copied : labels.copy}
            </button>
            {isLink && (
              <a href={result} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary">
                {labels.open} ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
