import { Camera, Video, X } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface RecordingScreenProps {
  status: "idle" | "recording" | "error" | "success";
  angleLabel: string;
  elapsed: number;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

export const RecordingScreen = ({
  status,
  angleLabel,
  elapsed,
  duration,
  onStart,
  onStop,
  onCancel,
}: RecordingScreenProps) => {
  const progress = Math.min((elapsed / duration) * 100, 100);

  return (
    <div className="absolute inset-0 text-white flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div className="bg-black/50 px-3 py-1 rounded-lg">
          <span className="font-bold">{angleLabel}</span> Angle
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70"
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-md">
          <Progress value={progress} className="h-2 bg-white/20" />
          <div className="flex justify-between text-xs mt-1">
            <span>{Math.floor(elapsed / 1000)}s</span>
            <span>{duration / 1000}s</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {status === "idle" && (
            <Button
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-black hover:bg-gray-200"
              onClick={onStart}
            >
              <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
            </Button>
          )}
          {status === "recording" && (
            <Button
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 text-white hover:bg-red-600"
              onClick={onStop}
            >
              <Video className="w-7 h-7 sm:w-8 sm:h-8" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};