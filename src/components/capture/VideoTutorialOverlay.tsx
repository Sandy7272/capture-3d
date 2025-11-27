import { useState, useEffect, useRef } from "react";
import { Play, ArrowRight } from "lucide-react";

interface VideoTutorialOverlayProps {
  src: string;
  onComplete: () => void;
  isOpen: boolean;
}

const VideoTutorialOverlay = ({ src, onComplete, isOpen }: VideoTutorialOverlayProps) => {
  const videoTutorialRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Lock screen to landscape for tutorial
      if (screen.orientation && "lock" in screen.orientation) {
        (screen.orientation as any).lock("landscape").catch(() => {
          console.log("Screen orientation lock not supported");
        });
      }
    }
  }, [isOpen]);

  const handleTimeUpdate = () => {
    if (videoTutorialRef.current && !videoEnded) {
      const video = videoTutorialRef.current;
      if (video.duration > 0 && video.currentTime >= video.duration - 0.5) {
        setVideoEnded(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen && videoTutorialRef.current) {
      setIsPlaying(true);
      videoTutorialRef.current.play().catch(e => console.error("Error playing video:", e));
    } else if (!isOpen && videoTutorialRef.current) {
      setIsPlaying(false);
      videoTutorialRef.current.pause();
      videoTutorialRef.current.currentTime = 0;
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col lg:flex-row text-white">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-zinc-900 text-white p-4 lg:p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">
        {/* HEADER */}
        <div className="flex-shrink-0">
          <h2 className="text-xl lg:text-3xl font-bold mb-1 lg:mb-2">How to Record</h2>
          <p className="text-gray-300 text-xs lg:text-sm">Walk 360° around the object</p>

          {/* INSTAGRAM STORY STYLE BOX */}
          <div className="mt-3 lg:mt-6 w-full aspect-[4/3] lg:h-[36vh] bg-[#1f1f1f] rounded-xl lg:rounded-2xl flex items-center justify-center text-gray-400 text-base lg:text-xl">
            Instruction
          </div>
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-3 lg:mt-4 flex-shrink-0">
            <button
              onClick={onComplete}
              className="w-full py-2 lg:py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg lg:rounded-xl font-bold text-white text-sm lg:text-lg shadow-lg"
            >
              Skip Tutorial
            </button>
            <button
              onClick={onComplete}
              disabled={false}
              className="w-full py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg lg:rounded-xl font-bold text-white text-sm lg:text-lg shadow-lg flex items-center justify-center gap-2 disabled:bg-zinc-500 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 lg:w-5 h-4 lg:h-5" />
            </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-black flex items-center justify-center p-3 lg:p-6 overflow-hidden">
        <div className="relative max-w-full max-h-full aspect-video bg-[#1a1a1a] rounded-xl lg:rounded-2xl flex items-center justify-center overflow-hidden">
          <video
            ref={videoTutorialRef}
            src={src}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {!isPlaying && (
            <button
              onClick={() => {
                videoTutorialRef.current?.play();
                setIsPlaying(true);
              }}
              className="absolute w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-105 transition-all"
            >
              <Play className="w-12 h-12 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTutorialOverlay;