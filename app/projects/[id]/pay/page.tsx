'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    Square: any;
  }
}

export default function PayPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const total = Number(searchParams.get('total') || 0);
  const deposit = Math.round(total * 0.5);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If SDK already loaded (e.g. back-navigation), initialize immediately
    if (window.Square) {
      setSdkReady(true);
      return;
    }
    // Avoid adding duplicate script tags
    if (document.querySelector('script[src*="squarecdn"]')) {
      setSdkReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = () => setSdkReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkReady || !cardContainerRef.current) return;
    // Destroy existing card instance before re-initializing
    if (cardRef.current) {
      cardRef.current.destroy?.();
      cardRef.current = null;
    }

    const initSquare = async () => {
      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      );
      const card = await payments.card();
      await card.attach('#card-container');
      cardRef.current = card;
    };

    initSquare().catch((err) => setError(err.message));
  }, [sdkReady]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return null;

  const handlePay = async () => {
    if (!cardRef.current) return;
    setIsProcessing(true);
    setError('');

    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message || 'Card tokenization failed');
      }

      const response = await fetch('/api/square-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          amount: deposit,
          projectId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment failed');

      // Update project status
      await supabase
        .from('projects')
        .update({ status: 'booked' })
        .eq('id', projectId);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Deposit Paid!</h2>
            <p className="text-gray-300 mb-2">
              ${deposit} deposit received. We'll be in touch to confirm your measurement visit.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pay Deposit</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Quote total</span>
            <span>${total}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-3 mt-3">
            <span>Deposit due (50%)</span>
            <span className="text-green-400">${deposit}</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Remaining ${deposit} due at project completion.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-600 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <label className="block text-sm font-semibold mb-3 text-gray-300">
            Card details
          </label>
          <div
            id="card-container"
            ref={cardContainerRef}
            className="mb-6 min-h-[100px]"
          />

          <button
            onClick={handlePay}
            disabled={!sdkReady || isProcessing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Pay $${deposit} Deposit`}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-3 mt-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold"
          >
            Cancel
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">
          Payments secured by Square. Card data never touches our servers.
        </p>
      </div>
    </div>
  );
}
