// src/pages/client/book-session.tsx
import { useState } from 'react';
import { 
  CoachSelection, 
  SessionTypeSelection, 
  AvailabilityCalendar,
  BookingForm
} from '../../features/booking';
import { useAuth } from '../../features/auth/hooks/useAuth';

const BookSessionPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [includeAIAnalysis, setIncludeAIAnalysis] = useState(false);

  // Mock data - in real app, fetch from API
  const coaches: Coach[] = [
    {
      id: '1',
      name: 'Ramy Ashour',
      imageUrl: '/coaches/ramy.jpg',
      bio: 'Former world #1 squash player',
      specialties: ['Technique', 'Strategy', 'Footwork'],
      availableLevels: ['intermediate', 'advanced', 'pro'],
      rating: 5
    },
    // More coaches...
  ];

  const sessionTypes: SessionType[] = [
    {
      id: 'private',
      name: 'Private Session',
      description: 'One-on-one coaching',
      duration: 60,
      price: 120,
      groupSize: 1,
      suitableLevels: ['beginner', 'intermediate', 'advanced', 'pro']
    },
    // More session types...
  ];

  const handleBookingSubmit = async (bookingData: any) => {
    // Send to backend
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...bookingData,
        playerLevel: user?.skillLevel,
        aiAnalysisRequested: includeAIAnalysis
      }),
    });
    
    if (response.ok) {
      setStep(5); // Confirmation step
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-progress">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Select Coach</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Session Type</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Date & Time</div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Confirm</div>
      </div>

      {step === 1 && (
        <CoachSelection 
          coaches={coaches}
          selectedCoach={selectedCoach}
          onSelect={(coach) => {
            setSelectedCoach(coach);
            setStep(2);
          }}
        />
      )}

      {step === 2 && selectedCoach && (
        <SessionTypeSelection
          sessionTypes={sessionTypes}
          selectedSession={selectedSession}
          onSelect={(session) => {
            setSelectedSession(session);
            setStep(3);
          }}
          includeAIAnalysis={includeAIAnalysis}
          onToggleAIAnalysis={() => setIncludeAIAnalysis(!includeAIAnalysis)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && selectedCoach && selectedSession && (
        <div className="calendar-step">
          <AvailabilityCalendar
            coachId={selectedCoach.id}
            sessionDuration={selectedSession.duration}
            playerLevel={user?.skillLevel || 'beginner'}
            onSlotSelect={(slot) => {
              setSelectedSlot(slot);
              setStep(4);
            }}
          />
          <button className="back-button" onClick={() => setStep(2)}>
            Back
          </button>
        </div>
      )}

      {step === 4 && selectedCoach && selectedSession && selectedSlot && (
        <BookingForm
          coach={selectedCoach}
          session={selectedSession}
          slot={selectedSlot}
          includeAIAnalysis={includeAIAnalysis}
          user={user}
          onSubmit={handleBookingSubmit}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <BookingConfirmation
          bookingDetails={{
            coach: selectedCoach!,
            session: selectedSession!,
            slot: selectedSlot!,
            aiAnalysis: includeAIAnalysis
          }}
        />
      )}
    </div>
  );
};

export default BookSessionPage;