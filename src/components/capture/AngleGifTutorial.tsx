import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Video Imports
import middleVideo from "../../asset/middle.webm";
import topVideo from "../../asset/top.webm";
import bottomVideo from "../../asset/bottom.webm";

interface AngleGifTutorialProps {
  angle: (typeof angleOrder)[number];
  onNext: () => void;
  onPrev: () => void;
}

const angleOrder = ["middle", "top", "bottom"] as const;

const angleData = {
  middle: {
    title: "Middle Angle",
    subtitle: "Camera at Chest Level",
    video: middleVideo,
    speak: "This is the middle angle. Hold your phone at chest height and move around the object slowly.",
    lines: ["Hold chest height", "Move in full circle", "Keep object centered"],
  },
  top: {
    title: "Top Angle",
    subtitle: "Camera Above Object",
    video: topVideo,
    speak: "This is the top angle. Hold your phone above the object at a downward angle and move in a full circle.",
    lines: ["Raise phone above object", "Tilt 45° down", "Walk full circle"],
  },
  bottom: {
    title: "Bottom Angle",
    subtitle: "Camera Below Object",
    video: bottomVideo,
    speak: "This is the bottom angle. Hold your phone low and tilt upward while moving around the object.",
    lines: ["Phone lower than object", "Tilt 45° up", "Walk full circle"],
  },
};

const AngleGifTutorial: FC<AngleGifTutorialProps> = ({ angle, onNext, onPrev }) => {
  const step = angleOrder.indexOf(angle);
  const data = angleData[angle];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const [state, setState] = useState<"idle" | "speaking" | "finished">("idle");
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // New state to show countdown (optional, but helpful for 15s wait)
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // --- Voice Logic ---
  const speakInstructions = useCallback(() => {
    if (!("speechSynthesis" in window)) return; 

    window.speechSynthesis.cancel();

    if (isMutedRef.current) return;

    const msg = new SpeechSynthesisUtterance(data.speak);
    msg.rate = 1.0;
    utteranceRef.current = msg;
    
    msg.onstart = () => setState("speaking");
    
    // NOTE: We removed the onend logic here. 
    // The button will ONLY appear after the 15s timer, not when the voice finishes.
    msg.onend = () => {
      // Do nothing, wait for timer.
    };

    msg.onerror = (e) => {
      console.warn("Speech error:", e);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        window.speechSynthesis.speak(msg);
    } else {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.speak(msg);
            window.speechSynthesis.onvoiceschanged = null;
        };
    }
  }, [data.speak]);

  // --- Effect: Step Change Lifecycle ---
  useEffect(() => {
    setVideoLoaded(false);
    setState("speaking");
    setTimeLeft(15); // Reset countdown
    
    if (videoRef.current) {
      videoRef.current.load();
    }

    // Small delay to ensure audio plays correctly
    const audioTimer = setTimeout(() => {
        speakInstructions();
    }, 500);

    // --- 15 SECOND TIMER LOGIC ---
    // We use an interval to update the countdown visual
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setState("finished"); // Unlock button at 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(audioTimer);
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [step, speakInstructions]);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (newMuteState) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="w-full h-screen bg-[#0A0A0A] text-white flex flex-row overflow-hidden font-sans">

      {/* LEFT SIDE: PREVIEW */}
      <div className="w-[60%] flex justify-center items-center px-4 bg-[#050505]">
        <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-[#222] shadow-2xl overflow-hidden">
          <video
            ref={videoRef}
            key={data.video} 
            autoPlay
            muted
            loop
            playsInline
            preload="auto" 
            onLoadedData={() => setVideoLoaded(true)}
            className={`
              w-full h-auto
              object-contain transition-opacity duration-500
              ${videoLoaded ? 'opacity-100' : 'opacity-0'} 
            `}
          >
            <source src={data.video} type="video/webm" />
          </video>
        </div>
      </div>

      {/* RIGHT SIDE: UI PANEL */}
      <div className="w-[40%] bg-[#0A0A0A] border-l border-[#222] px-5 py-6 flex flex-col justify-center relative">

        {/* PROGRESS BAR */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-[#2DFFA7]" : "bg-[#222]"
              }`} 
            />
          ))}
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-[#2DFFA7]/10 border border-[#2DFFA7]/20 text-[#2DFFA7] text-[10px] font-bold tracking-wide uppercase">
            Step {step + 1} of 3
          </div>

          <button 
            onClick={toggleMute} 
            className="p-1.5 -mr-1.5 text-[#777] hover:text-white transition-colors rounded-full hover:bg-[#111]"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* CONTENT */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">{data.title}</h1>
            <p className="text-sm text-[#888] mb-5 font-medium">{data.subtitle}</p>

            <div className="space-y-3 pl-1">
            {data.lines.map((line, i) => (
                <div key={i} className="flex items-center gap-3 text-[#BBB]">
                <div className="w-1 h-1 bg-[#444] rounded-full"></div>
                <p className="text-xs sm:text-sm">{line}</p>
                </div>
            ))}
            </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-auto space-y-3">
            
            {state !== "finished" ? (
                // LOADING/WAITING STATE
                <div className="w-full h-12 bg-[#161616] border border-[#222] rounded-lg flex items-center justify-center gap-2 text-[#888]">
                    {/* Show Pulse if speaking, otherwise static */}
                    <div className="animate-pulse flex items-center gap-2">
                      <Volume2 size={16} className="text-[#2DFFA7]" />
                      <span className="text-xs font-medium tabular-nums">
                        {/* Display countdown text */}
                        Wait {timeLeft}s...
                      </span>
                    </div>
                </div>
            ) : (
                // FINISHED STATE
                <button
                    onClick={onNext}
                    className="w-full h-12 bg-[#2DFFA7] text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#28e596] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(45,255,167,0.1)] text-sm"
                >
                    {step === 2 ? "Start Recording" : "Next Angle"}
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            <div className="flex justify-center h-4">
                <button 
                    onClick={onPrev}
                    disabled={step === 0}
                    className={`text-[10px] font-medium flex items-center gap-1 transition-colors ${
                        step === 0 ? 'opacity-0 cursor-default' : 'text-[#555] hover:text-[#888]'
                    }`}
                >
                    <ChevronLeft size={10} /> Previous
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AngleGifTutorial;