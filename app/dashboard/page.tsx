'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'hclarsen27@gmail.com';

interface Stats {
  total: number;
  active: number;
  nextAppointment: string | null;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, nextAppointment: null });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [{ data: projects }, { data: appointments }] = await Promise.all([
        supabase.from('projects').select('id, status').eq('user_id', user.id),
        supabase
          .from('appointments')
          .select('scheduled_at')
          .eq('user_id', user.id)
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1),
      ]);

      const total = projects?.length || 0;
      const active = projects?.filter((p) => p.status !== 'complete').length || 0;
      const nextAppointment = appointments?.[0]?.scheduled_at
        ? new Date(appointments[0].scheduled_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : null;

      setStats({ total, active, nextAppointment });
    };

    fetchStats();
  }, [user]);

  if (loading || !user) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Garage Transform</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 hidden sm:inline">
              {user.displayName || user.email}
            </span>
            <Link href="/profile" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium">
              Profile
            </Link>
            {user.email === ADMIN_EMAIL && (
              <Link href="/admin" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium">
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats row */}
        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Projects</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Active</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Next Visit</p>
              <p className="text-xl font-bold">{stats.nextAppointment || '—'}</p>
            </div>
          </div>
        )}

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Link href="/projects/new">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
              <div className="text-4xl mb-4">📸</div>
              <h2 className="text-xl font-bold mb-2">New Project</h2>
              <p className="text-gray-400">Upload a photo and get an instant AI-powered quote</p>
            </div>
          </Link>

          <Link href="/projects">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-bold mb-2">My Projects</h2>
              <p className="text-gray-400">
                {stats.total > 0
                  ? `${stats.total} project${stats.total !== 1 ? 's' : ''} — ${stats.active} active`
                  : 'View and manage your garage projects'}
              </p>
            </div>
          </Link>

          <Link href="/profile">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-xl font-bold mb-2">My Profile</h2>
              <p className="text-gray-400">Update your contact info and view appointment history</p>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <ol className="space-y-2 text-gray-300">
            <li><span className="text-blue-400 font-semibold">1. Upload Photos</span> — Take a photo of your garage space</li>
            <li><span className="text-blue-400 font-semibold">2. Get a Quote</span> — AI analyzes your space and generates a custom estimate</li>
            <li><span className="text-blue-400 font-semibold">3. Book a Visit</span> — Schedule an official measurement visit</li>
            <li><span className="text-blue-400 font-semibold">4. Pay Deposit</span> — Secure your project with a 50% deposit</li>
            <li><span className="text-blue-400 font-semibold">5. Installation</span> — We handle shelving, organization, and setup</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
