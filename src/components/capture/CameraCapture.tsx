import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Zap, ZapOff, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecordingRound from "./RecordingRound";
import ProcessingScreen from "./ProcessingScreen";

interface CameraCaptureProps {
  onBack: () => void;
}

type CaptureState = "setup" | "round1" | "round2" | "round3" | "processing";

const CameraCapture = ({ onBack }: CameraCaptureProps) => {
  const [captureState, setCaptureState] = useState<CaptureState>("setup");
  const [isLandscape, setIsLandscape] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  useEffect(() => {
    if (captureState === "setup") {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [captureState]);

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const toggleFlash = () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.torch) {
        track.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
      }
    }
  };

  const handleZoomChange = (value: number) => {
    setZoom(value);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.zoom) {
        track.applyConstraints({
          advanced: [{ zoom: value } as any]
        });
      }
    }
  };

  const handleExposureChange = (value: number) => {
    setExposure(value);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.exposureCompensation) {
        track.applyConstraints({
          advanced: [{ exposureCompensation: value } as any]
        });
      }
    }
  };

  const handleRoundComplete = () => {
    if (captureState === "round1") {
      setCaptureState("round2");
    } else if (captureState === "round2") {
      setCaptureState("round3");
    } else if (captureState === "round3") {
      setCaptureState("processing");
    }
  };

  if (!isLandscape) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6 z-50">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-full bg-surface border-2 border-neon shadow-neon flex items-center justify-center">
            <svg className="w-12 h-12 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Rotate Your Device</h2>
          <p className="text-muted-foreground text-lg">
            Please rotate your phone to landscape mode
          </p>
        </div>
      </div>
    );
  }

  if (captureState === "processing") {
    return <ProcessingScreen onComplete={onBack} />;
  }

  return (
    <div className="fixed inset-0 bg-background">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay controls */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <button
            onClick={toggleFlash}
            className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
          >
            {flashEnabled ? (
              <Zap className="w-5 h-5 text-neon fill-neon" />
            ) : (
              <ZapOff className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Right side controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 pointer-events-auto">
          {/* Zoom control */}
          <div className="flex flex-col items-center gap-3 bg-overlay/80 backdrop-blur-sm rounded-full p-4 border border-border/50">
            <span className="text-xs text-muted-foreground font-medium">ZOOM</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="slider-vertical h-32 w-2 appearance-none bg-surface rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neon [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-neon [&::-moz-range-thumb]:cursor-pointer"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            />
            <span className="text-xs text-foreground font-bold">{zoom.toFixed(1)}x</span>
          </div>

          {/* Exposure control */}
          <div className="flex flex-col items-center gap-3 bg-overlay/80 backdrop-blur-sm rounded-full p-4 border border-border/50">
            <span className="text-xs text-muted-foreground font-medium">EXP</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={exposure}
              onChange={(e) => handleExposureChange(parseFloat(e.target.value))}
              className="slider-vertical h-32 w-2 appearance-none bg-surface rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neon [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-neon [&::-moz-range-thumb]:cursor-pointer"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            />
            <span className="text-xs text-foreground font-bold">{exposure > 0 ? '+' : ''}{exposure.toFixed(1)}</span>
          </div>
        </div>

        {/* Center reticle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-2 border-neon/50 rounded-lg">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-neon" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-neon" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-neon" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-neon" />
          </div>
        </div>

        {/* Recording round UI */}
        {captureState !== "setup" && (
          <RecordingRound
            round={captureState === "round1" ? 1 : captureState === "round2" ? 2 : 3}
            onComplete={handleRoundComplete}
            stream={stream}
          />
        )}

        {/* Start button (only in setup) */}
        {captureState === "setup" && (
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-auto bg-gradient-to-t from-black/50 to-transparent">
            <button
              onClick={() => setCaptureState("round1")}
              className="w-20 h-20 rounded-full bg-neon hover:bg-neon/80 flex items-center justify-center shadow-neon transition-all hover:scale-105"
            >
              <Circle className="w-12 h-12 text-background fill-background" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
