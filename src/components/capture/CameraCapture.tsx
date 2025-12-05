import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { CameraRecorder } from "@/components/CameraRecorder";
import UnifiedTutorial from "@/components/UnifiedTutorial";
import { SavePreview } from "@/components/SavePreview"; 
import { performAutoCheck } from "@/utils/autoCheck";
import { concatVideos } from "@/utils/videoConcat";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CameraCapture = ({ onBack }) => {
  const navigate = useNavigate();
  
  const [angleStep, setAngleStep] = useState(1);
  const [blobs, setBlobs] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [autoStart, setAutoStart] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [finalBlob, setFinalBlob] = useState(null);
  const [checkError, setCheckError] = useState(null);

  const getLabel = () =>
    angleStep === 1 ? "Middle Angle" :
    angleStep === 2 ? "Top Angle" : "Bottom Angle";

  // HANDLE RECORDING COMPLETE
  const handleComplete = async (blob) => {
    setIsProcessing(true);

    const check = await performAutoCheck(blob, 3);
    setIsProcessing(false);

    if (!check.ok) {
      setCheckError(check.errors);
      return;
    }

    const updated = [...blobs, blob];
    setBlobs(updated);

    if (angleStep < 3) {
      setAngleStep(angleStep + 1);
      setShowTutorial(true);
      setAutoStart(false);
    } else {
      mergeVideos(updated);
    }
  };

  const mergeVideos = async (videos) => {
    setIsProcessing(true);
    try {
      const merged = await concatVideos(videos);
      setFinalBlob(merged);
      toast.success("All angles captured!");
    } catch {
      toast.error("Merge failed");
    }
    setIsProcessing(false);
  };

  if (finalBlob) {
    return <SavePreview videoBlob={finalBlob} onBack={() => navigate("/")} />;
  }

  return (
    <div className="fixed inset-0 bg-black">

      {!showTutorial && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 z-50 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      )}

      <Dialog open={!!checkError} onOpenChange={() => setCheckError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Recording Issue</DialogTitle>
            <DialogDescription>
              <ul>
                {checkError?.map((e, i) => <li key={i}>- {e}</li>)}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setCheckError(null)}>Retake</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnifiedTutorial
        isOpen={showTutorial}
        onFinish={() => {
          setShowTutorial(false);
          setAutoStart(true);
        }}
      />

      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 text-white flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}

      {!showTutorial && !isProcessing && (
        <CameraRecorder
          key={angleStep}
          onRecordingComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default CameraCapture;
