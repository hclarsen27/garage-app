import Link from 'next/link';

export default function MarketingNav() {
  return (
    <nav className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          Garage Transform
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/how-it-works" className="text-gray-400 hover:text-white transition">
            How It Works
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition">
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
