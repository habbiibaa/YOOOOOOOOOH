"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
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
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, User, Clock, MapPin, Check, X } from "lucide-react";

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
};

export default function BookingManagement() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.player_name.toLowerCase().includes(query) ||
          booking.coach_name.toLowerCase().includes(query) ||
          booking.branch_name.toLowerCase().includes(query) ||
          booking.session_date.includes(query)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchQuery]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-900/20 text-blue-400 border-blue-900";
      case "booked":
        return "bg-green-900/20 text-green-400 border-green-900";
      case "completed":
        return "bg-purple-900/20 text-purple-400 border-purple-900";
      case "cancelled":
        return "bg-red-900/20 text-red-400 border-red-900";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-800";
    }
  };

  const handleActionClick = (booking: Booking) => {
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

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search bookings..."
              className="w-full md:w-64 bg-gray-800 border-gray-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter" className="sr-only">
              Filter by status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger
                id="status-filter"
                className="w-full md:w-40 bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={fetchBookings}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
          <Calendar className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            No Bookings Found
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No bookings match your current filters. Try adjusting your search
            criteria or check back later.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-900">
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Time</TableHead>
                  <TableHead className="text-gray-300">Coach</TableHead>
                  <TableHead className="text-gray-300">Player</TableHead>
                  <TableHead className="text-gray-300">Location</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="border-gray-800 hover:bg-gray-800/50"
                  >
                    <TableCell className="text-white">
                      {formatDate(booking.session_date)}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatTime(booking.start_time)} -{" "}
                      {formatTime(booking.end_time)}
                    </TableCell>
                    <TableCell className="text-white">
                      {booking.coach_name}
                    </TableCell>
                    <TableCell className="text-white">
                      {booking.player_name === "Unassigned" 
                        ? <span className="text-gray-500">Unassigned</span> 
                        : booking.player_name}
                    </TableCell>
                    <TableCell className="text-white">
                      {booking.branch_name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() => handleActionClick(booking)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Booking action dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Manage Booking</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the status or details of this booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Date</Label>
                  <div className="flex items-center text-white">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(selectedBooking.session_date)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Time</Label>
                  <div className="flex items-center text-white">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {formatTime(selectedBooking.start_time)} -{" "}
                    {formatTime(selectedBooking.end_time)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Coach</Label>
                  <div className="flex items-center text-white">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedBooking.coach_name}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Player</Label>
                  <div className="flex items-center text-white">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedBooking.player_name === "Unassigned" 
                      ? <span className="text-gray-500">Unassigned</span> 
                      : selectedBooking.player_name}
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-300">Location</Label>
                  <div className="flex items-center text-white">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedBooking.branch_name}
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="status" className="text-gray-300">
                    Status
                  </Label>
                  <Select
                    defaultValue={selectedBooking.status}
                    onValueChange={(value) => handleStatusChange(value)}
                    disabled={actionLoading}
                  >
                    <SelectTrigger
                      id="status"
                      className="bg-gray-800 border-gray-700 text-white"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={actionLoading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            {selectedBooking?.status === "booked" && (
              <Button
                onClick={() => handleStatusChange("completed")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? "Processing..." : "Mark Completed"}
              </Button>
            )}
            {selectedBooking?.status === "booked" && (
              <Button
                onClick={() => handleStatusChange("cancelled")}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? "Processing..." : "Cancel Booking"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 