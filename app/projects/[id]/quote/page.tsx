'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  title: string;
  status: string;
  garage_photo_url: string;
  photo_urls: string[] | null;
  admin_visualization_url: string | null;
  room_width: number;
  room_height: number;
  room_depth: number;
  notes: string;
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

interface Package {
  id: string;
  name: string;
  description: string;
  includes: string[];
  basePrice: number;
}

const SERVICE_PACKAGES: Package[] = [
  {
    id: 'shelving',
    name: 'Shelving Only',
    description: 'Custom 2x4 shelving with plywood',
    includes: ['Design & materials', 'Installation', 'Up to 3 shelving units'],
    basePrice: 800,
  },
  {
    id: 'shelving-junk',
    name: 'Shelving + Junk Removal',
    description: 'Shelving + debris cleanup',
    includes: ['All from Shelving', 'Full junk removal & haul', 'Cleanup'],
    basePrice: 1200,
  },
  {
    id: 'full-org',
    name: 'Full Organization Package',
    description: 'Complete garage transformation',
    includes: [
      'All from Shelving + Junk Removal',
      'Professional organization & zoning',
      'Labeling & categorization',
    ],
    basePrice: 1600,
  },
  {
    id: 'full-org-inventory',
    name: 'Complete + Digital Inventory',
    description: 'Full transformation + QR-coded bins',
    includes: [
      'All from Full Organization',
      'QR-coded storage bins',
      '3-month digital inventory subscription',
    ],
    basePrice: 2000,
  },
];

