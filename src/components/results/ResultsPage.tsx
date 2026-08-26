'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { RecommendationResult } from '@/types';
import { CardResult } from './CardResult';
import { ComparisonTable } from './ComparisonTable';
import { MethodologySection } from './MethodologySection';

interface Props {
  result: RecommendationResult;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ResultsPage({ result }: Props) {
  const { top3, quizAnswers } = result;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Your personalized card matches
        </h1>
        <p className="text-slate-500 text-sm">
          Based on your spending habits, these cards appear to be strong fits — ranked by estimated
          year-one value in real dollars.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {top3.map((calc, i) => (
          <motion.div key={calc.card.id} variants={item}>
            <CardResult
              calc={calc}
              rank={i as 0 | 1 | 2}
              answers={quizAnswers}
              animationDelay={i * 0.15}
            />
          </motion.div>
        ))}
      </motion.div>

      {top3.length >= 2 && <ComparisonTable top3={top3} />}

      <MethodologySection result={result} />

      <div className="mt-8 text-center">
        <Link
          href="/"
          onClick={() => sessionStorage.removeItem('cc-recommendation')}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#275B2D] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          Retake the quiz
        </Link>
      </div>
    </div>
  );
}
