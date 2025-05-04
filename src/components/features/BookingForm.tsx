// src/features/booking/types/bookingTypes.ts
export interface Coach {
    id: string;
    name: string;
    imageUrl: string;
    bio: string;
    specialties: string[];
    availableLevels: string[]; // beginner, intermediate, advanced, pro
    rating: number;
  }
  
  export interface SessionType {
    id: string;
    name: string;
    description: string;
    duration: number; // minutes
    price: number;
    groupSize: number;
    suitableLevels: string[];
  }
  
  export interface TimeSlot {
    start: string; // ISO string
    end: string;   // ISO string
    available: boolean;
    coachId: string;
  }
  
  export interface Booking {
    id: string;
    userId: string;
    coachId: string;
    sessionTypeId: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    aiAnalysisRequested: boolean;
    playerLevel: string;
    notes?: string;
  }