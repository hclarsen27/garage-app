'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function BookPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon'>('morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return null;

  const handleSubmit = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('appointments')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            scheduled_at: `${selectedDate}T${timeSlot === 'morning' ? '09:00:00' : '14:00:00'}`,
            status: 'scheduled',
          },
        ]);

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date and 30 days ahead for min/max
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Appointment Confirmed!</h2>
            <p className="mb-2">
              Measurement visit scheduled for{' '}
              <span className="font-semibold">
                {new Date(selectedDate).toLocaleDateString()} ({timeSlot})
              </span>
            </p>
            <p className="text-gray-300 mb-6">
              We'll send you a confirmation email shortly.
            </p>
            <button
              onClick={() => router.push(`/projects/${projectId}/quote`)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              Back to Quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Schedule Measurement Visit</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-3">
              Select a date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              max={maxDateStr}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-gray-400 text-sm mt-2">
              Choose a date within the next 30 days
            </p>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-3">
              Preferred time
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="timeSlot"
                  value="morning"
                  checked={timeSlot === 'morning'}
                  onChange={(e) =>
                    setTimeSlot(e.target.value as 'morning' | 'afternoon')
                  }
                  className="w-4 h-4"
                />
                <span>Morning (8am - 12pm)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="timeSlot"
                  value="afternoon"
                  checked={timeSlot === 'afternoon'}
                  onChange={(e) =>
                    setTimeSlot(e.target.value as 'morning' | 'afternoon')
                  }
                  className="w-4 h-4"
                />
                <span>Afternoon (1pm - 5pm)</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedDate || isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
          >
            {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
          </button>

          <button
            onClick={() => router.push(`/projects/${projectId}/quote`)}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
