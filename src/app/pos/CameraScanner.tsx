"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, X, Loader2, ScanLine, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { recognizeProduct } from "../actions/recognize";

type Product = {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
};

type RecognitionResult = {
  found: boolean;
  productId?: number;
  productName?: string;
  confidence?: string;
  description?: string;
};

interface CameraScannerProps {
  products: Product[];
  onProductFound: (product: Product) => void;
}

export default function CameraScanner({ products, onProductFound }: CameraScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err: any) {
      setError("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.");
      console.error("Camera error:", err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const handleOpen = async () => {
    setIsOpen(true);
    setCapturedImage(null);
    setResult(null);
    setError(null);
    // Small delay to let dialog render
    setTimeout(() => startCamera(), 300);
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = dataUrl.split(",")[1];

    setCapturedImage(dataUrl);
    stopCamera();
    setIsAnalyzing(true);
    setResult(null);

    try {
      const productList = products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
      }));

      const response = await recognizeProduct(base64, productList);

      if (response.success && response.result) {
        setResult(response.result);
      } else {
        setError(response.error || "Gagal mengenali barang");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan saat mengenali barang");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = async () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    await startCamera();
  };

  const handleAddToCart = () => {
    if (result?.found && result.productId) {
      const product = products.find((p) => p.id === result.productId);
      if (product) {
        onProductFound(product);
        handleClose();
      }
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(() => startCamera(), 200);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpen}
        className="rounded-xl h-11 gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
      >
        <Camera className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Scan Barang</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <Camera className="h-4 w-4" />
              </div>
              Kenali Barang
            </DialogTitle>
            <DialogDescription>
              Arahkan kamera ke barang untuk mengenalinya secara otomatis dengan AI.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 pb-5">
            {/* Camera / Captured Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black mt-4 aspect-[4/3]">
              {/* Live Video */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${capturedImage ? "hidden" : ""}`}
                autoPlay
                playsInline
                muted
              />

              {/* Captured Image */}
              {capturedImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Scan Overlay */}
              {isStreaming && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-primary/60 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-primary rounded-br-lg" />
                    <ScanLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary/40 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Analyzing Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                  <p className="text-white font-semibold">Menganalisis gambar...</p>
                  <p className="text-white/60 text-sm mt-1">AI sedang mengenali barang</p>
                </div>
              )}

              {/* Camera Error */}
              {error && !capturedImage && (
                <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-6 text-center">
                  <XCircle className="h-10 w-10 text-destructive/60 mb-3" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Hidden canvas for capturing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Result Area */}
            {result && (
              <div className={`mt-4 p-4 rounded-xl border animate-float-in ${
                result.found 
                  ? "bg-emerald-500/5 border-emerald-500/15" 
                  : "bg-amber-500/5 border-amber-500/15"
              }`}>
                {result.found ? (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-emerald-700">Barang Dikenali!</p>
                      <p className="text-sm mt-0.5">{result.productName}</p>
                      {result.confidence && (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                          result.confidence === "TINGGI" 
                            ? "bg-emerald-500/15 text-emerald-700" 
                            : result.confidence === "SEDANG" 
                            ? "bg-amber-500/15 text-amber-700" 
                            : "bg-red-500/15 text-red-700"
                        }`}>
                          Akurasi: {result.confidence}
                        </span>
                      )}
                      {(() => {
                        const matchedProduct = products.find(p => p.id === result.productId);
                        return matchedProduct ? (
                          <p className="text-sm font-bold text-primary mt-2">
                            Rp {matchedProduct.price.toLocaleString("id-ID")}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-700">Barang Tidak Dikenali</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {result.description || "Barang ini tidak cocok dengan produk manapun di inventaris Anda."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && capturedImage && (
              <div className="mt-4 p-4 rounded-xl border bg-red-500/5 border-red-500/15 animate-float-in">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              {isStreaming && !capturedImage && (
                <>
                  <Button
                    variant="outline"
                    onClick={switchCamera}
                    className="rounded-xl"
                    size="icon"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 rounded-xl h-11 shadow-lg shadow-primary/20 text-base font-semibold"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Ambil Foto
                  </Button>
                </>
              )}

              {capturedImage && !isAnalyzing && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    className="flex-1 rounded-xl h-11"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Foto Ulang
                  </Button>
                  {result?.found && (
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 rounded-xl h-11 shadow-lg shadow-primary/20 font-semibold bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Tambah ke Keranjang
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
