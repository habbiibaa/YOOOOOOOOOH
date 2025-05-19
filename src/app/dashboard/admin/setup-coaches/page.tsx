"use client";

import { useState } from "react";
import { setupCoachSchedules } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// Define coach schedule data structure
type CoachSchedule = {
  name: string;
  schedules: {
    day: string;
    startTime: string;
    endTime: string;
    color?: string;
    court?: string;
    note?: string;
  }[];
};

export default function SetupCoachesPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("royal-british");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Format the date range for display
  const formatDateRange = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startDay = startOfWeek.getDate();
    const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
    const endDay = endOfWeek.getDate();
    const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
    const year = startOfWeek.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth} ${year}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
  };
  
  // Handle week navigation
  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };
  
  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };
  
  const resetToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };
  
  // Define branches
  const branches = [
    { id: "royal-british", name: "Royal British School", location: "New Cairo" },
    { id: "sodic", name: "Sodic East Town", location: "New Cairo", membersOnly: true },
    { id: "golf-city", name: "Golf City Club", location: "EL Oubor" },
    { id: "club-one", name: "Club One", location: "El Maadi" }
  ];

  // Define the coaches and their schedules
  const coaches: CoachSchedule[] = [
    {
      name: "Ahmed Fakhry",
      schedules: [
        { day: "Sunday", startTime: "16:30", endTime: "21:45", court: "Court 1" },
        { day: "Tuesday", startTime: "16:30", endTime: "21:45", court: "Court 1" },
      ]
    },
    {
      name: "Ahmed Mahrous",
      schedules: [
        { day: "Saturday", startTime: "10:00", endTime: "21:30", court: "Court 2" },
        { day: "Tuesday", startTime: "16:30", endTime: "21:45", court: "Court 2" },
      ]
    },
    {
      name: "Ahmed Magdy",
      schedules: [
        { day: "Monday", startTime: "16:30", endTime: "21:45", court: "Court 1" },
      ]
    },
    {
      name: "Alaa Taha",
      schedules: [
        { day: "Monday", startTime: "16:30", endTime: "21:45", court: "Court 1 (C.Alaa Taha)" },
      ]
    },
    {
      name: "Ahmed Maher",
      schedules: [
        { day: "Sunday", startTime: "16:30", endTime: "21:45", court: "Court 2" },
        { day: "Wednesday", startTime: "15:30", endTime: "21:30", court: "Court 2" },
      ]
    },
    {
      name: "Omar Zaki",
      schedules: [
        { day: "Thursday", startTime: "15:30", endTime: "21:30", court: "Court 1" },
        { day: "Friday", startTime: "13:30", endTime: "16:30", court: "Court 1" },
        { day: "Saturday", startTime: "10:00", endTime: "21:30", court: "Court 1" },
      ]
    },
    {
      name: "Abdelrahman Dahy",
      schedules: [
        { day: "Wednesday", startTime: "15:30", endTime: "21:30", court: "Court 1" },
      ]
    },
    {
      name: "C. Abdullah",
      schedules: [
        { day: "Sunday", startTime: "16:30", endTime: "21:45", court: "Court 2", note: "not coming 27/04" },
      ]
    }
  ];

  // Define the days of the week and time slots
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Get time slots based on day
  const getTimeSlots = (day: string) => {
    if (day === "Saturday") {
      return [
        "10:00", "10:45", "11:30", "12:15", "13:00", "13:45", "14:30", 
        "15:15", "16:00", "16:45", "17:30", "18:15", "19:00", "19:45", "20:30", "21:15"
      ];
    } else if (day === "Friday") {
      return ["13:30", "14:15", "15:00", "15:45", "16:30"];
    } else {
      return ["3:30", "4:30", "5:15", "6:00", "6:45", "7:30", "8:15", "9:00", "9:45"];
    }
  };

  // Helper function to get coach for a specific day and time
  const getCoachForSlot = (day: string, time: string) => {
    const results: { coach: string; court: string; note?: string }[] = [];
    
    coaches.forEach(coach => {
      coach.schedules.forEach(schedule => {
        if (schedule.day === day) {
          const startHour = parseInt(schedule.startTime.split(":")[0]);
          const startMinute = parseInt(schedule.startTime.split(":")[1]);
          const endHour = parseInt(schedule.endTime.split(":")[0]);
          const endMinute = parseInt(schedule.endTime.split(":")[1]);
          
          const timeHour = parseInt(time.split(":")[0]);
          const timeMinute = parseInt(time.split(":")[1] || "0");
          
          // Convert to minutes for easier comparison
          const slotTimeInMinutes = timeHour * 60 + timeMinute;
          const startTimeInMinutes = startHour * 60 + startMinute;
          const endTimeInMinutes = endHour * 60 + endMinute;
          
          // Check if time slot is within coach's schedule
          if (slotTimeInMinutes >= startTimeInMinutes && slotTimeInMinutes < endTimeInMinutes) {
            results.push({ 
              coach: coach.name, 
              court: schedule.court || "",
              note: schedule.note
            });
          }
        }
      });
    });
    
    return results;
  };

  // Helper function to get students for specific slots
  const getStudentForSlot = (day: string, time: string, court: string) => {
    const studentMap: Record<string, { name: string; type: string; note?: string }> = {
      // Sunday appointments
      "Sunday_3:30_Court 2": { name: "ECA", type: "" },
      "Sunday_4:30_Court 1": { name: "Rayan", type: "individual" },
      "Sunday_4:30_Court 2": { name: "Tamem", type: "individual" },
      "Sunday_5:15_Court 1": { name: "Mayada Emad", type: "individual" },
      "Sunday_5:15_Court 2": { name: "Omar sherif", type: "individual" },
      "Sunday_6:00_Court 1": { name: "Dalida", type: "individual" },
      "Sunday_6:00_Court 2": { name: "Mohamed reda el basuiny", type: "individual" },
      "Sunday_6:45_Court 1": { name: "Lara omar", type: "individual" },
      "Sunday_6:45_Court 2": { name: "elissa mark", type: "individual" },
      "Sunday_7:30_Court 1": { name: "aly ahmed", type: "individual" },
      "Sunday_7:30_Court 2": { name: "Cady mohamed", type: "individual" },
      "Sunday_8:15_Court 1": { name: "Aly mostafa", type: "individual" },
      "Sunday_8:15_Court 2": { name: "youssef Adham", type: "individual" },
      
      // Monday appointments
      "Monday_3:30_Court 1": { name: "ECA", type: "" },
      "Monday_3:30_Court 2": { name: "ECA", type: "" },
      "Monday_4:30_Court 1": { name: "Layla Mohamed Sadek", type: "individual" },
      "Monday_4:30_Court 2": { name: "Selim el khamiry", type: "individual", note: "Not Confirmed" },
      "Monday_5:15_Court 1": { name: "Talia mohamed", type: "individual" },
      "Monday_5:15_Court 2": { name: "Camellia Gheriany", type: "individual" },
      "Monday_6:00_Court 1": { name: "Carla mahmoud", type: "individual" },
      "Monday_6:00_Court 2": { name: "Mariam ahmed", type: "individual" },
      "Monday_6:45_Court 1": { name: "Aly mostafa", type: "individual" },
      "Monday_6:45_Court 2": { name: "layan", type: "individual" },
      "Monday_7:30_Court 1": { name: "Omar sherif salem", type: "individual" },
      "Monday_7:30_Court 2": { name: "Yasin Mohamed Mamdouh", type: "individual", note: "from 28/04" },
      "Monday_8:15_Court 1": { name: "Marwa fahmy", type: "individual" },
      "Monday_8:15_Court 2": { name: "Adam merai", type: "individual" },
      "Monday_9:00_Court 1": { name: "Hamza", type: "individual" },
      "Monday_9:00_Court 2": { name: "Malek Ahmed Tarek", type: "individual", note: "from 01/05" },
      
      // Tuesday appointments
      "Tuesday_4:30_Court 1": { name: "Karim", type: "individual" },
      "Tuesday_4:30_Court 2": { name: "Hassan", type: "individual" },
      "Tuesday_5:15_Court 1": { name: "Amina", type: "individual" },
      "Tuesday_5:15_Court 2": { name: "Kareem", type: "individual" },
      "Tuesday_6:00_Court 1": { name: "Youssef", type: "individual" },
      "Tuesday_6:00_Court 2": { name: "Mahmoud", type: "individual" },
      "Tuesday_6:45_Court 1": { name: "Farida", type: "individual" },
      "Tuesday_6:45_Court 2": { name: "Salma", type: "individual" },
      "Tuesday_7:30_Court 1": { name: "Ahmed", type: "individual" },
      "Tuesday_7:30_Court 2": { name: "Omar", type: "individual" },
      
      // Wednesday appointments 
      "Wednesday_3:30_Court 1": { name: "Tarek", type: "individual" },
      "Wednesday_3:30_Court 2": { name: "Malak", type: "individual" },
      "Wednesday_4:30_Court 1": { name: "Ali", type: "individual" },
      "Wednesday_4:30_Court 2": { name: "Sarah", type: "individual" },
      "Wednesday_5:15_Court 1": { name: "Mohamed", type: "individual" },
      "Wednesday_5:15_Court 2": { name: "Jana", type: "individual" },
      
      // Thursday appointments
      "Thursday_3:30_Court 1": { name: "Nour", type: "individual" },
      "Thursday_4:30_Court 1": { name: "Hana", type: "individual" },
      "Thursday_5:15_Court 1": { name: "Yousef", type: "individual" },
      
      // Friday appointments
      "Friday_1:30_Court 1": { name: "Adam", type: "individual" },
      "Friday_2:15_Court 1": { name: "Fatma", type: "individual" },
      "Friday_3:00_Court 1": { name: "Ziad", type: "individual" },
      "Friday_3:45_Court 1": { name: "Laila", type: "individual" },
      
      // Saturday appointments
      "Saturday_10:00_Court 1": { name: "Tarek", type: "individual" },
      "Saturday_10:00_Court 2": { name: "Nada", type: "individual" },
      "Saturday_10:45_Court 1": { name: "Ibrahim", type: "individual" },
      "Saturday_10:45_Court 2": { name: "Mariam", type: "individual" },
      "Saturday_11:30_Court 1": { name: "Ahmed", type: "individual" },
      "Saturday_11:30_Court 2": { name: "Dina", type: "individual" }
    };

    const key = `${day}_${time}_${court}`;
    return studentMap[key] || { name: "", type: "" };
  };

  // Modified getCellColor to reflect the coloring in the image
  const getCellColor = (day: string, time: string, court: string) => {
    // Get coach for this slot
    const coachSlots = getCoachForSlot(day, time);
    let coachForCourt = "";
    
    coachSlots.forEach(slot => {
      if (slot.court.includes(court)) {
        coachForCourt = slot.coach;
      }
    });
    
    // Get student for this slot
    const student = getStudentForSlot(day, time, court);
    
    // Special case for ECA
    if (student.name === "ECA") {
      return "bg-amber-100";
    }
    
    // For Sunday
    if (day === "Sunday") {
      if (time === "4:30") return "bg-green-100";
      if (time === "5:15" || time === "6:00" || time === "6:45" || 
          time === "7:30" || time === "8:15" || time === "9:00") {
        return "bg-blue-100";
      }
    }
    
    // For Monday
    if (day === "Monday") {
      if (time === "3:30") return "bg-amber-100";
      if (time === "4:30" || time === "5:15" || time === "6:00" || 
          time === "6:45") {
        return "bg-blue-100";
      }
      if (time === "7:30") return "bg-green-100";
      if (time === "8:15") return "bg-rose-100";
      if (time === "9:00") return "bg-green-100";
    }
    
    // Default colors based on coach
    const coachColorMap: Record<string, string> = {
      "Ahmed Fakhry": "bg-green-100",
      "Ahmed Mahrous": "bg-blue-100",
      "Ahmed Magdy": "bg-blue-100",
      "Alaa Taha": "bg-blue-100",
      "Ahmed Maher": "bg-green-100",
      "Omar Zaki": "bg-yellow-100",
      "Abdelrahman Dahy": "bg-indigo-100",
      "C. Abdullah": "bg-rose-100"
    };
    
    return coachColorMap[coachForCourt] || "";
  };

  const runSetup = async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      const setupResult = await setupCoachSchedules();
      setResult(setupResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Coach Schedule Management</h1>
      
      <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Select Branch</h2>
        <div className="flex flex-wrap gap-3">
          {branches.map(branch => (
            <button
              key={branch.id}
              onClick={() => setSelectedBranch(branch.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all 
                ${selectedBranch === branch.id ? 
                  'bg-red-600 text-white shadow-md' : 
                  'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {branch.name}
              {branch.membersOnly && <span className="ml-1 text-xs">(Members Only)</span>}
              <span className="ml-1 block text-xs opacity-70">{branch.location}</span>
            </button>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue="schedule" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
          <TabsTrigger value="setup">Setup Tool</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Weekly Schedule</h2>
            <div className="text-sm bg-amber-100 px-3 py-1 rounded-full text-amber-800">
              All coaches & slots at Royal British School branch
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
            <button 
              onClick={previousWeek}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{formatDateRange()}</span>
              <button
                onClick={resetToCurrentWeek}
                className="text-xs text-red-600 hover:underline ml-2"
              >
                Today
              </button>
            </div>
            
            <button 
              onClick={nextWeek}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <p className="mb-6 text-gray-600">
            The schedule shows all coaching sessions. Each cell represents a 45-minute session.
          </p>
          
          <div className="overflow-x-auto">
            {days.map(day => (
              <div key={day} className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center bg-red-600 text-white py-2 rounded-t-lg">{day}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 w-24">Time</th>
                        <th className="border border-gray-300 px-4 py-2 w-1/2">Court 1</th>
                        <th className="border border-gray-300 px-4 py-2 w-1/2">Court 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTimeSlots(day).map(time => {
                        const coachSlots = getCoachForSlot(day, time);
                        
                        let court1Content = { coach: "", note: "" };
                        let court2Content = { coach: "", note: "" };
                        
                        coachSlots.forEach(slot => {
                          if (slot.court.includes("Court 1")) {
                            court1Content = { 
                              coach: slot.coach,
                              note: slot.note || ""
                            };
                          } else if (slot.court.includes("Court 2")) {
                            court2Content = { 
                              coach: slot.coach,
                              note: slot.note || ""
                            };
                          }
                        });
                        
                        // Check for ECA (special case)
                        if (time === "3:30" && (day === "Sunday" || day === "Monday")) {
                          if (day === "Sunday") {
                            court1Content = { coach: "", note: "" };
                            court2Content = { coach: "ECA", note: "" };
                          } else if (day === "Monday") {
                            court1Content = { coach: "ECA", note: "" };
                            court2Content = { coach: "ECA", note: "" };
                          }
                        }
                        
                        return (
                          <tr key={time}>
                            <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">{time}</td>
                            <td className={`border border-gray-300 px-4 py-2 ${getCellColor(day, time, "Court 1")}`}>
                              {court1Content.coach ? (
                                <div>
                                  <div className="text-xs text-gray-600">Court 1 ({court1Content.coach})</div>
                                  {getStudentForSlot(day, time, "Court 1").name && (
                                    <div className="font-medium">
                                      {getStudentForSlot(day, time, "Court 1").name}
                                      {getStudentForSlot(day, time, "Court 1").type && (
                                        <span className="text-sm text-gray-600 ml-1">
                                          ({getStudentForSlot(day, time, "Court 1").type})
                                        </span>
                                      )}
                                      {getStudentForSlot(day, time, "Court 1").note && (
                                        <span className="text-xs text-red-500 ml-1">
                                          {getStudentForSlot(day, time, "Court 1").note}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {court1Content.note && <span className="text-red-500 ml-2 text-sm">{court1Content.note}</span>}
                                </div>
                              ) : (
                                getStudentForSlot(day, time, "Court 1").name && (
                                  <div>
                                    <div className="font-medium">
                                      {getStudentForSlot(day, time, "Court 1").name}
                                      {getStudentForSlot(day, time, "Court 1").type && (
                                        <span className="text-sm text-gray-600 ml-1">
                                          ({getStudentForSlot(day, time, "Court 1").type})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </td>
                            <td className={`border border-gray-300 px-4 py-2 ${getCellColor(day, time, "Court 2")}`}>
                              {court2Content.coach ? (
                                <div>
                                  <div className="text-xs text-gray-600">Court 2 ({court2Content.coach})</div>
                                  {getStudentForSlot(day, time, "Court 2").name && (
                                    <div className="font-medium">
                                      {getStudentForSlot(day, time, "Court 2").name}
                                      {getStudentForSlot(day, time, "Court 2").type && (
                                        <span className="text-sm text-gray-600 ml-1">
                                          ({getStudentForSlot(day, time, "Court 2").type})
                                        </span>
                                      )}
                                      {getStudentForSlot(day, time, "Court 2").note && (
                                        <span className="text-xs text-red-500 ml-1">
                                          {getStudentForSlot(day, time, "Court 2").note}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {court2Content.note && <span className="text-red-500 ml-2 text-sm">{court2Content.note}</span>}
                                </div>
                              ) : (
                                getStudentForSlot(day, time, "Court 2").name && (
                                  <div>
                                    <div className="font-medium">
                                      {getStudentForSlot(day, time, "Court 2").name}
                                      {getStudentForSlot(day, time, "Court 2").type && (
                                        <span className="text-sm text-gray-600 ml-1">
                                          ({getStudentForSlot(day, time, "Court 2").type})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="setup" className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-white">Setup Tool</h2>
          <p className="mb-4 text-gray-300">
            This tool will set up the coaches and their schedules for the Royal British School branch. 
            It will create the following coaches with their specific schedules:
          </p>
          
          <div className="space-y-4 mb-6">
            {coaches.map((coach, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2 text-white">{coach.name}</h3>
                <div className="text-sm text-gray-400">
                  {coach.schedules.map((schedule, idx) => (
                    <p key={idx}>
                      {schedule.day}: {schedule.startTime} - {schedule.endTime} (45 min sessions)
                      {schedule.note && <span className="text-red-400 ml-2">{schedule.note}</span>}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-900/20 border border-amber-800 text-amber-200 p-4 rounded-md mb-6">
            <h3 className="font-medium mb-2">Warning</h3>
            <p>
              This action will add new users to the database and generate session slots. 
              Running it multiple times may result in duplicate data. Use with caution.
            </p>
          </div>
          
          <Button 
            onClick={runSetup} 
            disabled={isRunning}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isRunning ? "Setting Up..." : "Setup Coaches and Generate Sessions"}
          </Button>
        </TabsContent>
      </Tabs>
      
      {result && (
        <div className={`p-6 rounded-xl ${result.success ? 'bg-green-900/20 border border-green-800 text-green-200' : 'bg-red-900/20 border border-red-800 text-red-200'}`}>
          <h3 className="text-xl font-semibold mb-2">
            {result.success ? 'Setup Complete!' : 'Setup Failed'}
          </h3>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
} 