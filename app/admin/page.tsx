'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'hclarsen27@gmail.com';

interface Project {
  id: string;
  user_id: string;
  title: string;
  status: string;
  room_width: number;
  room_depth: number;
  room_height: number;
  notes: string;
  created_at: string;
}

interface Appointment {
  id: string;
  project_id: string;
  user_id: string;
  scheduled_at: string;
  status: string;
}

type Tab = 'leads' | 'appointments';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [projects, setProjects] = useState<Project[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const fetchData = async () => {
      setDataLoading(true);
      const [{ data: projectData }, { data: appointmentData }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('scheduled_at', { ascending: true }),
      ]);
      setProjects(projectData || []);
      setAppointments(appointmentData || []);
      setDataLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading || !user) return null;
  if (user.email !== ADMIN_EMAIL) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-600';
      case 'quoted': return 'bg-yellow-600';
      case 'booked': return 'bg-purple-600';
      case 'complete': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['new', 'quoted', 'booked', 'complete'].map((status) => (
            <div key={status} className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm capitalize mb-1">{status}</p>
              <p className="text-3xl font-bold">
                {projects.filter((p) => p.status === status).length}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 px-1 font-semibold ${activeTab === 'leads' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}
          >
            Leads & Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 px-1 font-semibold ${activeTab === 'appointments' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}
          >
            Appointments ({appointments.length})
          </button>
        </div>

        {dataLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : activeTab === 'leads' ? (
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-gray-400">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-lg p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold truncate">{project.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">
                      {project.room_width}ft × {project.room_depth}ft × {project.room_height}ft ceiling
                    </p>
                    {project.notes && (
                      <p className="text-gray-400 text-sm line-clamp-2">{project.notes}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-2">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/projects/${project.id}/quote`)}
                    className="shrink-0 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    View Quote
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-gray-400">No appointments yet.</p>
            ) : (
              appointments.map((appt) => {
                const date = new Date(appt.scheduled_at);
                const hour = date.getHours();
                const timeSlot = hour < 12 ? 'Morning (8am–12pm)' : 'Afternoon (1pm–5pm)';
                return (
                  <div key={appt.id} className="bg-gray-800 rounded-lg p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{date.toLocaleDateString()}</p>
                      <p className="text-gray-400 text-sm">{timeSlot}</p>
                      <p className="text-gray-600 text-xs mt-1">Project: {appt.project_id}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
