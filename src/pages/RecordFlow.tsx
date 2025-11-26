import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CameraRecorder } from "../components/CameraRecorder";
import AngleGifTutorial from "../components/capture/AngleGifTutorial";
import { SavePreview } from "../components/SavePreview";
import { SuccessCelebration } from "../components/capture/SuccessCelebration";
import { AngleReviewScreen } from "../components/capture/AngleReviewScreen";
import { performAutoCheck } from "../utils/autoCheck";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

const RecordFlow = () => {
  const navigate = useNavigate();
  
  // State Management
  const [angleStep, setAngleStep] = useState<1 | 2 | 3>(1); // 1=Middle, 2=Top, 3=Bottom
  const [blobs, setBlobs] = useState<(Blob | null)[]>([null, null, null]);
  const [showGifTutorial, setShowGifTutorial] = useState(true); // Show GIF tutorial before each angle
  const [isChecking, setIsChecking] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [checkError, setCheckError] = useState<string[] | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Lock orientation to landscape when camera is active
  useEffect(() => {
    if (!showGifTutorial && screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as any).lock("landscape").catch(() => {
        console.log("Landscape lock not supported");
      });
    }

    return () => {
      if (screen.orientation && 'unlock' in screen.orientation) {
        (screen.orientation as any).unlock();
      }
    };
  }, [showGifTutorial]);

  // Handler: Called when CameraRecorder finishes a valid take
  const handleRecordingComplete = async (blob: Blob) => {
    setIsChecking(true);
    
    // 1. Run Auto Check (Quality Control)
    const checkResult = await performAutoCheck(blob);
    
    setIsChecking(false);

    if (!checkResult.ok) {
      setCheckError(checkResult.errors);
      return; // Stop here, force retake
    }

    if (checkResult.warnings.length > 0) {
      checkResult.warnings.forEach(w => toast.warning(w));
    }

    // 2. Store Blob at current angle index
    const newBlobs = [...blobs];
    newBlobs[angleStep - 1] = blob;
    setBlobs(newBlobs);

    // 3. Decide next step
    if (angleStep < 3) {
      // Haptic feedback for angle transition
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      
      // Add smooth transition between angles
      setIsTransitioning(true);
      setTimeout(() => {
        setAngleStep(prev => (prev + 1) as 1 | 2 | 3);
        setShowGifTutorial(true); // Show GIF tutorial for NEXT angle
        setIsTransitioning(false);
      }, 500);
    } else {
      // Finished all 3 angles -> Show success celebration
      setShowSuccess(true);
    }
  };

  // Logic: Merge all segments into one
  const processFinalVideo = async () => {
    const validBlobs = blobs.filter((b): b is Blob => b !== null);
    if (validBlobs.length !== 3) {
      toast.error("Missing angle recordings");
      return;
    }

    setIsMerging(true);
    try {
      toast.info("Processing final video...");
      const concatenated = await concatVideos(validBlobs);
      setFinalBlob(concatenated);
      
      // Auto-download to device
      const url = URL.createObjectURL(concatenated);
      const a = document.createElement('a');
      a.href = url;
      a.download = `3d-scan-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("3D Scan ready and downloaded!");
    } catch (e) {
      toast.error("Failed to process videos.");
      console.error(e);
    } finally {
      setIsMerging(false);
    }
  };

  const handleRetakeAngle = (index: number) => {
    setShowReview(false);
    setAngleStep((index + 1) as 1 | 2 | 3);
    setShowGifTutorial(true);
  };

  const handleGifTutorialStart = () => {
    setShowGifTutorial(false);
  };

  const handleRetryAngle = () => {
    setCheckError(null);
    // We just close the modal; CameraRecorder state is reset by key prop change or internal logic if needed
  };

  // If processing is done, show the Final Preview Page
  if (finalBlob) {
    return <SavePreview videoBlob={finalBlob} onBack={() => navigate("/")} />;
  }

  // Show success celebration
  if (showSuccess) {
    return <SuccessCelebration onContinue={() => {
      setShowSuccess(false);
      setShowReview(true);
    }} />;
  }

  // Show review screen
  if (showReview) {
    return (
      <AngleReviewScreen
        blobs={blobs}
        angleLabels={["Middle Angle", "Top Angle", "Bottom Angle"]}
        onRetake={handleRetakeAngle}
        onContinue={processFinalVideo}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 1. Error Modal (Auto-Check Failed) */}
      <Dialog open={!!checkError} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive gap-2">
              <AlertTriangle /> Recording Issue
            </DialogTitle>
            <DialogDescription>
              We detected some issues with your recording:
              <ul className="list-disc pl-5 mt-2 text-foreground">
                {checkError?.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleRetryAngle} variant="default">Retake Angle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. GIF Tutorial (Full-screen tutorial before each angle) */}
      {showGifTutorial && (
        <AngleGifTutorial 
          angle={angleStep === 1 ? "middle" : angleStep === 2 ? "top" : "bottom"} 
          onStart={handleGifTutorialStart} 
        />
      )}

      {/* 3. Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-white/60" />
        </div>
      )}

      {/* 4. Checking/Merging Overlay (Loading state) */}
      {(isChecking || isMerging) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-white flex flex-col items-center p-6 bg-black/50 rounded-2xl border border-white/20">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin mb-4 text-primary" />
            <p className="text-base sm:text-lg font-medium">
              {isChecking ? "Analyzing recording quality..." : "Processing videos..."}
            </p>
            {isMerging && (
              <p className="text-xs sm:text-sm text-white/60 mt-2">This may take a moment</p>
            )}
          </div>
        </div>
      )}

      {/* 5. Main UI (Only show when GIF tutorial is closed) */}
      {!showGifTutorial && (
        <div className="flex-1 relative">
          {/* Progress Indicator */}
          <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  {blobs[step - 1] ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : step === angleStep ? (
                    <div className="w-5 h-5 rounded-full border-2 border-primary animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                  )}
                  <span className={`text-xs font-medium ${
                    blobs[step - 1] ? "text-green-400" : step === angleStep ? "text-white" : "text-white/40"
                  }`}>
                    {step === 1 ? "Middle" : step === 2 ? "Top" : "Bottom"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key prop forces CameraRecorder to completely reset when angle changes */}
          <CameraRecorder
            key={angleStep}
            angleLabel={angleStep === 1 ? "Middle Angle" : angleStep === 2 ? "Top Angle" : "Bottom Angle"}
            onRecordingComplete={handleRecordingComplete}
          />
        </div>
      )}
    </div>
  );
};

export default RecordFlow;

async function concatVideos(allBlobs: Blob[]): Promise<Blob> {
  // Simple concatenation: combine all recorded segments into one Blob.
  if (!allBlobs || allBlobs.length === 0) {
    throw new Error("No blobs to concatenate");
  }
  const mime = allBlobs[0].type || "video/webm";
  return new Blob(allBlobs, { type: mime });
}
