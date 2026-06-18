'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Appointment {
  id: string;
  scheduled_at: string;
  status: string;
  project_id: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ data: userData }, { data: apptData }] = await Promise.all([
        supabase.from('users').select('phone').eq('id', user.id).single(),
        supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_at', { ascending: false }),
      ]);

      setPhone(userData?.phone || '');
      setAppointments(apptData || []);
      setDataLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading || !user) return null;

  const handleSavePhone = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    const { error: updateError } = await supabase
      .from('users')
      .update({ phone })
      .eq('id', user.id);

    if (updateError) {
      setError('Failed to save phone number');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Account info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Name</p>
              <p>{user.displayName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Phone number */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Phone Number</h2>
          <p className="text-gray-400 text-sm mb-4">
            Used for appointment reminders and project updates via SMS.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSavePhone}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>

        {/* Appointment history */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Appointment History</h2>
          {dataLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-400">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => {
                const date = new Date(appt.scheduled_at);
                const hour = date.getHours();
                const timeSlot = hour < 12 ? 'Morning (8am–12pm)' : 'Afternoon (1pm–5pm)';
                return (
                  <div key={appt.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium">{date.toLocaleDateString()}</p>
                      <p className="text-gray-400 text-sm">{timeSlot}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white">
                        {appt.status}
                      </span>
                      <button
                        onClick={() => router.push(`/projects/${appt.project_id}/quote`)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View project
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
