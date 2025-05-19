"use client";

import { useState } from "react";
import { insertRoyalBritishSchedules } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Info, Upload, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import DashboardNavbar from "@/components/dashboard-navbar";

export default function ImportRoyalBritishSchedulesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeDay, setActiveDay] = useState("Tuesday");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const handleImportSchedules = async () => {
    setIsLoading(true);
    try {
      const result = await insertRoyalBritishSchedules();
      
      if (result.success) {
        toast.success("Royal British schedules imported successfully");
        if (result.results) {
          toast.info(`Created ${result.results.created} sessions, updated ${result.results.updated}`);
        }
      } else {
        toast.error(result.error || "Failed to import schedules");
      }
    } catch (error) {
      console.error("Error importing schedules:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Import Royal British School Schedules</h1>
          <Link href="/dashboard/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Schedule Import Settings</CardTitle>
            <CardDescription>
              This will import the preset schedules for the Royal British School branch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-800 rounded-md">
                <Info className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Important Information</p>
                  <p className="text-sm mb-2">
                    This will create schedules for the following coaches at Royal British School:
                    Ahmed Fakhry, Ahmed Mahrous, Alaa Taha, Abdelrahman Dahy, Omar Zaki, and Ahmed Maher.
                    Make sure all coaches have accounts in the system before proceeding.
                  </p>
                  <p className="text-sm mb-1">Session counts per day:</p>
                  <ul className="text-xs list-disc pl-5 mb-2">
                    <li>Sunday, Monday, Tuesday: 7 sessions per coach</li>
                    <li>Wednesday, Thursday: 8 sessions per coach</li>
                    <li>Friday, Saturday: 15 sessions per coach</li>
                  </ul>
                  <p className="text-sm font-medium mb-1">Level Color Coding:</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-blue-100">Level 1</span>
                    <span className="px-2 py-1 rounded bg-green-100">Level 2</span>
                    <span className="px-2 py-1 rounded bg-pink-100">Level 3</span>
                    <span className="px-2 py-1 rounded bg-purple-100">Level 4</span>
                    <span className="px-2 py-1 rounded bg-red-100">Level 5</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-800 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Warning</p>
                  <p className="text-sm">
                    This will replace all existing schedule data for the Royal British School branch.
                    Sessions will be generated for the next 4 weeks based on these schedules.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleImportSchedules} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white/60 border-t-white rounded-full" />
                  Importing Schedules...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Royal British School Schedules
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Schedule Preview</CardTitle>
            <CardDescription>
              This shows the weekly schedule that will be imported for Royal British School
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue={activeDay} 
              onValueChange={setActiveDay}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  {days.map(day => (
                    <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <TabsContent value="Sunday">
                <ScheduleTable day="Sunday" />
              </TabsContent>

              <TabsContent value="Monday">
                <ScheduleTable day="Monday" />
              </TabsContent>
              
              <TabsContent value="Tuesday">
                <ScheduleTable day="Tuesday" />
              </TabsContent>
              
              <TabsContent value="Wednesday">
                <ScheduleTable day="Wednesday" />
              </TabsContent>
              
              <TabsContent value="Thursday">
                <ScheduleTable day="Thursday" />
              </TabsContent>
              
              <TabsContent value="Friday">
                <ScheduleTable day="Friday" />
              </TabsContent>
              
              <TabsContent value="Saturday">
                <ScheduleTable day="Saturday" />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              <p>* The schedules shown are the predefined RBS schedules</p>
              <p>* These schedules will be imported exactly as shown</p>
              <p>* After import, sessions will be available for booking in the system</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

function ScheduleTable({ day }: { day: string }) {
  const getScheduleData = (day: string) => {
    switch(day) {
      case "Sunday":
        return [
          { time: "3:30 PM", court1: "Ahmed Fakhry - ECA", court2: "Ahmed Maher - ECA", level: 1 },
          { time: "4:30 PM", court1: "Ahmed Fakhry - Rayan", court2: "Ahmed Maher - Tamem", level: 2 },
          { time: "5:15 PM", court1: "Ahmed Fakhry - Mayada Emad", court2: "Ahmed Maher - Omar sherif", level: 1 },
          { time: "6:00 PM", court1: "Ahmed Fakhry - Dalida", court2: "Ahmed Maher - Mohamed reda el basuiny", level: 1 },
          { time: "6:45 PM", court1: "Ahmed Fakhry - Lara omar", court2: "Ahmed Maher - elissa mark", level: 1 },
          { time: "7:30 PM", court1: "Ahmed Fakhry - aly ahmed", court2: "Ahmed Maher - Cady mohamed", level: 1 },
          { time: "8:15 PM", court1: "Ahmed Fakhry - Aly mostafa", court2: "Ahmed Maher - youssef Adham", level: 2 },
          { time: "9:00 PM", court1: "", court2: "", level: 0 }
        ];
      case "Monday":
        return [
          { time: "3:30 PM", court1: "Alaa Taha - ECA", court2: "Abdelrahman Dahy - ECA", level: 1 },
          { time: "4:30 PM", court1: "Alaa Taha - Layla Mohamed Sadek", court2: "Abdelrahman Dahy - Selim el khamiry", level: 1 },
          { time: "5:15 PM", court1: "Alaa Taha - Talia mohamed", court2: "Abdelrahman Dahy - Camellia Gheriany", level: 1 },
          { time: "6:00 PM", court1: "Alaa Taha - Carla mahmoud", court2: "Abdelrahman Dahy - Mariam ahmed", level: 1 },
          { time: "6:45 PM", court1: "Alaa Taha - Aly mostafa", court2: "Abdelrahman Dahy - layan", level: 1 },
          { time: "7:30 PM", court1: "Alaa Taha - Omar sherif salem", court2: "Abdelrahman Dahy - Yasin Mohamed Mamdouh", level: 2 },
          { time: "8:15 PM", court1: "Alaa Taha - Marwa fahmy", court2: "Abdelrahman Dahy - Adam merai", level: 3 },
          { time: "9:00 PM", court1: "Alaa Taha - Hamza", court2: "Abdelrahman Dahy - Malek Ahmed Tarek", level: 2 }
        ];
      case "Tuesday":
        return [
          { time: "3:30 PM", court1: "Ahmed Fakhry", court2: "Ahmed Mahrous - ECA", level: 1 },
          { time: "4:30 PM", court1: "Ahmed Fakhry - Rayan", court2: "Ahmed Mahrous - Tamem", level: 2 },
          { time: "5:15 PM", court1: "Ahmed Fakhry - Mayada emad", court2: "Ahmed Mahrous - Mariam sherif", level: 1 },
          { time: "6:00 PM", court1: "Ahmed Fakhry - Dalida", court2: "Ahmed Mahrous - elissa mark", level: 1 },
          { time: "6:45 PM", court1: "Ahmed Fakhry - Lara omar", court2: "Ahmed Mahrous - Laila ashraf", level: 1 },
          { time: "7:30 PM", court1: "Ahmed Fakhry - Aly Ahmed", court2: "Ahmed Mahrous - Marwa fahmy", level: 3 },
          { time: "8:15 PM", court1: "Ahmed Fakhry - Farida amr", court2: "Ahmed Mahrous - Cady mohamed", level: 1 },
          { time: "9:00 PM", court1: "", court2: "", level: 0 }
        ];
      case "Wednesday":
        return [
          { time: "3:30 PM", court1: "Ahmed Maher", court2: "Alaa Taha - Aly Mostafa", level: 2 },
          { time: "4:15 PM", court1: "Ahmed Maher - layan", court2: "Alaa Taha - Taher & Ameen Asser Yassin", level: 2 },
          { time: "5:00 PM", court1: "Ahmed Maher - Camellia Gheriany", court2: "Alaa Taha - Talia mohamed", level: 1 },
          { time: "5:45 PM", court1: "Ahmed Maher - Assessment (Yehia and aly)", court2: "Alaa Taha - Selim el khamry", level: 1 },
          { time: "6:30 PM", court1: "Ahmed Maher - Aly karim", court2: "Alaa Taha - Omar sherif salem", level: 2 },
          { time: "7:15 PM", court1: "Ahmed Maher - Hachem", court2: "Alaa Taha - Gasser", level: 1 },
          { time: "8:00 PM", court1: "Ahmed Maher - Youssef adham", court2: "Alaa Taha - Mohamed reda el basiuony", level: 1 },
          { time: "8:45 PM", court1: "", court2: "", level: 0 }
        ];
      case "Thursday":
        return [
          { time: "3:30 PM", court1: "Omar Zaki - Yassin Mohamed Mamdouh", court2: "", level: 1 },
          { time: "4:15 PM", court1: "Omar Zaki - Zeina El Ghazawy", court2: "", level: 2 },
          { time: "5:00 PM", court1: "Omar Zaki - Marwa Fahmy", court2: "", level: 3 },
          { time: "5:45 PM", court1: "Omar Zaki - Hachem", court2: "", level: 1 },
          { time: "6:30 PM", court1: "Omar Zaki - Gasser", court2: "", level: 1 },
          { time: "7:15 PM", court1: "Omar Zaki - Aisha yasser", court2: "", level: 1 },
          { time: "8:00 PM", court1: "Omar Zaki - Icel mohamed", court2: "", level: 2 },
          { time: "8:45 PM", court1: "Omar Zaki - Dema mohamed", court2: "", level: 1 }
        ];
      case "Friday":
        return [
          { time: "10:00 AM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "10:45 AM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "11:30 AM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "12:15 PM", court1: "Prayer Time", court2: "Prayer Time", level: 0 },
          { time: "1:30 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "2:15 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "3:00 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "3:45 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "4:30 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "5:15 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "6:00 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "6:45 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "7:30 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "8:15 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 },
          { time: "9:00 PM", court1: "Omar Zaki", court2: "Ahmed Fakhry", level: 0 }
        ];
      case "Saturday":
        return [
          { time: "10:00 AM", court1: "Omar Zaki - Taher & Ameen Asser yassin", court2: "Ahmed Mahrous", level: 0 },
          { time: "10:45 AM", court1: "Omar Zaki", court2: "Ahmed Mahrous - Laila ashraf", level: 0 },
          { time: "11:30 AM", court1: "Omar Zaki - Layla Mohamed Sadek", court2: "Ahmed Mahrous - Mariam sherif", level: 0 },
          { time: "12:15 PM", court1: "Omar Zaki - Hachem", court2: "Ahmed Mahrous - Gasser", level: 0 },
          { time: "1:00 PM", court1: "Omar Zaki", court2: "Ahmed Mahrous - Carla mahmoud", level: 0 },
          { time: "1:45 PM", court1: "Omar Zaki", court2: "Ahmed Mahrous - Hamza", level: 0 },
          { time: "2:30 PM", court1: "Omar Zaki", court2: "Ahmed Mahrous - Aly karim", level: 0 },
          { time: "3:15 PM", court1: "Omar Zaki - Yehia and aly", court2: "Ahmed Mahrous - Dema mohamed", level: 0 },
          { time: "4:00 PM", court1: "Omar Zaki - Aisha yasser", court2: "Ahmed Mahrous - Rayan", level: 0 },
          { time: "4:45 PM", court1: "Omar Zaki - Mariam Ahmed", court2: "Ahmed Mahrous - Tamem", level: 0 },
          { time: "5:30 PM", court1: "Omar Zaki - Icel mohamed", court2: "Ahmed Mahrous - Student", level: 0 },
          { time: "6:15 PM", court1: "Omar Zaki - Zeina El Ghazawy", court2: "Ahmed Mahrous - Student", level: 0 },
          { time: "7:00 PM", court1: "Omar Zaki - Selim el khamiry", court2: "Ahmed Mahrous - Student", level: 0 },
          { time: "7:45 PM", court1: "Omar Zaki", court2: "Ahmed Mahrous - Student", level: 0 },
          { time: "8:30 PM", court1: "Omar Zaki", court2: "Ahmed Mahrous", level: 0 }
        ];
      default:
        return [];
    }
  };

  const data = getScheduleData(day);
  
  // Function to get background color based on level
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-blue-100"; // Level 1 - Blue
      case 2: return "bg-green-100"; // Level 2 - Green
      case 3: return "bg-pink-100"; // Level 3 - Light Pink
      case 4: return "bg-purple-100"; // Level 4 - Purple
      case 5: return "bg-red-100"; // Level 5 - Light Red
      default: return ""; // No color for level 0 (empty or special slots)
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead>Court 1</TableHead>
            <TableHead>Court 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((slot, index) => (
            <TableRow key={`${day}-${index}`} className={getLevelColor(slot.level)}>
              <TableCell className="font-medium">{slot.time}</TableCell>
              <TableCell>{slot.court1 || "—"}</TableCell>
              <TableCell>{slot.court2 || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 