export default function QuotePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('shelving');
  const [binCount, setBinCount] = useState(0);
  const [materialUpgrade, setMaterialUpgrade] = useState(false);
  const [error, setError] = useState('');
  const [loading2, setLoading2] = useState(true);

  const [vizOptions, setVizOptions] = useState<DesignOptions>({
    paintedWalls: false,
    epoxyFloor: false,
    heavyDutyShelfing: false,
    labeledBins: false,
    pegboard: false,
    ceilingStorage: false,
  });
  const [vizUrl, setVizUrl] = useState<string | null>(null);
  const [vizLoading, setVizLoading] = useState(false);
  const [vizError, setVizError] = useState('');

  useEffect(() => {
    if (!user || !projectId) return;

    const fetchProject = async () => {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        setError('Project not found');
        return;
      }

      setProject(data);
      setLoading2(false);
    };

    fetchProject();
  }, [user, projectId]);

  if (loading || loading2) return <div className="text-white">Loading...</div>;
  if (!user || !project) return null;

  const pkg = SERVICE_PACKAGES.find((p) => p.id === selectedPackage)!;
  let total = pkg.basePrice;

  // Add-ons
  if (binCount > 0) total += binCount * 25; // $25 per bin
  if (materialUpgrade) total += 200; // Premium materials upgrade

  const handleGenerateViz = async () => {
    const anySelected = Object.values(vizOptions).some(Boolean);
    if (!anySelected) { setVizError('Select at least one feature to visualize'); return; }
    if (!project?.garage_photo_url) { setVizError('No photo available for visualization'); return; }
    setVizLoading(true);
    setVizError('');
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
      setVizError(err.message || 'Failed to generate visualization');
    } finally {
      setVizLoading(false);
    }
  };

  const handleSubmitQuote = async () => {
    const { error: updateError } = await supabase
      .from('projects')
      .update({ status: 'quoted' })
      .eq('id', projectId);
    if (updateError) {
      setError(updateError.message || 'Failed to proceed');
    } else {
      router.push(`/projects/${projectId}/book`);
    }
  };

  const STEPS = [
    { key: 'new', label: 'Quote Ready' },
    { key: 'quoted', label: 'Visit Booked' },
    { key: 'booked', label: 'Deposit Paid' },
    { key: 'complete', label: 'Complete' },
  ];
  const currentStep = STEPS.findIndex((s) => s.key === project.status);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress stepper */}
        <div className="flex items-center mb-8 overflow-x-auto pb-1">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i < currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : i === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-600 text-gray-600'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${i <= currentStep ? 'text-white' : 'text-gray-600'}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-4 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-8">{project.title || 'Your Garage Quote'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
              {project.photo_urls && project.photo_urls.length > 1 ? (
                <div className="grid grid-cols-2 gap-1">
                  {project.photo_urls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Garage photo ${i + 1}`}
                      className="w-full h-40 object-cover"
                    />
                  ))}
                </div>
              ) : project.garage_photo_url ? (
                <img
                  src={project.garage_photo_url}
                  alt="Garage"
                  className="w-full h-64 object-cover"
                />
              ) : null}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Space Analysis</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Width</p>
                    <p className="text-3xl font-bold">{project.room_width}ft</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Depth</p>
                    <p className="text-3xl font-bold">{project.room_depth}ft</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Height</p>
                    <p className="text-3xl font-bold">{project.room_height}ft</p>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-gray-300">{project.notes}</p>
                </div>
              </div>
            </div>

            {/* Service Packages */}
            <h2 className="text-2xl font-bold mb-4">Select a Package</h2>
            <div className="space-y-3 mb-6">
              {SERVICE_PACKAGES.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedPackage === pkg.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    value={pkg.id}
                    checked={selectedPackage === pkg.id}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-semibold">{pkg.name}</span>
                  <p className="text-gray-400 text-sm mt-1">{pkg.description}</p>
                  <ul className="text-sm text-gray-300 mt-2 ml-6 list-disc">
                    {pkg.includes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </label>
              ))}
            </div>

            {/* Add-ons */}
            <h2 className="text-2xl font-bold mb-4">Customizations</h2>
            <div className="bg-gray-800 p-6 rounded-lg space-y-4">
              <div>
                <label className="block text-sm mb-2">Storage Bins (+$25 each)</label>
                <input
                  type="number"
                  min="0"
                  value={binCount}
                  onChange={(e) => setBinCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 px-3 py-2 bg-gray-700 text-white rounded"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={materialUpgrade}
                  onChange={(e) => setMaterialUpgrade(e.target.checked)}
                />
                <span>Premium Materials Upgrade (+$200)</span>
              </label>
            </div>
          </div>

          {/* Quote Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
              <h3 className="text-2xl font-bold mb-6">Quote Summary</h3>

              <div className="space-y-3 mb-6 border-b border-gray-700 pb-6">
                <div className="flex justify-between text-sm">
                  <span>{pkg.name}</span>
                  <span>${pkg.basePrice}</span>
                </div>
                {binCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{binCount} Storage Bins</span>
                    <span>${binCount * 25}</span>
                  </div>
                )}
                {materialUpgrade && (
                  <div className="flex justify-between text-sm">
                    <span>Premium Materials</span>
                    <span>$200</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-2xl font-bold mb-8">
                <span>Total</span>
                <span className="text-green-400">${total}</span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitQuote}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold mb-3"
              >
                Request Measurement Visit
              </button>

              <button
                onClick={() => router.push(`/projects/${projectId}/pay?total=${total}`)}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded font-semibold mb-3"
              >
                Pay ${Math.round(total * 0.5)} Deposit Now
              </button>

              <p className="text-xs text-gray-400 text-center">
                Next step: Schedule an official measurement & confirm final details
              </p>
            </div>
          </div>
        </div>

        {/* Visualization section */}
        <div className="bg-gray-800 rounded-lg p-6 mt-2">
          <h2 className="text-2xl font-bold mb-1">Preview Your Transformation</h2>
          <p className="text-gray-400 text-sm mb-5">
            Select the features you're considering and see an AI-generated preview of your space.
          </p>

          {/* Admin-shared design */}
          {project.admin_visualization_url && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm font-semibold mb-3">
                Harrison shared a custom design concept for your space:
              </p>
              <img
                src={project.admin_visualization_url}
                alt="Custom design from Harrison"
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Design options */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            {VIZ_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={vizOptions[opt.key]}
                  onChange={(e) =>
                    setVizOptions((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                  }
                  className="accent-blue-500"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>

          {vizError && <p className="text-red-400 text-sm mb-3">{vizError}</p>}

          <button
            onClick={handleGenerateViz}
            disabled={vizLoading}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded font-semibold disabled:opacity-50 transition"
          >
            {vizLoading ? 'Generating preview… (~10 seconds)' : 'Generate Preview'}
          </button>

          {/* Before / After */}
          {vizUrl && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs text-center mb-2 uppercase tracking-wide">Before</p>
                <img
                  src={project.garage_photo_url}
                  alt="Before"
                  className="w-full rounded-lg object-cover"
                />
              </div>
              <div>
                <p className="text-gray-400 text-xs text-center mb-2 uppercase tracking-wide">AI Preview</p>
                <img src={vizUrl} alt="AI transformation preview" className="w-full rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}