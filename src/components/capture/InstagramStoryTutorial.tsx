import { useState, useEffect } from "react";
import { X, Check, XCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check if user wants to skip
  useEffect(() => {
    if (!isOpen) return;
    const skipTutorials = localStorage.getItem("skipStoryTutorial");
    if (skipTutorials === "true") {
      onComplete();
      return;
    }
  }, [isOpen, onComplete]);

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    setIndex(0);
    setProgress(0);
  }, [isOpen]);

  // Auto slide
  useEffect(() => {
    if (!isOpen) return;

    const duration = 3000;
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextTopic();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [index, isOpen]);

  const nextTopic = () => {
    if (index < topics.length - 1) {
      setIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem("skipStoryTutorial", "true");
    }
    onComplete();
  };

  const current = topics[index];

  return (
    <div className={cn("fixed inset-0 z-50 bg-black flex flex-col", !isOpen && "hidden")}>
      
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

      {/* Header Controls */}
      <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg">
          <Checkbox
            id="skip-story"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
          <label htmlFor="skip-story" className="text-xs text-white cursor-pointer">
            Don't show again
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComplete}
            className="text-white hover:bg-white/20"
          >
            <SkipForward className="w-4 h-4 mr-1" /> Skip
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleComplete}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative flex flex-col md:flex-row justify-center items-center p-6 gap-8">

        {/* TITLE */}
        <div className="w-full md:w-1/3 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            {current.title}
          </h2>
        </div>

        {/* IMAGES */}
        <div className="flex items-center justify-center gap-4">
          {/* GOOD IMAGE */}
          <div className="relative w-40 h-56 bg-white rounded-xl overflow-hidden shadow-lg animate-slide-up">
            <img src={current.goodImg} className="w-full h-full object-cover" alt="Good" />
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
              <Check className="text-green-600 w-6 h-6" />
            </div>
            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-sm px-2 py-1 rounded">
              Correct
            </div>
          </div>

          {/* BAD IMAGE */}
          <div className="relative w-40 h-56 bg-white rounded-xl overflow-hidden shadow-lg animate-slide-up">
            <img src={current.badImg} className="w-full h-full object-cover" alt="Bad" />
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
              <XCircle className="text-red-600 w-6 h-6" />
            </div>
            <div className="absolute bottom-2 left-2 bg-red-600 text-white text-sm px-2 py-1 rounded">
              Incorrect
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstagramStoryTutorial;
