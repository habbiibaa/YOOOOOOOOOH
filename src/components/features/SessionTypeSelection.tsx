// src/features/booking/components/SessionTypeSelection/SessionTypeSelection.tsx
import { SessionType } from '../types/bookingTypes';

interface SessionTypeSelectionProps {
  sessionTypes: SessionType[];
  selectedSession: SessionType | null;
  onSelect: (session: SessionType) => void;
  includeAIAnalysis: boolean;
  onToggleAIAnalysis: () => void;
}

export const SessionTypeSelection = ({
  sessionTypes,
  selectedSession,
  onSelect,
  includeAIAnalysis,
  onToggleAIAnalysis
}: SessionTypeSelectionProps) => (
  <div className="session-type-selection">
    <h2>Select Session Type</h2>
    <div className="session-grid">
      {sessionTypes.map(session => (
        <SessionCard 
          key={session.id}
          session={session}
          isSelected={selectedSession?.id === session.id}
          onSelect={onSelect}
        />
      ))}
    </div>
    <div className="ai-option">
      <label>
        <input
          type="checkbox"
          checked={includeAIAnalysis}
          onChange={onToggleAIAnalysis}
        />
        Include AI Video Analysis (+$15)
      </label>
      <p className="ai-description">
        Get detailed technical analysis of your session with AI-powered feedback
      </p>
    </div>
  </div>
);