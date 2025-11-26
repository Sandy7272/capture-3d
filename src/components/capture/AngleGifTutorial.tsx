import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Volume2, SkipForward } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AngleGifTutorialProps {
  angle: "middle" | "top" | "bottom";
  onStart: () => void;
}

const angleData = {
  middle: {
    title: "Middle Angle",
    subtitle: "Eye-level 360° capture",
    steps: [
      "Keep phone steady at chest height",
      "Walk a full circle around the object",
      "Keep the object centered at all times",
      "Move slowly and smoothly",
    ],
    gifUrl: "/assets/tutorials/middle-angle.gif",
  },
  top: {
    title: "Top Angle",
    subtitle: "High-angle 45° capture",
    steps: [
      "Raise phone above the object",
      "Look down at a 45-degree angle",
      "Walk a full circle around the object",
      "Ensure top surfaces are visible",
    ],
    gifUrl: "/assets/tutorials/top-angle.gif",
  },
  bottom: {
    title: "Bottom Angle",
    subtitle: "Low-angle 45° capture",
    steps: [
      "Lower phone below the object",
      "Look up at a 45-degree angle",
      "Walk a full circle around the object",
      "Capture the base details",
    ],
    gifUrl: "/assets/tutorials/bottom-angle.gif",
  },
};

const AngleGifTutorial = ({ angle, onStart }: AngleGifTutorialProps) => {
  const data = angleData[angle];
  const [tutorialState, setTutorialState] = useState<"idle" | "speaking" | "finished">("idle");
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check if user wants to skip tutorials
  useEffect(() => {
    const skipTutorials = localStorage.getItem("skipAngleTutorials");
    if (skipTutorials === "true") {
      onStart();
    }
  }, [onStart]);

  const speakInstructions = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Clear queue

      const textToSpeak = [
        data.title,
        data.subtitle,
        ...data.steps,
      ].join(". ");

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-US";
      utterance.rate = 1;

      utterance.onstart = () => setTutorialState("speaking");
      utterance.onend = () => setTutorialState("finished");
      utterance.onerror = () => {
        console.error("Speech synthesis error");
        setTutorialState("finished"); // Allow user to proceed even if speech fails
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported.");
      setTutorialState("finished"); // If not supported, just show the button.
    }
  }, [data]);

  useEffect(() => {
    if (screen.orientation && "lock" in screen.orientation) {
      // @ts-ignore
      screen.orientation.lock("landscape").catch(() => {});
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem("skipAngleTutorials", "true");
    }
    onStart();
  };

  const renderActionButton = () => {
    switch (tutorialState) {
      case "idle":
        return (
          <Button
            onClick={speakInstructions}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg transition-all"
          >
            <Volume2 className="w-5 h-5 mr-2" /> Play Instructions
          </Button>
        );
      case "speaking":
        return (
          <div className="h-14 flex items-center justify-center w-full">
            <p className="text-center text-muted-foreground animate-pulse flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Playing instructions...
            </p>
          </div>
        );
      case "finished":
        return (
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Play className="w-5 h-5 mr-2" /> Start Recording
          </Button>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-foreground flex overflow-hidden font-sans">
      
      {/* LEFT PANEL — GIF / PREVIEW */}
      <div className="flex-1 flex items-center justify-center relative p-6">
        
        {/* Cinematic Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/60 to-black/80 pointer-events-none"></div>

        <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] border border-white/10 bg-black">
          
          {/* Animated SVG Tutorial Placeholder */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
            <svg width="400" height="300" viewBox="0 0 400 300" className="opacity-70">
              {/* Phone Icon */}
              <rect x="180" y="120" width="40" height="70" rx="5" fill="currentColor" className="text-white/80" />
              <circle cx="200" cy="200" r="3" fill="currentColor" className="text-white/60" />
              
              {/* Object in center */}
              <circle cx="200" cy="150" r="30" fill="currentColor" className="text-green-400/60" />
              
              {/* Rotation path */}
              <circle cx="200" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-white/30" />
              
              {/* Animated phone position */}
              <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: "200px 150px" }}>
                <rect x="270" y="120" width="30" height="50" rx="4" fill="currentColor" className="text-primary" />
                <circle cx="285" cy="180" r="2" fill="currentColor" className="text-primary-foreground" />
              </g>

              {/* Angle indicator */}
              {angle === "top" && (
                <path d="M 200 70 L 200 100 M 195 105 L 200 100 L 205 105" stroke="currentColor" strokeWidth="2" className="text-green-400" />
              )}
              {angle === "bottom" && (
                <path d="M 200 230 L 200 200 M 195 195 L 200 200 L 205 195" stroke="currentColor" strokeWidth="2" className="text-green-400" />
              )}
              {angle === "middle" && (
                <line x1="150" y1="150" x2="180" y2="150" stroke="currentColor" strokeWidth="2" className="text-green-400" />
              )}
            </svg>
          </div>

          {/* Label */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-lg text-xs font-mono text-white border border-white/10">
            TUTORIAL PREVIEW
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* RIGHT PANEL — TEXT / STEPS / BUTTON */}
      <div className="w-[420px] max-w-[38%] bg-[#0f0f11] border-l border-white/10 flex flex-col p-10 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="mb-8">
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider inline-flex">
            Step {angle === "middle" ? "1" : angle === "top" ? "2" : "3"} of 3
          </div>

          <h1 className="text-4xl font-bold mt-4 text-white tracking-tight drop-shadow-md">
            {data.title}
          </h1>

          <p className="text-muted-foreground text-lg mt-1">
            {data.subtitle}
          </p>
        </div>

        {/* STEPS */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {data.steps.map((step, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold border border-white/10">
                {index + 1}
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* ACTION BUTTON */}
        <div className="mt-10 pt-6 border-t border-white/10">
          {renderActionButton()}
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Checkbox
              id="skip-tutorial"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label
              htmlFor="skip-tutorial"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Don't show angle tutorials again
            </label>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleStart}
            className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-3 h-3 mr-1" /> Skip Tutorial
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            Recording takes ~30 seconds
          </p>
        </div>

      </div>
    </div>
  );
};

export default AngleGifTutorial;
