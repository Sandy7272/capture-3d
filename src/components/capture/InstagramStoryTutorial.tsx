import { useState, useEffect } from "react";
import { Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Make sure these paths are correct in your project folder structure
import naturalLightingGood from "../../asset/naturalLightingGood.png";
import naturalLightingBad from "../../asset/naturalLightingBad.png";
import frameObjectGood from "../../asset/naturalLightingGood.png";
import frameObjectBad from "../../asset/frame-object-bad.png";
import cleanBackgroundGood from "../../asset/naturalLightingGood.png";
import cleanBackgroundBad from "../../asset/cleanBackgroundBad.png";

interface Topic {
  id: number;
  instruction: string;
  subtext: string;
  goodImg: string;
  badImg: string;
}

// ------------------------------------------------------------------
// DATA
// ------------------------------------------------------------------
const topics: Topic[] = [
  {
    id: 1,
    instruction: "Use Natural Lighting",
    subtext: "Avoid harsh shadows or dark rooms",
    goodImg: naturalLightingGood,
    badImg: naturalLightingBad,
  },
  {
    id: 2,
    instruction: "Frame the Object",
    subtext: "Keep the whole object visible",
    goodImg: frameObjectGood,
    badImg: frameObjectBad,
  },
  {
    id: 3,
    instruction: "Clean Background",
    subtext: "Avoid cluttered backgrounds",
    goodImg: cleanBackgroundGood,
    badImg: cleanBackgroundBad,
  },
];

interface InstagramStoryTutorialProps {
  onComplete: () => void;
  isOpen: boolean;
}

const InstagramStoryTutorial = ({ onComplete, isOpen }: InstagramStoryTutorialProps) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    setIndex(0);
    setProgress(0);
  }, [isOpen]);

  // Auto slide (5s per story)
  useEffect(() => {
    if (!isOpen) return;

    const duration = 5000;
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (index < topics.length - 1) {
            setIndex((idx) => idx + 1);
            return 0;
          } else {
            onComplete();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [index, isOpen, onComplete]);

  const current = topics[index];

  return (
    <div
      className={cn(
        // FIXED POSITIONING & SCROLL LOCKING:
        // fixed inset-0 z-50: Covers everything
        // h-[100dvh]: Exact viewport height (fixes mobile address bar issue)
        // overflow-hidden: Cuts off anything outside
        // overscroll-none: Stops iOS rubber-banding
        // touch-none: Disables browser zooming/panning
        "fixed inset-0 z-50 bg-black flex flex-col h-[100dvh] w-screen overflow-hidden overscroll-none touch-none select-none",
        !isOpen && "hidden"
      )}
    >
      {/* Progress bars */}
      <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-20 pointer-events-none">
        {topics.map((t, i) => (
          <div key={t.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* MAIN CONTENT CONTAINER */}
      {/* flex-1 & min-h-0 ensures this container shrinks to fit the screen, never overflowing */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-8 pb-4 min-h-0 pointer-events-none">
        {/* TEXT SECTION */}
        <div className="text-center w-full mb-4 md:mb-6 shrink-0 animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-md">
            {current.instruction}
          </h2>
          <p className="text-white/80 mt-1.5 text-xs md:text-sm font-medium drop-shadow-sm">
            {current.subtext}
          </p>
        </div>

        {/* IMAGES SECTION */}
        {/* flex-1 basis-0 ensures images share remaining space equally without pushing bounds */}
        <div className="w-full flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8">
          {/* GOOD IMAGE */}
          <div className="relative w-full max-w-sm flex-1 basis-0 aspect-video bg-white rounded-lg overflow-hidden border-2 border-green-500 animate-slide-up shadow-lg min-h-0">
            <img src={current.goodImg} className="w-full h-full object-cover" alt="Good Example" />

            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full p-1">
              <Check className="text-green-400 w-3 h-3 md:w-4 md:h-4 stroke-" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[9px] md:text-[10px] font-bold py-1 text-center uppercase tracking-widest">
              Do This
            </div>
          </div>

          {/* BAD IMAGE */}
          <div className="relative w-full max-w-sm flex-1 basis-0 aspect-video bg-white rounded-lg overflow-hidden border-2 border-red-500 opacity-90 animate-slide-up animation-delay-100 shadow-lg min-h-0">
            <img src={current.badImg} className="w-full h-full object-cover grayscale-[0.3]" alt="Bad Example" />

            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full p-1">
              <XCircle className="text-red-400 w-3 h-3 md:w-4 md:h-4 stroke-" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-[9px] md:text-[10px] font-bold py-1 text-center uppercase tracking-widest">
              Don't Do This
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramStoryTutorial;