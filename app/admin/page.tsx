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
  garage_photo_url: string | null;
  admin_visualization_url: string | null;
  created_at: string;
}

interface Appointment {
  id: string;
  project_id: string;
  user_id: string;
  scheduled_at: string;
  status: string;
}

interface CustomerInfo {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
}

interface DesignOptions {
  paintedWalls: boolean;
  epoxyFloor: boolean;
  heavyDutyShelfing: boolean;
  labeledBins: boolean;
  pegboard: boolean;
  ceilingStorage: boolean;
}

const VIZ_OPTIONS: { key: keyof DesignOptions; label: string }[] = [
  { key: 'paintedWalls', label: 'Painted Walls' },
  { key: 'epoxyFloor', label: 'Epoxy Floor' },
  { key: 'heavyDutyShelfing', label: 'Heavy-Duty Shelving' },
  { key: 'labeledBins', label: 'Labeled Bins' },
  { key: 'pegboard', label: 'Pegboard Organizer' },
  { key: 'ceilingStorage', label: 'Ceiling Storage' },
];

const DEFAULT_VIZ_OPTIONS: DesignOptions = {
  paintedWalls: false,
  epoxyFloor: false,
  heavyDutyShelfing: true,
  labeledBins: true,
  pegboard: false,
  ceilingStorage: false,
};

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  new: { label: 'Quote Ready', color: 'bg-blue-600' },
  quoted: { label: 'Visit Pending', color: 'bg-yellow-600' },
  booked: { label: 'Deposit Paid', color: 'bg-purple-600' },
  complete: { label: 'Complete', color: 'bg-green-600' },
};

