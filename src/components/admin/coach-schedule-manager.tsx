"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Plus, Trash, Edit, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Coach = {
  id: string;
  name: string;
  specialization?: string;
  hourly_rate?: number;
  years_experience?: number;
  avatar_url?: string;
};

type Branch = {
  id: string;
  name: string;
  location: string;
};

type CoachSchedule = {
  id: string;
  coach_id: string;
  branch_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
};

type ScheduleFormData = {
  coach_id: string;
  branch_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
};

export default function CoachScheduleManager() {
  const supabase = createClient();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [schedules, setSchedules] = useState<CoachSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    coach_id: "",
    branch_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    session_duration: 45,
  });
  const [selectedCoach, setSelectedCoach] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");

  // Days of the week
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    checkDatabaseSchema();
  }, []);

  // Fetch coaches, branches, and schedules
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch coaches - first try from users table (more reliable)
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, role, email")
        .eq("role", "coach");
      
      if (usersError) {
        console.error("Error fetching coaches from users table:", usersError);
      } else if (usersData && usersData.length > 0) {
        console.log(`Found ${usersData.length} coaches in users table:`, usersData);
        const formattedCoaches = usersData.map(user => ({
          id: user.id,
          name: user.full_name || user.email || "Unknown Coach",
        }));
        setCoaches(formattedCoaches);
      } else {
        // Fallback to coaches table if no users found
        console.log("No coaches found in users table, trying coaches table...");
        const { data: coachesData, error: coachesError } = await supabase
          .from("coaches")
          .select(`
            id,
            name,
            users:users!coaches_id_fkey(id, full_name, avatar_url),
            specialization,
            hourly_rate,
            years_experience
          `);

        if (coachesError) {
          console.error("Error fetching coaches:", coachesError);
          throw coachesError;
        }

        if (coachesData && coachesData.length > 0) {
          console.log(`Found ${coachesData.length} coaches in coaches table:`, coachesData);
          const formattedCoaches = coachesData.map((coach) => ({
            id: coach.id || coach.users?.id || `coach-${Math.random().toString(36).substring(2, 9)}`, // Ensure ID exists
            name: coach.name || coach.users?.full_name || "Unknown Coach",
            specialization: coach.specialization,
            hourly_rate: coach.hourly_rate,
            years_experience: coach.years_experience,
            avatar_url: coach.users?.avatar_url,
          }));
          setCoaches(formattedCoaches);
        } else {
          console.warn("No coaches found in coaches table either!");
          // Create a dummy coach so the UI doesn't break
          setCoaches([
            { id: "missing-coach", name: "Add coaches first" }
          ]);
        }
      }

      // Fetch branches
      const { data: branchesData, error: branchesError } = await supabase
        .from("branches")
        .select("id, name, location");

      if (branchesError) {
        console.error("Error fetching branches:", branchesError);
        throw branchesError;
      }

      if (branchesData && branchesData.length > 0) {
        console.log(`Found ${branchesData.length} branches:`, branchesData);
        setBranches(branchesData);
      } else {
        console.warn("No branches found!");
        // Create a dummy branch so the UI doesn't break
        setBranches([
          { id: "missing-branch", name: "Add branches first", location: "N/A" }
        ]);
      }

      // Fetch schedules
      await fetchSchedules();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch coach schedules
  const fetchSchedules = async () => {
    try {
      console.log("Fetching schedules with filters:", {
        coach: selectedCoach,
        branch: selectedBranch,
        day: selectedDay
      });
      
      let query = supabase.from("coach_schedules").select("*");
      
      if (selectedCoach && selectedCoach !== "all") {
        query = query.eq("coach_id", selectedCoach);
      }
      
      if (selectedBranch && selectedBranch !== "all") {
        query = query.eq("branch_id", selectedBranch);
      }
      
      if (selectedDay && selectedDay !== "all") {
        query = query.eq("day_of_week", selectedDay);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} schedules:`, data);
      
      if (data) {
        setSchedules(data);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      // Set empty schedules on error to avoid UI breaking
      setSchedules([]);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }) => {
    const { name, value } = e instanceof Event 
      ? (e.target as HTMLInputElement)
      : e;
    
    console.log(`Field "${name}" changed to:`, value);
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log("Updated form data:", newData);
      return newData;
    });
  };

  // Reset form data
  const resetForm = () => {
    console.log("Resetting form data");
    setFormData({
      coach_id: "",
      branch_id: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      session_duration: 45,
    });
    setEditingScheduleId(null);
  };

  // Open add schedule dialog
  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  // Open edit schedule dialog
  const openEditDialog = (schedule: CoachSchedule) => {
    console.log("Opening edit dialog for schedule:", JSON.stringify(schedule, null, 2));
    
    // Ensure time formats are correct (HH:MM)
    const formatTimeValue = (timeStr: string) => {
      if (!timeStr) return "";
      console.log(`Formatting time value: "${timeStr}"`);
      
      // If time is already in HH:MM format, return as is
      if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log(`Normalized time "${timeStr}" to "${formattedTime}"`);
        return formattedTime;
      }
      
      try {
        // Handle different time formats
        let hours, minutes;
        if (timeStr.includes(':')) {
          [hours, minutes] = timeStr.split(':').map(Number);
        } else {
          hours = parseInt(timeStr);
          minutes = 0;
        }
        
        if (isNaN(hours) || isNaN(minutes)) {
          console.error(`Invalid time components in "${timeStr}"`);
          return "00:00";
        }
        
        // Ensure valid ranges
        hours = Math.min(Math.max(0, hours), 23);
        minutes = Math.min(Math.max(0, minutes), 59);
        
        // Pad with leading zeros
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log(`Formatted time from "${timeStr}" to "${formattedTime}"`);
        return formattedTime;
      } catch (err) {
        console.error(`Error formatting time "${timeStr}":`, err);
        return "00:00"; // Return default if parsing fails
      }
    };
    
    // Create a fresh object with properly formatted time values
    const updatedFormData = {
      coach_id: schedule.coach_id,
      branch_id: schedule.branch_id,
      day_of_week: schedule.day_of_week,
      start_time: formatTimeValue(schedule.start_time),
      end_time: formatTimeValue(schedule.end_time),
      session_duration: schedule.session_duration,
    };
    
    console.log("Setting form data for editing:", updatedFormData);
    setFormData(updatedFormData);
    
    setEditingScheduleId(schedule.id);
    setShowAddDialog(true);
  };

  // Save schedule (create or update)
  const saveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving schedule with form data:", JSON.stringify(formData, null, 2));
    console.log("Editing schedule ID:", editingScheduleId);
    
    try {
      setSaving(true);
      // Validate form data
      if (!formData.coach_id || !formData.branch_id || !formData.day_of_week) {
        console.error("Missing required fields");
        alert("Please select a coach, branch, and day of week");
        return;
      }
      
      if (!formData.start_time || !formData.end_time) {
        console.error("Missing time fields");
        alert("Please set both start and end times");
        return;
      }
      
      // Log before time validation
      console.log(`Validating times - start: "${formData.start_time}", end: "${formData.end_time}"`);
      
      // Normalize time format to HH:MM
      const normalizeTime = (timeStr: string): string => {
        try {
          // Handle HTML time input which should already be in correct format
          if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
          
          // Fallback for other formats
          let hours = 0, minutes = 0;
          
          if (timeStr.includes(':')) {
            const parts = timeStr.split(':');
            hours = parseInt(parts[0]);
            minutes = parseInt(parts[1]);
          } else {
            hours = parseInt(timeStr);
          }
          
          // Validate
          if (isNaN(hours) || hours < 0 || hours > 23) {
            throw new Error(`Invalid hours: ${hours}`);
          }
          if (isNaN(minutes) || minutes < 0 || minutes > 59) {
            throw new Error(`Invalid minutes: ${minutes}`);
          }
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (err) {
          console.error(`Error normalizing time "${timeStr}":`, err);
          throw new Error(`Invalid time format: ${timeStr}. Please use 24-hour format (HH:MM).`);
        }
      };
      
      // Format times
      let startTime, endTime;
      try {
        startTime = normalizeTime(formData.start_time);
        endTime = normalizeTime(formData.end_time);
        console.log(`Normalized times: start=${startTime}, end=${endTime}`);
      } catch (timeError) {
        alert(timeError.message);
        return;
      }
      
      // Ensure start time is before end time
      const startMinutes = convertTimeToMinutes(startTime);
      const endMinutes = convertTimeToMinutes(endTime);
      
      console.log(`Start time: ${startTime} (${startMinutes} minutes), End time: ${endTime} (${endMinutes} minutes)`);
      
      if (startMinutes >= endMinutes) {
        console.error("Start time must be earlier than end time");
        alert("Start time must be earlier than end time");
        return;
      }
      
      // Ensure session duration is reasonable
      if (formData.session_duration < 15 || formData.session_duration > 120) {
        console.error("Invalid session duration:", formData.session_duration);
        alert("Session duration must be between 15 and 120 minutes");
        return;
      }
      
      // Prepare the data to save
      const scheduleData = {
        coach_id: formData.coach_id,
        branch_id: formData.branch_id, 
        day_of_week: formData.day_of_week,
        start_time: startTime,
        end_time: endTime,
        session_duration: formData.session_duration
      };
      
      console.log("Final schedule data to save:", JSON.stringify(scheduleData, null, 2));
      
      if (editingScheduleId) {
        // Update existing schedule
        console.log(`Updating schedule with ID: ${editingScheduleId}`);
        
        try {
          // Use the API endpoint for better server-side validation and handling
          const response = await fetch('/api/admin/update-schedule', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scheduleId: editingScheduleId,
              scheduleData: scheduleData
            }),
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update schedule');
          }
          
          console.log("Schedule updated successfully");
          alert("Schedule updated successfully");
          
          // Update the local state immediately to reflect changes
          setSchedules(prevSchedules => 
            prevSchedules.map(schedule => 
              schedule.id === editingScheduleId 
                ? {
                    ...schedule,
                    ...scheduleData
                  }
                : schedule
            )
          );
          
          // Reset form and close dialog
          resetForm();
          setShowAddDialog(false);
          
          // Force refresh of schedules to get latest data
          await fetchSchedules();
        } catch (updateError) {
          console.error("Error during update process:", updateError);
          alert(`Failed to update schedule: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
        }
      } else {
        // Create new schedule with unique ID
        const newId = uuidv4();
        console.log(`Creating new schedule with generated ID: ${newId}`);
        
        const { data, error } = await supabase
          .from("coach_schedules")
          .insert([{ id: newId, ...scheduleData }])
          .select();
          
        if (error) {
          console.error("Error creating schedule:", error);
          throw error;
        }
        
        console.log("Schedule created successfully, response:", data);
        alert("Schedule added successfully");
      }
      
      // Refresh schedules
      console.log("Refreshing schedules list");
      await fetchSchedules();
      
      // Reset form and close dialog
      resetForm();
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert(`Failed to save schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete schedule
  const deleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("coach_schedules")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      alert("Schedule deleted successfully");
      
      // Refresh schedules
      await fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Failed to delete schedule. Please try again.");
    }
  };

  // Generate sessions from schedule
  const generateSessions = async (schedule: CoachSchedule) => {
    try {
      // First, confirm with the user
      if (!confirm("This will generate sessions for the next 30 days based on this schedule. Continue?")) {
        return;
      }
      
      setLoading(true);
      
      // Get coach and branch info
      const coach = coaches.find(c => c.id === schedule.coach_id);
      const branch = branches.find(b => b.id === schedule.branch_id);
      
      if (!coach || !branch) {
        alert("Coach or branch information not found");
        return;
      }
      
      // Get current date and next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      // Generate dates for the specified day of week in the next 30 days
      const dates: Date[] = [];
      const current = new Date(startDate);
      const dayIndex = days.indexOf(schedule.day_of_week);
      
      // Move to the next occurrence of the day
      current.setDate(current.getDate() + (dayIndex + 7 - current.getDay()) % 7);
      
      // Generate all dates until end date
      while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }
      
      // Convert time strings to minutes for calculations
      const startMinutes = convertTimeToMinutes(schedule.start_time);
      const endMinutes = convertTimeToMinutes(schedule.end_time);
      const duration = schedule.session_duration;
      
      // Generate session time slots
      const sessions = [];
      
      for (const date of dates) {
        let currentMinutes = startMinutes;
        
        while (currentMinutes + duration <= endMinutes) {
          const sessionDate = date.toISOString().split('T')[0];
          const startTime = convertMinutesToTime(currentMinutes);
          const endTime = convertMinutesToTime(currentMinutes + duration);
          
          sessions.push({
            coach_id: schedule.coach_id,
            branch_id: schedule.branch_id,
            session_date: sessionDate,
            start_time: startTime,
            end_time: endTime,
            status: "available",
          });
          
          currentMinutes += duration;
        }
      }
      
      // Insert sessions into database
      if (sessions.length > 0) {
        const { error } = await supabase
          .from("coach_sessions")
          .insert(sessions);
          
        if (error) throw error;
        
        alert(`Created ${sessions.length} sessions for ${coach.name} at ${branch.name}`);
      } else {
        alert("No sessions could be generated for the selected time range");
      }
    } catch (error) {
      console.error("Error generating sessions:", error);
      alert("Failed to generate sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to convert time string (HH:MM) to minutes
  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Helper function to convert minutes to time string (HH:MM)
  const convertMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Get coach name by ID
  const getCoachName = (id: string) => {
    return coaches.find(c => c.id === id)?.name || "Unknown Coach";
  };
  
  // Get branch name by ID
  const getBranchName = (id: string) => {
    return branches.find(b => b.id === id)?.name || "Unknown Branch";
  };

  // Add a new function to initialize schedules
  const initializeSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/initialize-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize schedules');
      }

      alert(`Successfully initialized schedules:
- ${result.coaches?.length || 0} coaches
- ${result.schedules?.length || 0} schedules created
    
Refreshing data...`);
      
      // Refresh data to show the new coaches and schedules
      await fetchData();
    } catch (error) {
      console.error('Error initializing schedules:', error);
      alert(`Error initializing schedules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add this function right after fetchSchedules
  const checkDatabaseSchema = async () => {
    try {
      console.log("Checking database schema for coach_schedules table...");
      
      // Try to fetch a single record to inspect structure
      const { data, error } = await supabase
        .from("coach_schedules")
        .select("*")
        .limit(1);
        
      if (error) {
        console.error("Error fetching schema:", error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Sample record structure:", data[0]);
        
        // Specifically check id field
        console.log("ID field type:", typeof data[0].id);
        console.log("ID value:", data[0].id);
        
        // Check time fields
        console.log("start_time type:", typeof data[0].start_time);
        console.log("end_time type:", typeof data[0].end_time);
      } else {
        console.log("No records found to inspect schema");
      }
      
      // Also check current user role for debugging
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting current user:", userError);
        alert("Could not verify user permissions. Please try logging out and back in.");
        return;
      }
      
      if (userData && userData.user) {
        console.log("Current user ID:", userData.user.id);
        
        // Get role from users table
        const { data: roleData, error: roleError } = await supabase
          .from("users")
          .select("role, approved")
          .eq("id", userData.user.id)
          .single();
          
        if (roleError) {
          console.error("Error getting user role:", roleError);
          alert("Could not verify user role. Please contact support.");
        } else if (roleData) {
          console.log("User role:", roleData.role);
          console.log("User approved:", roleData.approved);
          
          if (roleData.role !== "admin") {
            alert("You need admin privileges to edit the database. Current role: " + roleData.role);
          }
          
          if (roleData.approved !== true) {
            alert("Your account is not approved. Please contact an administrator.");
          }
        }
      }
    } catch (error) {
      console.error("Error checking schema:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Coach Schedule Management</h2>
          <p className="text-gray-400">Manage coach schedules and generate training sessions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={initializeSchedules} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            Initialize Schedules
          </Button>
          <Button 
            onClick={checkDatabaseSchema} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={loading}
          >
            Check Permissions
          </Button>
          <Button 
            onClick={openAddDialog} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Schedule
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
          <CardDescription className="text-gray-400">Filter schedules by coach, branch, or day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filter-coach" className="text-white mb-2 block">
                Coach
              </Label>
              <Select
                value={selectedCoach}
                onValueChange={(value) => setSelectedCoach(value)}
              >
                <SelectTrigger
                  id="filter-coach"
                  className="bg-gray-800 border-gray-700 text-white"
                >
                  <SelectValue placeholder="All Coaches" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Coaches</SelectItem>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-branch" className="text-white mb-2 block">
                Branch
              </Label>
              <Select
                value={selectedBranch}
                onValueChange={(value) => setSelectedBranch(value)}
              >
                <SelectTrigger
                  id="filter-branch"
                  className="bg-gray-800 border-gray-700 text-white"
                >
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-day" className="text-white mb-2 block">
                Day
              </Label>
              <Select
                value={selectedDay}
                onValueChange={(value) => setSelectedDay(value)}
              >
                <SelectTrigger
                  id="filter-day"
                  className="bg-gray-800 border-gray-700 text-white"
                >
                  <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Days</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={fetchSchedules} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Apply Filters
          </Button>
        </CardFooter>
      </Card>
      
      {/* Schedules List */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Coach Schedules</CardTitle>
          <CardDescription className="text-gray-400">
            {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : schedules.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Coach</TableHead>
                    <TableHead className="text-gray-300">Branch</TableHead>
                    <TableHead className="text-gray-300">Day</TableHead>
                    <TableHead className="text-gray-300">Time</TableHead>
                    <TableHead className="text-gray-300">Session Duration</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id} className="border-gray-800">
                      <TableCell className="text-white font-medium">
                        {getCoachName(schedule.coach_id)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {getBranchName(schedule.branch_id)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {schedule.day_of_week}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {schedule.start_time} - {schedule.end_time}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {schedule.session_duration} min
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-500 border-green-500 hover:bg-green-950"
                            onClick={() => generateSessions(schedule)}
                          >
                            <Calendar className="h-4 w-4 mr-1" /> Generate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-500 border-blue-500 hover:bg-blue-950"
                            onClick={() => openEditDialog(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-500 hover:bg-red-950"
                            onClick={() => deleteSchedule(schedule.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Schedules Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                No coach schedules match your current filters. Try adjusting your filters or add a new schedule.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Schedule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingScheduleId ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingScheduleId 
                ? "Update the coach schedule details" 
                : "Create a new recurring schedule for a coach"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={saveSchedule}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="coach_id" className="text-white mb-2 block">
                    Coach
                  </Label>
                  <Select
                    value={formData.coach_id}
                    onValueChange={(value) => handleChange({ name: "coach_id", value })}
                  >
                    <SelectTrigger
                      id="coach_id"
                      className="bg-gray-800 border-gray-700 text-white"
                    >
                      <SelectValue placeholder="Select a coach" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {coaches.length > 0 ? (
                        coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-coaches">No coaches available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {coaches.length === 0 && (
                    <p className="text-red-400 text-xs mt-1">No coaches found. Please create coaches first.</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="branch_id" className="text-white mb-2 block">
                    Branch
                  </Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) => handleChange({ name: "branch_id", value })}
                  >
                    <SelectTrigger
                      id="branch_id"
                      className="bg-gray-800 border-gray-700 text-white"
                    >
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {branches.length > 0 ? (
                        branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-branches">No branches available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {branches.length === 0 && (
                    <p className="text-red-400 text-xs mt-1">No branches found. Please create branches first.</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="day_of_week" className="text-white mb-2 block">
                    Day of Week
                  </Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) => handleChange({ name: "day_of_week", value })}
                  >
                    <SelectTrigger
                      id="day_of_week"
                      className="bg-gray-800 border-gray-700 text-white"
                    >
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <Label htmlFor="start_time" className="text-white mb-2 block">
                      Start Time
                    </Label>
                    <Input
                      type="time"
                      id="start_time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="HH:MM (e.g. 09:00)"
                    />
                    <p className="text-gray-400 text-xs mt-1">24-hour format (e.g. 14:30 for 2:30 PM)</p>
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="end_time" className="text-white mb-2 block">
                      End Time
                    </Label>
                    <Input
                      type="time"
                      id="end_time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="HH:MM (e.g. 17:00)"
                    />
                    <p className="text-gray-400 text-xs mt-1">24-hour format (e.g. 17:00 for 5:00 PM)</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="session_duration" className="text-white mb-2 block">
                    Session Duration (minutes)
                  </Label>
                  <Input
                    id="session_duration"
                    type="number"
                    min="15"
                    step="15"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={formData.session_duration}
                    onChange={(e) => handleChange({ 
                      name: "session_duration", 
                      value: e.target.value 
                    })}
                    name="session_duration"
                    required
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setShowAddDialog(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {editingScheduleId ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingScheduleId ? "Update Schedule" : "Add Schedule"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 