import { Bike, Home } from "lucide-react";

interface LandingScreenProps {
  onModeSelect: (mode: "object" | "scene") => void;
}

const LandingScreen = ({ onModeSelect }: LandingScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-dark">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            3D Capture
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose what you want to capture
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onModeSelect("object")}
            className="group w-full p-8 bg-surface hover:bg-surface border-2 border-border hover:border-neon rounded-2xl transition-all duration-300 shadow-elevated hover:shadow-neon"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bike className="w-8 h-8 text-background" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold text-foreground mb-1">Object</h2>
                <p className="text-muted-foreground">
                  Capture bikes, cars, furniture & more
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onModeSelect("scene")}
            className="group w-full p-8 bg-surface hover:bg-surface border-2 border-border hover:border-neon rounded-2xl transition-all duration-300 shadow-elevated hover:shadow-neon"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-8 h-8 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold text-foreground mb-1">Scene</h2>
                <p className="text-muted-foreground">
                  Capture rooms, houses & environments
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
