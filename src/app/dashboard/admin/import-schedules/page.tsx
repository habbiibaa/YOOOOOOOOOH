"use client";

import { useState } from "react";
import { importCoachSchedules } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImportSchedulesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const handleImportSchedules = async () => {
    setIsLoading(true);
    try {
      const result = await importCoachSchedules();
      setResults(result);
    } catch (error) {
      console.error("Error importing schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule data by day for preview
  const scheduleDays = [
    "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Import Coach Schedules</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Import Weekly Schedule</CardTitle>
          <CardDescription>
            This will import the weekly coach schedules into the database.
            It will create coach sessions for the upcoming week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            This will process schedules for the following coaches:
          </p>
          <ul className="list-disc ml-6 mb-6">
            <li>Ahmed Fakhry (Tuesday, Saturday)</li>
            <li>Ahmed Mahrous (Tuesday, Saturday)</li>
            <li>Abdullah (Wednesday)</li>
            <li>Alaa Taha (Wednesday)</li>
            <li>Omar Zaki (Thursday, Friday, Saturday)</li>
          </ul>
          
          <Button 
            onClick={handleImportSchedules} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Importing Schedules..." : "Import Weekly Schedules"}
          </Button>
        </CardContent>
      </Card>
      
      {results && (
        <Alert 
          variant={
            results.success && results.results.failed === 0
              ? "default"
              : results.success 
                ? "warning" 
                : "destructive"
          }
          className="mb-6"
        >
          <AlertTitle>Import Results</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>Total Sessions: {results.results.total}</p>
              <p>Created/Updated: {results.results.created}</p>
              <p>Skipped (empty slots): {results.results.skipped}</p>
              <p>Failed: {results.results.failed}</p>
            </div>
            
            {results.results.errors && results.results.errors.length > 0 && (
              <div className="mt-4 border border-red-200 rounded p-2 bg-red-50 max-h-40 overflow-y-auto">
                <p className="font-semibold">Errors:</p>
                <ul className="list-disc ml-6 text-sm">
                  {results.results.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Preview</CardTitle>
          <CardDescription>
            Preview of the weekly schedules that will be imported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Tuesday">
            <TabsList className="mb-4">
              {scheduleDays.map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="Tuesday">
              <ScheduleTable day="Tuesday" courts={[
                { coach: "Ahmed Fakhry", court: 1 },
                { coach: "Ahmed Mahrous", court: 2 }
              ]} />
            </TabsContent>
            
            <TabsContent value="Wednesday">
              <ScheduleTable day="Wednesday" courts={[
                { coach: "Abdullah", court: 1 },
                { coach: "Alaa Taha", court: 2 }
              ]} />
            </TabsContent>
            
            <TabsContent value="Thursday">
              <ScheduleTable day="Thursday" courts={[
                { coach: "Omar Zaki", court: 1 },
                { coach: "", court: 2 }
              ]} />
            </TabsContent>
            
            <TabsContent value="Friday">
              <ScheduleTable day="Friday" courts={[
                { coach: "Omar Zaki", court: 1 },
                { coach: "", court: 2 }
              ]} />
            </TabsContent>
            
            <TabsContent value="Saturday">
              <ScheduleTable day="Saturday" courts={[
                { coach: "Omar Zaki", court: 1 },
                { coach: "Ahmed Mahrous", court: 2 }
              ]} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component to display schedule table
function ScheduleTable({ day, courts }: { day: string, courts: { coach: string, court: number }[] }) {
  // Common time slots based on the days
  const getTimeSlots = (day: string) => {
    if (day === "Friday" || day === "Saturday") {
      return ["10:00", "10:45", "11:30", "12:15", "1:00", "1:45", "2:30", "3:15", "4:00", "4:45", "5:30", "6:15", "7:00", "7:45", "8:30"];
    }
    return ["3:30", "4:15", "4:30", "5:00", "5:15", "5:45", "6:00", "6:30", "6:45", "7:15", "7:30", "8:00", "8:15", "8:45", "9:00"];
  };

  const timeSlots = getTimeSlots(day);

  return (
    <div className="border rounded overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Time</TableHead>
            {courts.map((court, index) => (
              <TableHead key={index}>
                Court {court.court} {court.coach ? `(${court.coach})` : ""}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((time, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{time}</TableCell>
              {courts.map((court, courtIndex) => (
                <TableCell key={courtIndex}>
                  {getStudentForTimeSlot(day, time, court.court)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper function to get the student name for a specific time slot
function getStudentForTimeSlot(day: string, time: string, court: number): string {
  // This is a simplified version that just shows some of the major slots from the schedule
  
  // Tuesday slots
  if (day === "Tuesday") {
    if (time === "3:30" && court === 2) return "ECA";
    if (time === "4:30" && court === 1) return "Rayan";
    if (time === "4:30" && court === 2) return "Tamem";
    if (time === "5:15" && court === 1) return "Mayada emad";
    if (time === "5:15" && court === 2) return "Mariam sherif";
    if (time === "6:00" && court === 1) return "Dalida";
    if (time === "7:30" && court === 2) return "Marwa fahmy";
  }
  
  // Wednesday slots
  if (day === "Wednesday") {
    if (time === "3:30" && court === 2) return "Aly Mostafa";
    if (time === "4:15" && court === 1) return "layan";
    if (time === "4:15" && court === 2) return "Taher and Ameen (group)";
    if (time === "5:45" && court === 2) return "Selim el khamry";
  }
  
  // Thursday slots
  if (day === "Thursday") {
    if (time === "3:30" && court === 1) return "Yassin Mohamed";
    if (time === "4:15" && court === 1) return "Zaina El Ghazawy";
    if (time === "5:00" && court === 1) return "Marwa Fahmy";
  }
  
  // Saturday slots
  if (day === "Saturday") {
    if (time === "10:00" && court === 1) return "Taher and Ameen (group)";
    if (time === "10:45" && court === 2) return "Laila ashraf";
    if (time === "11:30" && court === 1) return "Layla Mohamed Sadek";
    if (time === "11:30" && court === 2) return "Mariam sherif";
  }
  
  return "";
} 