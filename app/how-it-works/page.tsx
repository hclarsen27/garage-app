import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'From a photo on your phone to a fully transformed garage — see all 7 steps of the Garage Transform process.',
};

const STEPS = [
  {
    number: '01',
    icon: '📷',
    title: 'Upload Your Photos',
    description:
      'Take photos of each wall in your garage — the more angles, the better. Our system accepts any number of photos so we can see the full picture of your space.',
  },
  {
    number: '02',
    icon: '🤖',
    title: 'AI Analyzes Your Space',
    description:
      'Claude Vision instantly measures your garage dimensions, identifies obstacles, and assesses your current storage situation — no tape measure required.',
  },
  {
    number: '03',
    icon: '📋',
    title: 'Review Your Quote',
    description:
      'Choose from four service packages based on your needs and budget. Add storage bins, materials upgrades, or premium finishes to customize your project.',
  },
  {
    number: '04',
    icon: '✨',
    title: 'Preview the Transformation',
    description:
      'Select the features you want — painted walls, epoxy floor, custom shelving — and see an AI-generated preview of what your garage could look like before committing.',
  },
  {
    number: '05',
    icon: '📅',
    title: 'Book a Measurement Visit',
    description:
      'Schedule a time for us to come out, verify dimensions, and finalize the details. Morning or afternoon slots available. Takes about 30 minutes.',
  },
  {
    number: '06',
    icon: '💳',
    title: 'Secure Your Project',
    description:
      'Pay a 50% deposit online to lock in your installation date. The remaining balance is due at completion. No surprises, no hidden fees.',
  },
  {
    number: '07',
    icon: '🔨',
    title: 'We Handle Everything',
    description:
      'Our team arrives with materials, handles all installation, and leaves your garage completely transformed. Most projects are completed in a single day.',
  },
];

const FAQS = [
  {
    q: 'How accurate is the AI quote?',
    a: "Very close for most garages. The AI is conservative with estimates — it errs on the side of slightly larger dimensions rather than smaller. The measurement visit confirms exact specs before any work begins.",
  },
  {
    q: 'What if I don\'t like the AI-generated preview?',
    a: "No problem. If the preview doesn't capture your vision, reach out and we'll create a custom design for your specific space. Human eyes and professional judgment are always available.",
  },
  {
    q: 'How long does installation take?',
    a: 'Most projects are a single day — typically 4 to 8 hours depending on the package. The Full Organization package may take a second day for larger garages.',
  },
  {
    q: 'Do I need to empty my garage first?',
    a: 'Not entirely. For the measurement visit, just enough clearance to see the walls. For installation day, we\'ll help you move items and organize as we go.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">How It Works</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          From a photo on your phone to a transformed garage — here's exactly what to expect.
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl p-6 flex gap-6 items-start border border-gray-700"
            >
              <div className="shrink-0 text-4xl">{step.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-blue-400 font-mono font-bold">{step.number}</span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-800 border-t border-gray-700 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">Common Questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-gray-700 pb-6">
                <p className="font-semibold text-white mb-2">{faq.q}</p>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-gray-400 mb-8">
          Create a free account and upload your first photo. You'll have a quote in under a minute.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition"
        >
          Get Your Free Quote
        </Link>
      </section>
    </div>
  );
}
