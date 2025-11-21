import { useState } from "react";
import { Video, Home } from "lucide-react";
import LandingScreen from "@/components/capture/LandingScreen";
import TutorialFlow from "@/components/capture/TutorialFlow";
import CameraCapture from "@/components/capture/CameraCapture";

type AppState = "landing" | "tutorial" | "camera" | "scene-placeholder";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");

  const handleModeSelect = (mode: "object" | "scene") => {
    if (mode === "object") {
      setAppState("tutorial");
    } else {
      setAppState("scene-placeholder");
    }
  };

  const handleTutorialComplete = () => {
    setAppState("camera");
  };

  const handleBackToLanding = () => {
    setAppState("landing");
  };

  return (
    <div className="min-h-screen bg-background">
      {appState === "landing" && (
        <LandingScreen onModeSelect={handleModeSelect} />
      )}
      
      {appState === "tutorial" && (
        <TutorialFlow onComplete={handleTutorialComplete} />
      )}
      
      {appState === "camera" && (
        <CameraCapture onBack={handleBackToLanding} />
      )}
      
      {appState === "scene-placeholder" && (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-surface flex items-center justify-center border-2 border-neon shadow-neon">
              <Home className="w-10 h-10 text-neon" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Scene Mode</h1>
            <p className="text-muted-foreground text-lg">Coming Soon</p>
            <button
              onClick={handleBackToLanding}
              className="mt-8 px-6 py-3 bg-surface hover:bg-surface-elevated text-foreground rounded-lg transition-all border border-border"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
