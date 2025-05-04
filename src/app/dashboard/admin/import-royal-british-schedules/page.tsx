"use client";

import { useState } from "react";
import { insertRoyalBritishSchedules } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, InfoIcon } from "lucide-react";

export default function ImportRoyalBritishSchedulesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const handleImportSchedules = async () => {
    setIsLoading(true);
    try {
      const result = await insertRoyalBritishSchedules();
      setResults(result);
    } catch (error) {
      console.error("Error importing schedules:", error);
      setResults({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Days for the tab navigation
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Royal British School Schedules</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Import Royal British School Schedules</CardTitle>
          <CardDescription>
            This will import the exact schedules shown in the timetable for the Royal British School branch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-md">
            <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
            <p className="text-sm text-gray-700">
              This will create sessions for the following coaches at Royal British School:
              Ahmed Fakhry, Ahmed Mahrous, Alaa Taha, Ahmed Magdy, Omar Zaki, and Abdullah.
            </p>
          </div>
          
          <Alert variant="warning" className="mb-4">
            <AlertCircleIcon className="h-4 w-4 mr-2" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure all coaches have accounts in the system before importing schedules.
              If any coach is missing, the import will fail.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleImportSchedules} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Importing Schedules..." : "Import Royal British School Schedules"}
          </Button>
        </CardContent>
      </Card>
      
      {results && (
        <Alert 
          variant={results.success === true ? "default" : "destructive"}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            {results.success ? 
              <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
              <XCircleIcon className="h-5 w-5 text-red-500" />
            }
            <AlertTitle>{results.success ? "Import Successful" : "Import Failed"}</AlertTitle>
          </div>
          <AlertDescription>
            {results.success ? (
              <div className="space-y-2">
                <p>{results.message}</p>
                {results.results && (
                  <div className="bg-gray-50 p-3 rounded-md mt-2">
                    <p>Total: {results.results.total}</p>
                    <p>Created: {results.results.created}</p>
                    <p>Updated: {results.results.updated}</p>
                    <p>Failed: {results.results.failed}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-500 font-medium">{results.error}</p>
            )}
            
            {results.results?.errors && results.results.errors.length > 0 && (
              <div className="mt-4 bg-red-50 p-3 rounded-md max-h-40 overflow-y-auto">
                <p className="font-medium">Errors:</p>
                <ul className="list-disc ml-6 mt-1">
                  {results.results.errors.map((error: string, index: number) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Royal British School Schedule Preview</CardTitle>
          <CardDescription>
            Preview of the weekly schedule that will be imported for Royal British School
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Tuesday">
            <TabsList className="mb-4">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="Sunday">
              <ScheduleTable day="Sunday" data={[
                { time: "3:30", court1: { coach: "Ahmed Fakhry", student: "ECA" }, court2: { coach: "Abdullah", student: "" } },
                { time: "4:30", court1: { coach: "Ahmed Fakhry", student: "Rayan (individual)" }, court2: { coach: "Abdullah", student: "Tamem (individual)" } },
                { time: "5:15", court1: { coach: "Ahmed Fakhry", student: "Mayada Emad (individual)" }, court2: { coach: "Abdullah", student: "Omar sherif (individual)" } },
                { time: "6:00", court1: { coach: "Ahmed Fakhry", student: "Dalida(individual)" }, court2: { coach: "Abdullah", student: "Mohamed reda el basuiny (individual)" } },
                { time: "6:45", court1: { coach: "Ahmed Fakhry", student: "Lara omar(individual)" }, court2: { coach: "Abdullah", student: "elissa mark (individual)" } },
                { time: "7:30", court1: { coach: "Ahmed Fakhry", student: "aly ahmed( individual )" }, court2: { coach: "Abdullah", student: "Cady mohamed(individual)" } },
                { time: "8:15", court1: { coach: "Ahmed Fakhry", student: "Aly mostafa(individual)" }, court2: { coach: "Abdullah", student: "youssef Adham(individual)" } },
                { time: "9:00", court1: { coach: "Ahmed Fakhry", student: "" }, court2: { coach: "Abdullah", student: "" } }
              ]} />
            </TabsContent>

            <TabsContent value="Monday">
              <ScheduleTable day="Monday" data={[
                { time: "3:30", court1: { coach: "Alaa Taha", student: "ECA" }, court2: { coach: "Ahmed Magdy", student: "ECA" } },
                { time: "4:30", court1: { coach: "Alaa Taha", student: "Layla Mohamed Sadek (Individual)" }, court2: { coach: "Ahmed Magdy", student: "Selim el khamiry(individual) Not Confirmed" } },
                { time: "5:15", court1: { coach: "Alaa Taha", student: "Talia mohamed (individual)" }, court2: { coach: "Ahmed Magdy", student: "Camellia Gheriany (Individual)" } },
                { time: "6:00", court1: { coach: "Alaa Taha", student: "Carla mahmoud (individual)" }, court2: { coach: "Ahmed Magdy", student: "Mariam ahmed (individual)" } },
                { time: "6:45", court1: { coach: "Alaa Taha", student: "Aly mostafa(individual)" }, court2: { coach: "Ahmed Magdy", student: "layan(individual)" } },
                { time: "7:30", court1: { coach: "Alaa Taha", student: "Omar sherif salem (individual)" }, court2: { coach: "Ahmed Magdy", student: "Yasin Mohamed Mamdouh (from 28/04)" } },
                { time: "8:15", court1: { coach: "Alaa Taha", student: "Marwa fahmy (individual)" }, court2: { coach: "Ahmed Magdy", student: "Adam merai(individual)" } },
                { time: "9:00", court1: { coach: "Alaa Taha", student: "Hamza(individual)" }, court2: { coach: "Ahmed Magdy", student: "Malek Ahmed Tarek (from 01/05)" } }
              ]} />
            </TabsContent>
            
            <TabsContent value="Tuesday">
              <ScheduleTable day="Tuesday" data={[
                { time: "3:30", court1: { coach: "Ahmed Fakhry", student: "" }, court2: { coach: "Ahmed Mahrous", student: "ECA" } },
                { time: "4:30", court1: { coach: "Ahmed Fakhry", student: "Rayan" }, court2: { coach: "Ahmed Mahrous", student: "Tamem" } },
                { time: "5:15", court1: { coach: "Ahmed Fakhry", student: "Mayada emad" }, court2: { coach: "Ahmed Mahrous", student: "Mariam sherif" } },
                { time: "6:00", court1: { coach: "Ahmed Fakhry", student: "Dalida" }, court2: { coach: "Ahmed Mahrous", student: "elissa mark" } },
                { time: "6:45", court1: { coach: "Ahmed Fakhry", student: "Lara omar" }, court2: { coach: "Ahmed Mahrous", student: "Laila ashraf" } },
                { time: "7:30", court1: { coach: "Ahmed Fakhry", student: "Aly Ahmed" }, court2: { coach: "Ahmed Mahrous", student: "Marwa fahmy" } },
                { time: "8:15", court1: { coach: "Ahmed Fakhry", student: "Farida amr" }, court2: { coach: "Ahmed Mahrous", student: "Cady mohamed" } },
                { time: "9:00", court1: { coach: "Ahmed Fakhry", student: "" }, court2: { coach: "Ahmed Mahrous", student: "" } }
              ]} />
            </TabsContent>
            
            <TabsContent value="Wednesday">
              <ScheduleTable day="Wednesday" data={[
                { time: "3:30", court1: { coach: "Abdullah", student: "" }, court2: { coach: "Alaa Taha", student: "Aly Mostafa" } },
                { time: "4:15", court1: { coach: "Abdullah", student: "layan" }, court2: { coach: "Alaa Taha", student: "Taher and Ameen" } },
                { time: "5:00", court1: { coach: "Abdullah", student: "Camellia Gheriany" }, court2: { coach: "Alaa Taha", student: "Talia mohamed" } },
                { time: "5:45", court1: { coach: "Abdullah", student: "Assessment - Yehia and aly" }, court2: { coach: "Alaa Taha", student: "Selim el khamry" } },
                { time: "6:30", court1: { coach: "Abdullah", student: "Aly karim" }, court2: { coach: "Alaa Taha", student: "Omar sherif" } },
                { time: "7:15", court1: { coach: "Abdullah", student: "Hachem" }, court2: { coach: "Alaa Taha", student: "Gasser" } },
                { time: "8:00", court1: { coach: "Abdullah", student: "Youssef adham" }, court2: { coach: "Alaa Taha", student: "Mohamed reda" } },
                { time: "8:45", court1: { coach: "Abdullah", student: "" }, court2: { coach: "Alaa Taha", student: "" } }
              ]} />
            </TabsContent>
            
            <TabsContent value="Thursday">
              <ScheduleTable day="Thursday" data={[
                { time: "3:30", court1: { coach: "Omar Zaki", student: "Yassin Mohamed" }, court2: { coach: "", student: "" } },
                { time: "4:15", court1: { coach: "Omar Zaki", student: "Zaina El Ghazawy" }, court2: { coach: "", student: "" } },
                { time: "5:00", court1: { coach: "Omar Zaki", student: "Marwa Fahmy" }, court2: { coach: "", student: "" } },
                { time: "5:45", court1: { coach: "Omar Zaki", student: "Hachem" }, court2: { coach: "", student: "" } },
                { time: "6:30", court1: { coach: "Omar Zaki", student: "Gasser" }, court2: { coach: "", student: "" } },
                { time: "7:15", court1: { coach: "Omar Zaki", student: "Aisha yasser" }, court2: { coach: "", student: "" } },
                { time: "8:00", court1: { coach: "Omar Zaki", student: "Icel mohamed" }, court2: { coach: "", student: "" } },
                { time: "8:45", court1: { coach: "Omar Zaki", student: "Dema mohamed" }, court2: { coach: "", student: "" } }
              ]} />
            </TabsContent>
            
            <TabsContent value="Friday">
              <ScheduleTable day="Friday" data={[
                { time: "10:00", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "10:45", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "11:30", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "11:00", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "12:00", court1: { coach: "", student: "Prayer Time" }, court2: { coach: "", student: "Prayer Time" } },
                { time: "1:30", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "2:15", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "3:00", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "3:45", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "4:30", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "5:15", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "6:00", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "", student: "" } },
                { time: "6:45", court1: { coach: "", student: "" }, court2: { coach: "", student: "" } },
                { time: "7:15", court1: { coach: "", student: "" }, court2: { coach: "", student: "" } },
                { time: "8:00", court1: { coach: "", student: "" }, court2: { coach: "", student: "" } }
              ]} />
            </TabsContent>
            
            <TabsContent value="Saturday">
              <ScheduleTable day="Saturday" data={[
                { time: "10:00", court1: { coach: "Omar Zaki", student: "Taher and Ameen" }, court2: { coach: "Ahmed Mahrous", student: "" } },
                { time: "10:45", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "Ahmed Mahrous", student: "Laila ashraf" } },
                { time: "11:30", court1: { coach: "Omar Zaki", student: "Layla Mohamed" }, court2: { coach: "Ahmed Mahrous", student: "Mariam sherif" } },
                { time: "12:15", court1: { coach: "Omar Zaki", student: "Hachem" }, court2: { coach: "Ahmed Mahrous", student: "Gasser" } },
                { time: "1:00", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "Ahmed Mahrous", student: "Carla mahmoud" } },
                { time: "1:45", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "Ahmed Mahrous", student: "Hamza" } },
                { time: "2:30", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "Ahmed Mahrous", student: "Aly karim" } },
                { time: "3:15", court1: { coach: "Omar Zaki", student: "Yehia and aly" }, court2: { coach: "Ahmed Mahrous", student: "Dema mohamed" } },
                { time: "4:00", court1: { coach: "Omar Zaki", student: "Aisha yasser" }, court2: { coach: "Ahmed Mahrous", student: "Rayan" } },
                { time: "4:45", court1: { coach: "Omar Zaki", student: "Mariam Ahmed" }, court2: { coach: "Ahmed Mahrous", student: "Tamem" } },
                { time: "5:30", court1: { coach: "Omar Zaki", student: "Icel mohamed" }, court2: { coach: "Ahmed Mahrous", student: "Youssef" } },
                { time: "6:15", court1: { coach: "Omar Zaki", student: "Zeina El Ghazawy" }, court2: { coach: "Ahmed Mahrous", student: "Younes" } },
                { time: "7:00", court1: { coach: "Omar Zaki", student: "Selim el khamiry" }, court2: { coach: "Ahmed Mahrous", student: "Adam merai" } },
                { time: "7:45", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "Ahmed Mahrous", student: "Farida amr" } },
                { time: "8:30", court1: { coach: "Omar Zaki", student: "" }, court2: { coach: "Ahmed Mahrous", student: "" } }
              ]} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component to display the schedule table
interface ScheduleSlot {
  coach: string;
  student: string;
}

interface ScheduleData {
  time: string;
  court1: ScheduleSlot;
  court2: ScheduleSlot;
}

function ScheduleTable({ day, data }: { day: string, data: ScheduleData[] }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Time</TableHead>
            <TableHead>Court 1</TableHead>
            <TableHead>Court 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((slot, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{slot.time}</TableCell>
              <TableCell>
                {slot.court1.coach && (
                  <div>
                    <span className="text-xs font-semibold text-blue-600">{slot.court1.coach}</span>
                    {slot.court1.student && (
                      <p className="text-sm mt-1">{slot.court1.student}</p>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {slot.court2.coach && (
                  <div>
                    <span className="text-xs font-semibold text-blue-600">{slot.court2.coach}</span>
                    {slot.court2.student && (
                      <p className="text-sm mt-1">{slot.court2.student}</p>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 