'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase, supabaseStorage } from '@/lib/supabase';

export default function NewProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please select a photo');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call Claude Vision API with base64 image
      setAnalyzing(true);
      const response = await fetch('/api/analyze-garage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await response.json();
      setAnalysis(analysisData);

      // Upload image to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabaseStorage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabaseStorage.from('photos').getPublicUrl(filePath);
      const photoUrl = data.publicUrl;

      // Save project to Supabase
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            title: `Garage Project - ${new Date().toLocaleDateString()}`,
            garage_photo_url: photoUrl,
            room_width: analysisData.roomWidth,
            room_height: analysisData.roomHeight,
            room_depth: analysisData.roomDepth,
            notes: analysisData.summary,
            status: 'new',
          },
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // Redirect to quote page immediately
      router.push(`/projects/${project.id}/quote`);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze photo');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Start New Project</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded text-red-200">
            {error}
          </div>
        )}

        {!analysis ? (
          <div className="bg-gray-800 rounded-lg p-8">
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-4">
                Upload a photo of your garage
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading || analyzing}
                className="block w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {preview && (
              <div className="mb-6">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
              </div>
            )}

            <button
              onClick={handleUploadAndAnalyze}
              disabled={!file || uploading || analyzing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : analyzing ? 'Analyzing with AI...' : 'Analyze Photo'}
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-gray-400">Estimated Room Width</p>
                <p className="text-2xl font-semibold">{analysis.roomWidth}ft</p>
              </div>
              <div>
                <p className="text-gray-400">Estimated Room Depth</p>
                <p className="text-2xl font-semibold">{analysis.roomDepth}ft</p>
              </div>
              <div>
                <p className="text-gray-400">Estimated Ceiling Height</p>
                <p className="text-2xl font-semibold">{analysis.roomHeight}ft</p>
              </div>
              <div>
                <p className="text-gray-400">Summary</p>
                <p className="text-lg">{analysis.summary}</p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/projects/${projectId}/quote`)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded font-semibold">
              Continue to Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}