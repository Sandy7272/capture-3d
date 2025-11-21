import { useState, useEffect } from "react";
import { CheckCircle2, Download } from "lucide-react";

interface ProcessingScreenProps {
  onComplete: () => void;
}

const ProcessingScreen = ({ onComplete }: ProcessingScreenProps) => {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-dark flex items-center justify-center p-6 animate-fade-in">
      <div className="text-center space-y-8 max-w-md">
        {isProcessing ? (
          <>
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-surface"></div>
              <div className="absolute inset-0 rounded-full border-4 border-neon border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Processing</h2>
              <p className="text-muted-foreground text-lg">
                Preparing your 3D capture...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-neon animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-background" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">All Done!</h2>
              <p className="text-muted-foreground text-lg">
                Your videos have been saved to your device
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-neon">
              <Download className="w-5 h-5" />
              <span className="font-medium">3 videos downloaded</span>
            </div>
            <button
              onClick={onComplete}
              className="mt-8 px-8 py-4 bg-gradient-primary hover:opacity-90 text-background font-bold rounded-xl transition-all shadow-neon hover:scale-105"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessingScreen;
