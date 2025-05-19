"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { uploadSchedule } from "@/app/actions";

export default function ScheduleUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [branch, setBranch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [startDate, setStartDate] = useState("");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!branch) {
      toast.error("Please select a branch");
      return;
    }
    
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Read the file as text
      const text = await file.text();
      
      // Call the server action to upload the schedule
      const result = await uploadSchedule({
        scheduleData: text,
        branchId: branch,
        startDate
      });
      
      if (result.success) {
        toast.success("Schedule uploaded successfully");
        setFile(null);
        // Reset the file input
        const fileInput = document.getElementById("schedule-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(result.error || "Failed to upload schedule");
      }
    } catch (error) {
      console.error("Error uploading schedule:", error);
      toast.error("An error occurred while uploading the schedule");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Player Schedule</CardTitle>
        <CardDescription>
          Upload a schedule file to make slots available for players to book
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="schedule-file">Schedule File (CSV or JSON)</Label>
            <Input
              id="schedule-file"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-sm text-gray-500">
              Upload a CSV or JSON file containing the schedule data
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={branch} onValueChange={setBranch} disabled={isUploading}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fbd9510e-14ab-4a6a-a129-e0430683ecaf">Royal British School</SelectItem>
                  <SelectItem value="branch-2">Branch 2</SelectItem>
                  <SelectItem value="branch-3">Branch 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isUploading}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">File Format Guidelines</h4>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>CSV format: coach_name,day,start_time,end_time,court</li>
              <li>JSON format: array of objects with coach_name, day, start_time, end_time, and court properties</li>
              <li>Times should be in 24-hour format (e.g., 14:30)</li>
              <li>Days should be full names (e.g., Monday, Tuesday)</li>
            </ul>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} disabled={isUploading} className="w-full">
          {isUploading ? "Uploading..." : "Upload Schedule"}
        </Button>
      </CardFooter>
    </Card>
  );
} 