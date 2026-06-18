import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';

const VALUES = [
  {
    icon: '🔍',
    title: 'Transparency First',
    description:
      "You see the quote before we ever step foot in your garage. No sales pitch, no surprise pricing. The AI quote is real and the final number doesn't change without your approval.",
  },
  {
    icon: '⚡',
    title: 'Built Around Your Time',
    description:
      'Online quotes, online booking, online deposit. We designed every step so you can move the project forward at 10pm from your couch, not only during business hours.',
  },
  {
    icon: '🏗️',
    title: 'We Own the Outcome',
    description:
      "We build what we quote. If something changes during installation, we figure it out — not you. You hired us because you want it done right, and that's what we deliver.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-6">About Garage Transform</h1>
        <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
          We're a garage organization company that got tired of the old way of doing things —
          vague estimates, week-long waits for quotes, and contractors who don't show up on time.
        </p>
      </section>

      {/* Story */}
      <section className="bg-gray-800 border-y border-gray-700 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              It started with our own garage — two cars, three bikes, holiday decorations, a lawnmower,
              and years of stuff that had nowhere to go. We asked around for quotes. Most contractors
              either didn't call back, quoted two weeks out, or wanted a $200 consultation fee just to
              walk through the door.
            </p>
            <p>
              So we built our own solution. The AI quote system started as a spreadsheet and a lot of
              photos. Now it's a complete platform that gives homeowners an accurate estimate in under
              a minute, lets them see a preview of their transformed space, and books the whole project
              online — no phone tag required.
            </p>
            <p>
              We're a small team that does quality work and shows up on time. That's it. The tech
              exists to make your experience easier, not to replace the craftsmanship.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-10">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((val, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-3xl mb-4">{val.icon}</div>
              <h3 className="font-bold text-lg mb-2">{val.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service area / contact placeholder */}
      <section className="bg-gray-800 border-t border-gray-700 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Service Area</h2>
          <p className="text-gray-400 mb-8">
            {/* TODO: update with your actual service area */}
            Currently serving the greater Houston area. Not sure if we cover your neighborhood?
            Start a free quote and we'll let you know.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Get Your Free Quote
          </Link>
        </div>
      </section>
    </div>
  );
}
