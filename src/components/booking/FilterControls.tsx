"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Calendar } from "lucide-react";

interface Branch {
  id: string;
  name: string;
}

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
}

interface FilterControlsProps {
  branches: Branch[];
  coaches: Coach[];
  currentBranch?: string;
  currentCoach?: string;
  currentLevel?: string;
  currentDate?: string;
}

export default function FilterControls({
  branches,
  coaches,
  currentBranch,
  currentCoach,
  currentLevel,
  currentDate,
}: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [branch, setBranch] = useState(currentBranch || "");
  const [coach, setCoach] = useState(currentCoach || "");
  const [level, setLevel] = useState(currentLevel || "");
  const [date, setDate] = useState(currentDate || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  useEffect(() => {
    setBranch(currentBranch || "");
    setCoach(currentCoach || "");
    setLevel(currentLevel || "");
    setDate(currentDate || "");
  }, [currentBranch, currentCoach, currentLevel, currentDate]);
  
  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    if (branch) params.set("branch", branch);
    if (coach) params.set("coach", coach);
    if (level) params.set("level", level);
    if (date) params.set("date", date);
    
    router.push(`${pathname}?${params.toString()}`);
    setIsFilterOpen(false);
  };
  
  const handleClearFilters = () => {
    setBranch("");
    setCoach("");
    setLevel("");
    setDate("");
    router.push(pathname);
    setIsFilterOpen(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter Sessions
        </Button>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="date-quick" className="sr-only">Date</Label>
          <Input
            id="date-quick"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              const params = new URLSearchParams();
              if (currentBranch) params.set("branch", currentBranch);
              if (currentCoach) params.set("coach", currentCoach);
              if (currentLevel) params.set("level", currentLevel);
              params.set("date", e.target.value);
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="w-auto"
          />
          <Button 
            variant="ghost" 
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              setDate(today);
              const params = new URLSearchParams();
              if (currentBranch) params.set("branch", currentBranch);
              if (currentCoach) params.set("coach", currentCoach);
              if (currentLevel) params.set("level", currentLevel);
              params.set("date", today);
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Today
          </Button>
        </div>
      </div>
      
      {isFilterOpen && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coach">Coach</Label>
                <Select value={coach} onValueChange={setCoach}>
                  <SelectTrigger id="coach">
                    <SelectValue placeholder="All coaches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All coaches</SelectItem>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.first_name} {coach.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 