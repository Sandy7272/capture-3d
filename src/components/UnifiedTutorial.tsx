import React, { useEffect, useRef, useState } from "react";
import InstagramStoryTutorial from "@/components/capture/InstagramStoryTutorial";
import VideoTutorialOverlay from "@/components/capture/VideoTutorialOverlay";
import { SkipForward, X } from "lucide-react";

/**
 * UnifiedTutorial (A1)
 * Sequence:
 *  1) Instagram-style slides
 *  2) Middle video
 *  3) Top video
 *  4) Bottom video
 *  -> onFinish() called when sequence completes
 *
 * Replace DEFAULT_VIDEO_PATHS with real video paths later.
 */

interface UnifiedTutorialProps {
  isOpen: boolean;
  onFinish: () => void;
  slideCount?: number;
}

type Phase =
  | { type: "slides"; index: number }
  | { type: "video"; index: number } // 0 = middle, 1 = top, 2 = bottom
  | { type: "done" };

const STORY_DURATION = 3000; // 3s per slide
const VIDEO_STORY_DURATION = 8000; // 8s auto-next for video (VideoTutorialOverlay uses this)
const SKIP_VISIBLE_TIME = 10000; // show skip after 10s

const DEFAULT_VIDEO_PATHS = [
  "/tutorials/middle.mp4",
  "/tutorials/top.mp4",
  "/tutorials/bottom.mp4",
];

const UnifiedTutorial = ({ isOpen, onFinish, slideCount = 4 }: UnifiedTutorialProps) => {
  const [phase, setPhase] = useState<Phase>({ type: "slides", index: 0 });
  const [slideProgress, setSlideProgress] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoSkipVisible, setVideoSkipVisible] = useState(false);
  const slideTimerRef = useRef<number | null>(null);
  const videoTimerRef = useRef<number | null>(null);
  const skipTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPhase({ type: "slides", index: 0 });
      setSlideProgress(0);
      setVideoIndex(0);
      setVideoSkipVisible(false);
    }
  }, [isOpen]);

  // Slide auto-advance
  useEffect(() => {
    if (!isOpen) return;
    if (phase.type !== "slides") return;

    const interval = 50;
    const step = 100 / (STORY_DURATION / interval);

    slideTimerRef.current = window.setInterval(() => {
      setSlideProgress((p) => {
        if (p >= 100) {
          if (phase.index < slideCount - 1) {
            setPhase({ type: "slides", index: phase.index + 1 });
            return 0;
          } else {
            setPhase({ type: "video", index: 0 });
            setVideoIndex(0);
            return 0;
          }
        }
        return p + step;
      });
    }, interval);

    return () => {
      if (slideTimerRef.current) window.clearInterval(slideTimerRef.current);
      slideTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isOpen]);

  // Video auto-advance + skip visible after SKIP_VISIBLE_TIME
  useEffect(() => {
    if (!isOpen) return;
    if (phase.type !== "video") return;

    // reset
    setVideoSkipVisible(false);
    if (skipTimerRef.current) {
      window.clearTimeout(skipTimerRef.current);
      skipTimerRef.current = null;
    }
    skipTimerRef.current = window.setTimeout(() => {
      setVideoSkipVisible(true);
    }, SKIP_VISIBLE_TIME);

    const interval = 50;
    const step = 100 / (VIDEO_STORY_DURATION / interval);

    videoTimerRef.current = window.setInterval(() => {
      setSlideProgress((p) => {
        if (p >= 100) {
          if (phase.index < DEFAULT_VIDEO_PATHS.length - 1) {
            const next = phase.index + 1;
            setPhase({ type: "video", index: next });
            setVideoIndex(next);
            setSlideProgress(0);
            setVideoSkipVisible(false);
            return 0;
          } else {
            setPhase({ type: "done" });
            return 0;
          }
        }
        return p + step;
      });
    }, interval);

    return () => {
      if (skipTimerRef.current) window.clearTimeout(skipTimerRef.current);
      if (videoTimerRef.current) window.clearInterval(videoTimerRef.current);
      skipTimerRef.current = null;
      videoTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isOpen]);

  // When done -> notify parent
  useEffect(() => {
    if (phase.type === "done") {
      onFinish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Skip current slide/video (only advances current item)
  const skipCurrent = () => {
    if (phase.type === "slides") {
      if (phase.index < slideCount - 1) {
        setPhase({ type: "slides", index: phase.index + 1 });
        setSlideProgress(0);
      } else {
        setPhase({ type: "video", index: 0 });
        setVideoIndex(0);
        setSlideProgress(0);
      }
      return;
    }
    if (phase.type === "video") {
      if (phase.index < DEFAULT_VIDEO_PATHS.length - 1) {
        const next = phase.index + 1;
        setPhase({ type: "video", index: next });
        setVideoIndex(next);
        setSlideProgress(0);
        setVideoSkipVisible(false);
      } else {
        setPhase({ type: "done" });
      }
      return;
    }
  };

  if (!isOpen) return null;

  if (phase.type === "slides") {
    return (
      <InstagramStoryTutorial
        isOpen={true}
        onComplete={() => {
          // user or auto finished slides -> move to first video
          setPhase({ type: "video", index: 0 });
          setVideoIndex(0);
          setSlideProgress(0);
        }}
      />
    );
  }

  if (phase.type === "video") {
    const video = DEFAULT_VIDEO_PATHS[phase.index];
    return (
      <div className="fixed inset-0 z-50">
        <VideoTutorialOverlay
          isOpen={true}
          onComplete={() => {
            // single-video overlay finished -> move forward
            if (phase.index < DEFAULT_VIDEO_PATHS.length - 1) {
              const next = phase.index + 1;
              setPhase({ type: "video", index: next });
              setVideoIndex(next);
            } else {
              setPhase({ type: "done" });
            }
            setSlideProgress(0);
            setVideoSkipVisible(false);
          }}
          stories={[video]}
        />

        {/* small overlay controls for skip/close */}
        <div className="absolute top-6 right-6 z-60 flex gap-2">
          {videoSkipVisible && (
            <button
              onClick={skipCurrent}
              className="px-3 py-1 bg-white/20 rounded-lg text-sm flex items-center gap-1 text-white"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
          )}

          <button
            onClick={() => setPhase({ type: "done" })}
            className="p-1 bg-white/10 rounded-full text-white"
            aria-label="Close tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // done -> onFinish() will be called by effect
  return null;
};

export default UnifiedTutorial;
