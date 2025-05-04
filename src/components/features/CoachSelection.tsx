// src/features/booking/components/CoachSelection/CoachSelection.tsx
import { Coach } from '../types/bookingTypes';
import { usePlayerLevel } from '../hooks/usePlayerLevel';

interface CoachSelectionProps {
  coaches: Coach[];
  selectedCoach: Coach | null;
  onSelect: (coach: Coach) => void;
}

export const CoachSelection = ({ coaches, selectedCoach, onSelect }: CoachSelectionProps) => {
  const { playerLevel } = usePlayerLevel();
  
  return (
    <div className="coach-selection">
      <h2>Select Your Coach</h2>
      <div className="coach-grid">
        {coaches
          .filter(coach => coach.availableLevels.includes(playerLevel))
          .map(coach => (
            <CoachCard 
              key={coach.id}
              coach={coach}
              isSelected={selectedCoach?.id === coach.id}
              onSelect={onSelect}
            />
          ))}
      </div>
    </div>
  );
};

const CoachCard = ({ coach, isSelected, onSelect }: { coach: Coach, isSelected: boolean, onSelect: (c: Coach) => void }) => (
  <div 
    className={`coach-card ${isSelected ? 'selected' : ''}`}
    onClick={() => onSelect(coach)}
  >
    <img src={coach.imageUrl} alt={coach.name} />
    <h3>{coach.name}</h3>
    <p>Specialties: {coach.specialties.join(', ')}</p>
    <p>Teaches: {coach.availableLevels.join(', ')}</p>
    <div className="rating">Rating: {coach.rating}/5</div>
  </div>
);