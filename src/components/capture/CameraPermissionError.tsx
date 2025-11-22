import { AlertCircle, Camera, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraPermissionErrorProps {
  onRetry: () => void;
  errorType: 'denied' | 'blocked' | 'in-use' | 'not-found' | 'unknown';
}

const CameraPermissionError = ({ onRetry, errorType }: CameraPermissionErrorProps) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const getErrorContent = () => {
    switch (errorType) {
      case 'denied':
      case 'blocked':
        return {
          title: "Camera Access Required",
          description: "This app needs camera access to record videos for 3D reconstruction.",
          instructions: isIOS 
            ? [
                "1. Open your iPhone Settings",
                "2. Scroll down and tap Safari (or your browser)",
                "3. Tap Camera under settings",
                "4. Select 'Allow' or 'Ask'",
                "5. Return here and tap Retry"
              ]
            : isAndroid
            ? [
                "1. Open your phone Settings",
                "2. Tap Apps or Applications",
                "3. Find your browser (Chrome, Firefox, etc.)",
                "4. Tap Permissions",
                "5. Enable Camera permission",
                "6. Return here and tap Retry"
              ]
            : [
                "Please enable camera access in your device settings and retry."
              ]
        };
      case 'in-use':
        return {
          title: "Camera In Use",
          description: "Another app is currently using your camera.",
          instructions: [
            "Please close any other apps that might be using the camera (video calls, camera apps, etc.) and try again."
          ]
        };
      case 'not-found':
        return {
          title: "No Camera Found",
          description: "We couldn't detect a camera on your device.",
          instructions: [
            "Please make sure your device has a working camera and try again."
          ]
        };
      default:
        return {
          title: "Camera Error",
          description: "We encountered an issue accessing your camera.",
          instructions: [
            "Please check your device camera settings and try again."
          ]
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 sm:p-6 z-50">
      <div className="max-w-md w-full space-y-4 sm:space-y-6 text-center animate-fade-in">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center">
          {errorType === 'in-use' ? (
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
          ) : (
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {content.title}
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-muted-foreground">
          {content.description}
        </p>

        {/* Instructions */}
        {(errorType === 'denied' || errorType === 'blocked') && (
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 text-left">
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                How to enable camera access:
              </span>
            </div>
            <div className="space-y-1">
              {content.instructions.map((instruction, index) => (
                <p key={index} className="text-xs sm:text-sm text-muted-foreground">
                  {instruction}
                </p>
              ))}
            </div>
          </div>
        )}

        {errorType === 'in-use' && (
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-left">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {content.instructions[0]}
            </p>
          </div>
        )}

        {/* Retry Button */}
        <Button 
          onClick={onRetry}
          size="lg"
          className="w-full sm:w-auto min-w-[200px]"
        >
          <Camera className="w-4 h-4 mr-2" />
          Retry Camera Access
        </Button>

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          Still having issues? Make sure no other apps are using the camera.
        </p>
      </div>
    </div>
  );
};

export default CameraPermissionError;
