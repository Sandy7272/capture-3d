import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CameraRecorder } from "../components/CameraRecorder";
import { AngleHeader } from "../components/AngleHeader";
import AngleGifTutorial from "../components/capture/AngleGifTutorial";
import { SavePreview } from "../components/SavePreview";
import { performAutoCheck } from "../utils/autoCheck";
import { concatVideos } from "../utils/videoConcat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

const RecordFlow = () => {
  const navigate = useNavigate();
  
  // State Management
  const [angleStep, setAngleStep] = useState<1 | 2 | 3>(1); // 1=Middle, 2=Top, 3=Bottom
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [showGifTutorial, setShowGifTutorial] = useState(true); // Show GIF tutorial before each angle
  const [isChecking, setIsChecking] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [checkError, setCheckError] = useState<string[] | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);

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

    // 2. Store Blob
    const newBlobs = [...blobs, blob];
    setBlobs(newBlobs);

    // 3. Decide next step
    if (angleStep < 3) {
      setAngleStep(prev => (prev + 1) as 1 | 2 | 3);
      setShowGifTutorial(true); // Show GIF tutorial for NEXT angle
    } else {
      // Finished all 3 angles -> Merge!
      processFinalVideo(newBlobs);
    }
  };

  // Logic: Merge all segments into one
  const processFinalVideo = async (allBlobs: Blob[]) => {
    setIsMerging(true);
    try {
      toast.info("Processing final video...");
      const concatenated = await concatVideos(allBlobs);
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

      {/* 3. Checking/Merging Overlay (Loading state) */}
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

      {/* 4. Main UI (Only show when GIF tutorial is closed) */}
      {!showGifTutorial && (
        <>
          <AngleHeader currentAngle={angleStep} />
          
          <div className="flex-1 relative">
            {/* Key prop forces CameraRecorder to completely reset when angle changes */}
            <CameraRecorder 
              key={angleStep} 
              onRecordingComplete={handleRecordingComplete}
              minDuration={30}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default RecordFlow;