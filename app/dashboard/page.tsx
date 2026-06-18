'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const ADMIN_EMAIL = 'hclarsen27@gmail.com';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Garage Transform</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {user.full_name || user.email}</span>
            <Link
              href="/profile"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium"
            >
              Profile
            </Link>
            {user.email === ADMIN_EMAIL && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium"
              >
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Project Card */}
          <Link href="/projects/new">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
              <div className="text-4xl mb-4">📸</div>
              <h2 className="text-xl font-bold mb-2">New Project</h2>
              <p className="text-gray-400">Upload photos and get started on your garage transformation</p>
            </div>
          </Link>

          {/* My Projects Card */}
          <Link href="/projects">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-bold mb-2">My Projects</h2>
              <p className="text-gray-400">View and manage all your garage projects</p>
            </div>
          </Link>

          {/* Digital Inventory Card */}
          <Link href="/inventory">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-xl font-bold mb-2">Digital Inventory</h2>
              <p className="text-gray-400">Organize and track items in your garage bins</p>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">How it Works</h2>
          <ol className="space-y-3 text-gray-300">
            <li><strong>1. Upload Photos:</strong> Take photos of your garage space</li>
            <li><strong>2. Get Quote:</strong> Receive an AI-generated estimate with 2D renderings</li>
            <li><strong>3. Book Measurement:</strong> Schedule an official measurement visit</li>
            <li><strong>4. Installation:</strong> We handle the shelving, organization, and setup</li>
            <li><strong>5. Digital Inventory:</strong> Get QR-coded bins and digital tracking</li>
          </ol>
        </div>
      </main>
    </div>
  );
}