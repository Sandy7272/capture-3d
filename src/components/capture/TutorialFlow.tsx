import { useState, useEffect } from "react";
import { Lightbulb, Hand, RefreshCw, Move } from "lucide-react";

interface TutorialFlowProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Lightbulb,
    title: "Find good lighting",
    description: "Bright, even lighting is essential for quality captures",
    visual: "split"
  },
  {
    icon: Hand,
    title: "Keep your hand steady",
    description: "Hold your phone stable while recording",
    visual: "phone"
  },
  {
    icon: RefreshCw,
    title: "YOU move, not the object",
    description: "Walk around the object in a circle",
    visual: "circle"
  },
  {
    icon: Move,
    title: "Maintain distance",
    description: "Stay the same distance from your object",
    visual: "distance"
  }
];

const TutorialFlow = ({ onComplete }: TutorialFlowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (currentSlide < slides.length) {
      const timer = setTimeout(() => {
        if (currentSlide === slides.length - 1) {
          onComplete();
        } else {
          setCurrentSlide(prev => prev + 1);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentSlide, onComplete]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 p-4">
        {slides.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-surface rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-neon transition-all ${
                index === currentSlide
                  ? "animate-progress-fill"
                  : index < currentSlide
                  ? "w-full"
                  : "w-0"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="w-32 h-32 mb-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-neon animate-pulse-neon">
          <Icon className="w-16 h-16 text-background" />
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
          {slide.title}
        </h2>
        <p className="text-xl text-muted-foreground text-center max-w-md">
          {slide.description}
        </p>

        {/* Visual indicators */}
        <div className="mt-12">
          {slide.visual === "split" && (
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500 mb-2">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">Bright</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 mb-2">
                  <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">Dark</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide counter */}
      <div className="p-4 text-center">
        <span className="text-muted-foreground">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
};

export default TutorialFlow;
