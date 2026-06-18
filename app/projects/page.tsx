'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  status: string;
  room_width: number;
  room_depth: number;
  room_height: number;
  garage_photo_url: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  new: { label: 'Quote Ready', color: 'bg-blue-600' },
  quoted: { label: 'Book a Visit', color: 'bg-yellow-600' },
  booked: { label: 'Deposit Paid', color: 'bg-purple-600' },
  complete: { label: 'Complete', color: 'bg-green-600' },
};

const STATUS_NEXT: Record<string, { label: string; href: (id: string) => string }> = {
  new: { label: 'View Quote →', href: (id) => `/projects/${id}/quote` },
  quoted: { label: 'Book Visit →', href: (id) => `/projects/${id}/book` },
  booked: { label: 'Pay Deposit →', href: (id) => `/projects/${id}/pay` },
};

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProjects(data || []);
        setDataLoading(false);
      });
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <div className="flex gap-3">
            <Link
              href="/projects/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
            >
              + New Project
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {dataLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">No projects yet.</p>
            <Link
              href="/projects/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              Start Your First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const status = STATUS_LABEL[project.status] || { label: project.status, color: 'bg-gray-600' };
              const next = STATUS_NEXT[project.status];
              return (
                <div key={project.id} className="bg-gray-800 rounded-lg p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold truncate">{project.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {project.room_width}ft × {project.room_depth}ft × {project.room_height}ft ceiling
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/projects/${project.id}/quote`)}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      Quote
                    </button>
                    {next && (
                      <button
                        onClick={() => router.push(next.href(project.id))}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold"
                      >
                        {next.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
