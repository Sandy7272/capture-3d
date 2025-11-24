import { useState, useEffect } from "react";
import { Lightbulb, Camera, Move, Sun, XCircle } from "lucide-react";

interface InstagramStoryTutorialProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Lightbulb,
    title: "Good Lighting",
    dos: ["Use natural daylight", "Even lighting on object", "Bright environment"],
    donts: ["Avoid dark shadows", "No strong backlight", "No direct harsh light"],
    bgColor: "from-blue-600 to-blue-800"
  },
  {
    icon: Camera,
    title: "Steady Recording",
    dos: ["Keep phone stable", "Move slowly", "Smooth movements"],
    donts: ["Don't shake phone", "No sudden movements", "Avoid quick pans"],
    bgColor: "from-purple-600 to-purple-800"
  },
  {
    icon: Move,
    title: "Walk Around Object",
    dos: ["Walk in a circle", "Keep same distance", "Complete 360°"],
    donts: ["Don't spin object", "Don't change distance", "Don't walk backwards"],
    bgColor: "from-green-600 to-green-800"
  },
  {
    icon: Sun,
    title: "Object Placement",
    dos: ["Place on plain surface", "Clear background", "Good contrast"],
    donts: ["Avoid cluttered area", "No reflective surfaces", "No moving objects"],
    bgColor: "from-orange-600 to-orange-800"
  },
  {
    icon: XCircle,
    title: "Common Mistakes",
    dos: ["Record all 3 angles", "Keep object centered", "Full 30 seconds each"],
    donts: ["Don't skip angles", "Don't rush recording", "Don't cut it short"],
    bgColor: "from-red-600 to-red-800"
  }
];

const InstagramStoryTutorial = ({ onComplete }: InstagramStoryTutorialProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const SLIDE_DURATION = 3000; // 3 seconds
  const TICK_RATE = 50;

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
          startTime = Date.now();
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
    <div className={`fixed inset-0 bg-gradient-to-br ${slide.bgColor} z-50 flex flex-col text-white transition-all duration-500`}>
      {/* Progress bars (Instagram Story Style) */}
      <div className="flex gap-1 p-3 pt-6">
        {slides.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all ease-linear"
              style={{ 
                width: index < currentSlide ? '100%' : index === currentSlide ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 pt-8 animate-fade-in overflow-y-auto">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <Icon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" strokeWidth={2} />
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center tracking-tight">
          {slide.title}
        </h2>

        {/* DO's Section */}
        <div className="w-full max-w-sm mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-xl">
            <h3 className="text-green-300 font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">✓</span> DO's
            </h3>
            <ul className="space-y-2">
              {slide.dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-white/90">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DON'Ts Section */}
        <div className="w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-xl">
            <h3 className="text-red-300 font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">✕</span> DON'Ts
            </h3>
            <ul className="space-y-2">
              {slide.donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-white/90">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Slide indicator */}
        <div className="mt-8 text-white/60 text-xs sm:text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
};

export default InstagramStoryTutorial;
