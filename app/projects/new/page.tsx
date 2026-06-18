'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase, supabaseStorage } from '@/lib/supabase';

interface PhotoEntry {
  file: File;
  preview: string;
}

export default function NewProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const newEntries = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newEntries]);
    // Reset input so the same file can be re-added if needed
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAnalyze = async () => {
    if (photos.length === 0) {
      setError('Add at least one photo');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Convert all photos to base64
      const imagesBase64 = await Promise.all(photos.map((p) => toBase64(p.file)));

      // Analyze with Claude (all images in one call)
      setAnalyzing(true);
      const response = await fetch('/api/analyze-garage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagesBase64 }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const analysisData = await response.json();

      // Upload all photos to Supabase Storage in parallel
      const uploadPromises = photos.map(async (photo) => {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${photo.file.name}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabaseStorage
          .from('photos')
          .upload(filePath, photo.file);
        if (uploadError) throw uploadError;
        return supabaseStorage.from('photos').getPublicUrl(filePath).data.publicUrl;
      });

      const photoUrls = await Promise.all(uploadPromises);

      // Save project — primary photo in garage_photo_url, all in photo_urls
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            title: `Garage Project - ${new Date().toLocaleDateString()}`,
            garage_photo_url: photoUrls[0],
            photo_urls: photoUrls,
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

      router.push(`/projects/${project.id}/quote`);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze photos');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const busy = uploading || analyzing;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Start New Project</h1>
        <p className="text-gray-400 mb-8">
          Add photos of each wall — the more angles, the better the estimate.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-8">
          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {photos.map((photo, i) => (
                <div key={i} className="relative group">
                  <img
                    src={photo.preview}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  {!busy && (
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-700 rounded-full text-white text-sm font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  )}
                  <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-0.5 rounded text-gray-200">
                    Photo {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add photos button */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={busy}
            className="hidden"
          />

          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-full py-3 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg text-gray-400 hover:text-white transition mb-4 disabled:opacity-50"
          >
            {photos.length === 0 ? '+ Add Photos' : '+ Add More Photos'}
          </button>

          {photos.length > 0 && (
            <p className="text-gray-500 text-sm text-center mb-4">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
              {photos.length === 1 && ' — add more for a better estimate'}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={photos.length === 0 || busy}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
          >
            {analyzing
              ? `Analyzing ${photos.length} photo${photos.length !== 1 ? 's' : ''} with AI...`
              : uploading
              ? 'Uploading...'
              : `Analyze ${photos.length > 0 ? photos.length + ' ' : ''}Photo${photos.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
