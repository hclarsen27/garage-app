'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white shrink-0">
          Garage Transform
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/how-it-works" className="text-gray-400 hover:text-white transition">
            How It Works
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition">
            About
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop CTAs */}
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-gray-400 hover:text-white transition px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
          >
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="sm:hidden ml-1 p-2 text-gray-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-gray-800 bg-gray-900 px-6 py-4 space-y-3">
          <Link
            href="/how-it-works"
            onClick={() => setOpen(false)}
            className="block text-gray-300 hover:text-white py-1"
          >
            How It Works
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block text-gray-300 hover:text-white py-1"
          >
            About
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block text-gray-300 hover:text-white py-1"
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}
