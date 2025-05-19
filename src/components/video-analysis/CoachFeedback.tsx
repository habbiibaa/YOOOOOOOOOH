import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface CoachFeedbackProps {
  videoId: string;
  userId: string;
  initialFeedback?: string;
  initialAssessment?: {
    technique: number;
    footwork: number;
    consistency: number;
    tactical: number;
  };
}

export default function CoachFeedback({
  videoId,
  userId,
  initialFeedback = '',
  initialAssessment = {
    technique: 0,
    footwork: 0,
    consistency: 0,
    tactical: 0,
  },
}: CoachFeedbackProps) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [assessment, setAssessment] = useState(initialAssessment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAssessmentChange = (skill: keyof typeof assessment, value: number) => {
    setAssessment((prev) => ({
      ...prev,
      [skill]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from('training_videos')
        .update({
          coach_feedback: feedback,
          skill_assessment: assessment,
          status: 'completed',
        })
        .eq('id', videoId);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Coach Feedback</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide detailed feedback about the player's performance..."
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Skill Assessment</h3>
          <div className="space-y-4">
            {Object.entries(assessment).map(([skill, value]) => (
              <div key={skill}>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-gray-600 capitalize">
                    {skill}
                  </label>
                  <span className="text-sm text-gray-500">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) =>
                    handleAssessmentChange(skill as keyof typeof assessment, parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-500 text-sm">
            Feedback saved successfully!
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Feedback'}
        </button>
      </div>
    </div>
  );
} 