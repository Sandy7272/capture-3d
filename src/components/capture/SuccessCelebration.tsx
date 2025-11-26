import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessCelebrationProps {
  onContinue: () => void;
}

export const SuccessCelebration = ({ onContinue }: SuccessCelebrationProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate confetti particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    setConfetti(particles);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-900/20 to-black backdrop-blur-sm">
      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-2 h-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500"
          style={{
            left: `${particle.left}%`,
            animation: `fall ${particle.duration}s ease-in forwards`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Success Message */}
      <div className="relative z-10 text-center px-6 max-w-md animate-scale-in">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-20 h-20 text-green-400/30 animate-pulse" />
          </div>
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">Perfect!</h1>
        <p className="text-white/70 text-lg mb-2">All 3 angles captured successfully</p>
        <p className="text-white/50 text-sm mb-8">
          Your 3D scan is ready for processing
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-center gap-3 text-white/60 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span>Middle Angle - 30s</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/60 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span>Top Angle - 30s</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/60 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span>Bottom Angle - 30s</span>
          </div>
        </div>

        <Button
          onClick={onContinue}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
        >
          Continue
        </Button>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
