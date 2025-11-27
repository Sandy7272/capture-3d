import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

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
    video: "/assets/tutorials/middle.mp4",
    speak: "This is the middle angle. Hold your phone at chest height and move around the object slowly.",
    lines: ["Hold chest height", "Move in full circle", "Keep object centered"],
  },
  top: {
    title: "Top Angle",
    subtitle: "Camera Above Object",
    video: "/assets/tutorials/top.mp4",
    speak: "This is the top angle. Hold your phone above the object at a downward angle and move in a full circle.",
    lines: ["Raise phone above object", "Tilt 45° down", "Walk full circle"],
  },
  bottom: {
    title: "Bottom Angle",
    subtitle: "Camera Below Object",
    video: "/assets/tutorials/bottom.mp4",
    speak: "This is the bottom angle. Hold your phone low and tilt upward while moving around the object.",
    lines: ["Phone lower than object", "Tilt 45° up", "Walk full circle"],
  },
};

const AngleGifTutorial: FC<AngleGifTutorialProps> = ({ angle, onNext, onPrev }) => {
  const step = angleOrder.indexOf(angle);
  const data = angleData[angle];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false); // Ref to access current mute state inside callbacks

  const [state, setState] = useState<"idle" | "speaking" | "finished">("idle");
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Sync ref with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // --- Voice Logic ---
  const speakInstructions = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      // If no speech support, rely on the 10s timer or finish immediately
      return; 
    }

    window.speechSynthesis.cancel();

    if (isMutedRef.current) {
      return;
    }

    const msg = new SpeechSynthesisUtterance(data.speak);
    msg.rate = 1.0;
    
    msg.onstart = () => setState("speaking");
    
    msg.onend = () => {
      // Only finish if NOT muted. 
      // If muted, we wait for the 10s timer instead.
      if (!isMutedRef.current) {
        setState("finished");
      }
    };

    msg.onerror = () => {
       // On error, we rely on the timer to eventually unlock the button
    };

    window.speechSynthesis.speak(msg);
  }, [data.speak]);

  // --- Effect: Step Change Lifecycle ---
  useEffect(() => {
    setVideoLoaded(false);
    setState("speaking"); // Initially assume speaking/waiting
    
    // 1. Start Audio
    speakInstructions();

    // 2. Start 10s Fallback Timer
    // This ensures the button appears after 10s even if muted or audio fails
    const timer = setTimeout(() => {
      setState("finished");
    }, 10000);

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [step, speakInstructions]);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      // If muting, stop audio. 
      // NOTE: We do NOT set state to "finished" here. 
      // User must wait for the 10s timer.
      window.speechSynthesis.cancel();
    } else {
      // If unmuting, we could replay, but user might just want to hear remaining time?
      // For simplicity, we just unmute. 
      // If they want to hear it, they can reset the step (Previous -> Next).
    }
  };

  return (
    <div className="w-full h-screen bg-[#0A0A0A] text-white flex flex-row overflow-hidden font-sans">

      {/* LEFT SIDE: PREVIEW */}
      <div className="w-[60%] flex justify-center items-center px-4 bg-[#050505]">
        <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-[#222] p-4 shadow-2xl">
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full border border-[#333] text-[10px] tracking-wider text-white/80 z-10 bg-black/40 backdrop-blur-md">
            TUTORIAL PREVIEW
          </div>

          <video
            ref={videoRef}
            key={data.video}
            autoPlay
            muted
            loop
            playsInline
            src={data.video}
            onLoadedData={() => setVideoLoaded(true)}
            className={`
              w-full h-[200px] sm:h-[220px] md:h-[240px] lg:h-[280px]
              object-contain mt-4 transition-opacity duration-500
              ${videoLoaded ? 'opacity-100' : 'opacity-0'} 
            `}
          />
        </div>
      </div>

      {/* RIGHT SIDE: UI PANEL - COMPACT */}
      <div className="w-[40%] bg-[#0A0A0A] border-l border-[#222] px-5 py-6 flex flex-col justify-center relative">

        {/* TOP SEGMENTED PROGRESS BAR */}
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

        {/* HEADER: STEP BADGE + MUTE */}
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

        {/* TEXT CONTENT - COMPACT */}
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

        {/* BOTTOM ACTION AREA */}
        <div className="mt-auto space-y-3">
            
            {state !== "finished" ? (
                // STATUS: PLAYING INSTRUCTIONS (Wait for audio OR 10s timer)
                <div className="w-full h-12 bg-[#161616] border border-[#222] rounded-lg flex items-center justify-center gap-2 text-[#888] animate-pulse">
                    <Volume2 size={16} className="text-[#2DFFA7]" />
                    <span className="text-xs font-medium">
                      {isMuted ? "Please wait..." : "Playing Instructions..."}
                    </span>
                </div>
            ) : (
                // ACTION: NEXT BUTTON (Only appears when finished)
                <button
                    onClick={onNext}
                    className="w-full h-12 bg-[#2DFFA7] text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#28e596] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(45,255,167,0.1)] text-sm"
                >
                    {step === 2 ? "Start Recording" : "Next Angle"}
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            {/* Back Navigation */}
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