type Tab = 'leads' | 'appointments';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [projects, setProjects] = useState<Project[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userMap, setUserMap] = useState<Record<string, CustomerInfo>>({});
  const [dataLoading, setDataLoading] = useState(true);

  // Visualization state
  const [expandedVizId, setExpandedVizId] = useState<string | null>(null);
  const [vizOptions, setVizOptions] = useState<DesignOptions>(DEFAULT_VIZ_OPTIONS);
  const [vizUrl, setVizUrl] = useState<string | null>(null);
  const [vizLoading, setVizLoading] = useState(false);
  const [vizError, setVizError] = useState('');
  const [sharedSuccess, setSharedSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) router.push('/dashboard');
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

      // Fetch customer contact info for everyone who has a project or appointment
      const userIds = [
        ...new Set([
          ...(projectData?.map((p) => p.user_id) || []),
          ...(appointmentData?.map((a) => a.user_id) || []),
        ]),
      ];
      if (userIds.length > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, email, full_name, phone')
          .in('id', userIds);
        const map: Record<string, CustomerInfo> = {};
        userData?.forEach((u) => { map[u.id] = u; });
        setUserMap(map);
      }

      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading || !user || user.email !== ADMIN_EMAIL) return null;

  const openViz = (project: Project) => {
    setExpandedVizId(project.id);
    setVizOptions(DEFAULT_VIZ_OPTIONS);
    setVizUrl(null);
    setVizError('');
    setSharedSuccess(false);
  };

  const handleGenerate = async (project: Project) => {
    if (!project.garage_photo_url) {
      setVizError('This project has no garage photo yet');
      return;
    }
    setVizLoading(true);
    setVizError('');
    setVizUrl(null);
    try {
      const res = await fetch('/api/generate-visualization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: project.garage_photo_url, options: vizOptions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setVizUrl(data.url);
    } catch (err: any) {
      setVizError(err.message || 'Generation failed');
    } finally {
      setVizLoading(false);
    }
  };

  const handleShare = async (projectId: string) => {
    if (!vizUrl) return;
    const { error } = await supabase
      .from('projects')
      .update({ admin_visualization_url: vizUrl })
      .eq('id', projectId);
    if (!error) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, admin_visualization_url: vizUrl } : p))
      );
      setSharedSuccess(true);
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
          {(['new', 'quoted', 'booked', 'complete'] as const).map((status) => (
            <div key={status} className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">
                {STATUS_DISPLAY[status]?.label || status}
              </p>
              <p className="text-3xl font-bold">
                {projects.filter((p) => p.status === status).length}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {(['leads', 'appointments'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-semibold capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-gray-400'
              }`}
            >
              {tab === 'leads' ? `Leads & Projects (${projects.length})` : `Appointments (${appointments.length})`}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : activeTab === 'leads' ? (
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-gray-400">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  {/* Project row */}
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold truncate">{project.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full text-white shrink-0 ${
                            STATUS_DISPLAY[project.status]?.color || 'bg-gray-600'
                          }`}
                        >
                          {STATUS_DISPLAY[project.status]?.label || project.status}
                        </span>
                        {project.admin_visualization_url && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-700 text-white shrink-0">
                            Design Shared
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-1">
                        {project.room_width}ft × {project.room_depth}ft × {project.room_height}ft ceiling
                      </p>
                      {project.notes && (
                        <p className="text-gray-500 text-sm line-clamp-2">{project.notes}</p>
                      )}
                      {userMap[project.user_id] && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                          {userMap[project.user_id].full_name && (
                            <span className="text-gray-300 text-sm font-medium">
                              {userMap[project.user_id].full_name}
                            </span>
                          )}
                          <a href={`mailto:${userMap[project.user_id].email}`}
                            className="text-blue-400 hover:text-blue-300 text-sm">
                            {userMap[project.user_id].email}
                          </a>
                          {userMap[project.user_id].phone && (
                            <a href={`tel:${userMap[project.user_id].phone}`}
                              className="text-green-400 hover:text-green-300 text-sm">
                              {userMap[project.user_id].phone}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-gray-600 text-xs mt-2">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() =>
                          expandedVizId === project.id
                            ? setExpandedVizId(null)
                            : openViz(project)
                        }
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded text-sm"
                      >
                        {expandedVizId === project.id ? 'Close' : 'Generate Design'}
                      </button>
                      <button
                        onClick={() => router.push(`/projects/${project.id}/quote`)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        View Quote
                      </button>
                    </div>
                  </div>

                  {/* Visualization panel */}
                  {expandedVizId === project.id && (
                    <div className="border-t border-gray-700 bg-gray-900/50 p-5">
                      <h4 className="font-semibold mb-3">Generate Design for Customer</h4>

                      {project.garage_photo_url ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left: options + controls */}
                          <div>
                            <p className="text-gray-400 text-sm mb-3">Select features to visualize:</p>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {VIZ_OPTIONS.map((opt) => (
                                <label
                                  key={opt.key}
                                  className="flex items-center gap-2 p-2.5 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer text-sm transition"
                                >
                                  <input
                                    type="checkbox"
                                    checked={vizOptions[opt.key]}
                                    onChange={(e) =>
                                      setVizOptions((prev) => ({
                                        ...prev,
                                        [opt.key]: e.target.checked,
                                      }))
                                    }
                                    className="accent-purple-500"
                                  />
                                  {opt.label}
                                </label>
                              ))}
                            </div>

                            {vizError && (
                              <p className="text-red-400 text-sm mb-3">{vizError}</p>
                            )}

                            <button
                              onClick={() => handleGenerate(project)}
                              disabled={vizLoading}
                              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold text-sm disabled:opacity-50 mb-2"
                            >
                              {vizLoading ? 'Generating… (~10 seconds)' : 'Generate Preview'}
                            </button>

                            {vizUrl && !sharedSuccess && (
                              <button
                                onClick={() => handleShare(project.id)}
                                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded font-semibold text-sm"
                              >
                                Share with Customer
                              </button>
                            )}

                            {sharedSuccess && (
                              <p className="text-green-400 text-sm text-center mt-2">
                                Shared! Customer will see this on their quote page.
                              </p>
                            )}
                          </div>

                          {/* Right: before / after */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Original</p>
                              <img
                                src={project.garage_photo_url}
                                alt="Original"
                                className="w-full h-40 object-cover rounded-lg"
                              />
                            </div>
                            {vizUrl && (
                              <div>
                                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">AI Preview</p>
                                <img
                                  src={vizUrl}
                                  alt="AI preview"
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          This project doesn't have a garage photo yet.
                        </p>
                      )}
                    </div>
                  )}
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
                const timeSlot = date.getHours() < 12 ? 'Morning (8am–12pm)' : 'Afternoon (1pm–5pm)';
                return (
                  <div
                    key={appt.id}
                    className="bg-gray-800 rounded-lg p-5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold">{date.toLocaleDateString()}</p>
                      <p className="text-gray-400 text-sm">{timeSlot}</p>
                      {userMap[appt.user_id] && (
                        <div className="flex flex-wrap items-center gap-x-2 mt-1">
                          {userMap[appt.user_id].full_name && (
                            <span className="text-gray-300 text-sm">
                              {userMap[appt.user_id].full_name}
                            </span>
                          )}
                          <a href={`mailto:${userMap[appt.user_id].email}`}
                            className="text-blue-400 hover:text-blue-300 text-xs">
                            {userMap[appt.user_id].email}
                          </a>
                          {userMap[appt.user_id].phone && (
                            <a href={`tel:${userMap[appt.user_id].phone}`}
                              className="text-green-400 hover:text-green-300 text-xs">
                              {userMap[appt.user_id].phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full text-white shrink-0 ${
                        STATUS_DISPLAY[appt.status]?.color || 'bg-gray-600'
                      }`}
                    >
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
