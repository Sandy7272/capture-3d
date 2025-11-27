import { useState, useEffect } from "react";
import { Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// White placeholder image
const WHITE_PLACEHOLDER = "https://placehold.co/600x800/FFFFFF/000?text=Image";

interface Topic {
  id: number;
  title: string;
  goodImg: string;
  badImg: string;
}

const topics: Topic[] = [
  { id: 1, title: "Lighting", goodImg: WHITE_PLACEHOLDER, badImg: WHITE_PLACEHOLDER },
  { id: 2, title: "Framing", goodImg: WHITE_PLACEHOLDER, badImg: WHITE_PLACEHOLDER },
  { id: 3, title: "Distance", goodImg: WHITE_PLACEHOLDER, badImg: WHITE_PLACEHOLDER },
  { id: 4, title: "Movement", goodImg: WHITE_PLACEHOLDER, badImg: WHITE_PLACEHOLDER },
  { id: 5, title: "Angles", goodImg: WHITE_PLACEHOLDER, badImg: WHITE_PLACEHOLDER },
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

  // Auto slide (3s per story)
  useEffect(() => {
    if (!isOpen) return;

    const duration = 3000;
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

  // Tap Navigation
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = e.currentTarget.clientWidth;
    const clickX = e.nativeEvent.offsetX;

    // Tap left 30% -> Previous
    if (clickX < screenWidth * 0.3) {
      if (index > 0) {
        setIndex((prev) => prev - 1);
        setProgress(0);
      }
    } 
    // Tap right 70% -> Next
    else {
      if (index < topics.length - 1) {
        setIndex((prev) => prev + 1);
        setProgress(0);
      } else {
        onComplete();
      }
    }
  };

  const current = topics[index];

  return (
    <div 
      className={cn("fixed inset-0 z-50 bg-black flex flex-col cursor-pointer select-none", !isOpen && "hidden")}
      onClick={handleTap}
    >
      
      {/* Progress bars */}
      <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
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

      {/* MAIN CONTENT - Split Layout */}
      <div className="flex-1 flex flex-row items-center justify-center p-8 w-full max-w-6xl mx-auto gap-16">

        {/* LEFT SIDE: TEXT */}
        <div className="flex-1 flex justify-end">
          <div className="max-w-xs text-right">
            <h2 className="text-5xl font-bold text-white animate-fade-in drop-shadow-md leading-tight">
              {current.title}
            </h2>
            <p className="text-white/60 mt-4 text-lg">
              Follow these best practices for better 3D results.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: IMAGES */}
        <div className="flex-1 flex items-center justify-start gap-6">
          
          {/* GOOD IMAGE */}
          <div className="relative w-48 h-72 bg-neutral-800 rounded-xl overflow-hidden shadow-2xl border-2 border-green-500/30 animate-slide-up">
            <img src={current.goodImg} className="w-full h-full object-cover" alt="Good Example" />
            
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded-full p-1">
              <Check className="text-green-400 w-5 h-5 stroke-[3]" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-green-500/90 text-white text-[10px] font-bold py-1.5 text-center uppercase tracking-widest">
              Do This
            </div>
          </div>

          {/* BAD IMAGE */}
          <div className="relative w-48 h-72 bg-neutral-800 rounded-xl overflow-hidden shadow-2xl border-2 border-red-500/30 opacity-90 animate-slide-up animation-delay-100">
            <img src={current.badImg} className="w-full h-full object-cover grayscale-[0.5]" alt="Bad Example" />
            
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded-full p-1">
              <XCircle className="text-red-400 w-5 h-5 stroke-[3]" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-[10px] font-bold py-1.5 text-center uppercase tracking-widest">
              Don't Do This
            </div>
          </div>

        </div>

      </div>
      
      {/* Tap Guidance Hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/20 text-xs font-medium pointer-events-none uppercase tracking-wider">
        Tap to continue
      </div>
    </div>
  );
};

export default InstagramStoryTutorial;