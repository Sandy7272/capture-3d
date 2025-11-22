import { useState, useEffect } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";

interface ProcessingScreenProps {
  onComplete: () => void;
}

const ProcessingScreen = ({ onComplete }: ProcessingScreenProps) => {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6 animate-fade-in z-50 font-sans">
      <div className="text-center space-y-8 max-w-md w-full">
        {isProcessing ? (
          <>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-white tracking-tight">Processing</h2>
              <p className="text-white/60 text-lg">
                Analyzing spatial data...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 mx-auto rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-in zoom-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-white tracking-tight">All Done!</h2>
              <p className="text-white/60 text-lg">
                Capture saved to gallery
              </p>
            </div>
            
            <button
              onClick={onComplete}
              className="mt-12 w-full px-8 py-4 bg-white active:bg-neutral-200 text-black font-semibold rounded-full transition-all transform active:scale-95"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessingScreen;