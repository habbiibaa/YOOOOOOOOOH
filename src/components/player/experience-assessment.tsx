"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { checkAndCreatePlayerProfile } from "@/app/actions";
import { useRouter } from "next/navigation";

interface ExperienceAssessmentProps {
  userId: string;
  email: string;
  name: string;
  onAssessmentComplete: (
    recommendedLevel: number,
    shouldBookAssessment: boolean
  ) => void;
}

export default function ExperienceAssessment({
  userId,
  email,
  name,
  onAssessmentComplete,
}: ExperienceAssessmentProps) {
  const [hasPlayedSquash, setHasPlayedSquash] = useState<boolean | null>(null);
  const [yearsPlaying, setYearsPlaying] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (hasPlayedSquash === null) {
      setError("Please select whether you've played squash before");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await checkAndCreatePlayerProfile(
        userId,
        email,
        name,
        hasPlayedSquash,
        yearsPlaying
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success) {
        onAssessmentComplete(
          result.recommendedLevel,
          result.shouldBookAssessment
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Assessment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-gray-900 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Squash Experience</CardTitle>
        <CardDescription className="text-gray-400">
          Tell us about your squash experience so we can recommend the right
          training plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Label htmlFor="played-squash" className="text-white">
            Have you played squash before?
          </Label>
          <RadioGroup
            value={hasPlayedSquash === null ? undefined : hasPlayedSquash ? "yes" : "no"}
            onValueChange={(value) => {
              setHasPlayedSquash(value === "yes");
              if (value === "no") setYearsPlaying(0);
            }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="yes"
                id="yes"
                className="peer sr-only"
              />
              <Label
                htmlFor="yes"
                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-white peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-900/20 [&:has([data-state=checked])]:border-red-600"
              >
                <span>Yes</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="no"
                id="no"
                className="peer sr-only"
              />
              <Label
                htmlFor="no"
                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-white peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-900/20 [&:has([data-state=checked])]:border-red-600"
              >
                <span>No</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {hasPlayedSquash && (
          <div className="space-y-3">
            <Label htmlFor="years" className="text-white">
              How many years have you been playing?
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 5].map((year) => (
                <Button
                  key={year}
                  type="button"
                  variant="outline"
                  className={`${
                    yearsPlaying === year
                      ? "bg-red-900/30 border-red-600 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setYearsPlaying(year)}
                >
                  {year === 0 ? "<1" : year === 5 ? "5+" : year}
                </Button>
              ))}
            </div>
            <div className="pt-2">
              <Label htmlFor="exact-years" className="text-white text-sm">
                Or enter exact number:
              </Label>
              <Input
                id="exact-years"
                type="number"
                min="0"
                max="50"
                value={yearsPlaying}
                onChange={(e) => setYearsPlaying(Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? "Processing..." : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
} 