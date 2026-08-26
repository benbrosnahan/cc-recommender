'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RecommendationResult } from '@/types';
import { ResultsPage } from '@/components/results/ResultsPage';
import { useState } from 'react';

export default function Results() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    let parsed: RecommendationResult | null = null;
    const raw = sessionStorage.getItem('cc-recommendation');
    if (raw) {
      try {
        parsed = JSON.parse(raw) as RecommendationResult;
      } catch {
        sessionStorage.removeItem('cc-recommendation');
      }
    }
    setResult(parsed);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-[#275B2D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <p className="text-xl font-bold text-slate-800 mb-2">No results yet</p>
        <p className="text-slate-500 text-sm mb-6">
          Take the quiz first to see your personalized card matches.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-[#275B2D] text-white font-semibold rounded-xl hover:bg-[#1E4623] transition-colors text-sm"
        >
          Find my card
        </button>
      </div>
    );
  }

  return <ResultsPage result={result} />;
}
