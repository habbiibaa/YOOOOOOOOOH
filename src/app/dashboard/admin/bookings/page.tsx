"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, MapPin, Filter, Search, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type Booking = {
  id: string;
  player_id: string;
  coach_id: string;
  branch_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  player_name: string;
  coach_name: string;
  branch_name: string;
  created_at?: string;
};

export default function AdminBookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = [...bookings];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter === "today") {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((booking) => booking.session_date === today);
    } else if (dateFilter === "upcoming") {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((booking) => booking.session_date >= today);
    } else if (dateFilter === "past") {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((booking) => booking.session_date < today);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.player_name.toLowerCase().includes(query) ||
          booking.coach_name.toLowerCase().includes(query) ||
          booking.branch_name.toLowerCase().includes(query) ||
          booking.session_date.includes(query) ||
          booking.status.toLowerCase().includes(query)
      );
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      // First compare by date
      const dateComparison = a.session_date.localeCompare(b.session_date);
      if (dateComparison !== 0) return dateComparison;
      
      // If same date, compare by time
      return a.start_time.localeCompare(b.start_time);
    });

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateFilter, searchQuery]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coach_sessions")
        .select(`
          *,
          player:users!coach_sessions_player_id_fkey(id, full_name),
          coach:users!coach_sessions_coach_id_fkey(id, full_name),
          branch:branches!coach_sessions_branch_id_fkey(id, name)
        `)
        .order("session_date", { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedBookings = data.map((booking) => ({
          id: booking.id,
          player_id: booking.player_id,
          coach_id: booking.coach_id,
          branch_id: booking.branch_id,
          session_date: booking.session_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          player_name: booking.player?.full_name || "Unassigned",
          coach_name: booking.coach?.full_name || "Unknown Coach",
          branch_name: booking.branch?.name || "Unknown Branch",
          created_at: booking.created_at,
        }));
        setBookings(formattedBookings);
        setFilteredBookings(formattedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900">
            Available
          </Badge>
        );
      case "booked":
        return (
          <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-900">
            Booked
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-900">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-900">
            Cancelled
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-900">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-900/20 text-gray-400 border-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDialog(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("coach_sessions")
        .update({ status: newStatus })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      
      setShowDialog(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating booking status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getTotalsByStatus = () => {
    const totals = {
      available: 0,
      booked: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      total: bookings.length,
    };

    bookings.forEach((booking) => {
      if (booking.status in totals) {
        totals[booking.status as keyof typeof totals]++;
      }
    });

    return totals;
  };

  const stats = getTotalsByStatus();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
      <p className="text-muted-foreground mb-6">View and manage all bookings across the academy</p>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Booked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.booked}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.available}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-muted/20 p-4 rounded-lg mb-6 border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-8 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] gap-2 bg-background">
                <Filter className="h-4 w-4" />
                <span>Status</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px] gap-2 bg-background">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="secondary" 
              className="gap-2"
              onClick={fetchBookings}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      
      {/* Booking List */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Booking List</CardTitle>
          <CardDescription>
            Showing {filteredBookings.length} of {bookings.length} total bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No Bookings Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {statusFilter !== "all" || dateFilter !== "all" || searchQuery
                  ? "Try adjusting your filters to see more results"
                  : "There are no bookings in the system yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-collapse w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(booking.session_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {booking.player_name}
                        </div>
                      </TableCell>
                      <TableCell>{booking.coach_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {booking.branch_name}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(booking)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                View and manage booking information
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <div id="date" className="col-span-3 font-medium">
                  {formatDate(selectedBooking.session_date)}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label htmlFor="time" className="text-right">
                  Time
                </Label>
                <div id="time" className="col-span-3 font-medium">
                  {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label htmlFor="player" className="text-right">
                  Player
                </Label>
                <div id="player" className="col-span-3 font-medium">
                  {selectedBooking.player_name}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label htmlFor="coach" className="text-right">
                  Coach
                </Label>
                <div id="coach" className="col-span-3 font-medium">
                  {selectedBooking.coach_name}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label htmlFor="branch" className="text-right">
                  Branch
                </Label>
                <div id="branch" className="col-span-3 font-medium">
                  {selectedBooking.branch_name}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div id="status" className="col-span-3 font-medium">
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>
              
              {selectedBooking.status !== "available" && (
                <div className="bg-muted rounded-lg p-4 mt-2">
                  <h4 className="font-medium mb-2">Change Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.status !== "booked" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleStatusChange("booked")}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Mark Booked
                      </Button>
                    )}
                    
                    {selectedBooking.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleStatusChange("completed")}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        Mark Completed
                      </Button>
                    )}
                    
                    {selectedBooking.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleStatusChange("cancelled")}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                        Cancel Session
                      </Button>
                    )}
                    
                    {selectedBooking.status !== "available" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleStatusChange("available")}
                        disabled={actionLoading}
                      >
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        Mark Available
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setShowDialog(false)}
                disabled={actionLoading}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 