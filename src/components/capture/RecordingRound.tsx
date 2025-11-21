import { useState, useEffect, useRef } from "react";
import { Circle, Square } from "lucide-react";

interface RecordingRoundProps {
  round: number;
  onComplete: () => void;
  stream: MediaStream | null;
}

const roundInstructions = {
  1: "Walk around the object at middle height",
  2: "Walk around from a higher angle, looking down",
  3: "Walk around from a lower angle, looking up"
};

const RecordingRound = ({ round, onComplete, stream }: RecordingRoundProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showComplete, setShowComplete] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isRecording && timeLeft === 0) {
      stopRecording();
    }
  }, [isRecording, timeLeft]);

  const startRecording = () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `3d-capture-round-${round}.webm`;
        a.click();
        
        chunksRef.current = [];
        setShowComplete(true);
        
        setTimeout(() => {
          onComplete();
        }, 2000);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (showComplete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-auto animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Round {round} Complete!</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top instruction banner */}
      <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-auto animate-fade-in">
        <div className="bg-overlay/90 backdrop-blur-sm px-6 py-3 rounded-full border border-neon/50">
          <p className="text-foreground font-medium">
            Round {round}: {roundInstructions[round as keyof typeof roundInstructions]}
          </p>
        </div>
      </div>

      {/* Timer circle */}
      {isRecording && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-surface"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-neon"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - timeLeft / 30)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{timeLeft}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center pointer-events-auto bg-gradient-to-t from-black/50 to-transparent">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-neon hover:bg-neon/80 flex items-center justify-center shadow-neon transition-all hover:scale-105 animate-pulse-neon"
          >
            <Circle className="w-12 h-12 text-background fill-background" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-neon transition-all hover:scale-105"
          >
            <Square className="w-8 h-8 text-background fill-background" />
          </button>
        )}
        
        <p className="mt-4 text-muted-foreground text-sm">
          {isRecording ? "Recording..." : "Tap to start recording"}
        </p>
      </div>
    </>
  );
};

export default RecordingRound;
