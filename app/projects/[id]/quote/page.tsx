'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  garage_photo_url: string;
  room_width: number;
  room_height: number;
  room_depth: number;
  notes: string;
}

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

  const handleSubmitQuote = () => {
    // Update project status to quoted and navigate to booking
    supabase
      .from('projects')
      .update({ status: 'quoted' })
      .eq('id', projectId)
      .then(() => router.push(`/projects/${projectId}/book`))
      .catch((err) => setError(err.message || 'Failed to proceed'));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Garage Quote</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
              {project.garage_photo_url && (
                <img
                  src={project.garage_photo_url}
                  alt="Garage"
                  className="w-full h-64 object-cover"
                />
              )}
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
      </div>
    </div>
  );
}