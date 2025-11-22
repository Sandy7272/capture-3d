import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Zap, ZapOff, Settings, RefreshCw, Image, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecordingRound from "./RecordingRound";
import ProcessingScreen from "./ProcessingScreen";
import VideoTutorialOverlay from "./VideoTutorialOverlay";
import CameraPermissionError from "./CameraPermissionError";
import CameraSettingsSheet from "./CameraSettingsSheet";

interface CameraCaptureProps {
  onBack: () => void;
}

type CaptureState =
  | "setup"
  | "tutorial-middle"
  | "record-middle"
  | "tutorial-top"
  | "record-top"
  | "tutorial-bottom"
  | "record-bottom"
  | "processing";

// Extend MediaTrackCapabilities for better type safety
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
  zoom?: MediaSettingsRange;
  exposureCompensation?: MediaSettingsRange;
}

// Extend MediaTrackConstraintSet for better type safety
interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
  zoom?: number;
  exposureCompensation?: number;
}

interface ResolutionOption {
  width: number;
  height: number;
  label: string;
}

interface FpsOption {
  value: number;
  label: string;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { width: 3840, height: 2160, label: "4K" },
  { width: 1920, height: 1080, label: "1080p" },
  { width: 1280, height: 720, label: "720p" },
];

const FPS_OPTIONS: FpsOption[] = [
  { value: 60, label: "60 FPS" },
  { value: 30, label: "30 FPS" },
];

