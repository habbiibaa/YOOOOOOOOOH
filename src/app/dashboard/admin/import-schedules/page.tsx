"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Upload, Download, Plus, Trash, Info, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function ImportSchedulesPage() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [activeDay, setActiveDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [formState, setFormState] = useState({
    status: null,
    message: "",
    showSuccess: false,
    showError: false
  });

  // Array of time slots from 7:00 to 22:00 in 30-minute increments
  const timeSlots = Array.from({ length: 31 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Default schedule data structure for each day
  const defaultSchedule = timeSlots.map(time => ({
    time,
    court1: { coachId: "", coachName: "" },
    court2: { coachId: "", coachName: "" }
  }));

  // Schedule state for each day
  const [schedules, setSchedules] = useState({
    Sunday: [...defaultSchedule],
    Monday: [...defaultSchedule],
    Tuesday: [...defaultSchedule],
    Wednesday: [...defaultSchedule],
    Thursday: [...defaultSchedule],
    Friday: [...defaultSchedule],
    Saturday: [...defaultSchedule]
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('branches').select('*');
      if (error) {
        console.error("Error fetching branches:", error);
        toast.error("Failed to load branches");
      } else {
        setBranches(data || []);
        if (data && data.length > 0) {
          setSelectedBranch(data[0].id);
        }
      }
    };

    const fetchCoaches = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'coach')
        .eq('approved', true);
      
      if (error) {
        console.error("Error fetching coaches:", error);
        toast.error("Failed to load coaches");
      } else {
        setCoaches(data || []);
      }
    };

    fetchBranches();
    fetchCoaches();
  }, []);

  const handleCoachChange = (day, timeIndex, court, coachId) => {
    const newSchedules = { ...schedules };
    const selectedCoach = coaches.find(coach => coach.id === coachId) || { id: "", full_name: "" };
    
    newSchedules[day][timeIndex][court] = {
      coachId: selectedCoach.id,
      coachName: selectedCoach.full_name
    };
    
    setSchedules(newSchedules);
  };

  const handleImportSchedules = async () => {
    if (!selectedBranch) {
      toast.error("Please select a branch first");
      return;
    }

    setLoading(true);
    setFormState({
      status: "processing",
      message: "Processing schedules...",
      showSuccess: false,
      showError: false
    });

    try {
      // Create formatted schedule objects for import
      const formattedSchedules = [];
      
      Object.entries(schedules).forEach(([day, slots]) => {
        slots.forEach((slot, index) => {
          // Only add if a coach is assigned
          if (slot.court1.coachId) {
            formattedSchedules.push({
              coach_id: slot.court1.coachId,
              branch_id: selectedBranch,
              day_of_week: day,
              start_time: slot.time,
              end_time: calculateEndTime(slot.time, 45), // 45 min session
              session_duration: 45,
              court: "Court 1"
            });
          }
          
          if (slot.court2.coachId) {
            formattedSchedules.push({
              coach_id: slot.court2.coachId,
              branch_id: selectedBranch,
              day_of_week: day,
              start_time: slot.time,
              end_time: calculateEndTime(slot.time, 45), // 45 min session
              session_duration: 45,
              court: "Court 2"
            });
          }
        });
      });
      
      // If no schedules to import
      if (formattedSchedules.length === 0) {
        setFormState({
          status: "error",
          message: "No schedules to import. Please assign coaches to time slots first.",
          showError: true,
          showSuccess: false
        });
        return;
      }
      
      const supabase = createClient();
      
      // Delete existing schedules for this branch first
      const { error: deleteError } = await supabase
        .from('coach_schedules')
        .delete()
        .eq('branch_id', selectedBranch);
      
      if (deleteError) {
        throw new Error(`Failed to clear existing schedules: ${deleteError.message}`);
      }
      
      // Insert new schedules
      const { data, error } = await supabase
        .from('coach_schedules')
        .insert(formattedSchedules)
        .select();
      
      if (error) {
        throw new Error(`Failed to import schedules: ${error.message}`);
      }
      
      // Success
      setFormState({
        status: "success",
        message: `Successfully imported ${data.length} schedule items.`,
        showSuccess: true,
        showError: false
      });
      
      toast.success(`Successfully imported ${data.length} schedule items`);
      
      // Trigger session generation
      const response = await fetch('/api/admin/generate-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branchId: selectedBranch }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.warning(`Schedules imported, but session generation had an issue: ${errorData.error}`);
      } else {
        const resultData = await response.json();
        toast.success(`${resultData.count || 0} sessions generated for the next 30 days`);
      }
      
    } catch (error) {
      console.error("Import error:", error);
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        showError: true,
        showSuccess: false
      });
      toast.error("Failed to import schedules");
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const clearSchedule = (day) => {
    const newSchedules = { ...schedules };
    newSchedules[day] = [...defaultSchedule];
    setSchedules(newSchedules);
    toast.info(`Cleared all assignments for ${day}`);
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Import Schedules</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Schedule Import Settings</CardTitle>
          <CardDescription>
            Select the branch and configure the schedule for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <Label htmlFor="branch">Branch</Label>
              <Select 
                value={selectedBranch}
                onValueChange={setSelectedBranch}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!selectedBranch && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md flex items-start">
                <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Please select a branch to continue</p>
              </div>
            )}
            
            {coaches.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md flex items-start">
                <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">No approved coaches found. Please approve coaches first.</p>
              </div>
            )}

            {formState.showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{formState.message}</p>
              </div>
            )}
            
            {formState.showError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{formState.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Schedule Configuration</CardTitle>
            <Button
              variant="default"
              disabled={loading || !selectedBranch || coaches.length === 0}
              onClick={handleImportSchedules}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white/60 border-t-white rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Schedules
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            Assign coaches to time slots for each day of the week
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearSchedule(activeDay)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Clear {activeDay}
              </Button>
            </div>
            
            {days.map(day => (
              <TabsContent key={day} value={day} className="mt-0">
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
                      {schedules[day].map((slot, index) => (
                        <TableRow key={`${day}-${slot.time}`}>
                          <TableCell className="font-medium">{slot.time}</TableCell>
                          <TableCell>
                            <Select
                              value={slot.court1.coachId}
                              onValueChange={(value) => handleCoachChange(day, index, 'court1', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Coach" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Coach</SelectItem>
                                {coaches.map(coach => (
                                  <SelectItem key={coach.id} value={coach.id}>
                                    {coach.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={slot.court2.coachId}
                              onValueChange={(value) => handleCoachChange(day, index, 'court2', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Coach" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Coach</SelectItem>
                                {coaches.map(coach => (
                                  <SelectItem key={coach.id} value={coach.id}>
                                    {coach.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <p>* This will replace all existing schedules for the selected branch</p>
            <p>* Sessions will be generated for the next 30 days based on these schedules</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 