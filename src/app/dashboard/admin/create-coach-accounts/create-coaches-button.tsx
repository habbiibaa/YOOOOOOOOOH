"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCoachAccounts } from "@/app/actions";
import { toast } from "sonner";

export function CreateCoachesButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setResults] = useState<any>(null);

  const handleCreateCoaches = async () => {
    setIsLoading(true);
    try {
      const result = await createCoachAccounts();
      setResults(result);
      if (result.success) {
        toast.success(`Successfully created ${result.results?.created || 0} coach accounts`);
      } else {
        toast.error("Failed to create coach accounts");
      }
    } catch (error) {
      console.error("Error creating coach accounts:", error);
      toast.error("Failed to create coach accounts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateCoaches} 
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white/60 border-t-white rounded-full" />
          Creating...
        </>
      ) : "Create Coach Accounts"}
    </Button>
  );
} 