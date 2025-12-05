import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AngleGifTutorial from "../components/capture/AngleGifTutorial";
import { CameraRecorder } from "../components/CameraRecorder";
import { SavePreview } from "../components/SavePreview";
import { Loader2, AlertTriangle } from "lucide-react";
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

const RecordFlow = () => {
  const navigate = useNavigate();

  // --- TUTORIAL STATE (Preserved) ---
  const [tutorialIndex, setTutorialIndex] = useState(0); // 0=middle, 1=top, 2=bottom, 3=detail
  const [showTutorial, setShowTutorial] = useState(true);
  const angleNames: ("middle" | "top" | "bottom" | "detail")[] = ["middle", "top", "bottom", "detail"];

  // --- RECORDING STATE ---
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkError, setCheckError] = useState<string[] | null>(null);

  // Lock landscape only when tutorial ends (Camera starts)
  useEffect(() => {
    if (!showTutorial && screen.orientation && "lock" in screen.orientation) {
      // @ts-ignore
      screen.orientation.lock("landscape").catch(() => console.log("Orientation lock not supported"));
    }
    return () => {
      if (!showTutorial && screen.orientation && "unlock" in screen.orientation) {
        // @ts-ignore
        screen.orientation.unlock();
      }
    };
  }, [showTutorial]);

  // --- TUTORIAL HANDLERS ---
  const handleTutorialNext = () => {
    if (tutorialIndex < 3) {
      setTutorialIndex(tutorialIndex + 1);
    } else {
      setShowTutorial(false); // All tutorials done -> Start Camera
    }
  };

  const handleTutorialPrev = () => {
    if (tutorialIndex > 0) {
      setTutorialIndex(tutorialIndex - 1);
    }
  };

  // --- RECORDING HANDLERS ---
  const handleRecordingComplete = (blob: Blob) => {
    setIsProcessing(true);
    // Simulate final processing
    setTimeout(() => {
        setFinalBlob(blob);
        setIsProcessing(false);
        toast.success("Capture Complete!");
    }, 1000);
  };

  const handleRetake = () => {
    setFinalBlob(null);
    // Note: We stay on the camera screen, we don't go back to tutorials
  };

  const retryAfterError = () => setCheckError(null);

  // --- RENDER: PREVIEW ---
  if (finalBlob) {
    return <SavePreview videoBlob={finalBlob} onBack={handleRetake} />;
  }

  // --- RENDER: MAIN FLOW ---
  return (
    <div className="flex flex-col h-[100dvh] bg-black">

      {/* ERROR MODAL */}
      <Dialog open={!!checkError} onOpenChange={retryAfterError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive gap-2">
              <AlertTriangle /> Recording Issue
            </DialogTitle>
            <DialogDescription>
              <ul className="list-disc pl-5 mt-2 text-foreground">
                {checkError?.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={retryAfterError}>Retake</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 1. TUTORIAL PHASE */}
      {showTutorial && (
        <AngleGifTutorial
          angle={angleNames[tutorialIndex]}
          onNext={handleTutorialNext}
          onPrev={handleTutorialPrev}
        />
      )}

      {/* 2. PROCESSING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-white flex flex-col items-center p-6 bg-black/50 rounded-2xl border border-white/20">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
            <p className="text-base font-medium">Finalizing video...</p>
          </div>
        </div>
      )}

      {/* 3. CAMERA PHASE (Continuous Mode) */}
      {!showTutorial && !finalBlob && (
        <CameraRecorder onRecordingComplete={handleRecordingComplete} />
      )}
    </div>
  );
};

export default RecordFlow;