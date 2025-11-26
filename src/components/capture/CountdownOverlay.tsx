import { useEffect, useState } from "react";

interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay = ({ onComplete }: CountdownOverlayProps) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    // Haptic feedback for each count
    if (navigator.vibrate) navigator.vibrate(100);

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-[120px] font-bold text-white animate-scale-in">
          {count}
        </div>
        <p className="text-white/60 text-lg mt-4">Get ready...</p>
      </div>
    </div>
  );
};
