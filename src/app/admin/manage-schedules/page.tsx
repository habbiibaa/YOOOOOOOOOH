'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Coach {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Schedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Schedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function ManageSchedules() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  // Fetch coaches on component mount
  useEffect(() => {
    const fetchCoaches = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('role', 'coach')
        .eq('approved', true);

      if (error) {
        setError('Failed to fetch coaches');
      } else {
        setCoaches(data);
      }
    };

    fetchCoaches();
  }, []);

  // Fetch coach schedules when a coach is selected
  useEffect(() => {
    if (!selectedCoach) return;

    const fetchSchedules = async () => {
      setLoading(true);
      const response = await fetch(`/api/admin/manage-coach-schedule?coach_id=${selectedCoach}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Initialize schedules for all days if none exist
        const existingSchedules = data.schedules || [];
        const initializedSchedules = daysOfWeek.map(day => {
          const existing = existingSchedules.find(s => s.day_of_week === day);
          return existing || {
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            is_available: true
          };
        });
        setSchedules(initializedSchedules);
      }
      setLoading(false);
    };

    fetchSchedules();
  }, [selectedCoach]);

  const handleScheduleChange = (day, field, value) => {
    setSchedules(prev => 
      prev.map(schedule => 
        schedule.day_of_week === day 
          ? { ...schedule, [field]: value }
          : schedule
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/manage-coach-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: selectedCoach,
          schedules: schedules
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to save schedules');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Coach Schedules</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Coach</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          onChange={(e) => setSelectedCoach(e.target.value)}
          value={selectedCoach || ''}
        >
          <option value="">Select a coach...</option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.first_name} {coach.last_name} ({coach.email})
            </option>
          ))}
        </select>
      </div>

      {selectedCoach && (
        <div className="bg-white shadow rounded-lg p-4">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Day</th>
                <th className="px-4 py-2">Start Time</th>
                <th className="px-4 py-2">End Time</th>
                <th className="px-4 py-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.day_of_week}>
                  <td className="px-4 py-2">{schedule.day_of_week}</td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={schedule.start_time}
                      onChange={(e) => handleScheduleChange(schedule.day_of_week, 'start_time', e.target.value)}
                      className="border rounded p-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={schedule.end_time}
                      onChange={(e) => handleScheduleChange(schedule.day_of_week, 'end_time', e.target.value)}
                      className="border rounded p-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={schedule.is_available}
                      onChange={(e) => handleScheduleChange(schedule.day_of_week, 'is_available', e.target.checked)}
                      className="rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Schedules'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
