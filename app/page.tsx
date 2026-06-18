'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';

const PACKAGES = [
  { name: 'Shelving Only', price: '$800', description: 'Custom 2×4 shelving with plywood, up to 3 units' },
  { name: 'Shelving + Junk Removal', price: '$1,200', description: 'Everything above plus full haul-away and cleanup' },
  { name: 'Full Organization', price: '$1,600', description: 'Complete transformation with professional zoning and labeling' },
  { name: 'Complete + Digital Inventory', price: '$2,000', description: 'Full org plus QR-coded bins and 3-month inventory subscription' },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Your Garage,{' '}
          <span className="text-blue-400">Transformed</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Upload a photo. Get an instant AI-powered quote. See a preview of your new space —
          before you spend a dollar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition"
          >
            Get Your Free Quote
          </Link>
          <Link
            href="/how-it-works"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-semibold text-lg transition"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-800 bg-gray-800/50 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
          <span>⚡ Instant AI quote</span>
          <span>📸 Just a photo to start</span>
          <span>🔍 See your space before you commit</span>
          <span>🔨 Professional installation</span>
          <span>💳 Secure online deposit</span>
        </div>
      </section>

      {/* How it works (abbreviated) */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">From Photo to Finished Garage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📸', step: '1', title: 'Upload Photos', body: 'Snap a few photos of your garage walls — any phone will do. Add as many angles as you want.' },
            { icon: '🤖', step: '2', title: 'Get Your Quote', body: 'AI analyzes dimensions, current clutter, and space potential. A full quote in under 60 seconds.' },
            { icon: '✅', step: '3', title: 'Book & Install', body: 'Pick your package, preview the result, book a visit, pay a deposit. We handle the rest.' },
          ].map((item) => (
            <div key={item.step} className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-blue-400 text-xs font-mono font-bold mb-1">STEP {item.step}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/how-it-works" className="text-blue-400 hover:text-blue-300 text-sm">
            See all 7 steps →
          </Link>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-gray-800 border-y border-gray-700 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Four Packages, Every Budget</h2>
          <p className="text-gray-400 text-center mb-10">
            Starting at $800. All packages include design, materials, and installation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKAGES.map((pkg, i) => (
              <div
                key={i}
                className={`rounded-xl p-5 border ${i === 2 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-900'}`}
              >
                {i === 2 && (
                  <div className="text-xs text-blue-400 font-semibold mb-2">MOST POPULAR</div>
                )}
                <div className="text-2xl font-bold text-blue-400 mb-1">{pkg.price}</div>
                <div className="font-semibold mb-2">{pkg.name}</div>
                <p className="text-gray-400 text-sm">{pkg.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to reclaim your garage?</h2>
        <p className="text-gray-400 mb-8 text-lg">
          Takes 2 minutes to sign up. Free quote, no obligation.
        </p>
        <Link
          href="/signup"
          className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-xl transition"
        >
          Get Started Free
        </Link>
      </section>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-between gap-4 text-sm text-gray-600">
          <span>© 2026 Garage Transform</span>
          <div className="flex gap-6">
            <Link href="/how-it-works" className="hover:text-gray-400">How It Works</Link>
            <Link href="/about" className="hover:text-gray-400">About</Link>
            <Link href="/login" className="hover:text-gray-400">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
