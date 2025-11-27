import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, CheckCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SavePreviewProps {
  videoBlob: Blob;
  onBack: () => void;
}

export const SavePreview = ({ videoBlob, onBack }: SavePreviewProps) => {
  const videoUrl = useMemo(() => URL.createObjectURL(videoBlob), [videoBlob]);
  const [isSaved, setIsSaved] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `3d-capture-scan-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Video saved to gallery!");
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col h-full w-full">
      
      {/* FULL SCREEN VIDEO PREVIEW */}
      <div className="flex-1 relative w-full h-full bg-black">
        <video 
          src={videoUrl} 
          autoPlay 
          loop 
          playsInline 
          controls={true} // Allow user to scrub if needed
          className="w-full h-full object-contain"
        />
        
        {/* TOP OVERLAY: TITLE */}
        <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
           <div className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/10 shadow-lg">
             Preview Scan
           </div>
        </div>
      </div>

      {/* BOTTOM OVERLAY: ACTION BUTTONS */}
      {/* Positioned absolutely at the bottom over the video content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex gap-4 max-w-lg mx-auto">
          
          {/* RETAKE BUTTON */}
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex-1 h-14 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl text-base font-semibold transition-all active:scale-95"
          >
            <RotateCcw className="mr-2 w-5 h-5" /> Retake
          </Button>

          {/* SAVE BUTTON */}
          <Button 
            onClick={handleDownload} 
            className={cn(
                "flex-1 h-14 text-base font-bold rounded-xl transition-all active:scale-95 shadow-lg",
                isSaved 
                    ? "bg-zinc-800 text-green-400 hover:bg-zinc-800 cursor-default border border-green-500/30" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isSaved ? (
                <>
                    <CheckCircle className="mr-2 w-5 h-5" /> Saved
                </>
            ) : (
                <>
                    <Download className="mr-2 w-5 h-5" /> Save Video
                </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};