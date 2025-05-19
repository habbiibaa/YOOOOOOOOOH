import { Metadata } from "next";
import ScheduleUploader from "@/components/schedule/ScheduleUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Upload Player Schedules | Admin Dashboard",
  description: "Upload schedules for players to book",
};

export default function UploadPlayerSchedulesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Upload Player Schedules</h1>
      
      <div className="grid gap-8">
        <ScheduleUploader />
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>About Player Schedules</CardTitle>
            <CardDescription>
              Information about how the player schedule system works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">How It Works</h3>
              <p className="text-gray-600">
                Schedules uploaded here will be made available for players to book in the booking system.
                The system will create available sessions based on the schedule data, and players can
                book these sessions according to their subscription level.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">Schedule Format</h3>
              <p className="text-gray-600 mb-2">
                You can upload schedules in CSV or JSON format. The required fields are:
              </p>
              <ul className="list-disc list-inside text-gray-600 pl-4 space-y-1">
                <li><strong>coach_name</strong>: The full name of the coach (must match a coach in the system)</li>
                <li><strong>day</strong>: The day of the week (Sunday, Monday, etc.)</li>
                <li><strong>start_time</strong>: The session start time in 24-hour format (e.g., 14:30)</li>
                <li><strong>end_time</strong>: The session end time in 24-hour format</li>
                <li><strong>court</strong>: (Optional) The court number or name</li>
                <li><strong>level</strong>: (Optional) The skill level for this session</li>
                <li><strong>student</strong>: (Optional) If this slot is already assigned to a student</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">Sample CSV Format</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm text-gray-700 overflow-x-auto">
                coach_name,day,start_time,end_time,court,level,student{"\n"}
                Ahmed Fakhry,Monday,14:30,15:15,Court 1,2,{"\n"}
                Ahmed Fakhry,Monday,15:30,16:15,Court 1,1,{"\n"}
                Alaa Taha,Tuesday,16:00,16:45,Court 2,3,{"\n"}
                Omar Zaki,Wednesday,17:30,18:15,Court 1,1,Ahmed Ali
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 