const CameraCapture = ({ onBack }: CameraCaptureProps) => {
  const [captureState, setCaptureState] = useState<CaptureState>("setup");
  const [isLandscape, setIsLandscape] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [showExposureSlider, setShowExposureSlider] = useState(false);
  const [currentResolution, setCurrentResolution] = useState<ResolutionOption>(
    RESOLUTION_OPTIONS[1]
  ); // Default to 1080p
  const [currentFps, setCurrentFps] = useState<FpsOption>(FPS_OPTIONS[0]); // Default to 60 FPS
  const [supportedResolutions, setSupportedResolutions] = useState<ResolutionOption[]>([]);
  const [supportedFps, setSupportedFps] = useState<FpsOption[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialVideo, setCurrentTutorialVideo] = useState("");
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'error'>('prompt');
  const [permissionErrorType, setPermissionErrorType] = useState<'denied' | 'blocked' | 'in-use' | 'not-found' | 'unknown'>('unknown');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showSettings, setShowSettings] = useState(false);
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

  const initCamera = useCallback(async (reinit: boolean = false) => {
    if (stream && !reinit) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      // Determine available capabilities
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const tempTrack = tempStream.getVideoTracks()[0];
      const capabilities = tempTrack.getCapabilities();
      tempTrack.stop(); // Stop the temporary stream

      const newSupportedResolutions: ResolutionOption[] = [];
      for (const res of RESOLUTION_OPTIONS) {
        if (
          capabilities.width &&
          capabilities.height &&
          res.width <= (capabilities.width.max || Infinity) &&
          res.height <= (capabilities.height.max || Infinity)
        ) {
          newSupportedResolutions.push(res);
        }
      }
      setSupportedResolutions(newSupportedResolutions.length > 0 ? newSupportedResolutions : RESOLUTION_OPTIONS);

      const newSupportedFps: FpsOption[] = [];
      for (const fpsOption of FPS_OPTIONS) {
        if (
          capabilities.frameRate &&
          fpsOption.value <= (capabilities.frameRate.max || Infinity)
        ) {
          newSupportedFps.push(fpsOption);
        }
      }
      setSupportedFps(newSupportedFps.length > 0 ? newSupportedFps : FPS_OPTIONS);

      // Apply selected constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: currentResolution.width },
          height: { ideal: currentResolution.height },
          frameRate: { ideal: currentFps.value },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((error) => {
          console.error("Error playing video stream:", error);
        });

        const track = mediaStream.getVideoTracks()[0];
        const settings = track.getSettings();
        setCurrentResolution({ width: settings.width || 0, height: settings.height || 0, label: `${settings.width}x${settings.height}` });
        setCurrentFps({ value: settings.frameRate || 0, label: `${settings.frameRate} FPS` });
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      setCameraPermission('error');
      
      // Determine error type
      if (error.name === 'NotAllowedError') {
        setPermissionErrorType('denied');
      } else if (error.name === 'NotFoundError') {
        setPermissionErrorType('not-found');
      } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
        setPermissionErrorType('in-use');
      } else {
        setPermissionErrorType('unknown');
      }
    }
  }, [toast, currentResolution, currentFps, facingMode]);

  const handleChangeResolution = useCallback(async (res: ResolutionOption) => {
    setCurrentResolution(res);
    setShowSettings(false);
    await initCamera(true);
  }, [initCamera]);

  const handleChangeFps = useCallback(async (fps: FpsOption) => {
    setCurrentFps(fps);
    setShowSettings(false);
    await initCamera(true);
  }, [initCamera]);

  const handleFacingModeChange = useCallback(async (mode: 'environment' | 'user') => {
    setFacingMode(mode);
    setShowSettings(false);
    await initCamera(true);
  }, [initCamera]);

  const handleRetryPermission = () => {
    setCameraPermission('prompt');
    setPermissionErrorType('unknown');
    initCamera();
  };

  useEffect(() => {
    if (captureState === "setup") {
      initCamera();
    } else if (
      captureState.startsWith("tutorial-") &&
      stream &&
      videoRef.current
    ) {
      // Pause camera feed for tutorial
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getVideoTracks()
          .forEach((track) => (track.enabled = false));
      }
      setShowTutorial(true);
      // Set the appropriate tutorial video
      if (captureState === "tutorial-middle") {
        setCurrentTutorialVideo("https://example.com/videos/middle-angle.mp4"); // Placeholder
      } else if (captureState === "tutorial-top") {
        setCurrentTutorialVideo("https://example.com/videos/top-angle.mp4"); // Placeholder
      } else if (captureState === "tutorial-bottom") {
        setCurrentTutorialVideo("https://example.com/videos/bottom-angle.mp4"); // Placeholder
      }
    } else if (captureState.startsWith("record-")) {
      // Resume camera feed for recording
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getVideoTracks()
          .forEach((track) => (track.enabled = true));
      }
      setShowTutorial(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [captureState, initCamera, stream]);

  const toggleFlash = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;

      if (capabilities.torch !== undefined) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }] as ExtendedMediaTrackConstraintSet[]
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          console.error("Error toggling torch:", error);
          toast({
            title: "Flashlight Error",
            description: "Unable to toggle flashlight. Your device might not support this feature or it's currently unavailable.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Flashlight Not Supported",
          description: "Your device does not support flashlight control.",
          variant: "destructive"
        });
      }
    }
  };

  const handleZoomChange = (value: number) => {
    setZoom(value);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities.zoom !== undefined) {
        track.applyConstraints({
          advanced: [{ zoom: value }] as ExtendedMediaTrackConstraintSet[]
        }).catch(error => console.error("Error setting zoom:", error));
      }
    }
  };

  const handleExposureChange = (value: number) => {
    setExposure(value);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities.exposureCompensation !== undefined) {
        track.applyConstraints({
          advanced: [{ exposureCompensation: value }] as ExtendedMediaTrackConstraintSet[]
        }).catch(error => console.error("Error setting exposure compensation:", error));
      }
    }
  };

  const handleRoundComplete = () => {
    if (captureState === "record-middle") {
      setCaptureState("tutorial-top");
    } else if (captureState === "record-top") {
      setCaptureState("tutorial-bottom");
    } else if (captureState === "record-bottom") {
      setCaptureState("processing");
    }
  };

  const handleTutorialComplete = () => {
    if (captureState === "tutorial-middle") {
      setCaptureState("record-middle");
    } else if (captureState === "tutorial-top") {
      setCaptureState("record-top");
    } else if (captureState === "tutorial-bottom") {
      setCaptureState("record-bottom");
    }
  };

  // Show permission error screen
  if (cameraPermission === 'error') {
    return (
      <CameraPermissionError 
        onRetry={handleRetryPermission}
        errorType={permissionErrorType}
      />
    );
  }

  if (!isLandscape) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4 sm:p-6 z-50">
        <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full bg-surface border-2 border-neon shadow-neon flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Rotate Your Device</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
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
      {/* Camera Settings Sheet */}
      <CameraSettingsSheet
        isOpen={showSettings}
        onOpenChange={setShowSettings}
        currentResolution={currentResolution}
        currentFps={currentFps}
        supportedResolutions={supportedResolutions}
        supportedFps={supportedFps}
        facingMode={facingMode}
        onResolutionChange={handleChangeResolution}
        onFpsChange={handleChangeFps}
        onFacingModeChange={handleFacingModeChange}
      />

      {/* Video Tutorial Overlay */}
      <VideoTutorialOverlay
        src={currentTutorialVideo}
        onComplete={handleTutorialComplete}
        isOpen={showTutorial}
      />

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${
          showTutorial ? "hidden" : ""
        }`}
      />

      {/* Overlay controls */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          showTutorial ? "hidden" : ""
        }`}
      >
        {/* Top bar - iPhone style */}
        <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-background/50 to-transparent">
          {/* Left: Back button */}
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </button>

          {/* Center: Current settings badge */}
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-foreground/80 font-medium bg-surface/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
            <span>{currentResolution.label}</span>
            <span>•</span>
            <span>{currentFps.value}fps</span>
            <span>•</span>
            <span>{facingMode === 'environment' ? 'Back' : 'Front'}</span>
          </div>

          {/* Right: Flash & Settings */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleFlash}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
            >
              {flashEnabled ? (
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-neon fill-neon" />
              ) : (
                <ZapOff className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>
          </div>
        </div>

        <div className="absolute right-1.5 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 pointer-events-auto">
          {/* Zoom control - compact */}
          <div className="flex flex-col items-center gap-1 sm:gap-1.5 bg-overlay/80 backdrop-blur-sm rounded-full p-0.5 sm:p-1 border border-border/50">
            {[0.5, 1, 2, 3].map((zoomLevel) => (
              <button
                key={zoomLevel}
                onClick={() => handleZoomChange(zoomLevel)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-colors ${
                  zoom.toFixed(1) === zoomLevel.toFixed(1)
                    ? "bg-neon text-background shadow-neon"
                    : "bg-transparent text-foreground/70 hover:text-foreground"
                }`}
              >
                {zoomLevel}x
              </button>
            ))}
          </div>

          {/* Exposure control - compact */}
          <div className="flex flex-col items-center gap-1 sm:gap-1.5 bg-overlay/80 backdrop-blur-sm rounded-full p-0.5 sm:p-1 border border-border/50">
            <button
              onClick={() => setShowExposureSlider(!showExposureSlider)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold transition-colors bg-transparent text-foreground/70 hover:text-foreground"
            >
              EXP
            </button>
            {showExposureSlider && (
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={exposure}
                onChange={(e) => handleExposureChange(parseFloat(e.target.value))}
                className="slider-vertical h-16 sm:h-20 w-1 appearance-none bg-surface rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neon [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-neon [&::-moz-range-thumb]:cursor-pointer mt-1"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
            )}
          </div>
        </div>

        {/* Safe frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 border-2 border-foreground/50 rounded-lg" />
        </div>


        {/* Recording round UI */}
        {(captureState === "record-middle" ||
          captureState === "record-top" ||
          captureState === "record-bottom") && (
          <RecordingRound
            round={
              captureState === "record-middle"
                ? 1
                : captureState === "record-top"
                ? 2
                : 3
            }
            onComplete={handleRoundComplete}
            stream={stream}
          />
        )}

        {/* Bottom bar - iPhone style */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 flex justify-between items-center pointer-events-auto bg-gradient-to-t from-background/50 to-transparent">
          {/* Left: Gallery preview */}
          <button
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors border border-border/30"
          >
            <Image className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/70" />
          </button>

          {/* Center: Shutter button (only in setup) */}
          {captureState === "setup" && (
            <button
              onClick={() => setCaptureState("tutorial-middle")}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-neon hover:bg-neon/80 flex items-center justify-center shadow-neon transition-all hover:scale-105 active:scale-95"
            >
              <Circle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-background fill-background" />
            </button>
          )}

          {/* Right: Camera flip button */}
          <button
            onClick={() => handleFacingModeChange(facingMode === 'environment' ? 'user' : 'environment')}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
          >
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;