import { useRef, useState, useEffect } from "react";
import { formatTime } from "@/utils/formatTime";
import { 
  RotateCw, 
  CheckCircle, 
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CountdownOverlay } from "./capture/CountdownOverlay";

const useScreenOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isLandscape;
};

interface CameraRecorderProps {
  angleLabel: string;
  onRecordingComplete: (blob: Blob) => void;
}

export const CameraRecorder = ({ angleLabel, onRecordingComplete }: CameraRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"countdown" | "idle" | "recording" | "review">("countdown");
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  
  const [hasZoom, setHasZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const isLandscape = useScreenOrientation();

  // --- 1. START CAMERA AUTOMATICALLY ---
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const track = stream.getVideoTracks()[0];
        if (track.getCapabilities && 'zoom' in track.getCapabilities()) setHasZoom(true);
      } catch (err) {
        console.error(err);
        toast.error("Camera access denied");
      }
    };
    initCamera();
    
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleStop = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // --- 2. AUTO STOP AT 30s ---
  useEffect(() => {
    if (status === "recording" && elapsed >= 30) {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      // Enhanced time-up feedback
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
    }
  }, [elapsed, status]);

  // --- 3. TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "recording") {
      interval = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleStart = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setElapsed(0);
    
    const mimeType = MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm";
    const recorder = new MediaRecorder(streamRef.current, { mimeType, videoBitsPerSecond: 15000000 });

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setStatus("review");
      // Haptic feedback on stop
      if (navigator.vibrate) navigator.vibrate(200);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setStatus("recording");
    
    // Haptic feedback on start
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordedBlob(null);
    setStatus("idle");
    setElapsed(0);
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleConfirm = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
    }
  };

  const toggleZoom = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const newZoom = zoomLevel === 1 ? 2 : 1;
    try {
      // @ts-ignore
      await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
      setZoomLevel(newZoom);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Countdown Overlay */}
      {status === "countdown" && (
        <CountdownOverlay onComplete={() => setStatus("idle")} />
      )}

      {/* Time-up Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 z-50 bg-white animate-pulse pointer-events-none" />
      )}

      {!isLandscape && (
        <div className="absolute inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center text-white gap-4">
          <RotateCw className="w-12 h-12 animate-spin" />
          <p className="text-sm uppercase tracking-wider">Rotate to Landscape</p>
        </div>
      )}

      {/* VIDEO */}
      <div className="absolute inset-0 w-full h-full z-0">
        {status === "review" && previewUrl ? (
          <video src={previewUrl} autoPlay loop playsInline className="w-full h-full object-contain bg-black" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
      </div>

      {/* TOP HUD - GLASSMORPHISM CARD */}
      {status !== "review" && (
        <div className="absolute top-6 inset-x-0 z-20 flex justify-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 shadow-lg">
            <p className="text-[10px] text-white/60 uppercase tracking-widest text-center font-semibold mb-1">
              {angleLabel}
            </p>
            <p className={cn(
              "text-3xl font-mono font-black text-center tabular-nums",
              status === "recording" ? "text-white" : "text-white/90"
            )}>
              {formatTime(elapsed)}
            </p>
            {status === "recording" && (
              <>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] text-red-400 uppercase tracking-wider font-bold">Recording</span>
                </div>
                <div className="mt-3 w-full">
                  <Progress 
                    value={(elapsed / 30) * 100} 
                    className="h-1.5 bg-white/10"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* RIGHT CONTROL BAR */}
      <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-24 z-30 flex flex-col items-center justify-center bg-gradient-to-l from-black/50 to-transparent p-2">
        {status === "review" ? (
          <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleConfirm}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-lg border-2 border-white/20 flex items-center justify-center transition-all"
              >
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Next</span>
            </div>
            
            <div className="h-4" />

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleRetake}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white/30 bg-black/40 hover:bg-black/60 active:scale-95 text-white flex items-center justify-center transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Retake</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {hasZoom && (
              <button
                onClick={toggleZoom}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white text-xs font-bold hover:bg-black/60 active:scale-95 transition-all"
              >
                {zoomLevel}x
              </button>
            )}
            
            <button
              onClick={status === "idle" ? handleStart : handleStop}
              className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-transform active:scale-95"
            >
              <div className="absolute inset-0 rounded-full border-[5px] border-white shadow-xl" />
              {status === "recording" ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-sm shadow-lg" />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-full shadow-lg" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};