import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface ExperienceCheckProps {
  onComplete: (data: { 
    level: number;
    needsAssessment: boolean;
    needsVideoReview: boolean;
    yearsPlaying: number;
    videoUrl?: string;
    videoNotes?: string;
  }) => void;
}

export function ExperienceCheck({ onComplete }: ExperienceCheckProps) {
  const [hasPlayedBefore, setHasPlayedBefore] = useState<boolean | null>(null);
  const [yearsPlaying, setYearsPlaying] = useState<number>(0);
  const [hasVideo, setHasVideo] = useState<boolean | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoNotes, setVideoNotes] = useState<string>("");

  const handleSubmit = () => {
    if (hasPlayedBefore === null) {
      toast.error("Please indicate if you have played squash before");
      return;
    }

    if (hasPlayedBefore === false) {
      // For new players, automatically set level to 1 and proceed
      onComplete({
        level: 1,
        needsAssessment: true,
        needsVideoReview: false,
        yearsPlaying: 0,
        videoUrl: "",
        videoNotes: ""
      });
      return;
    }

    if (hasPlayedBefore && yearsPlaying === 0) {
      toast.error("Please enter your years of experience");
      return;
    }

    if (hasVideo === true && !videoUrl) {
      toast.error("Please provide a video URL");
      return;
    }

    onComplete({
      level: calculateLevel(yearsPlaying),
      needsAssessment: true,
      needsVideoReview: hasVideo === true,
      yearsPlaying,
      videoUrl,
      videoNotes
    });
  };

  const calculateLevel = (years: number): number => {
    if (years < 1) return 1;
    if (years < 3) return 2;
    if (years < 5) return 3;
    if (years < 8) return 4;
    return 5;
  };

  return (
    <>
      <Toaster position="top-center" />
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Experience Check</CardTitle>
          <CardDescription>
            Please tell us about your squash experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Have you played squash before?</Label>
              <RadioGroup
                value={hasPlayedBefore?.toString()}
                onValueChange={(value) => {
                  setHasPlayedBefore(value === 'true');
                  if (value === 'false') {
                    setHasVideo(false);
                    setVideoUrl('');
                    setVideoNotes('');
                    setYearsPlaying(0);
                  }
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {hasPlayedBefore && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="years">How many years have you been playing?</Label>
                  <Input
                    id="years"
                    type="number"
                    min="0"
                    max="50"
                    value={yearsPlaying}
                    onChange={(e) => setYearsPlaying(parseInt(e.target.value) || 0)}
                    placeholder="Enter years of experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Do you have a video of yourself playing squash?</Label>
                  <RadioGroup
                    value={hasVideo?.toString()}
                    onValueChange={(value) => {
                      setHasVideo(value === 'true');
                      if (value === 'false') {
                        setVideoUrl('');
                        setVideoNotes('');
                      }
                    }}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="video-yes" />
                      <Label htmlFor="video-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="video-no" />
                      <Label htmlFor="video-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {hasVideo && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <Input
                        id="videoUrl"
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Enter video URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoNotes">Notes about your video</Label>
                      <Textarea
                        id="videoNotes"
                        value={videoNotes}
                        onChange={(e) => setVideoNotes(e.target.value)}
                        placeholder="Add any notes about your video"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <Button 
              className="w-full" 
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 