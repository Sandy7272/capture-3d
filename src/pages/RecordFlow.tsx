import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CameraRecorder } from "../components/CameraRecorder";
import AngleGifTutorial from "../components/capture/AngleGifTutorial";
import { SavePreview } from "../components/SavePreview";
import { SuccessCelebration } from "../components/capture/SuccessCelebration";
import { AngleReviewScreen } from "../components/capture/AngleReviewScreen";
import { performAutoCheck } from "../utils/autoCheck";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

const RecordFlow = () => {
  const navigate = useNavigate();

  const [angleStep, setAngleStep] = useState<1 | 2 | 3>(1);
  const [blobs, setBlobs] = useState<(Blob | null)[]>([null, null, null]);
  const [showGifTutorial, setShowGifTutorial] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [checkError, setCheckError] = useState<string[] | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Orientation locking
  useEffect(() => {
    if (!showGifTutorial && screen.orientation && "lock" in screen.orientation) {
      (screen.orientation as any).lock("landscape").catch(() => {
        console.log("Orientation lock not supported");
      });
    }
    return () => {
      if (screen.orientation && "unlock" in screen.orientation) {
        (screen.orientation as any).unlock();
      }
    };
  }, [showGifTutorial]);

  // Handle recording complete
  const handleRecordingComplete = async (blob: Blob) => {
    setIsChecking(true);

    const checkResult = await performAutoCheck(blob);
    setIsChecking(false);

    if (!checkResult.ok) {
      setCheckError(checkResult.errors);
      return;
    }

    if (checkResult.warnings.length > 0) {
      checkResult.warnings.forEach((w) => toast.warning(w));
    }

    const newBlobs = [...blobs];
    newBlobs[angleStep - 1] = blob;
    setBlobs(newBlobs);

    if (angleStep < 3) {
      if (navigator.vibrate) navigator.vibrate(100);

      setIsTransitioning(true);
      setTimeout(() => {
        setAngleStep((prev) => (prev + 1) as 1 | 2 | 3);
        setShowGifTutorial(true);
        setIsTransitioning(false);
      }, 500);
    } else {
      setShowSuccess(true);
    }
  };

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

      const url = URL.createObjectURL(concatenated);
      const a = document.createElement("a");
      a.href = url;
      a.download = `3d-scan-${Date.now()}.mp4`;
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
  };

  if (finalBlob) {
    return <SavePreview videoBlob={finalBlob} onBack={() => navigate("/")} />;
  }

  if (showSuccess) {
    return (
      <SuccessCelebration
        onContinue={() => {
          setShowSuccess(false);
          setShowReview(true);
        }}
      />
    );
  }

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
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Error Modal */}
      <Dialog open={!!checkError} onOpenChange={handleRetryAngle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive gap-2">
              <AlertTriangle /> Recording Issue
            </DialogTitle>
            <DialogDescription>
              We detected some issues with your recording:
              <ul className="list-disc pl-5 mt-2 text-foreground">
                {checkError?.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleRetryAngle}>Retake Angle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GIF Tutorial */}
      {showGifTutorial && (
        <AngleGifTutorial
          angle={
            angleStep === 1 ? "middle" : angleStep === 2 ? "top" : "bottom"
          }
          onStart={handleGifTutorialStart}
        />
      )}

      {/* Transition */}
      {isTransitioning && (
        <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-white/60" />
        </div>
      )}

      {/* Checking/Merging */}
      {(isChecking || isMerging) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-white flex flex-col items-center p-6 bg-black/50 rounded-2xl border border-white/20">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
            <p className="text-base font-medium">
              {isChecking
                ? "Analyzing recording quality..."
                : "Processing videos..."}
            </p>
          </div>
        </div>
      )}

      {/* Main UI */}
      {!showGifTutorial && (
        <div className="flex-1 relative">
          {/* Progress */}
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

                  <span
                    className={`text-xs font-medium ${
                      blobs[step - 1]
                        ? "text-green-400"
                        : step === angleStep
                        ? "text-white"
                        : "text-white/40"
                    }`}
                  >
                    {step === 1
                      ? "Middle"
                      : step === 2
                      ? "Top"
                      : "Bottom"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <CameraRecorder
            key={angleStep}
            angleLabel={
              angleStep === 1
                ? "Middle Angle"
                : angleStep === 2
                ? "Top Angle"
                : "Bottom Angle"
            }
            onRecordingComplete={handleRecordingComplete}
          />
        </div>
      )}
    </div>
  );
};

export default RecordFlow;

async function concatVideos(allBlobs: Blob[]): Promise<Blob> {
  if (!allBlobs || allBlobs.length === 0)
    throw new Error("No blobs to concatenate");

  const mime = allBlobs[0].type || "video/mp4";
  return new Blob(allBlobs, { type: mime });
}
