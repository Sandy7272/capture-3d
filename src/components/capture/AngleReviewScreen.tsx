import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2 } from "lucide-react";

interface AngleReviewScreenProps {
  blobs: (Blob | null)[];
  angleLabels: string[];
  onRetake: (index: number) => void;
  onContinue: () => void;
}

export const AngleReviewScreen = ({
  blobs,
  angleLabels,
  onRetake,
  onContinue,
}: AngleReviewScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto p-4 sm:p-6 flex flex-col">
      <div className="w-full max-w-md m-auto">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Review Your Angles
        </h2>
        <p className="text-white/60 text-sm text-center mb-8">
          Check each angle before final processing
        </p>

        <div className="space-y-4 mb-8">
          {blobs.map((blob, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {blob ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                  )}
                  <div>
                    <p className="text-white font-medium">{angleLabels[index]}</p>
                    <p className="text-white/50 text-xs">30 seconds</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetake(index)}
                  disabled={!blob}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
              </div>

              {blob && (
                <video
                  src={URL.createObjectURL(blob)}
                  className="w-full aspect-video object-cover rounded-md mt-3"
                  muted
                  playsInline
                />
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={onContinue}
          disabled={blobs.some((b) => !b)}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
        >
          Process Videos
        </Button>
      </div>
    </div>
  );
};
