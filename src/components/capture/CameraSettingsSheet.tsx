import { Check, Video, Zap as ZapIcon, Camera } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ResolutionOption {
  width: number;
  height: number;
  label: string;
}

interface FpsOption {
  value: number;
  label: string;
}

interface CameraSettingsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentResolution: ResolutionOption;
  currentFps: FpsOption;
  supportedResolutions: ResolutionOption[];
  supportedFps: FpsOption[];
  facingMode: 'environment' | 'user';
  onResolutionChange: (resolution: ResolutionOption) => void;
  onFpsChange: (fps: FpsOption) => void;
  onFacingModeChange: (mode: 'environment' | 'user') => void;
}

const CameraSettingsSheet = ({
  isOpen,
  onOpenChange,
  currentResolution,
  currentFps,
  supportedResolutions,
  supportedFps,
  facingMode,
  onResolutionChange,
  onFpsChange,
  onFacingModeChange,
}: CameraSettingsSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0">
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
          <SheetHeader>
            <SheetTitle className="text-lg sm:text-xl">Camera Settings</SheetTitle>
          </SheetHeader>

          {/* Video Quality Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Video Quality</h3>
            </div>
            <div className="grid gap-2">
              {supportedResolutions.map((res) => (
                <button
                  key={`${res.width}x${res.height}`}
                  onClick={() => onResolutionChange(res)}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all ${
                    currentResolution.width === res.width && currentResolution.height === res.height
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{res.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {res.width} × {res.height}
                    </div>
                  </div>
                  {currentResolution.width === res.width && currentResolution.height === res.height && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Frame Rate Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ZapIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Frame Rate</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {supportedFps.map((fps) => (
                <button
                  key={fps.value}
                  onClick={() => onFpsChange(fps)}
                  className={`flex items-center justify-center p-3 sm:p-4 rounded-lg border transition-all ${
                    currentFps.value === fps.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">{fps.label}</div>
                    {currentFps.value === fps.value && (
                      <Check className="w-4 h-4 text-primary mx-auto mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Camera</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onFacingModeChange('environment')}
                className={`flex items-center justify-center p-3 sm:p-4 rounded-lg border transition-all ${
                  facingMode === 'environment'
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">Back Camera</div>
                  {facingMode === 'environment' && (
                    <Check className="w-4 h-4 text-primary mx-auto mt-1" />
                  )}
                </div>
              </button>
              <button
                onClick={() => onFacingModeChange('user')}
                className={`flex items-center justify-center p-3 sm:p-4 rounded-lg border transition-all ${
                  facingMode === 'user'
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">Front Camera</div>
                  {facingMode === 'user' && (
                    <Check className="w-4 h-4 text-primary mx-auto mt-1" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CameraSettingsSheet;
