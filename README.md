# Ramy Ashour Squash Academy

This is a management system for the Ramy Ashour Squash Academy, allowing coaches and players to schedule and manage squash training sessions.

## Recent Updates

### Admin Dashboard Improvements

The admin dashboard has been reorganized for better usability:

- **Tabbed Interface**: Organized tools into Daily Operations, Setup Tools, and System Tools tabs
- **Quick Access Dashboard**: Added quick access cards for common tasks
- **System Status Section**: Real-time overview of system status and alerts
- **Pending Approvals Component**: Displays and manages coach account approval requests
- **Improved Visual Organization**: Consistent card styles and clearer categorization of functions
- **Quick Help Guide**: Added user guidance to help administrators navigate the dashboard

### Booking System Error Handling

Enhanced the booking system with robust error handling:

- **Booking Error Handler Component**: Centralized error handling component for consistent error messaging
- **Error Recovery Flow**: Added ability to retry failed bookings when possible
- **Specific Error Messages**: Detailed error messages for different error scenarios
- **Session Reservation System**: Added temporary reservation of sessions during payment process
- **Conflict Detection**: Prevents double-bookings and schedule conflicts
- **Session Status Verification**: Verifies session availability before booking
- **Utility Functions**: Created reusable booking utility functions for common operations

### Booking Management Dashboard

Created a comprehensive booking management interface for administrators:

- **Status Dashboard**: Overview of booking statistics by status
- **Advanced Filtering**: Filter bookings by status, date range, and search query
- **Interactive List**: Detailed list of all bookings with quick actions
- **Booking Details**: Detailed view of booking information
- **Status Management**: Tools to change booking status (complete, cancel, etc.)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials
4. Run the development server:
   ```
   npm run dev
   ```

### Deployment

The application is deployed on Vercel. Changes to the main branch will automatically deploy to production.

## Features

### For Players
- **Player Assessment**: Initial skill assessment to determine appropriate training level
- **Subscription Plans**: Multiple subscription tiers with different pricing and session frequency
- **Session Booking**: Book individual sessions with preferred coaches
- **Availability Filtering**: Filter sessions by coach, date, time, or location
- **Booking Management**: View and manage upcoming sessions

### For Coaches
- **Schedule Management**: Set and update availability
- **Session Management**: View booked sessions and player details
- **Performance Tracking**: Track player progress over time

### For Administrators
- **Booking Management**: View, edit, and manage all bookings
- **User Management**: Manage player and coach accounts
- **Schedule Initialization**: Set up the coach schedules and generate available sessions
- **Analytics**: Access booking statistics and usage reports

## Technical Details

- Built with Next.js and React
- Uses Supabase for authentication and database
- Tailwind CSS for styling
- Fully responsive design
- Utilizes server components and server actions for optimal performance

## Setup Instructions

1. **Initialize Coaches and Schedules**:
   - Log in as an admin
   - Go to Dashboard > Settings
   - Click "Initialize Booking System"

2. **Generate Sessions**:
   - Once coaches and schedules are initialized, sessions will be automatically generated for the next 30 days
   - Sessions can be regenerated from the admin dashboard if needed

3. **Player Onboarding**:
   - Players complete assessment during first login
   - System recommends appropriate subscription level
   - Players can then book sessions based on their subscription

## Database Schema

### Main Tables
- `users`: Contains all user accounts (players, coaches, admins)
- `players`: Player-specific information linked to users
- `coaches`: Coach-specific information linked to users
- `coach_schedules`: Weekly availability patterns for coaches
- `coach_sessions`: Individual session slots that can be booked
- `branches`: Physical locations where sessions take place

## Usage Flow

1. Player registers and completes assessment
2. Player selects a subscription plan
3. Player books available sessions
4. Coach receives notification and confirms
5. Player attends session
6. Coach marks session as completed
7. Player can submit videos for analysis

## Technology Stack

- **Frontend**: React, Next.js, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context/Hooks
- **Styling**: TailwindCSS, shadcn/ui components
