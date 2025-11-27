import { useState, useEffect, useRef } from "react";
import { Play, X, SkipForward } from "lucide-react";

interface VideoTutorialOverlayProps {
  stories: string[]; // array of video tutorial files
  onComplete: () => void;
  isOpen: boolean;
}

const STORY_DURATION = 8000; // 8 sec auto next
const SKIP_VISIBLE_TIME = 10000; // show skip after 10 sec

const VideoTutorialOverlay = ({ stories, onComplete, isOpen }: VideoTutorialOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [skipVisible, setSkipVisible] = useState(false);

  /** RESET on open */
  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setProgress(0);
      setSkipVisible(false);
    }
  }, [isOpen]);

  /** AUTO TIMER like Instagram */
  useEffect(() => {
    if (!isOpen) return;

    setSkipVisible(false);
    setTimeout(() => setSkipVisible(true), SKIP_VISIBLE_TIME);

    const interval = 50;
    const step = 100 / (STORY_DURATION / interval);

    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          nextStory();
          return 0;
        }
        return p + step;
      });
    }, interval);

    return () => clearInterval(t);
  }, [index, isOpen]);

  /** NEXT STORY */
  const nextStory = () => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
      setSkipVisible(false);
    } else {
      onComplete();
    }
  };

  /** SKIP ONLY CURRENT STORY */
  const skipOne = () => {
    nextStory();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white overflow-hidden">

      {/* PROGRESS BARS */}
      <div className="absolute top-4 left-3 right-3 flex gap-1 z-40">
        {stories.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75"
              style={{
                width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* HEADER BUTTONS */}
      <div className="absolute top-8 right-4 z-40 flex items-center gap-3">

        {/* Skip (after 10 sec only) */}
        {skipVisible && (
          <button
            onClick={skipOne}
            className="px-3 py-1 bg-white/20 rounded-lg text-sm flex items-center gap-1"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>
        )}

        {/* Close = complete tutorial */}
        <button
          onClick={onComplete}
          className="p-1 bg-white/20 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* MAIN VIDEO AREA */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[500px] aspect-[9/16] bg-black rounded-xl overflow-hidden">

          {/* VIDEO */}
          <video
            ref={videoRef}
            src={stories[index]}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* TAP TO NEXT (optional) */}
          <div
            className="absolute inset-0"
            onClick={nextStory}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorialOverlay;
