import { useState, useEffect } from "react";
import { Lightbulb, Smartphone, RefreshCw, Move } from "lucide-react";

interface TutorialFlowProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Lightbulb,
    title: "Lighting is Key",
    description: "Ensure the object is evenly lit. Avoid dark shadows or bright backlight.",
    visual: "split"
  },
  {
    icon: Smartphone,
    title: "Steady Hands",
    description: "Keep your phone stable. Move slowly and smoothly.",
    visual: "phone"
  },
  {
    icon: RefreshCw,
    title: "Move Around",
    description: "Don't spin the object. YOU must walk around it in a circle.",
    visual: "circle"
  },
  {
    icon: Move,
    title: "Maintain Distance",
    description: "Keep the same distance from the object throughout the scan.",
    visual: "distance"
  }
];

const TutorialFlow = ({ onComplete }: TutorialFlowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const SLIDE_DURATION = 3000; // 3 seconds
  const TICK_RATE = 50; // Update every 50ms

  useEffect(() => {
    let startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= SLIDE_DURATION) {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(prev => prev + 1);
          setProgress(0);
          startTime = Date.now(); // Reset timer for next slide
        } else {
          clearInterval(timer);
          onComplete();
        }
      }
    }, TICK_RATE);

    return () => clearInterval(timer);
  }, [currentSlide, onComplete]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white">
      {/* Progress bars (Instagram Story Style) */}
      <div className="flex gap-1.5 p-3 pt-6 safe-area-top">
        {slides.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-neon transition-all ease-linear"
              style={{ 
                width: index < currentSlide ? '100%' : index === currentSlide ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="w-32 h-32 mb-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-[0_0_30px_hsl(var(--neon)/0.2)] animate-pulse-neon">
          <Icon className="w-16 h-16 text-neon" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4 text-center tracking-tight">
          {slide.title}
        </h2>
        <p className="text-xl text-neutral-300 text-center max-w-md leading-relaxed">
          {slide.description}
        </p>

        {/* Visual indicators specific to slides */}
        <div className="mt-12 h-24 w-full flex justify-center items-center">
          {slide.visual === "split" && (
            <div className="flex gap-6 w-full max-w-xs">
              <div className="flex-1 flex flex-col items-center p-3 bg-neutral-900 rounded-xl border border-green-500/30">
                <div className="text-green-500 font-bold text-sm mb-1">GOOD</div>
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-500 text-xs">✓</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center p-3 bg-neutral-900 rounded-xl border border-red-500/30">
                <div className="text-red-500 font-bold text-sm mb-1">BAD</div>
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-500 text-xs">✕</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialFlow;